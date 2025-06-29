
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
    numero_whatsapp?: string;
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
  console.log('🔍 [DEBUG] useFeedInfinito chamado com:', {
    userId,
    filtros,
    userIdType: typeof userId,
    userIdLength: userId?.length,
    filtrosKeys: Object.keys(filtros)
  });

  return useInfiniteQuery({
    queryKey: ['feed-infinito', userId, filtros],
    queryFn: async ({ pageParam = 0 }) => {
      console.log('🔄 [DEBUG] queryFn executando:', {
        pageParam,
        userId,
        filtros,
        timestamp: new Date().toISOString()
      });
      
      // Verificação básica de userId
      if (!userId) {
        console.error('❌ [DEBUG] userId está vazio ou undefined');
        throw new Error('userId é obrigatório');
      }

      // Parâmetros simplificados para debug
      const params = {
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
      };

      console.log('📤 [DEBUG] Enviando parâmetros para RPC:', params);
      
      try {
        const { data, error } = await supabase.rpc(
          'carregar_dados_feed_paginado' as any,
          params
        );
        
        console.log('📥 [DEBUG] Resposta bruta do Supabase:', {
          data,
          error,
          dataType: typeof data,
          dataIsArray: Array.isArray(data),
          dataKeys: data ? Object.keys(data) : null
        });
        
        if (error) {
          console.error('❌ [DEBUG] Erro na RPC:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          });
          throw error;
        }
        
        // Verificação detalhada da estrutura dos dados
        if (!data) {
          console.warn('⚠️ [DEBUG] data é null ou undefined');
          return {
            itens: [],
            has_more: false,
            total_count: 0
          };
        }

        // Forçar conversão para estrutura esperada
        let result: PaginaFeed;
        
        if (Array.isArray(data)) {
          console.log('📋 [DEBUG] Data é array, assumindo que é lista de itens');
          result = {
            itens: data as ItemFeed[],
            has_more: data.length >= 20,
            total_count: data.length
          };
        } else if (typeof data === 'object') {
          console.log('📦 [DEBUG] Data é objeto, tentando extrair estrutura');
          result = data as PaginaFeed;
          
          // Garantir que itens existe
          if (!result.itens) {
            console.warn('⚠️ [DEBUG] result.itens não existe, criando array vazio');
            result.itens = [];
          }
          
          // Garantir has_more
          if (result.has_more === undefined) {
            result.has_more = (result.itens?.length || 0) >= 20;
          }
        } else {
          console.error('❌ [DEBUG] Formato de data não reconhecido:', typeof data);
          result = {
            itens: [],
            has_more: false,
            total_count: 0
          };
        }
        
        console.log('✅ [DEBUG] Resultado final processado:', {
          itensCount: result.itens?.length || 0,
          hasMore: result.has_more,
          totalCount: result.total_count,
          primeiroItem: result.itens?.[0] ? {
            id: result.itens[0].id,
            titulo: result.itens[0].titulo,
            valor: result.itens[0].valor_girinhas
          } : null
        });
        
        return result;
      } catch (err) {
        console.error('💥 [DEBUG] Erro na execução da query:', {
          error: err,
          message: err instanceof Error ? err.message : 'Erro desconhecido',
          stack: err instanceof Error ? err.stack : null
        });
        throw err;
      }
    },
    initialPageParam: 0,
    enabled: !!userId,
    getNextPageParam: (lastPage, allPages) => {
      console.log('🔄 [DEBUG] getNextPageParam:', {
        hasMore: lastPage?.has_more,
        currentPagesCount: allPages.length,
        lastPageItemsCount: lastPage?.itens?.length || 0
      });
      return lastPage?.has_more ? allPages.length : undefined;
    },
    staleTime: 60000,
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      console.log('🔁 [DEBUG] Retry tentativa:', {
        failureCount,
        error: error instanceof Error ? error.message : error,
        willRetry: failureCount < 3
      });
      return failureCount < 3;
    },
  });
};
