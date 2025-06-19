
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface CotacaoData {
  cotacao_atual: number;
  volume_24h: number;
  updated_at: string;
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

export const useGirinhasAdmin = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query para cotação atual (apenas admin)
  const { 
    data: cotacao, 
    isLoading: loadingCotacao,
    refetch: refetchCotacao 
  } = useQuery({
    queryKey: ['admin-cotacao-girinhas'],
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
    staleTime: 30000,
    refetchInterval: 60000,
  });

  // Query para preço de emissão atual (apenas admin)
  const { data: precoEmissao, refetch: refetchPrecoEmissao } = useQuery({
    queryKey: ['admin-preco-emissao'],
    queryFn: async (): Promise<number> => {
      const { data, error } = await supabase.rpc('obter_preco_emissao');
      if (error) throw error;
      return Number(data);
    },
    staleTime: 30000,
    refetchInterval: 60000,
  });

  // Query para simulação de markup (apenas admin)
  const { data: simulacaoMarkup } = useQuery({
    queryKey: ['admin-simulacao-markup'],
    queryFn: async (): Promise<SimulacaoMarkup[]> => {
      const { data, error } = await supabase.rpc('simular_preco_emissao');
      if (error) throw error;
      return data || [];
    },
    staleTime: 30000,
    refetchInterval: 60000,
  });

  // Query para histórico de cotação (apenas admin)
  const { data: historico } = useQuery({
    queryKey: ['admin-historico-cotacao'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('historico_cotacao')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data;
    },
    staleTime: 300000,
  });

  // Mutation para recalcular cotação (apenas admin)
  const recalcularCotacaoMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc('calcular_cotacao_dinamica');
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-cotacao-girinhas'] });
      queryClient.invalidateQueries({ queryKey: ['admin-historico-cotacao'] });
      queryClient.invalidateQueries({ queryKey: ['admin-preco-emissao'] });
      queryClient.invalidateQueries({ queryKey: ['admin-simulacao-markup'] });
    },
  });

  // Mutation para ajustar markup manualmente (apenas admin)
  const ajustarMarkupMutation = useMutation({
    mutationFn: async (novoMarkup: number): Promise<AjusteMarkupResponse> => {
      const { data, error } = await supabase.rpc('ajustar_markup_emissao', {
        novo_markup: novoMarkup
      });
      if (error) throw error;
      
      const resultado = data as unknown as AjusteMarkupResponse;
      return resultado;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-preco-emissao'] });
      queryClient.invalidateQueries({ queryKey: ['admin-simulacao-markup'] });
      
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

  return {
    // Dados (apenas admin)
    cotacao,
    precoEmissao,
    simulacaoMarkup,
    historico,
    
    // Estados
    loadingCotacao,
    isAjustandoMarkup: ajustarMarkupMutation.isPending,
    
    // Ações (apenas admin)
    recalcularCotacao: recalcularCotacaoMutation.mutate,
    ajustarMarkup: ajustarMarkupMutation.mutate,
    refetchCotacao,
    refetchPrecoEmissao,
  };
};
