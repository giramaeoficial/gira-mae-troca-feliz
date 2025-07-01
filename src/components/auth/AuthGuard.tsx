
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
      console.log('🔒 AuthGuard - Verificando acesso para:', location.pathname);
      console.log('🔒 AuthGuard - User:', user?.id);
      console.log('🔒 AuthGuard - Auth Loading:', authLoading);

      // ✅ CORREÇÃO: Aguardar auth carregar primeiro
      if (authLoading) {
        console.log('🔒 AuthGuard - Ainda carregando auth...');
        return; // Não setar checking = false aqui ainda
      }

      try {
        // ✅ CORREÇÃO: Se não está logado, redirecionar para auth
        if (!user) {
          console.log('🔒 AuthGuard - Usuário não logado, redirecionando para /auth');
          setChecking(false); // ✅ IMPORTANTE: Setar false antes de redirecionar
          navigate('/auth', { replace: true });
          return;
        }

        // ✅ CORREÇÃO: Se está na página de cadastro, permitir acesso sem verificar profile
        if (location.pathname === '/cadastro') {
          console.log('🔒 AuthGuard - Página de cadastro, permitindo acesso');
          setChecking(false); // ✅ IMPORTANTE: Setar false
          return;
        }

        // ✅ CORREÇÃO: Verificar status do cadastro apenas para outras páginas
        console.log('🔒 AuthGuard - Verificando status do cadastro...');
        
        const { data, error } = await supabase
          .from('profiles')
          .select('cadastro_status')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('🔒 AuthGuard - Erro ao buscar perfil:', error);
          
          if (error.code === 'PGRST116') {
            // Perfil não encontrado - usuário novo
            console.log('🔒 AuthGuard - Perfil não encontrado, redirecionando para cadastro');
            setChecking(false); // ✅ IMPORTANTE: Setar false antes de redirecionar
            navigate('/cadastro', { replace: true });
            return;
          }
          
          // ✅ CORREÇÃO: Em caso de erro, permitir acesso mas logar o erro
          console.error('🔒 AuthGuard - Erro inesperado, permitindo acesso:', error);
          setChecking(false);
          return;
        }

        console.log('🔒 AuthGuard - Status encontrado:', data);

        // ✅ CORREÇÃO: Se cadastro não está completo, redirecionar para cadastro
        if (data.cadastro_status !== 'completo') {
          console.log('🔒 AuthGuard - Cadastro incompleto, redirecionando para /cadastro');
          setChecking(false); // ✅ IMPORTANTE: Setar false antes de redirecionar
          navigate('/cadastro', { replace: true });
          return;
        }

        // ✅ CORREÇÃO: Cadastro completo, permitir acesso
        console.log('🔒 AuthGuard - Cadastro completo, permitindo acesso');
        setChecking(false); // ✅ IMPORTANTE: Sempre setar false
        
      } catch (error) {
        console.error('🔒 AuthGuard - Erro inesperado ao verificar status do usuário:', error);
        // ✅ CORREÇÃO: Em caso de erro inesperado, permitir acesso
        setChecking(false);
      }
    };

    checkUserStatus();
  }, [user, authLoading, navigate, location.pathname]);

  // ✅ CORREÇÃO: Mostrar loading enquanto auth carrega OU enquanto checking
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
