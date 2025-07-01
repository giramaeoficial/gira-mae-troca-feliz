
import { useState, useEffect } from 'react';
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

type ItemSimples = {
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

interface UseItensInteligenteResult {
  data: ItemSimples[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export const useItensInteligentes = (params: UseItensInteligenteParams): UseItensInteligenteResult => {
  const [data, setData] = useState<ItemSimples[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🔄 Carregando itens inteligentes:', params);
      
      // Build query step by step to avoid complex type inference
      const baseQuery = supabase.from('itens');
      
      // Simple select without complex joins
      let queryBuilder = baseQuery.select('*').eq('status', 'disponivel');

      // Apply filters one by one
      if (params.vendedorId) {
        queryBuilder = queryBuilder.eq('publicado_por', params.vendedorId);
      }

      if (params.busca) {
        queryBuilder = queryBuilder.or(`titulo.ilike.%${params.busca}%,descricao.ilike.%${params.busca}%`);
      }

      if (params.categoria) {
        queryBuilder = queryBuilder.eq('categoria', params.categoria);
      }

      if (params.subcategoria) {
        queryBuilder = queryBuilder.eq('subcategoria', params.subcategoria);
      }

      if (params.genero) {
        queryBuilder = queryBuilder.eq('genero', params.genero);
      }

      // Apply ordering
      switch (params.ordem) {
        case 'preco_asc':
          queryBuilder = queryBuilder.order('valor_girinhas', { ascending: true });
          break;
        case 'preco_desc':
          queryBuilder = queryBuilder.order('valor_girinhas', { ascending: false });
          break;
        default:
          queryBuilder = queryBuilder.order('created_at', { ascending: false });
      }

      queryBuilder = queryBuilder.limit(20);

      // Execute query
      const { data: rawData, error: queryError } = await queryBuilder;

      if (queryError) {
        throw queryError;
      }

      console.log('✅ Itens base carregados:', rawData?.length || 0);
      
      // Now fetch profiles separately to avoid complex joins
      const items: ItemSimples[] = [];
      
      if (rawData && rawData.length > 0) {
        // Get unique publisher IDs
        const publisherIds = [...new Set(rawData.map(item => item.publicado_por))];
        
        // Fetch profiles separately
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, nome, avatar_url, reputacao')
          .in('id', publisherIds);

        // Create a map for quick lookup
        const profileMap = new Map();
        if (profiles) {
          profiles.forEach(profile => {
            profileMap.set(profile.id, profile);
          });
        }

        // Map items with profiles
        for (const item of rawData) {
          const profile = profileMap.get(item.publicado_por);
          
          items.push({
            id: item.id,
            titulo: item.titulo,
            descricao: item.descricao,
            categoria: item.categoria,
            subcategoria: item.subcategoria || undefined,
            genero: item.genero || undefined,
            tamanho_categoria: item.tamanho_categoria || undefined,
            tamanho_valor: item.tamanho_valor || undefined,
            estado_conservacao: item.estado_conservacao,
            valor_girinhas: item.valor_girinhas,
            fotos: item.fotos || undefined,
            status: item.status,
            publicado_por: item.publicado_por,
            created_at: item.created_at,
            updated_at: item.updated_at,
            publicado_por_profile: profile ? {
              nome: profile.nome || '',
              avatar_url: profile.avatar_url || undefined,
              reputacao: profile.reputacao || 0
            } : null
          });
        }
      }
      
      setData(items);
    } catch (err) {
      console.error('❌ Erro ao carregar itens inteligentes:', err);
      setError(err instanceof Error ? err : new Error('Erro desconhecido'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [
    params.categoria,
    params.subcategoria,
    params.genero,
    params.vendedorId,
    params.busca,
    params.location?.cidade,
    params.location?.estado,
    params.ordem
  ]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData
  };
};
