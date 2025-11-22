import { useState, useEffect } from 'react';
import { Tag } from '@/blog/types';
import { getBlogRepository } from '@/blog/lib/data';

interface UseTagsReturn {
  tags: Tag[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useTags(): UseTagsReturn {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTags = async () => {
    try {
      setLoading(true);
      setError(null);
      // Tags são estáticos por enquanto, virão do repository quando implementado
      setTags([]);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  return {
    tags,
    loading,
    error,
    refetch: fetchTags,
  };
}
