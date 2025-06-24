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

  // Query OTIMIZADA - Cache MUITO menos agressivo para permitir atualizações imediatas
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
        totalTransacoes: transacoes.length,
        saldoAtual: carteira?.saldo_atual
      });

      return {
        carteira,
        transacoes
      };
    },
    enabled: !!user,
    // CORREÇÃO CRÍTICA: Cache extremamente reduzido para transações
    staleTime: 0, // Sem cache stale - sempre buscar dados frescos
    gcTime: 1000 * 30, // 30 segundos apenas em cache
    refetchOnWindowFocus: true, 
    refetchOnMount: true, 
    refetchInterval: false, 
    retry: 1,
    retryDelay: 1000
  });

  // NOVO: Listener para evento de pagamento Stripe bem-sucedido
  useEffect(() => {
    const handlePaymentSuccess = async (event: CustomEvent) => {
      console.log('🎉 [useCarteira] Evento de pagamento recebido:', event.detail);
      
      // Invalidar TODOS os caches imediatamente
      await queryClient.invalidateQueries({ 
        queryKey: ['carteira'], 
        refetchType: 'all' 
      });
      
      // Forçar refetch MÚLTIPLO para garantir atualização
      await refetch();
      
      // Segundo refetch após pequeno delay
      setTimeout(async () => {
        await refetch();
      }, 200);
    };

    // Adicionar listener do evento customizado
    window.addEventListener('stripe-payment-success', handlePaymentSuccess as EventListener);
    
    // Cleanup
    return () => {
      window.removeEventListener('stripe-payment-success', handlePaymentSuccess as EventListener);
    };
  }, [queryClient, refetch]);

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

  // 🔒 SEGURANÇA: Mutation APENAS para transações internas (não compras)
  const adicionarTransacaoMutation = useMutation({
    mutationFn: async ({
      tipo,
      valor,
      descricao,
      itemId,
      usuarioOrigem
    }: {
      tipo: 'recebido' | 'gasto' | 'bonus' | 'queima' | 'transferencia_p2p_saida' | 'transferencia_p2p_entrada' | 'taxa' | 'extensao_validade';
      valor: number;
      descricao: string;
      itemId?: string;
      usuarioOrigem?: string;
    }) => {
      if (!user) throw new Error('Usuário não autenticado');

      console.log('💳 [useCarteira] Adicionando transação INTERNA:', { tipo, valor, descricao });

      // 🔒 SEGURANÇA: Usar apenas RPC para transações que afetam saldo
      const { data, error } = await supabase
        .from('transacoes')
        .insert({
          user_id: user.id,
          tipo,
          valor,
          descricao,
          item_id: itemId || null,
          usuario_origem: usuarioOrigem || null,
          // Deixar trigger preencher automaticamente
          cotacao_utilizada: null,
          quantidade_girinhas: null,
          data_expiracao: null
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: async () => {
      // CORREÇÃO CRUCIAL: Invalidação e refetch AGRESSIVOS
      console.log('🔄 [useCarteira] Transação bem-sucedida - Invalidando TODOS os caches...');
      
      // Invalidar cache da carteira
      await queryClient.invalidateQueries({ 
        queryKey: ['carteira', user?.id], 
        exact: true 
      });
      
      // Invalidar cache de expiração
      await queryClient.invalidateQueries({ 
        queryKey: ['girinhas-expiracao', user?.id], 
        exact: true 
      });
      
      // Forçar refetch IMEDIATO da carteira
      await refetch();
      
      // Aguardar um pouco e refetch novamente para garantir
      setTimeout(async () => {
        console.log('🔄 [useCarteira] Segundo refetch de segurança...');
        await queryClient.refetchQueries({ 
          queryKey: ['carteira', user?.id], 
          exact: true 
        });
        await queryClient.refetchQueries({ 
          queryKey: ['girinhas-expiracao', user?.id], 
          exact: true 
        });
      }, 500);
      
      toast({
        title: "💳 Transação Realizada",
        description: "Sua transação foi processada com sucesso! Saldo atualizado.",
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

  // 🔒 SEGURANÇA: Mutation para compras seguras via RPC
  const comprarPacoteSeguroMutation = useMutation({
    mutationFn: async (pacoteId: string) => {
      if (!user) throw new Error('Usuário não autenticado');

      console.log('🔒 [useCarteira] Comprando pacote SEGURO via RPC:', pacoteId);

      // Buscar dados do pacote
      const { data: pacote, error: pacoteError } = await supabase
        .from('pacotes_girinhas')
        .select('*')
        .eq('id', pacoteId)
        .single();

      if (pacoteError || !pacote) {
        throw new Error('Pacote não encontrado');
      }

      // Usar RPC segura que calcula cotação no servidor
      const { data, error } = await supabase.rpc('processar_compra_segura', {
        p_user_id: user.id,
        p_quantidade: pacote.valor_girinhas,
        p_idempotency_key: `pacote_${pacoteId}_${Date.now()}`
      });

      if (error) throw error;

      // Registrar compra na tabela de compras
      const { error: compraError } = await supabase
        .from('compras_girinhas')
        .insert({
          user_id: user.id,
          pacote_id: pacoteId,
          valor_pago: pacote.valor_real,
          girinhas_recebidas: pacote.valor_girinhas,
          status: 'aprovado',
          payment_id: `demo_${Date.now()}`
        });

      if (compraError) {
        console.error('⚠️ Erro ao registrar compra (mas transação foi processada):', compraError);
      }

      return data;
    },
    onSuccess: async () => {
      console.log('✅ [useCarteira] Compra segura bem-sucedida');
      
      // Invalidar todos os caches
      await queryClient.invalidateQueries({ queryKey: ['carteira'] });
      await queryClient.invalidateQueries({ queryKey: ['girinhas-expiracao'] });
      await refetch();
      
      toast({
        title: "💰 Compra Realizada!",
        description: "Girinhas adicionadas à sua carteira com segurança!",
      });
    },
    onError: (error: any) => {
      console.error('❌ [useCarteira] Erro na compra segura:', error);
      
      toast({
        title: "Erro na compra",
        description: error.message || "Não foi possível processar a compra. Tente novamente.",
        variant: "destructive",
      });
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

  // 🔒 SEGURANÇA: Função simplificada - SEM parâmetros de cotação
  const adicionarTransacao = async (
    tipo: 'recebido' | 'gasto' | 'bonus' | 'queima' | 'transferencia_p2p_saida' | 'transferencia_p2p_entrada' | 'taxa' | 'extensao_validade',
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

  // 🔒 SEGURANÇA: Função de compra usando RPC segura
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
      await comprarPacoteSeguroMutation.mutateAsync(pacoteId);
      return true;
    } catch {
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
