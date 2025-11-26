import { useState, useEffect } from 'react';
import { Post } from '@/blog/types';
import { supabase } from '@/integrations/supabase/client';

interface UseRelatedPostsReturn {
  posts: Post[];
  loading: boolean;
  error: Error | null;
}

export function useRelatedPosts(postId: string | undefined): UseRelatedPostsReturn {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchRelatedPosts = async () => {
      if (!postId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const { data, error: rpcError } = await supabase.rpc('blog_get_related_posts', {
          p_post_id: postId
        });

        if (rpcError) throw rpcError;

        setPosts(data as any || []);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch related posts'));
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedPosts();
  }, [postId]);

  return { posts, loading, error };
}
