
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface UseItensInteligenteParams {
  categoria?: string;
  subcategoria?: string;
  genero?: string;
  vendedorId?: string;
  busca?: string;
  location?: {
    cidade: string;
    estado: string;
    bairro?: string;
  } | null;
  ordem?: 'recentes' | 'preco_asc' | 'preco_desc';
}

type SimpleItemResponse = {
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
  publicado_por_profile?: {
    nome: string;
    avatar_url?: string;
    reputacao?: number;
  } | null;
};

interface QueryResult {
  data: SimpleItemResponse[];
  isLoading: boolean;
  error: any;
  refetch: () => void;
}

export const useItensInteligentes = (params: UseItensInteligenteParams): QueryResult => {
  const query = useQuery({
    queryKey: ['itens-inteligentes', params],
    queryFn: async () => {
      console.log('🔄 Carregando itens inteligentes:', params);
      
      let query = supabase
        .from('itens')
        .select(`
          *,
          publicado_por_profile:profiles!itens_publicado_por_fkey (
            nome,
            avatar_url,
            reputacao
          )
        `)
        .eq('status', 'disponivel');

      // Filtro por vendedor específico
      if (params.vendedorId) {
        query = query.eq('publicado_por', params.vendedorId);
      }

      // Filtro por busca
      if (params.busca) {
        query = query.or(`titulo.ilike.%${params.busca}%,descricao.ilike.%${params.busca}%`);
      }

      // Filtros existentes
      if (params.categoria) {
        query = query.eq('categoria', params.categoria);
      }

      if (params.subcategoria) {
        query = query.eq('subcategoria', params.subcategoria);
      }

      if (params.genero) {
        query = query.eq('genero', params.genero);
      }

      if (params.location?.cidade) {
        query = query.eq('endereco_cidade', params.location.cidade);
      }

      // Ordenação
      switch (params.ordem) {
        case 'preco_asc':
          query = query.order('valor_girinhas', { ascending: true });
          break;
        case 'preco_desc':
          query = query.order('valor_girinhas', { ascending: false });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      // Limitar resultados
      query = query.limit(20);

      const { data, error } = await query;

      if (error) {
        console.error('❌ Erro ao carregar itens inteligentes:', error);
        throw error;
      }

      console.log('✅ Itens inteligentes carregados:', data?.length || 0);
      
      // Mapear dados explicitamente
      if (!data) return [];
      
      const mappedData = data.map((item) => ({
        id: item.id,
        titulo: item.titulo,
        descricao: item.descricao,
        categoria: item.categoria,
        subcategoria: item.subcategoria,
        genero: item.genero,
        tamanho_categoria: item.tamanho_categoria,
        tamanho_valor: item.tamanho_valor,
        estado_conservacao: item.estado_conservacao,
        valor_girinhas: item.valor_girinhas,
        fotos: item.fotos,
        status: item.status,
        publicado_por: item.publicado_por,
        created_at: item.created_at,
        updated_at: item.updated_at,
        publicado_por_profile: item.publicado_por_profile
      }));
      
      return mappedData;
    },
    enabled: true,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  return {
    data: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch
  };
};
