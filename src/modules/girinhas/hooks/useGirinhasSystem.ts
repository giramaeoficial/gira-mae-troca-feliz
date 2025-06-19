
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
    mutationFn: async (novoMarkup: number) => {
      const { data, error } = await supabase.rpc('ajustar_markup_emissao', {
        novo_markup: novoMarkup
      });
      if (error) throw error;
      return data;
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

  // Mutation para transferência P2P
  const transferirP2PMutation = useMutation({
    mutationFn: async (dados: TransferenciaP2P) => {
      const { data, error } = await supabase.rpc('transferir_girinhas_p2p', {
        p_remetente_id: user?.id,
        p_destinatario_id: dados.destinatario_id,
        p_quantidade: dados.quantidade
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carteira'] });
      queryClient.invalidateQueries({ queryKey: ['transferencias-p2p'] });
      queryClient.invalidateQueries({ queryKey: ['cotacao-girinhas'] });
      
      toast({
        title: "Transferência realizada!",
        description: "Girinhas transferidas com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro na transferência",
        description: error.message,
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
    
    // Ações
    recalcularCotacao: recalcularCotacaoMutation.mutate,
    ajustarMarkup: ajustarMarkupMutation.mutate,
    transferirP2P: transferirP2PMutation.mutate,
    refetchCotacao,
    refetchPrecoEmissao,
  };
};
