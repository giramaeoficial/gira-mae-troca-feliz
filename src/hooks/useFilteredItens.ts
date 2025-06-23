
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';

interface FilteredItensParams {
  busca: string;
  categoria: string;
  ordem: string;
  escola: any;
  estadoConservacao?: string;
  tamanho?: string;
  valorMin?: string;
  valorMax?: string;
  estado?: string;
  cidade?: string;
  bairro?: string;
  mesmaEscola?: boolean;
  mesmoBairro?: boolean;
  paraFilhos?: boolean;
}

export const useFilteredItens = (filters: FilteredItensParams) => {
  const { user } = useAuth();
  const { profile } = useProfile();

  return useQuery({
    queryKey: ['filtered-itens', filters],
    queryFn: async () => {
      let query = supabase
        .from('itens')
        .select(`
          *,
          publicado_por_profile:profiles!publicado_por(*),
          escolas_inep!escola_id(*)
        `)
        .eq('status', 'disponivel')
        .neq('publicado_por', user?.id || '');

      // Filtro por busca
      if (filters.busca) {
        query = query.or(`titulo.ilike.%${filters.busca}%,descricao.ilike.%${filters.busca}%`);
      }

      // Filtro por categoria
      if (filters.categoria && filters.categoria !== 'todas') {
        query = query.eq('categoria', filters.categoria);
      }

      // Filtro por estado de conservação
      if (filters.estadoConservacao) {
        query = query.eq('estado_conservacao', filters.estadoConservacao);
      }

      // Filtro por tamanho
      if (filters.tamanho) {
        query = query.eq('tamanho', filters.tamanho);
      }

      // Filtro por valor
      if (filters.valorMin) {
        query = query.gte('valor_girinhas', parseFloat(filters.valorMin));
      }
      if (filters.valorMax) {
        query = query.lte('valor_girinhas', parseFloat(filters.valorMax));
      }

      // Filtro por localização
      if (filters.estado) {
        query = query.eq('endereco_estado', filters.estado);
      }
      if (filters.cidade) {
        query = query.eq('endereco_cidade', filters.cidade);
      }
      if (filters.bairro) {
        query = query.eq('endereco_bairro', filters.bairro);
      }

      // Filtro mesmo bairro
      if (filters.mesmoBairro && profile?.bairro) {
        query = query.eq('endereco_bairro', profile.bairro);
      }

      // Ordenação
      switch (filters.ordem) {
        case 'menor-preco':
          query = query.order('valor_girinhas', { ascending: true });
          break;
        case 'maior-preco':
          query = query.order('valor_girinhas', { ascending: false });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    },
    enabled: !!user
  });
};
