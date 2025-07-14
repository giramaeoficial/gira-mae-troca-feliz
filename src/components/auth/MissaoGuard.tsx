// ================================================================
// 3. MissaoGuard.tsx - STEPS 5-6 (ritual de entrada)
// ================================================================

import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import LoadingSpinner from '@/components/loading/LoadingSpinner';

interface MissaoGuardProps {
  children: React.ReactNode;
}

const MissaoGuard: React.FC<MissaoGuardProps> = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [userStatus, setUserStatus] = useState<any>(null);

  useEffect(() => {
    const checkMissaoStatus = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        // Verificar dados do perfil
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select(`
            telefone_verificado,
            termos_aceitos,
            politica_aceita,
            endereco,
            numero,
            cidade,
            estado,
            cadastro_status
          `)
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Erro ao verificar perfil:', profileError);
          setLoading(false);
          return;
        }

        // Contar itens publicados
        const { count: itensCount, error: itensError } = await supabase
          .from('itens')
          .select('*', { count: 'exact', head: true })
          .eq('publicado_por', user.id)
          .neq('status', 'removido');

        if (itensError) {
          console.error('Erro ao contar itens:', itensError);
          setLoading(false);
          return;
        }

        setUserStatus({
          ...profile,
          itens_publicados: itensCount || 0
        });
        setLoading(false);
      } catch (error) {
        console.error('Erro no MissaoGuard:', error);
        setLoading(false);
      }
    };

    checkMissaoStatus();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600">Verificando sua missão...</p>
        </div>
      </div>
    );
  }

  if (!userStatus) {
    return <Navigate to="/auth" replace />;
  }

  // Verificar se onboarding básico está completo
  const onboardingCompleto = userStatus.telefone_verificado && 
                            userStatus.termos_aceitos && 
                            userStatus.politica_aceita && 
                            userStatus.endereco && 
                            userStatus.numero &&
                            userStatus.cidade &&
                            userStatus.estado;

  // Se onboarding não completo, redirecionar
  if (!onboardingCompleto) {
    return <Navigate to="/onboarding/whatsapp" replace />;
  }

  // Verificar se missão está completa (2+ itens)
  const missaoCompleta = userStatus.itens_publicados >= 2;

  // Se missão completa, bloquear acesso às telas de missão
  if (missaoCompleta) {
    const missaoRoutes = ['/conceito-comunidade', '/publicar-primeiro-item'];
    
    if (missaoRoutes.includes(location.pathname)) {
      return <Navigate to="/aguardando-liberacao" replace />;
    }
  }

  // Se missão incompleta, garantir que está na rota correta
  if (!missaoCompleta) {
    const allowedRoutes = ['/conceito-comunidade', '/publicar-primeiro-item'];
    
    if (!allowedRoutes.includes(location.pathname)) {
      // Redirecionar baseado no progresso
      if (userStatus.itens_publicados === 0) {
        return <Navigate to="/conceito-comunidade" replace />;
      } else if (userStatus.itens_publicados === 1) {
        return <Navigate to="/publicar-primeiro-item" replace />;
      }
    }
  }

  return <>{children}</>;
};

export default MissaoGuard;
