
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

      // Apply filters
      if (params.vendedorId) {
        query = query.eq('publicado_por', params.vendedorId);
      }

      if (params.busca) {
        query = query.or(`titulo.ilike.%${params.busca}%,descricao.ilike.%${params.busca}%`);
      }

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

      // Apply ordering
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

      query = query.limit(20);

      const { data: rawData, error: queryError } = await query;

      if (queryError) {
        throw queryError;
      }

      console.log('✅ Itens inteligentes carregados:', rawData?.length || 0);
      
      // Map to our simple type
      const items: ItemSimples[] = (rawData || []).map((item: any) => ({
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
