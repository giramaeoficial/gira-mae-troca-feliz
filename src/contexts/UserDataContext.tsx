
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

type Profile = Tables<'profiles'>;
type Favorito = Tables<'favoritos'>;
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

interface UserDataContextType {
  profile: Profile | null;
  filhos: FilhoComEscola[];
  favoritos: Favorito[];
  loading: boolean;
  error: string | null;
  refetchProfile: () => Promise<void>;
  refetchFavoritos: () => Promise<void>;
  verificarSeFavorito: (itemId: string) => boolean;
}

const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

export const UserDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [filhos, setFilhos] = useState<FilhoComEscola[]>([]);
  const [favoritos, setFavoritos] = useState<Favorito[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllData = useCallback(async () => {
    if (!user?.id) {
      setProfile(null);
      setFilhos([]);
      setFavoritos([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fazer todas as requisições em paralelo
      const [profileResult, filhosResult, favoritosResult] = await Promise.all([
        // Profile
        supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single(),
        
        // Filhos com escolas
        supabase
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
          .order('created_at', { ascending: true }),

        // Favoritos
        supabase
          .from('favoritos')
          .select('*')
          .eq('user_id', user.id)
      ]);

      // Processar resultados
      if (profileResult.error) throw profileResult.error;
      setProfile(profileResult.data);

      if (filhosResult.error) throw filhosResult.error;
      const filhosProcessados = filhosResult.data?.map(filho => ({
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

      if (favoritosResult.error) throw favoritosResult.error;
      setFavoritos(favoritosResult.data || []);

    } catch (err) {
      console.error('Erro ao carregar dados do usuário:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const refetchProfile = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (err) {
      console.error('Erro ao atualizar perfil:', err);
    }
  }, [user?.id]);

  const refetchFavoritos = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('favoritos')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setFavoritos(data || []);
    } catch (err) {
      console.error('Erro ao atualizar favoritos:', err);
    }
  }, [user?.id]);

  const verificarSeFavorito = useCallback((itemId: string): boolean => {
    return favoritos.some(fav => fav.item_id === itemId);
  }, [favoritos]);

  // Carregar dados quando o usuário muda
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const value = {
    profile,
    filhos,
    favoritos,
    loading,
    error,
    refetchProfile,
    refetchFavoritos,
    verificarSeFavorito
  };

  return <UserDataContext.Provider value={value}>{children}</UserDataContext.Provider>;
};

export const useUserData = () => {
  const context = useContext(UserDataContext);
  if (context === undefined) {
    throw new Error('useUserData must be used within a UserDataProvider');
  }
  return context;
};
