
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
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/feed`
      }
    });

    if (error) {
      throw error;
    }
  };

  const signInWithGoogleForRegistration = async () => {
    try {
      // Para o cadastro, usamos o fluxo normal mas redirecionamos para o wizard
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/cadastro?step=phone`
        }
      });

      if (error) {
        return { success: false, error };
      }

      return { success: true, error: null };
    } catch (error) {
      return { success: false, error };
    }
  };

  const signOut = async () => {
    try {
      // Limpar estado local imediatamente
      setSession(null);
      setUser(null);
      
      // Tentar fazer logout no Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error && error.message !== 'Auth session missing!') {
        console.error('Erro ao fazer logout:', error.message);
        toast({
          title: "Erro no logout",
          description: "Houve um problema ao fazer logout, mas você foi desconectado localmente.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Logout realizado",
          description: "Você foi desconectado com sucesso.",
        });
      }
    } catch (error) {
      console.error('Erro no logout:', error);
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
