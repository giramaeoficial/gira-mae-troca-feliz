
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithGoogleForRegistration: () => Promise<{ success: boolean; error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    console.log('🔄 useAuth: Inicializando auth...');
    
    // ✅ CORREÇÃO: Configurar listener primeiro
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('🔄 useAuth: Mudança de auth detectada:', _event, session?.user?.id || 'logout');
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false); // ✅ IMPORTANTE: Sempre setar loading false após mudança
    });

    // ✅ CORREÇÃO: Depois buscar sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('🔄 useAuth: Sessão inicial carregada:', session?.user?.id || 'nenhuma');
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false); // ✅ IMPORTANTE: Sempre setar loading false
    }).catch((error) => {
      console.error('🔄 useAuth: Erro ao carregar sessão inicial:', error);
      setLoading(false); // ✅ IMPORTANTE: Setar false mesmo em caso de erro
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    console.log('🚀 useAuth: Iniciando login direto com Google...');
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth-callback`
      }
    });

    if (error) {
      console.error('❌ useAuth: Erro no login Google:', error);
      throw error;
    }
    
    console.log('✅ useAuth: Redirecionamento para Google OAuth iniciado');
  };

  const signInWithGoogleForRegistration = async () => {
    console.log('🚀 useAuth: Iniciando login para cadastro com Google...');
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth-callback`
        }
      });

      if (error) {
        console.error('❌ useAuth: Erro no login para cadastro:', error);
        return { success: false, error };
      }

      console.log('✅ useAuth: Redirecionamento para Google OAuth (cadastro) iniciado');
      return { success: true, error: null };
    } catch (error) {
      console.error('❌ useAuth: Erro inesperado no login para cadastro:', error);
      return { success: false, error };
    }
  };

  const signOut = async () => {
    console.log('🚪 useAuth: Iniciando logout...');
    
    try {
      // ✅ CORREÇÃO: Limpar estado local imediatamente
      setSession(null);
      setUser(null);
      
      const { error } = await supabase.auth.signOut();
      
      if (error && error.message !== 'Auth session missing!') {
        console.error('❌ useAuth: Erro ao fazer logout no Supabase:', error.message);
        toast({
          title: "Erro no logout",
          description: "Houve um problema ao fazer logout, mas você foi desconectado localmente.",
          variant: "destructive",
        });
      } else {
        console.log('✅ useAuth: Logout realizado com sucesso');
        toast({
          title: "Logout realizado",
          description: "Você foi desconectado com sucesso.",
        });
      }
    } catch (error) {
      console.error('❌ useAuth: Erro inesperado no logout:', error);
      toast({
        title: "Erro no logout", 
        description: "Você foi desconectado localmente.",
        variant: "destructive",
      });
    }
  };

  const value = {
    session,
    user,
    loading,
    signOut,
    signInWithGoogle,
    signInWithGoogleForRegistration,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
