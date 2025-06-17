
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { useQueryWithErrorHandling } from '@/hooks/useQueryWithErrorHandling';
import { getImageUrl } from '@/utils/supabaseStorage';

type Item = Tables<'itens'>;
type ProfileSubset = Pick<Tables<'profiles'>, 'id' | 'nome' | 'avatar_url' | 'bairro' | 'cidade' | 'reputacao'>;

interface ItemComPerfil extends Item {
  profiles?: ProfileSubset | null;
}

interface PaginationState {
  hasMore: boolean;
  lastCreatedAt: string | null;
  isLoadingMore: boolean;
}

interface CacheEntry {
  data: ItemComPerfil[];
  timestamp: number;
  filters: string;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos
const PAGE_SIZE = 20;

export const useItens = () => {
  const { user } = useAuth();
  const [itens, setItens] = useState<ItemComPerfil[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationState>({
    hasMore: true,
    lastCreatedAt: null,
    isLoadingMore: false
  });

  // Refs para abort controllers e cache
  const abortControllerRef = useRef<AbortController | null>(null);
  const cacheRef = useRef<Map<string, CacheEntry>>(new Map());

  // Cache com useMemo para 5 minutos
  const getCachedData = useCallback((cacheKey: string): ItemComPerfil[] | null => {
    const cached = cacheRef.current.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }, []);

  const setCachedData = useCallback((cacheKey: string, data: ItemComPerfil[]) => {
    cacheRef.current.set(cacheKey, {
      data,
      timestamp: Date.now(),
      filters: cacheKey
    });
  }, []);

  // Cleanup de cache expirado
  const cleanupExpiredCache = useCallback(() => {
    const now = Date.now();
    for (const [key, entry] of cacheRef.current.entries()) {
      if (now - entry.timestamp > CACHE_DURATION) {
        cacheRef.current.delete(key);
      }
    }
  }, []);

  // Abort controller cleanup
  const cancelPendingRequests = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  // Prefetch de profiles em single query
  const prefetchProfiles = useCallback(async (userIds: string[]): Promise<Map<string, ProfileSubset>> => {
    if (userIds.length === 0) return new Map();

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, nome, avatar_url, bairro, cidade, reputacao')
        .in('id', userIds);

      if (error) throw error;

      const profilesMap = new Map<string, ProfileSubset>();
      data?.forEach(profile => {
        profilesMap.set(profile.id, profile);
      });

      return profilesMap;
    } catch (err) {
      console.error('Erro ao buscar profiles:', err);
      return new Map();
    }
  }, []);

  const processarFotosItens = useCallback((itens: Item[]): ItemComPerfil[] => {
    return itens.map(item => ({
      ...item,
      fotos: item.fotos ? item.fotos.map(foto => {
        if (foto.startsWith('http') || foto.startsWith('blob:')) {
          return foto;
        }
        return getImageUrl('itens', foto, 'medium');
      }) : []
    }));
  }, []);

  const buscarItens = useCallback(async (
    filtros?: {
      categoria?: string;
      busca?: string;
      tamanho?: string;
      valorMin?: number;
      valorMax?: number;
    },
    loadMore: boolean = false
  ) => {
    try {
      cancelPendingRequests();
      
      const controller = new AbortController();
      abortControllerRef.current = controller;

      const cacheKey = JSON.stringify({
        filtros,
        userId: user?.id,
        loadMore,
        lastCreatedAt: loadMore ? pagination.lastCreatedAt : null
      });

      if (!loadMore) {
        const cachedData = getCachedData(cacheKey);
        if (cachedData) {
          setItens(cachedData);
          setPagination({
            hasMore: cachedData.length >= PAGE_SIZE,
            lastCreatedAt: cachedData[cachedData.length - 1]?.created_at || null,
            isLoadingMore: false
          });
          return cachedData;
        }
      }

      if (loadMore) {
        setPagination(prev => ({ ...prev, isLoadingMore: true }));
      } else {
        setLoading(true);
      }
      setError(null);

      const queryFn = async () => {
        let query = supabase
          .from('itens')
          .select('*')
          .eq('status', 'disponivel')
          .order('created_at', { ascending: false })
          .limit(PAGE_SIZE);

        if (loadMore && pagination.lastCreatedAt) {
          query = query.lt('created_at', pagination.lastCreatedAt);
        }

        if (filtros?.categoria && filtros.categoria !== 'todos') {
          query = query.eq('categoria', filtros.categoria);
        }

        if (filtros?.busca) {
          query = query.or(`titulo.ilike.%${filtros.busca}%,descricao.ilike.%${filtros.busca}%`);
        }

        if (filtros?.tamanho) {
          query = query.eq('tamanho', filtros.tamanho);
        }

        if (filtros?.valorMin !== undefined) {
          query = query.gte('valor_girinhas', filtros.valorMin);
        }

        if (filtros?.valorMax !== undefined) {
          query = query.lte('valor_girinhas', filtros.valorMax);
        }

        if (user) {
          query = query.neq('publicado_por', user.id);
        }

        return query;
      };

      const { data: itensData, error } = await Promise.race([
        queryFn(),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Timeout: busca demorou mais que 30 segundos')), 30000)
        )
      ]);

      if (error) {
        if (!loadMore) {
          const cachedData = getCachedData(cacheKey);
          if (cachedData) {
            console.log('Usando cache como fallback após erro');
            setItens(cachedData);
            setError('Dados podem estar desatualizados (sem conexão)');
            return cachedData;
          }
        }
        throw error;
      }

      if (controller.signal.aborted) {
        return [];
      }

      const itensComFotosProcessadas = processarFotosItens(itensData || []);

      const userIds = [...new Set(itensComFotosProcessadas.map(item => item.publicado_por))];
      const profilesMap = await prefetchProfiles(userIds);

      if (controller.signal.aborted) {
        return [];
      }

      const itensComPerfil: ItemComPerfil[] = itensComFotosProcessadas.map(item => ({
        ...item,
        profiles: profilesMap.get(item.publicado_por) || null
      }));

      if (loadMore) {
        setItens(prev => [...prev, ...itensComPerfil]);
        setPagination(prev => ({
          ...prev,
          hasMore: itensComPerfil.length >= PAGE_SIZE,
          lastCreatedAt: itensComPerfil[itensComPerfil.length - 1]?.created_at || prev.lastCreatedAt,
          isLoadingMore: false
        }));
      } else {
        setItens(itensComPerfil);
        setPagination({
          hasMore: itensComPerfil.length >= PAGE_SIZE,
          lastCreatedAt: itensComPerfil[itensComPerfil.length - 1]?.created_at || null,
          isLoadingMore: false
        });
        
        setCachedData(cacheKey, itensComPerfil);
      }

      cleanupExpiredCache();

      return itensComPerfil;
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return [];
      }
      
      console.error('Erro ao buscar itens:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar itens');
      return [];
    } finally {
      setLoading(false);
      if (loadMore) {
        setPagination(prev => ({ ...prev, isLoadingMore: false }));
      }
    }
  }, [user, pagination.lastCreatedAt, prefetchProfiles, getCachedData, setCachedData, cancelPendingRequests, cleanupExpiredCache, processarFotosItens]);

  const buscarItemPorId = useCallback(async (itemId: string) => {
    try {
      console.log('Buscando item por ID:', itemId);
      
      const { data, error } = await supabase
        .from('itens')
        .select(`
          *,
          profiles!publicado_por (
            id,
            nome,
            avatar_url,
            bairro,
            cidade,
            reputacao,
            telefone
          )
        `)
        .eq('id', itemId)
        .single();

      if (error) {
        console.error('Erro ao buscar item:', error);
        throw error;
      }
      
      if (!data) {
        throw new Error('Item não encontrado');
      }
      
      console.log('Item encontrado:', data);
      
      // Processar fotos do item
      if (data.fotos) {
        data.fotos = data.fotos.map(foto => {
          if (foto.startsWith('http') || foto.startsWith('blob:')) {
            return foto;
          }
          return getImageUrl('itens', foto, 'medium');
        });
      }
      
      return data;
    } catch (err) {
      console.error('Erro ao buscar item por ID:', err);
      throw err;
    }
  }, []);

  const carregarMais = useCallback(() => {
    if (pagination.hasMore && !pagination.isLoadingMore && !loading) {
      buscarItens(undefined, true);
    }
  }, [pagination.hasMore, pagination.isLoadingMore, loading, buscarItens]);

  const buscarTodosItens = useCallback(async () => {
    try {
      cancelPendingRequests();
      
      const controller = new AbortController();
      abortControllerRef.current = controller;

      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('itens')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (controller.signal.aborted) {
        return [];
      }

      const itensComFotosProcessadas = processarFotosItens(data || []);

      const userIds = [...new Set(itensComFotosProcessadas.map(item => item.publicado_por))];
      const profilesMap = await prefetchProfiles(userIds);

      if (controller.signal.aborted) {
        return [];
      }

      const itensComPerfil: ItemComPerfil[] = itensComFotosProcessadas.map(item => ({
        ...item,
        profiles: profilesMap.get(item.publicado_por) || null
      }));

      setItens(itensComPerfil);
      return itensComPerfil;
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return [];
      }
      
      console.error('Erro ao buscar todos os itens:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar itens');
      return [];
    } finally {
      setLoading(false);
    }
  }, [prefetchProfiles, cancelPendingRequests, processarFotosItens]);

  const buscarMeusItens = useCallback(async () => {
    if (!user) return [];

    try {
      cancelPendingRequests();
      
      const controller = new AbortController();
      abortControllerRef.current = controller;

      setLoading(true);
      const { data, error } = await supabase
        .from('itens')
        .select('*')
        .eq('publicado_por', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const itensComFotosProcessadas = processarFotosItens(data || []);
      
      return itensComFotosProcessadas;
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return [];
      }
      
      console.error('Erro ao buscar meus itens:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar meus itens');
      return [];
    } finally {
      setLoading(false);
    }
  }, [user, cancelPendingRequests, processarFotosItens]);

  const buscarItensDoUsuario = useCallback(async (usuarioId: string) => {
    try {
      cancelPendingRequests();
      
      const controller = new AbortController();
      abortControllerRef.current = controller;

      setLoading(true);
      const { data, error } = await supabase
        .from('itens')
        .select('*')
        .eq('publicado_por', usuarioId)
        .eq('status', 'disponivel')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Processar fotos antes de retornar - CORREÇÃO PRINCIPAL
      const itensComFotosProcessadas = processarFotosItens(data || []);
      
      return itensComFotosProcessadas;
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return [];
      }
      
      console.error('Erro ao buscar itens do usuário:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar itens do usuário');
      return [];
    } finally {
      setLoading(false);
    }
  }, [cancelPendingRequests, processarFotosItens]);

  const publicarItem = useCallback(async (novoItem: {
    titulo: string;
    descricao: string;
    categoria: string;
    tamanho?: string;
    estado_conservacao: string;
    valor_girinhas: number;
    fotos?: string[];
  }) => {
    if (!user) return false;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('itens')
        .insert({
          ...novoItem,
          publicado_por: user.id
        });

      if (error) throw error;
      
      cacheRef.current.clear();
      
      return true;
    } catch (err) {
      console.error('Erro ao publicar item:', err);
      setError(err instanceof Error ? err.message : 'Erro ao publicar item');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const atualizarItem = useCallback(async (itemId: string, updates: Partial<Item>) => {
    if (!user) return false;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('itens')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', itemId)
        .eq('publicado_por', user.id);

      if (error) throw error;
      
      cacheRef.current.clear();
      
      return true;
    } catch (err) {
      console.error('Erro ao atualizar item:', err);
      setError(err instanceof Error ? err.message : 'Erro ao atualizar item');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const deletarItem = useCallback(async (itemId: string) => {
    if (!user) return false;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('itens')
        .delete()
        .eq('id', itemId)
        .eq('publicado_por', user.id);

      if (error) throw error;
      
      cacheRef.current.clear();
      
      return true;
    } catch (err) {
      console.error('Erro ao deletar item:', err);
      setError(err instanceof Error ? err.message : 'Erro ao deletar item');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      cancelPendingRequests();
    };
  }, [cancelPendingRequests]);

  // Auto-load on mount
  useEffect(() => {
    buscarItens();
    
    return () => {
      cancelPendingRequests();
    };
  }, [user]);

  // Memoized values
  const memoizedValues = useMemo(() => ({
    itens,
    loading,
    error,
    pagination,
    hasMore: pagination.hasMore,
    isLoadingMore: pagination.isLoadingMore
  }), [itens, loading, error, pagination]);

  return {
    ...memoizedValues,
    buscarItens,
    buscarTodosItens,
    buscarMeusItens,
    buscarItensDoUsuario,
    buscarItemPorId,
    publicarItem,
    atualizarItem,
    deletarItem,
    carregarMais
  };
};
