import { useState, useEffect } from 'react';
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

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const repository = getBlogRepository();
      const result = await repository.getPosts(filters, pagination);
      
      setPosts(result);
      setHasMore(result.length === (pagination?.pageSize || 10));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch posts'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [
    filters?.status,
    filters?.categoryId,
    filters?.authorId,
    filters?.search,
    JSON.stringify(filters?.tags), // Serializa para detectar mudanças no array
    pagination?.page,
    pagination?.pageSize,
  ]);

  return {
    posts,
    loading,
    error,
    hasMore,
    refetch: fetchPosts,
  };
}
