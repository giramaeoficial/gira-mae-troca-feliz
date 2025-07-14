// ================================================================
// 5. AcessoTotalGuard.tsx - STEP 8+ (acesso completo)
// ================================================================

import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import LoadingSpinner from '@/components/loading/LoadingSpinner';

interface AcessoTotalGuardProps {
  children: React.ReactNode;
}

const AcessoTotalGuard: React.FC<AcessoTotalGuardProps> = ({ children }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userStatus, setUserStatus] = useState<any>(null);

  useEffect(() => {
    const checkAcessoTotal = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        // Verificar se é admin
        const { data: adminCheck, error: adminError } = await supabase
          .from('admin_users')
          .select('user_id')
          .eq('user_id', user.id)
          .single();

        const isAdmin = !adminError && adminCheck;

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
            estado
          `)
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Erro ao verificar perfil:', profileError);
          setLoading(false);
          return;
        }

        let cidadeLiberada = false;
        let itensCount = 0;

        // Se não é admin, verificar requisitos completos
        if (!isAdmin) {
          // Contar itens publicados
          const { count, error: itensError } = await supabase
            .from('itens')
            .select('*', { count: 'exact', head: true })
            .eq('publicado_por', user.id)
            .neq('status', 'removido');

          if (itensError) {
            console.error('Erro ao contar itens:', itensError);
          }
          itensCount = count || 0;

          // Verificar se cidade está liberada
          if (profile.cidade && profile.estado) {
            const { data: cidadeConfig, error: cidadeError } = await supabase
              .from('cidades_config')
              .select('liberada')
              .eq('cidade', profile.cidade)
              .eq('estado', profile.estado)
              .single();

            if (!cidadeError && cidadeConfig) {
              cidadeLiberada = cidadeConfig.liberada;
            }
          }
        }

        setUserStatus({
          ...profile,
          itens_publicados: itensCount,
          cidade_liberada: cidadeLiberada,
          is_admin: isAdmin
        });
        setLoading(false);
      } catch (error) {
        console.error('Erro no AcessoTotalGuard:', error);
        setLoading(false);
      }
    };

    checkAcessoTotal();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600">Verificando permissões de acesso...</p>
        </div>
      </div>
    );
  }

  if (!userStatus) {
    return <Navigate to="/auth" replace />;
  }

  // Admin com telefone verificado tem acesso total
  if (userStatus.is_admin && userStatus.telefone_verificado) {
    return <>{children}</>;
  }

  // Verificar pré-requisitos para usuários normais
  const onboardingCompleto = userStatus.telefone_verificado && 
                            userStatus.termos_aceitos && 
                            userStatus.politica_aceita && 
                            userStatus.endereco && 
                            userStatus.numero &&
                            userStatus.cidade &&
                            userStatus.estado;

  const missaoCompleta = userStatus.itens_publicados >= 2;

  // Redirecionar se não atende requisitos
  if (!onboardingCompleto) {
    return <Navigate to="/onboarding/whatsapp" replace />;
  }

  if (!missaoCompleta) {
    return <Navigate to="/conceito-comunidade" replace />;
  }

  if (!userStatus.cidade_liberada) {
    return <Navigate to="/aguardando-liberacao" replace />;
  }

  // Usuário tem acesso total
  return <>{children}</>;
};

export default AcessoTotalGuard;
