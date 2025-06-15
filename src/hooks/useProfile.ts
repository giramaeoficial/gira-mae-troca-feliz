
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

type Profile = Tables<'profiles'>;
type Filho = Tables<'filhos'>;

export const useProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [filhos, setFilhos] = useState<Filho[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      setProfile(profileData);

      const { data: filhosData, error: filhosError } = await supabase
        .from('filhos')
        .select('*')
        .eq('mae_id', user.id)
        .order('created_at', { ascending: true });

      if (filhosError) throw filhosError;

      setFilhos(filhosData || []);
    } catch (err) {
      console.error('Erro ao carregar perfil:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const fetchProfileByName = useCallback(async (nome: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('nome', decodeURIComponent(nome))
        .maybeSingle();

      if (profileError) throw profileError;

      if (!profileData) {
        setError('Perfil não encontrado');
        return null;
      }

      setProfile(profileData);

      const { data: filhosData, error: filhosError } = await supabase
        .from('filhos')
        .select('*')
        .eq('mae_id', profileData.id)
        .order('created_at', { ascending: true });

      if (filhosError) throw filhosError;

      setFilhos(filhosData || []);
      return profileData;
    } catch (err) {
      console.error('Erro ao carregar perfil por nome:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (updates: Partial<Profile>) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      setProfile(prev => prev ? { ...prev, ...updates } : null);
      return true;
    } catch (err) {
      console.error('Erro ao atualizar perfil:', err);
      setError(err instanceof Error ? err.message : 'Erro ao atualizar perfil');
      return false;
    }
  }, [user?.id]);

  const deleteFilho = useCallback(async (filhoId: string) => {
    try {
      const { error } = await supabase
        .from('filhos')
        .delete()
        .eq('id', filhoId);

      if (error) throw error;

      setFilhos(prev => prev.filter(filho => filho.id !== filhoId));
      return true;
    } catch (err) {
      console.error('Erro ao deletar filho:', err);
      setError(err instanceof Error ? err.message : 'Erro ao deletar filho');
      return false;
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    
    if (user && mounted) {
      fetchProfile();
    }
    
    return () => {
      mounted = false;
    };
  }, [user?.id, fetchProfile]);

  return {
    profile,
    filhos,
    loading,
    error,
    refetch: fetchProfile,
    fetchProfileByName,
    updateProfile,
    deleteFilho
  };
};
