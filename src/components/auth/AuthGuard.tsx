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

  useEffect(() => {
    const checkUserStatus = async () => {
      if (authLoading) {
        return;
      }

      // Se não está logado, redirecionar para auth
      if (!user) {
        navigate('/auth', { replace: true });
        return;
      }

      // Se está na página de cadastro, permitir acesso
      if (location.pathname === '/cadastro') {
        setChecking(false);
        return;
      }

      try {
        // Verificar status do cadastro
        const { data, error } = await supabase
          .from('profiles')
          .select('cadastro_status')
          .eq('id', user.id)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            // Perfil não encontrado - usuário novo
            navigate('/cadastro', { replace: true });
            return;
          }
          
          throw error;
        }

        // Se cadastro não está completo, redirecionar para cadastro
        if (data.cadastro_status !== 'completo') {
          navigate('/cadastro', { replace: true });
          return;
        }

        // Cadastro completo, permitir acesso
        setChecking(false);
        
      } catch (error) {
        console.error('AuthGuard - Erro ao verificar status do usuário:', error);
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
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthGuard;
