
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { toast } from '@/hooks/use-toast';

type Carteira = Tables<'carteiras'>;
type Transacao = Tables<'transacoes'>;

interface CarteiraData {
  carteira: Carteira | null;
  transacoes: Transacao[];
}

export const useCarteira = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Query para buscar dados da carteira
  const {
    data: carteiraData,
    isLoading: loading,
    error,
    refetch
  } = useQuery({
    queryKey: ['carteira', user?.id],
    queryFn: async (): Promise<CarteiraData> => {
      if (!user) throw new Error('Usuário não autenticado');

      // Buscar carteira
      const { data: carteiraData, error: carteiraError } = await supabase
        .from('carteiras')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (carteiraError) throw carteiraError;

      // Se não existe carteira, criar uma
      let carteira = carteiraData;
      if (!carteira) {
        carteira = await criarCarteiraInicial(user.id);
      }

      // Buscar transações
      const { data: transacoesData, error: transacoesError } = await supabase
        .from('transacoes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (transacoesError) throw transacoesError;

      const transacoes = transacoesData || [];

      // Verificar consistência da carteira
      await verificarConsistenciaCarteira(carteira, transacoes, user.id);

      return {
        carteira,
        transacoes
      };
    },
    enabled: !!user,
    staleTime: 300000, // 5 minutos
    gcTime: 600000, // 10 minutos
    retry: (failureCount, error) => {
      // Retry com exponential backoff até 3 tentativas
      if (failureCount >= 3) return false;
      
      // Não fazer retry para erros de autenticação
      if (error.message?.includes('não autenticado')) return false;
      
      return true;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * Math.pow(2, attemptIndex), 30000),
    onError: (error: any) => {
      console.error('Erro ao carregar carteira:', error);
      
      if (error.message?.includes('não autenticado')) {
        toast({
          title: "Erro de Autenticação",
          description: "Você precisa estar logado para acessar sua carteira.",
          variant: "destructive",
        });
      } else if (error.message?.includes('network')) {
        toast({
          title: "Erro de Conexão",
          description: "Verifique sua conexão com a internet e tente novamente.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro ao Carregar Carteira",
          description: "Ocorreu um erro inesperado. Tente novamente em alguns instantes.",
          variant: "destructive",
        });
      }
    }
  });

  // Mutation para adicionar transação
  const adicionarTransacaoMutation = useMutation({
    mutationFn: async ({
      tipo,
      valor,
      descricao,
      itemId,
      usuarioOrigem
    }: {
      tipo: 'recebido' | 'gasto' | 'bonus';
      valor: number;
      descricao: string;
      itemId?: string;
      usuarioOrigem?: string;
    }) => {
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('transacoes')
        .insert({
          user_id: user.id,
          tipo,
          valor,
          descricao,
          item_id: itemId || null,
          usuario_origem: usuarioOrigem || null
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onMutate: async (novaTransacao) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['carteira', user?.id] });

      const previousData = queryClient.getQueryData<CarteiraData>(['carteira', user?.id]);

      if (previousData && previousData.carteira) {
        const novaTransacaoTemp: Transacao = {
          id: `temp-${Date.now()}`,
          user_id: user!.id,
          tipo: novaTransacao.tipo,
          valor: novaTransacao.valor,
          descricao: novaTransacao.descricao,
          item_id: novaTransacao.itemId || null,
          usuario_origem: novaTransacao.usuarioOrigem || null,
          created_at: new Date().toISOString()
        };

        const novoSaldo = novaTransacao.tipo === 'gasto' 
          ? Number(previousData.carteira.saldo_atual) - novaTransacao.valor
          : Number(previousData.carteira.saldo_atual) + novaTransacao.valor;

        const novoTotalRecebido = (novaTransacao.tipo === 'recebido' || novaTransacao.tipo === 'bonus')
          ? Number(previousData.carteira.total_recebido) + novaTransacao.valor
          : Number(previousData.carteira.total_recebido);

        const novoTotalGasto = novaTransacao.tipo === 'gasto'
          ? Number(previousData.carteira.total_gasto) + novaTransacao.valor
          : Number(previousData.carteira.total_gasto);

        queryClient.setQueryData<CarteiraData>(['carteira', user?.id], {
          carteira: {
            ...previousData.carteira,
            saldo_atual: novoSaldo,
            total_recebido: novoTotalRecebido,
            total_gasto: novoTotalGasto
          },
          transacoes: [novaTransacaoTemp, ...previousData.transacoes]
        });
      }

      return { previousData };
    },
    onError: (error: any, _novaTransacao, context) => {
      // Reverter optimistic update em caso de erro
      if (context?.previousData) {
        queryClient.setQueryData(['carteira', user?.id], context.previousData);
      }

      console.error('Erro ao adicionar transação:', error);
      
      if (error.message?.includes('insufficient_funds')) {
        toast({
          title: "Saldo Insuficiente",
          description: "Você não tem Girinhas suficientes para esta transação.",
          variant: "destructive",
        });
      } else if (error.message?.includes('network')) {
        toast({
          title: "Erro de Conexão",
          description: "Não foi possível processar a transação. Verifique sua conexão.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro na Transação",
          description: "Não foi possível processar a transação. Tente novamente.",
          variant: "destructive",
        });
      }
    },
    onSuccess: () => {
      // Invalidar e refazer query após sucesso
      queryClient.invalidateQueries({ queryKey: ['carteira', user?.id] });
      
      toast({
        title: "Transação Realizada",
        description: "Sua transação foi processada com sucesso!",
      });
    }
  });

  // Função auxiliar para criar carteira inicial
  const criarCarteiraInicial = async (userId: string): Promise<Carteira> => {
    // Criar carteira inicial
    const { data: carteiraData, error: carteiraError } = await supabase
      .from('carteiras')
      .insert({
        user_id: userId,
        saldo_atual: 150.00,
        total_recebido: 150.00,
        total_gasto: 0.00
      })
      .select()
      .single();

    if (carteiraError) throw carteiraError;

    // Criar transações iniciais
    const transacoesIniciais = [
      {
        user_id: userId,
        tipo: 'bonus' as const,
        valor: 50.00,
        descricao: 'Bônus de boas-vindas',
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        user_id: userId,
        tipo: 'bonus' as const,
        valor: 100.00,
        descricao: 'Girinhas iniciais da comunidade',
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    const { error: transacoesError } = await supabase
      .from('transacoes')
      .insert(transacoesIniciais);

    if (transacoesError) console.error('Erro ao criar transações iniciais:', transacoesError);

    return carteiraData;
  };

  // Função para verificar consistência da carteira
  const verificarConsistenciaCarteira = async (
    carteira: Carteira, 
    transacoes: Transacao[], 
    userId: string
  ) => {
    const totalRecebido = transacoes
      .filter(t => t.tipo === 'recebido' || t.tipo === 'bonus')
      .reduce((total, t) => total + Number(t.valor), 0);
    
    const totalGasto = transacoes
      .filter(t => t.tipo === 'gasto')
      .reduce((total, t) => total + Number(t.valor), 0);
    
    const saldoCalculado = totalRecebido - totalGasto;

    const discrepanciaSaldo = Math.abs(Number(carteira.saldo_atual) - saldoCalculado) > 0.01;
    const discrepanciaRecebido = Math.abs(Number(carteira.total_recebido) - totalRecebido) > 0.01;
    const discrepanciaGasto = Math.abs(Number(carteira.total_gasto) - totalGasto) > 0.01;

    if (discrepanciaSaldo || discrepanciaRecebido || discrepanciaGasto) {
      console.log('Discrepância detectada na carteira, corrigindo...');

      const { error: updateError } = await supabase
        .from('carteiras')
        .update({
          saldo_atual: saldoCalculado,
          total_recebido: totalRecebido,
          total_gasto: totalGasto,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (updateError) {
        console.error('Erro ao corrigir carteira:', updateError);
      }
    }
  };

  const adicionarTransacao = async (
    tipo: 'recebido' | 'gasto' | 'bonus',
    valor: number,
    descricao: string,
    itemId?: string,
    usuarioOrigem?: string
  ) => {
    try {
      await adicionarTransacaoMutation.mutateAsync({
        tipo,
        valor,
        descricao,
        itemId,
        usuarioOrigem
      });
      return true;
    } catch {
      return false;
    }
  };

  const verificarSaldo = (valor: number): boolean => {
    return carteiraData?.carteira ? Number(carteiraData.carteira.saldo_atual) >= valor : false;
  };

  return {
    carteira: carteiraData?.carteira || null,
    transacoes: carteiraData?.transacoes || [],
    loading,
    error: error?.message || null,
    refetch,
    adicionarTransacao,
    verificarSaldo,
    saldo: carteiraData?.carteira ? Number(carteiraData.carteira.saldo_atual) : 0,
    totalRecebido: carteiraData?.carteira ? Number(carteiraData.carteira.total_recebido) : 0,
    totalGasto: carteiraData?.carteira ? Number(carteiraData.carteira.total_gasto) : 0,
    isAddingTransaction: adicionarTransacaoMutation.isPending
  };
};
