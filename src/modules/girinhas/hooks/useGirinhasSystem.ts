
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface CotacaoData {
  cotacao_atual: number;
  volume_24h: number;
  updated_at: string;
}

interface TransferenciaP2P {
  destinatario_id: string;
  quantidade: number;
}

interface SimulacaoMarkup {
  cotacao_atual: number;
  markup_atual: number;
  preco_com_markup_atual: number;
  preco_minimo: number;
  preco_maximo: number;
  precisa_ajuste: boolean;
  markup_necessario: number;
  preco_final: number;
}

interface AjusteMarkupResponse {
  markup_anterior: number;
  markup_novo: number;
  cotacao_atual: number;
  preco_resultante: number;
  mensagem: string;
}

interface CompraSeguraResponse {
  transacao_id: string;
  quantidade: number;
  preco_unitario: number;
  valor_total: number;
  cotacao_mercado: number;
  sucesso: boolean;
  mensagem: string;
}

export const useGirinhasSystem = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query para cotação atual
  const { 
    data: cotacao, 
    isLoading: loadingCotacao,
    refetch: refetchCotacao 
  } = useQuery({
    queryKey: ['cotacao-girinhas'],
    queryFn: async (): Promise<CotacaoData> => {
      const { data, error } = await supabase
        .from('cotacao_girinhas')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      return data;
    },
    staleTime: 30000, // 30 segundos
    refetchInterval: 60000, // 1 minuto
  });

  // Query para preço de emissão atual
  const { data: precoEmissao, refetch: refetchPrecoEmissao } = useQuery({
    queryKey: ['preco-emissao'],
    queryFn: async (): Promise<number> => {
      const { data, error } = await supabase.rpc('obter_preco_emissao');
      if (error) throw error;
      return Number(data);
    },
    staleTime: 30000,
    refetchInterval: 60000,
  });

  // Query para simulação de markup
  const { data: simulacaoMarkup } = useQuery({
    queryKey: ['simulacao-markup'],
    queryFn: async (): Promise<SimulacaoMarkup[]> => {
      const { data, error } = await supabase.rpc('simular_preco_emissao');
      if (error) throw error;
      return data || [];
    },
    staleTime: 30000,
    refetchInterval: 60000,
  });

  // Query para histórico de cotação
  const { data: historico } = useQuery({
    queryKey: ['historico-cotacao'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('historico_cotacao')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data;
    },
    staleTime: 300000, // 5 minutos
  });

  // Query para transferências do usuário
  const { data: transferencias } = useQuery({
    queryKey: ['transferencias-p2p', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('transferencias_girinhas')
        .select(`
          *,
          remetente:profiles!remetente_id(nome, avatar_url),
          destinatario:profiles!destinatario_id(nome, avatar_url)
        `)
        .or(`remetente_id.eq.${user.id},destinatario_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Query para queimas do usuário
  const { data: queimas } = useQuery({
    queryKey: ['queimas-girinhas', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('queimas_girinhas')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Mutation para compra segura server-side
  const compraSeguraMutation = useMutation({
    mutationFn: async ({ quantidade }: { quantidade: number }): Promise<CompraSeguraResponse> => {
      if (!user) throw new Error('Usuário não autenticado');
      
      const idempotencyKey = `compra_${user.id}_${Date.now()}_${Math.random()}`;
      
      const { data, error } = await supabase.rpc('processar_compra_segura', {
        p_user_id: user.id,
        p_quantidade: quantidade,
        p_idempotency_key: idempotencyKey
      });

      if (error) throw error;
      
      // Converter o retorno Json para nossa interface
      const resultado = data as unknown as CompraSeguraResponse;
      return resultado;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['carteira'] });
      queryClient.invalidateQueries({ queryKey: ['cotacao-girinhas'] });
      queryClient.invalidateQueries({ queryKey: ['preco-emissao'] });
      queryClient.invalidateQueries({ queryKey: ['simulacao-markup'] });
      
      toast({
        title: "Compra realizada com sucesso! 🎉",
        description: `${data.quantidade} Girinhas adicionadas por R$ ${data.valor_total.toFixed(2)}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro na compra",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation para recalcular cotação
  const recalcularCotacaoMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc('calcular_cotacao_dinamica');
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cotacao-girinhas'] });
      queryClient.invalidateQueries({ queryKey: ['historico-cotacao'] });
      queryClient.invalidateQueries({ queryKey: ['preco-emissao'] });
      queryClient.invalidateQueries({ queryKey: ['simulacao-markup'] });
    },
  });

  // Mutation para ajustar markup manualmente
  const ajustarMarkupMutation = useMutation({
    mutationFn: async (novoMarkup: number): Promise<AjusteMarkupResponse> => {
      const { data, error } = await supabase.rpc('ajustar_markup_emissao', {
        novo_markup: novoMarkup
      });
      if (error) throw error;
      
      // Converter o retorno Json para nossa interface
      const resultado = data as unknown as AjusteMarkupResponse;
      return resultado;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['preco-emissao'] });
      queryClient.invalidateQueries({ queryKey: ['simulacao-markup'] });
      
      toast({
        title: "Markup ajustado!",
        description: `Novo markup: ${data.markup_novo}% - Preço resultante: R$ ${data.preco_resultante}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao ajustar markup",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation para transferência P2P - CORRIGIDA sem propriedade protegida
  const transferirP2PMutation = useMutation({
    mutationFn: async (dados: TransferenciaP2P) => {
      if (!user) throw new Error('Usuário não autenticado');
      
      // Validações do frontend
      if (!dados.destinatario_id || !dados.quantidade) {
        throw new Error('Dados obrigatórios não informados');
      }
      
      if (dados.quantidade <= 0) {
        throw new Error('Quantidade deve ser maior que zero');
      }
      
      if (dados.quantidade > 10000) {
        throw new Error('Quantidade máxima: 10.000 Girinhas por transferência');
      }
      
      // Usar edge function para maior segurança
      const { data: authData } = await supabase.auth.getSession();
      if (!authData.session?.access_token) {
        throw new Error('Sessão expirada. Faça login novamente.');
      }
      
      // Usar a URL diretamente em vez da propriedade protegida
      const response = await fetch('https://mkuuwnqiaeguuexeeicw.supabase.co/functions/v1/transferir-p2p', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authData.session.access_token}`,
        },
        body: JSON.stringify({
          destinatario_id: dados.destinatario_id,
          quantidade: dados.quantidade
        })
      });
      
      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Erro na transferência');
      }
      
      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['carteira'] });
      queryClient.invalidateQueries({ queryKey: ['transferencias-p2p'] });
      queryClient.invalidateQueries({ queryKey: ['cotacao-girinhas'] });
      
      toast({
        title: "✅ Transferência realizada!",
        description: data.mensagem || "Girinhas transferidas com sucesso.",
      });
    },
    onError: (error: any) => {
      console.error('Erro na transferência P2P:', error);
      
      let mensagemErro = "Erro na transferência. Tente novamente.";
      
      if (error.message?.includes('Saldo insuficiente')) {
        mensagemErro = "Saldo insuficiente para esta transferência.";
      } else if (error.message?.includes('não encontrado')) {
        mensagemErro = "Destinatário não encontrado.";
      } else if (error.message?.includes('Muitas transferências')) {
        mensagemErro = "Muitas transferências recentes. Aguarde um momento.";
      } else if (error.message?.includes('Sessão expirada')) {
        mensagemErro = "Sua sessão expirou. Faça login novamente.";
      } else if (error.message) {
        mensagemErro = error.message;
      }
      
      toast({
        title: "❌ Erro na transferência",
        description: mensagemErro,
        variant: "destructive",
      });
    },
  });

  return {
    // Dados
    cotacao,
    precoEmissao,
    simulacaoMarkup,
    historico,
    transferencias,
    queimas,
    
    // Estados
    loadingCotacao,
    isTransferindo: transferirP2PMutation.isPending,
    isAjustandoMarkup: ajustarMarkupMutation.isPending,
    isComprandoSeguro: compraSeguraMutation.isPending,
    
    // Ações
    compraSegura: compraSeguraMutation.mutate,
    recalcularCotacao: recalcularCotacaoMutation.mutate,
    ajustarMarkup: ajustarMarkupMutation.mutate,
    transferirP2P: transferirP2PMutation.mutate,
    refetchCotacao,
    refetchPrecoEmissao,
  };
};
