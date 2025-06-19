
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface GirinhasExpiracao {
  total_expirando_7_dias: number;
  total_expirando_30_dias: number;
  proxima_expiracao: string | null;
  detalhes_expiracao: Array<{
    valor: number;
    data_compra: string;
    data_expiracao: string;
    dias_restantes: number;
  }>;
}

export const useGirinhasExpiracao = () => {
  const { user } = useAuth();

  const {
    data: expiracao,
    isLoading: loading,
    error,
    refetch
  } = useQuery({
    queryKey: ['girinhas-expiracao', user?.id],
    queryFn: async (): Promise<GirinhasExpiracao> => {
      if (!user) throw new Error('Usuário não autenticado');

      console.log('🔍 [useGirinhasExpiracao] Buscando dados de expiração para usuário:', user.id);

      const { data, error } = await supabase.rpc('obter_girinhas_expiracao', {
        p_user_id: user.id
      });

      if (error) {
        console.error('❌ Erro ao buscar expiração:', error);
        throw error;
      }

      const resultado = data?.[0] || {
        total_expirando_7_dias: 0,
        total_expirando_30_dias: 0,
        proxima_expiracao: null,
        detalhes_expiracao: []
      };

      console.log('✅ [useGirinhasExpiracao] Dados carregados:', resultado);

      return {
        total_expirando_7_dias: Number(resultado.total_expirando_7_dias || 0),
        total_expirando_30_dias: Number(resultado.total_expirando_30_dias || 0),
        proxima_expiracao: resultado.proxima_expiracao,
        detalhes_expiracao: resultado.detalhes_expiracao || []
      };
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutos
    gcTime: 1000 * 60 * 10, // 10 minutos em cache
    refetchOnWindowFocus: false,
    retry: 1
  });

  return {
    expiracao: expiracao || {
      total_expirando_7_dias: 0,
      total_expirando_30_dias: 0,
      proxima_expiracao: null,
      detalhes_expiracao: []
    },
    loading,
    error: error?.message || null,
    refetch
  };
};
