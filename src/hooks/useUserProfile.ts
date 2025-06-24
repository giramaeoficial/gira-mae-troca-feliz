
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface UserProfile {
  id: string;
  email?: string;
  nome?: string;
  username?: string;
  avatar_url?: string;
}

export const useUserProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, nome, username, avatar_url, email')
          .eq('id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Erro ao buscar perfil:', error);
          // Se não encontrou perfil, usar dados básicos do user
          setProfile({
            id: user.id,
            email: user.email,
            nome: user.user_metadata?.full_name || user.user_metadata?.name,
            avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture
          });
        } else if (data) {
          setProfile(data);
        } else {
          // Fallback para dados do auth
          setProfile({
            id: user.id,
            email: user.email,
            nome: user.user_metadata?.full_name || user.user_metadata?.name,
            avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture
          });
        }
      } catch (error) {
        console.error('Erro ao buscar perfil:', error);
        // Fallback para dados básicos
        setProfile({
          id: user.id,
          email: user.email,
          nome: user.user_metadata?.full_name || user.user_metadata?.name,
          avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  return { profile, loading };
};
