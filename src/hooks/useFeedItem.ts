
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PaginaFeed } from './useFeedInfinito';

/**
 * ✅ HOOK OTIMIZADO - Única fonte de dados para tela de detalhes do item
 * Retorna todos os dados necessários consolidados em uma única requisição RPC
 */
export const useFeedItem = (userId: string, itemId: string) => {
  return useQuery({
    queryKey: ['feed-item', userId, itemId],
    queryFn: async () => {
      console.log('🔄 [ÚNICA REQUISIÇÃO] Carregando item individual:', itemId);

      const { data, error } = await supabase.rpc(
        'carregar_dados_feed_paginado' as any,
        {
          p_user_id: userId,
          p_page: 0,
          p_limit: 1,
          p_busca: '',
          p_cidade: '',
          p_categoria: 'todas',
          p_subcategoria: 'todas',
          p_genero: 'todos',
          p_tamanho: 'todos',
          p_preco_min: 0,
          p_preco_max: 200,
          p_mostrar_reservados: true,
          p_item_id: itemId // ✅ Filtro específico por ID
        }
      );

      if (error) {
        console.error('❌ Erro ao carregar item:', error);
        throw error;
      }

      const result = data as unknown as PaginaFeed;
      console.log('✅ [DADOS CONSOLIDADOS] Item carregado com todos os dados:', {
        item: result.itens[0]?.titulo,
        favoritos: result.favoritos?.length || 0,
        reservas: result.reservas_usuario?.length || 0,
        filas: Object.keys(result.filas_espera || {}).length,
        profile: result.profile_essencial?.nome
      });

      // Extrair o item específico e todos os dados do feed
      const item = result.itens[0] || null;

      return {
        item,
        feedData: {
          favoritos: result.favoritos || [],
          reservas_usuario: result.reservas_usuario || [],
          filas_espera: result.filas_espera || {}
        },
        configuracoes: result.configuracoes,
        profile_essencial: result.profile_essencial
      };
    },
    enabled: !!userId && !!itemId,
    staleTime: 1000 * 60 * 5, // ✅ 5 minutos - dados ficam frescos
    gcTime: 1000 * 60 * 10, // ✅ 10 minutos no cache
    refetchOnWindowFocus: false,
    refetchOnMount: false, // ✅ Não refaz se já tem no cache
  });
};

// Interface para os dados retornados pelo hook
export interface FeedItemData {
  item: any | null;
  feedData: {
    favoritos: string[];
    reservas_usuario: Array<{
      item_id: string;
      status: string;
      usuario_reservou?: string;
      id?: string;
    }>;
    filas_espera: Record<string, {
      total_fila: number;
      posicao_usuario: number;
      usuario_id?: string;
    }>;
  };
  configuracoes?: any;
  profile_essencial?: any;
}
