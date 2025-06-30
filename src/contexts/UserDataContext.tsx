
import React, { createContext, useContext, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface UserData {
  profile: {
    id: string;
    nome: string;
    avatar_url?: string;
    reputacao?: number;
    bairro?: string;
    cidade?: string;
    estado?: string;
    cep?: string;
    endereco?: string;
    numero?: string;
    complemento?: string;
    ponto_referencia?: string;
  } | null;
  carteira: {
    saldo_atual: number;
    total_recebido: number;
    total_gasto: number;
  } | null;
  filhos: Array<{
    id: string;
    nome: string;
    escola_id?: number;
    data_nascimento?: string;
  }>;
  escolasIds: number[];
}

interface UserDataContextType {
  userData: UserData | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

export const useUserData = () => {
  const context = useContext(UserDataContext);
  if (context === undefined) {
    throw new Error('useUserData must be used within a UserDataProvider');
  }
  return context;
};

interface UserDataProviderProps {
  children: ReactNode;
}

export const UserDataProvider: React.FC<UserDataProviderProps> = ({ children }) => {
  const { user } = useAuth();

  const { data: userData, isLoading, error, refetch } = useQuery({
    queryKey: ['user-data', user?.id],
    queryFn: async (): Promise<UserData | null> => {
      if (!user?.id) return null;

      console.log('🔄 Carregando dados do usuário (contexto global):', user.id);

      // Buscar perfil
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select(`
          id, nome, avatar_url, reputacao, bairro, cidade, estado,
          cep, endereco, numero, complemento, ponto_referencia
        `)
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) {
        console.error('❌ Erro ao buscar perfil:', profileError);
        throw profileError;
      }

      // Buscar carteira
      const { data: carteira, error: carteiraError } = await supabase
        .from('carteiras')
        .select('saldo_atual, total_recebido, total_gasto')
        .eq('user_id', user.id)
        .maybeSingle();

      if (carteiraError) {
        console.error('❌ Erro ao buscar carteira:', carteiraError);
        throw carteiraError;
      }

      // Buscar filhos
      const { data: filhos, error: filhosError } = await supabase
        .from('filhos')
        .select('id, nome, escola_id, data_nascimento')
        .eq('mae_id', user.id);

      if (filhosError) {
        console.error('❌ Erro ao buscar filhos:', filhosError);
        throw filhosError;
      }

      // Extrair IDs das escolas
      const escolasIds = (filhos || [])
        .map(filho => filho.escola_id)
        .filter((id): id is number => id !== null && id !== undefined);

      const result = {
        profile: profile || null,
        carteira: carteira || null,
        filhos: filhos || [],
        escolasIds: [...new Set(escolasIds)] // Remove duplicatas
      };

      console.log('✅ Dados do usuário carregados (contexto):', result);
      return result;
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutos
    refetchOnWindowFocus: false,
  });

  return (
    <UserDataContext.Provider value={{ 
      userData, 
      isLoading, 
      error: error as Error | null, 
      refetch 
    }}>
      {children}
    </UserDataContext.Provider>
  );
};
