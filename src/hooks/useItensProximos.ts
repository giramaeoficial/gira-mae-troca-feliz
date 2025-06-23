
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';

interface UseItensProximosParams {
  location?: { estado: string; cidade: string; bairro?: string } | null;
  filters?: {
    mesmaEscola?: boolean;
    mesmoBairro?: boolean;
    paraFilhos?: boolean;
    categoria?: string;
    ordem?: string;
  };
}

export const useItensProximos = ({ location, filters = {} }: UseItensProximosParams) => {
  const { user } = useAuth();
  const { profile } = useProfile();

  return useQuery({
    queryKey: ['itens-proximos', location, filters],
    queryFn: async () => {
      let query = supabase
        .from('itens')
        .select(`
          *,
          publicado_por_profile:profiles!publicado_por(nome, bairro, cidade, avatar_url, reputacao),
          escolas_inep!escola_id(escola)
        `)
        .eq('status', 'disponivel')
        .neq('publicado_por', user?.id || '');

      // FILTRO 1: Localização (priorizar cidade do usuário)
      if (location?.cidade) {
        query = query.eq('endereco_cidade', location.cidade);
      } else if (profile?.cidade) {
        query = query.eq('endereco_cidade', profile.cidade);
      }

      if (location?.estado && !location?.cidade) {
        query = query.eq('endereco_estado', location.estado);
      }

      // FILTRO 2: Mesmo bairro (quando selecionado)
      if (filters.mesmoBairro && profile?.bairro) {
        query = query.eq('endereco_bairro', profile.bairro);
      }

      // FILTRO 3: Mesma escola dos filhos
      if (filters.mesmaEscola) {
        // Buscar escolas dos filhos do usuário
        const { data: filhos } = await supabase
          .from('filhos')
          .select('escola_id')
          .eq('mae_id', user?.id || '')
          .not('escola_id', 'is', null);

        const escolasFilhos = filhos?.map(f => f.escola_id).filter(Boolean);
        
        if (escolasFilhos && escolasFilhos.length > 0) {
          query = query.in('escola_id', escolasFilhos);
        } else {
          // Se não tem filhos com escola, retornar array vazio
          return [];
        }
      }

      // FILTRO 4: Categoria
      if (filters.categoria && filters.categoria !== 'todas') {
        query = query.eq('categoria', filters.categoria);
      }

      // FILTRO 5: Para os meus filhos (tamanhos compatíveis)
      if (filters.paraFilhos) {
        const { data: filhos } = await supabase
          .from('filhos')
          .select('tamanho_roupas, tamanho_calcados')
          .eq('mae_id', user?.id || '');

        const tamanhos = filhos?.flatMap(f => [
          f.tamanho_roupas,
          f.tamanho_calcados
        ]).filter(Boolean);

        if (tamanhos && tamanhos.length > 0) {
          query = query.in('tamanho', tamanhos);
        }
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
