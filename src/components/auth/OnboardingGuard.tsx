import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useRegiao } from '@/hooks/useRegiao';
import { supabase } from '@/integrations/supabase/client';
import LoadingSpinner from '@/components/loading/LoadingSpinner';

interface OnboardingGuardProps {
  children: React.ReactNode;
}

const OnboardingGuard: React.FC<OnboardingGuardProps> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const { liberada: cidadeLiberada, loading: loadingRegiao } = useRegiao();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (authLoading) return;

      if (!user) {
        navigate('/auth', { replace: true });
        return;
      }

      try {
        // Verificar status do onboarding
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('cadastro_status, telefone_verificado, termos_aceitos, politica_aceita')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('OnboardingGuard - Erro ao buscar perfil:', error);
          navigate('/onboarding/whatsapp', { replace: true });
          return;
        }

        const status = profile.cadastro_status;
        
        // Se cidade foi liberada e usuário ainda está aguardando, liberar automaticamente
        if (cidadeLiberada && status === 'aguardando') {
          console.log('Cidade liberada - atualizando status do usuário para liberado');
          await supabase
            .from('profiles')
            .update({ cadastro_status: 'liberado' })
            .eq('id', user.id);
          
          setChecking(false);
          return;
        }

        // Redirecionar baseado no status
        switch (status) {
          case 'incompleto':
          case 'whatsapp':
            navigate('/onboarding/whatsapp', { replace: true });
            break;
          case 'codigo':
            navigate('/onboarding/codigo', { replace: true });
            break;
          case 'termos':
            navigate('/onboarding/termos', { replace: true });
            break;
          case 'endereco':
            navigate('/onboarding/endereco', { replace: true });
            break;
          case 'itens':
            // Verificar se completou 2 itens e atualizar para 'aguardando'
            const { data: itens } = await supabase
              .from('itens')
              .select('id')
              .eq('publicado_por', user.id);
            
            if (itens && itens.length >= 2) {
              console.log('2 itens publicados - atualizando para aguardando');
              await supabase
                .from('profiles')
                .update({ cadastro_status: 'aguardando' })
                .eq('id', user.id);
              
              navigate('/aguardando-liberacao', { replace: true });
            } else {
              navigate('/conceito-comunidade', { replace: true });
            }
            break;
          case 'aguardando':
            navigate('/aguardando-liberacao', { replace: true });
            break;
          case 'liberado':
          case 'completo':
            // Onboarding completo - permitir acesso
            setChecking(false);
            break;
          default:
            // Status desconhecido, reiniciar onboarding
            navigate('/onboarding/whatsapp', { replace: true });
            break;
        }
      } catch (error) {
        console.error('OnboardingGuard - Erro:', error);
        navigate('/onboarding/whatsapp', { replace: true });
      }
    };

    checkOnboardingStatus();
  }, [user, authLoading, navigate]);

  if (authLoading || checking || loadingRegiao) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-primary to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <LoadingSpinner className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Verificando seu progresso...
          </h2>
          <p className="text-gray-600">
            Aguarde um momento
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default OnboardingGuard;