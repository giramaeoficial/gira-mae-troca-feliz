
import { useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface FiltrosFeed {
  busca?: string;
  cidade?: string;
  categoria?: string;
  subcategoria?: string;
  genero?: string;
  tamanho?: string;
  precoMin?: number;
  precoMax?: number;
  mostrarReservados?: boolean;
}

export interface ItemFeed {
  id: string;
  titulo: string;
  descricao: string;
  categoria: string;
  subcategoria?: string;
  genero?: string;
  tamanho_categoria?: string;
  tamanho_valor?: string;
  estado_conservacao: string;
  valor_girinhas: number;
  fotos?: string[];
  status: string;
  publicado_por: string;
  created_at: string;
  updated_at: string;
  endereco_bairro?: string;
  endereco_cidade?: string;
  endereco_estado?: string;
  aceita_entrega?: boolean;
  raio_entrega_km?: number;
  publicado_por_profile?: {
    nome: string;
    avatar_url?: string;
    reputacao?: number;
    telefone?: string;
  };
  escolas_inep?: {
    escola: string;
  };
}

export interface PaginaFeed {
  itens: ItemFeed[];
  configuracoes?: {
    categorias: Array<{
      codigo: string;
      nome: string;
      icone: string;
      ordem: number;
    }>;
    subcategorias: Array<{
      id: string;
      nome: string;
      categoria_pai: string;
      icone: string;
      ordem: number;
    }>;
  };
  profile_essencial?: {
    id: string;
    nome: string;
    cidade: string;
    estado: string;
    bairro?: string;
    avatar_url?: string;
  };
  has_more: boolean;
  total_count: number;
}

export const useFeedInfinito = (userId: string, filtros: FiltrosFeed = {}) => {
  return useInfiniteQuery({
    queryKey: ['feed-infinito', userId, filtros],
    queryFn: async ({ pageParam = 0 }) => {
      console.log('🔄 Carregando página do feed:', pageParam, 'Filtros:', filtros);
      
      const { data, error } = await supabase.rpc(
        'carregar_dados_feed_paginado' as any,
        {
          p_user_id: userId,
          p_page: pageParam,
          p_limit: 20,
          p_busca: filtros.busca || '',
          p_cidade: filtros.cidade || '',
          p_categoria: filtros.categoria || 'todas',
          p_subcategoria: filtros.subcategoria || 'todas',
          p_genero: filtros.genero || 'todos',
          p_tamanho: filtros.tamanho || 'todos',
          p_preco_min: filtros.precoMin || 0,
          p_preco_max: filtros.precoMax || 200,
          p_mostrar_reservados: filtros.mostrarReservados ?? true
        }
      );
      
      if (error) {
        console.error('❌ Erro ao carregar feed:', error);
        throw error;
      }
      
      const result = data as unknown as PaginaFeed;
      console.log('✅ Feed carregado:', result.itens?.length || 0, 'itens, has_more:', result.has_more);
      
      return result;
    },
    initialPageParam: 0,
    enabled: !!userId,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage?.has_more ? allPages.length : undefined;
    },
    staleTime: 60000,
    refetchOnWindowFocus: false,
    retry: 3,
  });
};
