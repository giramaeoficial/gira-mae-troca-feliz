import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// 🔥 ADICIONANDO: Imports do OneSignal (SEM REMOVER NADA)
import { initializeOneSignal } from '@/lib/onesignal';
import { syncPlayerIdWithDatabase } from '@/lib/sync-player-id';

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

  // 🔥 ADICIONANDO: Estado para controlar OneSignal (SEM AFETAR ESTADOS EXISTENTES)
  const [oneSignalInitialized, setOneSignalInitialized] = useState(false);

  useEffect(() => {
    // Get initial session (MANTENDO EXATAMENTE IGUAL)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes (MANTENDO EXATAMENTE IGUAL)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 🔥 ADICIONANDO: Novo useEffect APENAS para OneSignal (SEM AFETAR O EXISTENTE)
  useEffect(() => {
    const setupOneSignal = async () => {
      // Só executar se há usuário, não está carregando e ainda não foi inicializado
      if (!user?.id || loading || oneSignalInitialized) {
        return;
      }

      try {  
        // Inicializar OneSignal com o user ID
        const initialized = await initializeOneSignal(user.id);
        
        if (initialized) {
          setOneSignalInitialized(true);
          
          // Aguardar 3 segundos e sincronizar Player ID
          setTimeout(async () => {
            try {
              const synced = await syncPlayerIdWithDatabase(user.id);
              if (synced) {
              } else {
                console.log('[OneSignal - useAuth] ⚠️ Player ID não foi sincronizado (pode tentar novamente depois)');
              }
            } catch (syncError) {
              console.warn('[OneSignal - useAuth] ⚠️ Erro na sincronização do Player ID (não crítico):', syncError);
            }
          }, 3000);
          
        } else {
          console.warn('[OneSignal - useAuth] ⚠️ OneSignal não foi inicializado (tentará novamente no próximo login)');
        }
        
      } catch (error) {
        console.error('[OneSignal - useAuth] ❌ Erro na configuração do OneSignal:', error);
        // Não bloquear a aplicação por erro do OneSignal
      }
    };

    setupOneSignal();
  }, [user?.id, loading, oneSignalInitialized]);

  // MANTENDO TODAS AS FUNÇÕES ORIGINAIS EXATAMENTE IGUAIS

  const signInWithGoogle = async () => {
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth-callback` // ✅ Login direto vai para auth-callback
      }
    });

    if (error) {
      console.error('❌ useAuth: Erro no login Google:', error);
      throw error;
    }
  };

  const signInWithGoogleForRegistration = async () => {
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth-callback` // ✅ Cadastro também vai para auth-callback
        }
      });

      if (error) {
        console.error('❌ useAuth: Erro no login para cadastro:', error);
        return { success: false, error };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('❌ useAuth: Erro inesperado no login para cadastro:', error);
      return { success: false, error };
    }
  };

  const signOut = async () => {
    
    try {
      // 🔥 ADICIONANDO: Reset do estado OneSignal no logout (SEM AFETAR LÓGICA EXISTENTE)
      setOneSignalInitialized(false);
      
      // Limpar estado local imediatamente (MANTENDO IGUAL)
      setSession(null);
      setUser(null);
      
      // Tentar fazer logout no Supabase (MANTENDO IGUAL)
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

  // MANTENDO EXATAMENTE IGUAL
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

// MANTENDO EXATAMENTE IGUAL
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
