// src/components/auth/AuthGuard.tsx - SUBSTITUA COMPLETAMENTE
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import LoadingSpinner from '@/components/loading/LoadingSpinner';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [checking, setChecking] = useState(true);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    const checkUserStatus = async () => {
      console.log('🔒 AuthGuard - Verificando acesso para:', location.pathname);
      console.log('🔒 AuthGuard - User:', user?.id);
      console.log('🔒 AuthGuard - Auth Loading:', authLoading);

      if (authLoading) {
        console.log('🔒 AuthGuard - Ainda carregando auth...');
        return;
      }

      // Se não está logado, redirecionar para auth
      if (!user) {
        console.log('🔒 AuthGuard - Usuário não logado, redirecionando para /auth');
        navigate('/auth', { replace: true });
        return;
      }

      // Se está na página de cadastro, permitir acesso
      if (location.pathname === '/cadastro') {
        console.log('🔒 AuthGuard - Página de cadastro, permitindo acesso');
        setChecking(false);
        return;
      }

      try {
        console.log('🔒 AuthGuard - Verificando status do cadastro...');
        
        // Verificar status do cadastro
        const { data, error } = await supabase
          .from('profiles')
          .select('cadastro_status, cadastro_step, nome, telefone')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('🔒 AuthGuard - Erro ao buscar perfil:', error);
          throw error;
        }

        console.log('🔒 AuthGuard - Status encontrado:', data);
        setDebugInfo(data);

        // Se cadastro não está completo, redirecionar para cadastro
        if (data.cadastro_status === 'incompleto') {
          console.log('🔒 AuthGuard - Cadastro incompleto, redirecionando para /cadastro');
          console.log('🔒 AuthGuard - Step atual:', data.cadastro_step);
          navigate('/cadastro', { replace: true });
          return;
        }

        // Cadastro completo, permitir acesso
        console.log('🔒 AuthGuard - Cadastro completo, permitindo acesso');
        setChecking(false);
        
      } catch (error) {
        console.error('🔒 AuthGuard - Erro ao verificar status do usuário:', error);
        console.log('🔒 AuthGuard - Redirecionando para /auth devido ao erro');
        navigate('/auth', { replace: true });
      }
    };

    checkUserStatus();
  }, [user, authLoading, navigate, location.pathname]);

  if (authLoading || checking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600">Verificando permissões...</p>
          {debugInfo && (
            <div className="mt-4 p-4 bg-white rounded-lg shadow-sm text-sm text-left">
              <h4 className="font-medium mb-2">Debug Info:</h4>
              <pre className="text-xs">{JSON.stringify(debugInfo, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthGuard;
