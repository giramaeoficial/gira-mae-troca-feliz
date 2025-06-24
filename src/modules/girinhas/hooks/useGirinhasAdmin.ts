
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useGirinhasAdmin = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // ✅ CORRIGIDO: Query para preço manual atual (apenas admin)
  const { 
    data: precoManual, 
    isLoading: loadingPrecoManual,
    refetch: refetchPrecoManual 
  } = useQuery({
    queryKey: ['admin-preco-manual'],
    queryFn: async (): Promise<number> => {
      const { data, error } = await supabase.rpc('obter_preco_manual');
      if (error) throw error;
      return Number(data);
    },
    staleTime: 30000,
    refetchInterval: 60000,
  });

  // ✅ CORRIGIDO: Query para métricas de saúde (apenas admin)
  const { data: metricasSaude, refetch: refetchMetricas } = useQuery({
    queryKey: ['admin-metricas-saude'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('calcular_metricas_saude');
      if (error) throw error;
      return data;
    },
    staleTime: 30000,
    refetchInterval: 60000,
  });

  // ✅ CORRIGIDO: Mutation para atualizar preço manual (apenas admin)
  const atualizarPrecoManualMutation = useMutation({
    mutationFn: async (novoPreco: number) => {
      if (novoPreco <= 0 || novoPreco > 10) {
        throw new Error('Preço deve estar entre R$ 0,01 e R$ 10,00');
      }
      
      const { error } = await supabase
        .from('config_sistema')
        .upsert({
          chave: 'preco_manual_girinhas',
          valor: { valor: novoPreco }
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-preco-manual'] });
      queryClient.invalidateQueries({ queryKey: ['preco-manual'] });
      
      toast({
        title: "Preço atualizado!",
        description: "O novo preço foi salvo com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar preço",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    // Dados (apenas admin)
    precoManual: precoManual || 1.00,
    metricasSaude,
    
    // Estados
    loadingPrecoManual,
    isAtualizandoPreco: atualizarPrecoManualMutation.isPending,
    
    // Ações (apenas admin)
    atualizarPrecoManual: atualizarPrecoManualMutation.mutate,
    refetchPrecoManual,
    refetchMetricas,
  };
};
