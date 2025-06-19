
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { toast } from '@/hooks/use-toast';
import { useEffect } from 'react';

type Carteira = Tables<'carteiras'>;
type Transacao = Tables<'transacoes'>;

interface CarteiraData {
  carteira: Carteira | null;
  transacoes: Transacao[];
}

export const useCarteira = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Query para buscar dados da carteira com otimizações
  const {
    data: carteiraData,
    isLoading: loading,
    error,
    refetch
  } = useQuery({
    queryKey: ['carteira', user?.id],
    queryFn: async (): Promise<CarteiraData> => {
      if (!user) throw new Error('Usuário não autenticado');

      console.log('Buscando dados da carteira para usuário:', user.id);

      // Buscar carteira
      const { data: carteiraData, error: carteiraError } = await supabase
        .from('carteiras')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (carteiraError) {
        console.error('Erro ao buscar carteira:', carteiraError);
        throw carteiraError;
      }

      // Se não existe carteira, criar uma
      let carteira = carteiraData;
      if (!carteira) {
        console.log('Carteira não encontrada, criando nova...');
        carteira = await criarCarteiraInicial(user.id);
      }

      // Buscar transações (limitadas às últimas 50 para performance)
      const { data: transacoesData, error: transacoesError } = await supabase
        .from('transacoes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (transacoesError) {
        console.error('Erro ao buscar transações:', transacoesError);
        throw transacoesError;
      }

      const transacoes = transacoesData || [];

      console.log('Dados carregados:', {
        carteira: carteira,
        totalTransacoes: transacoes.length
      });

      return {
        carteira,
        transacoes
      };
    },
    enabled: !!user,
    staleTime: 30000, // Cache por 30 segundos
    gcTime: 60000, // Manter em cache por 1 minuto
    retry: 2, // Reduzir tentativas de retry
    retryDelay: (attemptIndex) => Math.min(1000 * Math.pow(2, attemptIndex), 5000)
  });

  // Tratamento de erros usando useEffect (otimizado)
  useEffect(() => {
    if (error) {
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
  }, [error]);

  // Mutation para adicionar transação (otimizada)
  const adicionarTransacaoMutation = useMutation({
    mutationFn: async ({
      tipo,
      valor,
      descricao,
      itemId,
      usuarioOrigem,
      cotacaoUtilizada,
      quantidadeGirinhas
    }: {
      tipo: 'recebido' | 'gasto' | 'bonus' | 'compra' | 'queima' | 'transferencia_p2p_saida' | 'transferencia_p2p_entrada' | 'taxa';
      valor: number;
      descricao: string;
      itemId?: string;
      usuarioOrigem?: string;
      cotacaoUtilizada?: number;
      quantidadeGirinhas?: number;
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
          usuario_origem: usuarioOrigem || null,
          cotacao_utilizada: cotacaoUtilizada || null,
          quantidade_girinhas: quantidadeGirinhas || null
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidar apenas carteira, não outras queries
      queryClient.invalidateQueries({ queryKey: ['carteira', user?.id] });
      
      toast({
        title: "Transação Realizada",
        description: "Sua transação foi processada com sucesso!",
      });
    },
    onError: (error: any) => {
      console.error('Erro ao adicionar transação:', error);
      
      if (error.message?.includes('insufficient_funds')) {
        toast({
          title: "Saldo Insuficiente",
          description: "Você não tem Girinhas suficientes para esta transação.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro na Transação",
          description: "Não foi possível processar a transação. Tente novamente.",
          variant: "destructive",
        });
      }
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

  const adicionarTransacao = async (
    tipo: 'recebido' | 'gasto' | 'bonus' | 'compra' | 'queima' | 'transferencia_p2p_saida' | 'transferencia_p2p_entrada' | 'taxa',
    valor: number,
    descricao: string,
    itemId?: string,
    usuarioOrigem?: string,
    cotacaoUtilizada?: number,
    quantidadeGirinhas?: number
  ) => {
    try {
      await adicionarTransacaoMutation.mutateAsync({
        tipo,
        valor,
        descricao,
        itemId,
        usuarioOrigem,
        cotacaoUtilizada,
        quantidadeGirinhas
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
