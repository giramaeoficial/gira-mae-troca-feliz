
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { toast } from '@/hooks/use-toast';
import { useEffect } from 'react';
import { TipoTransacaoEnum } from '@/types/transacao.types';

type Carteira = Tables<'carteiras'>;
type Transacao = any; // Simplified for join queries

interface CarteiraData {
  carteira: Carteira | null;
  transacoes: Transacao[];
}

export const useCarteira = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Query SIMPLIFICADA - Cache mínimo para garantir dados sempre frescos
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
        .select(`
          *,
          transacao_config(sinal, descricao_pt, cor_hex, icone)
        `)
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
    // CORREÇÃO: Cache mínimo para sempre buscar dados frescos
    staleTime: 0,
    gcTime: 0,
    refetchOnWindowFocus: true, 
    refetchOnMount: true, 
    refetchInterval: false, 
    retry: 1,
    retryDelay: 1000
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

  // ✅ ATUALIZADO: Mutation usando novo sistema de tipos
  const adicionarTransacaoMutation = useMutation({
    mutationFn: async ({
      tipo,
      valor,
      descricao,
      itemId,
      usuarioOrigem,
      metadados
    }: {
      tipo: TipoTransacaoEnum;
      valor: number;
      descricao: string;
      itemId?: string;
      usuarioOrigem?: string;
      metadados?: Record<string, any>;
    }) => {
      if (!user) throw new Error('Usuário não autenticado');

      console.log('💳 [useCarteira] Adicionando transação com novo tipo:', { tipo, valor, descricao });

      // ✅ NOVO: Usar função validada do banco
      const { data, error } = await supabase.rpc('criar_transacao_validada', {
        p_user_id: user.id,
        p_tipo: tipo,
        p_valor: valor,
        p_descricao: descricao,
        p_metadados: {
          item_id: itemId,
          usuario_origem: usuarioOrigem,
          ...metadados
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: async () => {
      // Invalidação simples
      await queryClient.invalidateQueries({ 
        queryKey: ['carteira', user?.id], 
        exact: true 
      });
      
      await refetch();
      
      toast({
        title: "💳 Transação Realizada",
        description: "Sua transação foi processada com sucesso! Saldo atualizado.",
      });
    },
    onError: (error: any) => {
      console.error('❌ [useCarteira] Erro ao adicionar transação:', error);
      
      if (error.message?.includes('insufficient_funds') || error.message?.includes('Saldo insuficiente')) {
        toast({
          title: "Saldo Insuficiente",
          description: "Você não tem Girinhas suficientes para esta transação.",
          variant: "destructive",
        });
      } else if (error.message?.includes('inválido ou inativo')) {
        toast({
          title: "Tipo de Transação Inválido",
          description: "Este tipo de transação não é permitido.",
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

    // ✅ NOVO: Criar transações iniciais usando novos tipos
    const transacoesIniciais = [
      {
        p_user_id: userId,
        p_tipo: 'bonus_cadastro' as TipoTransacaoEnum,
        p_valor: 50.00,
        p_descricao: 'Bônus de boas-vindas',
        p_metadados: { origem: 'sistema_inicial' }
      },
      {
        p_user_id: userId,
        p_tipo: 'bonus_cadastro' as TipoTransacaoEnum,
        p_valor: 100.00,
        p_descricao: 'Girinhas iniciais da comunidade',
        p_metadados: { origem: 'sistema_inicial' }
      }
    ];

    // Usar função validada para criar transações
    for (const transacao of transacoesIniciais) {
      try {
        await supabase.rpc('criar_transacao_validada', transacao);
      } catch (error) {
        console.error('⚠️ Erro ao criar transação inicial:', error);
      }
    }

    return carteiraData;
  };

  // ✅ ATUALIZADO: Função simplificada usando novos tipos
  const adicionarTransacao = async (
    tipo: TipoTransacaoEnum,
    valor: number,
    descricao: string,
    itemId?: string,
    usuarioOrigem?: string,
    metadados?: Record<string, any>
  ) => {
    try {
      await adicionarTransacaoMutation.mutateAsync({
        tipo,
        valor,
        descricao,
        itemId,
        usuarioOrigem,
        metadados
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
    isAddingTransaction: adicionarTransacaoMutation.isPending,
    
    // ✅ MANTIDO: Métodos compatíveis usando novos tipos
    transferirGirinhas: (valor: number, para: string, itemId: number, descricao: string): boolean => {
      if (!verificarSaldo(valor)) {
        return false;
      }
      adicionarTransacao('bloqueio_reserva', valor, `${descricao} - para ${para}`, String(itemId));
      return true;
    },
    receberGirinhas: (valor: number, de: string, itemId: number, descricao: string) => {
      adicionarTransacao('recebido_item', valor, `${descricao} - de ${de}`, String(itemId));
    },
    recarregarSaldo: () => refetch()
  };
};
