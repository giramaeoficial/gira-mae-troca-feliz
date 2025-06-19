
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

  // Query SUPER OTIMIZADA - Cache agressivo para minimizar requests
  const {
    data: carteiraData,
    isLoading: loading,
    error,
    refetch
  } = useQuery({
    queryKey: ['carteira', user?.id],
    queryFn: async (): Promise<CarteiraData> => {
      if (!user) throw new Error('Usuário não autenticado');

      console.log('🔍 [useCarteira] Buscando dados da carteira para usuário:', user.id);

      // Buscar carteira
      const { data: carteiraData, error: carteiraError } = await supabase
        .from('carteiras')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (carteiraError) {
        console.error('❌ Erro ao buscar carteira:', carteiraError);
        throw carteiraError;
      }

      // Se não existe carteira, criar uma
      let carteira = carteiraData;
      if (!carteira) {
        console.log('💡 Carteira não encontrada, criando nova...');
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
        console.error('❌ Erro ao buscar transações:', transacoesError);
        throw transacoesError;
      }

      const transacoes = transacoesData || [];

      console.log('✅ [useCarteira] Dados carregados:', {
        carteira: carteira,
        totalTransacoes: transacoes.length
      });

      return {
        carteira,
        transacoes
      };
    },
    enabled: !!user,
    // OTIMIZAÇÃO EXTREMA: Cache muito agressivo para reduzir requests
    staleTime: 1000 * 60 * 10, // 10 minutos sem refetch
    gcTime: 1000 * 60 * 20, // 20 minutos em cache
    refetchOnWindowFocus: false, // Nunca refetch no foco da janela
    refetchOnMount: false, // Nunca refetch na montagem se tem cache
    refetchInterval: false, // Sem polling automático
    retry: 1, // Minimizar retries
    retryDelay: 2000 // Delay entre retries
  });

  // Tratamento de erros usando useEffect (otimizado com dependência específica)
  useEffect(() => {
    if (error) {
      console.error('❌ [useCarteira] Erro ao carregar carteira:', error);
      
      const errorMessage = error?.message || '';
      
      if (errorMessage.includes('não autenticado')) {
        toast({
          title: "Erro de Autenticação",
          description: "Você precisa estar logado para acessar sua carteira.",
          variant: "destructive",
        });
      } else if (errorMessage.includes('network')) {
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
  }, [error?.message]);

  // Mutation OTIMIZADA para adicionar transação
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

      console.log('💳 [useCarteira] Adicionando transação:', { tipo, valor, descricao });

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
      // OTIMIZAÇÃO CRUCIAL: Invalidar apenas carteira específica, não todas as queries
      console.log('🔄 [useCarteira] Invalidando cache específico da carteira...');
      queryClient.invalidateQueries({ 
        queryKey: ['carteira', user?.id], 
        exact: true 
      });
      
      toast({
        title: "Transação Realizada",
        description: "Sua transação foi processada com sucesso!",
      });
    },
    onError: (error: any) => {
      console.error('❌ [useCarteira] Erro ao adicionar transação:', error);
      
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
    console.log('🏦 [useCarteira] Criando carteira inicial para:', userId);
    
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

    if (transacoesError) console.error('⚠️ Erro ao criar transações iniciais:', transacoesError);

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

  // Função centralizada para compra de pacotes (migrada do CarteiraContext)
  const comprarPacote = async (pacoteId: string): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para comprar Girinhas.",
        variant: "destructive",
      });
      return false;
    }

    try {
      // Buscar dados do pacote
      const { data: pacote, error: pacoteError } = await supabase
        .from('pacotes_girinhas')
        .select('*')
        .eq('id', pacoteId)
        .single();

      if (pacoteError || !pacote) {
        throw new Error('Pacote não encontrado');
      }

      // Simular processamento de pagamento (sempre aprovado para demo)
      const paymentId = `demo_${Date.now()}`;

      // Criar registro da compra
      const { error: compraError } = await supabase
        .from('compras_girinhas')
        .insert({
          user_id: user.id,
          pacote_id: pacoteId,
          valor_pago: pacote.valor_real,
          girinhas_recebidas: pacote.valor_girinhas,
          status: 'aprovado',
          payment_id: paymentId
        });

      if (compraError) throw compraError;

      // Adicionar Girinhas à carteira via transação
      const sucesso = await adicionarTransacao(
        'compra',
        pacote.valor_girinhas,
        `Compra de pacote: ${pacote.nome}`
      );

      if (sucesso) {
        toast({
          title: "💳 Compra realizada!",
          description: `${pacote.valor_girinhas} Girinhas adicionadas à sua carteira!`,
        });
      }

      return sucesso;
    } catch (err) {
      console.error('Erro ao processar compra:', err);
      
      toast({
        title: "Erro na compra",
        description: "Não foi possível processar a compra. Tente novamente.",
        variant: "destructive",
      });
      
      return false;
    }
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
    isAddingTransaction: adicionarTransacaoMutation.isPending,
    comprarPacote,
    
    // Métodos compatíveis com CarteiraContext para facilitar migração
    transferirGirinhas: (valor: number, para: string, itemId: number, descricao: string): boolean => {
      if (!verificarSaldo(valor)) {
        return false;
      }
      adicionarTransacao('gasto', valor, `${descricao} - para ${para}`, String(itemId));
      return true;
    },
    receberGirinhas: (valor: number, de: string, itemId: number, descricao: string) => {
      adicionarTransacao('recebido', valor, `${descricao} - de ${de}`, String(itemId));
    },
    recarregarSaldo: () => refetch()
  };
};
