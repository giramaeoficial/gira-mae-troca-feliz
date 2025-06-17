
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

type Profile = Tables<'profiles'>;
type Filho = Tables<'filhos'>;

interface FilhoComEscola extends Filho {
  escolas_inep?: {
    codigo_inep: number;
    escola: string;
    municipio: string;
    uf: string;
    categoria_administrativa: string;
  } | null;
}

export const useProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [filhos, setFilhos] = useState<FilhoComEscola[]>([]);
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

      // Buscar perfil
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      setProfile(profileData);

      // Buscar filhos com escolas
      const { data: filhosData, error: filhosError } = await supabase
        .from('filhos')
        .select(`
          *,
          escolas_inep!filhos_escola_id_fkey (
            codigo_inep,
            escola,
            municipio,
            uf,
            categoria_administrativa
          )
        `)
        .eq('mae_id', user.id)
        .order('created_at', { ascending: true });

      if (filhosError) throw filhosError;

      const filhosProcessados = filhosData?.map(filho => ({
        ...filho,
        escolas_inep: filho.escolas_inep ? {
          codigo_inep: filho.escolas_inep.codigo_inep,
          escola: filho.escolas_inep.escola || '',
          municipio: filho.escolas_inep.municipio || '',
          uf: filho.escolas_inep.uf || '',
          categoria_administrativa: filho.escolas_inep.categoria_administrativa || ''
        } : null
      })) || [];

      setFilhos(filhosProcessados);
    } catch (err) {
      console.error('Erro ao carregar perfil:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchProfileByName = useCallback(async (nome: string) => {
    try {
      setLoading(true);
      setError(null);

      console.log('Buscando perfil por nome:', nome);

      // Buscar perfil por nome
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('nome', decodeURIComponent(nome))
        .single();

      if (profileError) {
        console.error('Erro ao buscar perfil:', profileError);
        throw profileError;
      }

      console.log('Perfil encontrado:', profileData);
      setProfile(profileData);

      // Buscar filhos do perfil com escolas
      const { data: filhosData, error: filhosError } = await supabase
        .from('filhos')
        .select(`
          *,
          escolas_inep!filhos_escola_id_fkey (
            codigo_inep,
            escola,
            municipio,
            uf,
            categoria_administrativa
          )
        `)
        .eq('mae_id', profileData.id)
        .order('created_at', { ascending: true });

      if (filhosError) throw filhosError;

      const filhosProcessados = filhosData?.map(filho => ({
        ...filho,
        escolas_inep: filho.escolas_inep ? {
          codigo_inep: filho.escolas_inep.codigo_inep,
          escola: filho.escolas_inep.escola || '',
          municipio: filho.escolas_inep.municipio || '',
          uf: filho.escolas_inep.uf || '',
          categoria_administrativa: filho.escolas_inep.categoria_administrativa || ''
        } : null
      })) || [];

      setFilhos(filhosProcessados);
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

      // Atualizar estado local
      setProfile(prev => prev ? { ...prev, ...updates } : null);
      return true;
    } catch (err) {
      console.error('Erro ao atualizar perfil:', err);
      setError(err instanceof Error ? err.message : 'Erro ao atualizar perfil');
      return false;
    }
  }, [user]);

  const deleteFilho = useCallback(async (filhoId: string) => {
    try {
      const { error } = await supabase
        .from('filhos')
        .delete()
        .eq('id', filhoId);

      if (error) throw error;

      // Atualizar estado local
      setFilhos(prev => prev.filter(filho => filho.id !== filhoId));
      return true;
    } catch (err) {
      console.error('Erro ao deletar filho:', err);
      setError(err instanceof Error ? err.message : 'Erro ao deletar filho');
      return false;
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

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
