import { useState, useEffect, useRef } from 'react';
import { Post, PostFilters, PaginationOptions } from '@/blog/types';
import { getBlogRepository } from '@/blog/lib/data';

interface UsePostsReturn {
  posts: Post[];
  loading: boolean;
  error: Error | null;
  hasMore: boolean;
  refetch: () => void;
}

export function usePosts(
  filters?: PostFilters,
  pagination?: PaginationOptions
): UsePostsReturn {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(false);
  
  // Guarda os filtros anteriores para detectar mudanças
  const prevFiltersRef = useRef<string>('');

  const fetchPosts = async (isLoadMore: boolean) => {
    try {
      setLoading(true);
      setError(null);
      
      const repository = getBlogRepository();
      const result = await repository.getPosts(filters, pagination);
      
      if (isLoadMore) {
        // Acumula posts (load more)
        setPosts(prev => [...prev, ...result]);
      } else {
        // Substitui posts (novos filtros)
        setPosts(result);
      }
      
      setHasMore(result.length === (pagination?.pageSize || 10));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch posts'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Serializa filtros atuais (sem página)
    const currentFilters = JSON.stringify({
      status: filters?.status,
      categoryId: filters?.categoryId,
      authorId: filters?.authorId,
      search: filters?.search,
      tags: filters?.tags,
    });
    
    // Verifica se os filtros mudaram
    const filtersChanged = currentFilters !== prevFiltersRef.current;
    prevFiltersRef.current = currentFilters;
    
    // Se filtros mudaram, é uma nova busca. Se não, é load more.
    const isLoadMore = !filtersChanged && (pagination?.page || 1) > 1;
    
    fetchPosts(isLoadMore);
  }, [
    filters?.status,
    filters?.categoryId,
    filters?.authorId,
    filters?.search,
    JSON.stringify(filters?.tags),
    pagination?.page,
    pagination?.pageSize,
  ]);

  return {
    posts,
    loading,
    error,
    hasMore,
    refetch: () => fetchPosts(false),
  };
}
