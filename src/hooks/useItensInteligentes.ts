
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useFavoritos } from '@/hooks/useFavoritos';
import { useSeguidores } from '@/hooks/useSeguidores';

interface ItensInteligentesFiltros {
  busca?: string;
  categoria?: string;
  subcategoria?: string;
  genero?: string;
  location?: {
    cidade: string;
    estado: string;
    bairro?: string;
  } | null;
  ordem?: 'recentes' | 'populares' | 'preco_baixo' | 'preco_alto';
  limite?: number;
  excludeUserId?: string;
}

export const useItensInteligentes = (filtros: ItensInteligentesFiltros = {}) => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { favoritos } = useFavoritos();
  const { buscarItensDasMinhasSeguidas } = useSeguidores();

  return useQuery({
    queryKey: ['itens-inteligentes', filtros],
    queryFn: async () => {
      let query = supabase
        .from('itens_completos')
        .select('*')
        .eq('status', 'disponivel');

      // Filtros
      if (filtros.busca) {
        query = query.or(`titulo.ilike.%${filtros.busca}%,descricao.ilike.%${filtros.busca}%`);
      }

      if (filtros.categoria) {
        query = query.eq('categoria', filtros.categoria);
      }

      if (filtros.subcategoria) {
        query = query.eq('subcategoria', filtros.subcategoria);
      }

      if (filtros.genero) {
        query = query.eq('genero', filtros.genero);
      }

      if (filtros.excludeUserId) {
        query = query.neq('publicado_por', filtros.excludeUserId);
      }

      // Localização
      if (filtros.location) {
        if (filtros.location.cidade) {
          query = query.eq('vendedor_cidade', filtros.location.cidade);
        }
        if (filtros.location.estado) {
          query = query.eq('vendedor_estado', filtros.location.estado);
        }
      }

      // Ordenação
      switch (filtros.ordem) {
        case 'recentes':
          query = query.order('created_at', { ascending: false });
          break;
        case 'preco_baixo':
          query = query.order('valor_girinhas', { ascending: true });
          break;
        case 'preco_alto':
          query = query.order('valor_girinhas', { ascending: false });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      // Limite
      const limite = filtros.limite || 20;
      query = query.limit(limite);

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};
