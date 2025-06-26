
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useFavoritos } from '@/hooks/useFavoritos';
import { useSeguidores } from '@/hooks/useSeguidores';

interface ItensInteligentesFiltros {
  location?: { estado: string; cidade: string; bairro?: string } | null;
  mesmaEscola?: boolean;
  mesmoBairro?: boolean;
  paraFilhos?: boolean;
  apenasFavoritos?: boolean;
  apenasSeguidoras?: boolean;
  categoria?: string;
  ordem?: string;
  busca?: string;
}

export const useItensInteligentes = (filtros: ItensInteligentesFiltros) => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { favoritos } = useFavoritos();
  const { buscarItensDasMinhasSeguidas } = useSeguidores();

  return useQuery({
    queryKey: ['itens-inteligentes', filtros, user?.id, favoritos.length],
    queryFn: async () => {
      console.log('🔍 Buscando itens inteligentes com filtros:', filtros);

      if (!user) {
        console.log('❌ Usuário não logado');
        return [];
      }

      // Se é apenas favoritos, buscar apenas os IDs dos favoritos
      if (filtros.apenasFavoritos) {
        if (favoritos.length === 0) {
          console.log('❤️ Nenhum favorito encontrado');
          return [];
        }

        const favoritosIds = favoritos.map(fav => fav.item_id);
        console.log('❤️ Buscando itens favoritos:', favoritosIds);

        const { data, error } = await supabase
          .from('itens')
          .select(`
            *,
            publicado_por_profile:profiles!publicado_por(*)
          `)
          .in('id', favoritosIds)
          .eq('status', 'disponivel');

        if (error) throw error;

        let itensFiltrados = data || [];

        // Aplicar filtros adicionais
        if (filtros.categoria && filtros.categoria !== 'todas') {
          itensFiltrados = itensFiltrados.filter(item => item.categoria === filtros.categoria);
        }

        // Ordenação
        itensFiltrados.sort((a, b) => {
          switch (filtros.ordem) {
            case 'menor-preco':
              return a.valor_girinhas - b.valor_girinhas;
            case 'maior-preco':
              return b.valor_girinhas - a.valor_girinhas;
            default:
              return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          }
        });

        return itensFiltrados;
      }

      // Se é apenas das seguidas
      if (filtros.apenasSeguidoras) {
        console.log('👥 Buscando itens das seguidas');
        const itensSeguidas = await buscarItensDasMinhasSeguidas();
        
        // Aplicar filtros adicionais aos itens das seguidas
        let itensFiltrados = itensSeguidas;

        if (filtros.categoria && filtros.categoria !== 'todas') {
          itensFiltrados = itensFiltrados.filter(item => item.categoria === filtros.categoria);
        }

        if (filtros.busca) {
          const buscaLower = filtros.busca.toLowerCase();
          itensFiltrados = itensFiltrados.filter(item =>
            item.titulo.toLowerCase().includes(buscaLower) ||
            item.descricao?.toLowerCase().includes(buscaLower)
          );
        }

        // Ordenação
        itensFiltrados.sort((a, b) => {
          switch (filtros.ordem) {
            case 'menor-preco':
              return a.valor_girinhas - b.valor_girinhas;
            case 'maior-preco':
              return b.valor_girinhas - a.valor_girinhas;
            default:
              return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          }
        });

        return itensFiltrados;
      }

      // Busca geral com filtros inteligentes
      let query = supabase
        .from('itens')
        .select(`
          *,
          publicado_por_profile:profiles!publicado_por(*)
        `)
        .eq('status', 'disponivel')
        .neq('publicado_por', user.id);

      // Filtro por categoria
      if (filtros.categoria && filtros.categoria !== 'todas') {
        query = query.eq('categoria', filtros.categoria);
      }

      // Filtro por busca
      if (filtros.busca) {
        query = query.or(`titulo.ilike.%${filtros.busca}%,descricao.ilike.%${filtros.busca}%`);
      }

      // Ordenação
      switch (filtros.ordem) {
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

      console.log('✅ Itens encontrados:', data?.length || 0);
      return data || [];
    },
    enabled: !!user,
    staleTime: 30000, // 30 segundos
    refetchOnWindowFocus: false,
  });
};
