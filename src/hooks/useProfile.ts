
import { useUserData } from '@/contexts/UserDataContext';
import { supabase } from '@/integrations/supabase/client';

export const useProfile = () => {
  const { profile, filhos, loading, error, refetchProfile } = useUserData();

  // Função para buscar perfil por ID (mantida para compatibilidade)
  const fetchProfileById = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao buscar perfil por ID:', error);
      return null;
    }
  };

  // ✅ Funções adicionais mantidas para compatibilidade
  const updateProfile = async (profileData: any) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', profile?.id);

      if (error) throw error;
      await refetchProfile();
      return true;
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      return false;
    }
  };

  const deleteFilho = async (filhoId: string) => {
    try {
      const { error } = await supabase
        .from('filhos')
        .delete()
        .eq('id', filhoId);

      if (error) throw error;
      await refetchProfile();
      return true;
    } catch (error) {
      console.error('Erro ao deletar filho:', error);
      return false;
    }
  };

  return {
    profile,
    filhos,
    loading,
    error,
    refetch: refetchProfile,
    fetchProfileById,
    updateProfile,
    deleteFilho
  };
};
