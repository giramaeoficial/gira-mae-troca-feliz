
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
      const response = await fetch('/supabase/functions/v1/calcular-cotacao', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Erro ao calcular cotação');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cotacao-girinhas'] });
      queryClient.invalidateQueries({ queryKey: ['historico-cotacao'] });
    },
  });

  // Mutation para transferência P2P
  const transferirP2PMutation = useMutation({
    mutationFn: async (dados: TransferenciaP2P) => {
      const response = await fetch('/supabase/functions/v1/transferir-p2p', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dados),
      });

      if (!response.ok) throw new Error('Erro na transferência');
      return response.json();
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
    historico,
    transferencias,
    queimas,
    
    // Estados
    loadingCotacao,
    isTransferindo: transferirP2PMutation.isPending,
    
    // Ações
    recalcularCotacao: recalcularCotacaoMutation.mutate,
    transferirP2P: transferirP2PMutation.mutate,
    refetchCotacao,
  };
};
