
import { useUserData } from '@/contexts/UserDataContext';

export const useProfile = () => {
  const { profile, filhos, loading, error, refetchProfile } = useUserData();

  // Função para buscar perfil por ID (mantida para compatibilidade)
  const fetchProfileById = async (id: string) => {
    // Esta função específica ainda precisa fazer requisição própria
    // pois é para buscar outros perfis, não o do usuário logado
    console.warn('fetchProfileById ainda não foi migrado para o contexto');
    return null;
  };

  return {
    profile,
    filhos,
    loading,
    error,
    refetch: refetchProfile,
    fetchProfileById
  };
};
