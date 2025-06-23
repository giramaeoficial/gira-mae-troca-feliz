
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';

interface FiltrosInteligentes {
  location?: { estado: string; cidade: string; bairro?: string } | null;
  mesmaEscola?: boolean;
  mesmoBairro?: boolean;
  paraFilhos?: boolean;
  categoria?: string;
  ordem?: string;
  busca?: string;
}

export const useItensInteligentes = (filtros: FiltrosInteligentes) => {
  const { user } = useAuth();
  const { profile } = useProfile();

  return useQuery({
    queryKey: ['itens-inteligentes', filtros, user?.id, profile?.cidade],
    queryFn: async () => {
      console.log('🔍 Buscando itens com filtros:', filtros);

      let query = supabase
        .from('itens')
        .select(`
          *,
          publicado_por_profile:profiles!publicado_por(nome, bairro, cidade, avatar_url, reputacao),
          escolas_inep!escola_id(escola, municipio)
        `)
        .eq('status', 'disponivel')
        .neq('publicado_por', user?.id || '');

      // 1. FILTRO DE LOCALIZAÇÃO INTELIGENTE
      const cidadeParaBuscar = filtros.location?.cidade || profile?.cidade;
      if (cidadeParaBuscar) {
        console.log('📍 Filtrando por cidade:', cidadeParaBuscar);
        query = query.eq('endereco_cidade', cidadeParaBuscar);
      }

      // 2. FILTRO DE MESMO BAIRRO
      if (filtros.mesmoBairro && profile?.bairro) {
        console.log('🏘️ Filtrando por mesmo bairro:', profile.bairro);
        query = query.eq('endereco_bairro', profile.bairro);
      }

      // 3. FILTRO DE MESMA ESCOLA
      if (filtros.mesmaEscola) {
        console.log('🏫 Aplicando filtro de mesma escola...');
        
        // Buscar escolas dos filhos do usuário
        const { data: filhos } = await supabase
          .from('filhos')
          .select('escola_id')
          .eq('mae_id', user?.id || '')
          .not('escola_id', 'is', null);

        const escolasFilhos = filhos?.map(f => f.escola_id).filter(Boolean);
        
        if (escolasFilhos && escolasFilhos.length > 0) {
          console.log('🎒 Escolas dos filhos encontradas:', escolasFilhos);
          query = query.in('escola_id', escolasFilhos);
        } else {
          console.log('❌ Usuário não tem filhos com escola cadastrada');
          return [];
        }
      }

      // 4. FILTRO PARA OS FILHOS (tamanhos compatíveis)
      if (filtros.paraFilhos) {
        console.log('👶 Aplicando filtro para filhos...');
        
        const { data: filhos } = await supabase
          .from('filhos')
          .select('tamanho_roupas, tamanho_calcados')
          .eq('mae_id', user?.id || '');

        const tamanhos = filhos?.flatMap(f => [
          f.tamanho_roupas,
          f.tamanho_calcados
        ]).filter(Boolean);

        if (tamanhos && tamanhos.length > 0) {
          console.log('📏 Tamanhos dos filhos:', tamanhos);
          query = query.in('tamanho', tamanhos);
        } else {
          console.log('❌ Usuário não tem filhos com tamanhos cadastrados');
          return [];
        }
      }

      // 5. FILTRO DE CATEGORIA
      if (filtros.categoria && filtros.categoria !== 'todas') {
        console.log('🏷️ Filtrando por categoria:', filtros.categoria);
        query = query.eq('categoria', filtros.categoria);
      }

      // 6. ORDENAÇÃO
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

      if (error) {
        console.error('❌ Erro ao buscar itens:', error);
        throw error;
      }

      console.log(`✅ Encontrados ${data?.length || 0} itens`);
      return data || [];
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 2, // 2 minutos
    gcTime: 1000 * 60 * 5, // 5 minutos
  });
};
