import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import LoadingSpinner from '@/components/loading/LoadingSpinner';
import { useToast } from '@/hooks/use-toast';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const handleAuthCallback = async () => {
      console.log('🔄 AuthCallback: Iniciando processamento...');
      
      // Aguardar um pouco para garantir que o user foi carregado
      if (!user) {
        console.log('⏳ AuthCallback: Aguardando user...');
        return;
      }

      console.log('✅ AuthCallback: User encontrado:', user.id);

      try {
        // Verificar status do cadastro do usuário
        const { data, error } = await supabase
          .from('profiles')
          .select('cadastro_status, cadastro_step, telefone, nome, endereco, telefone_verificado')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('❌ AuthCallback: Erro ao verificar perfil:', error);
          
          if (error.code === 'PGRST116') {
            // Perfil não encontrado - usuário novo, vai para cadastro
            console.log('👤 AuthCallback: Usuário novo, redirecionando para cadastro');
            toast({
              title: "Bem-vindo!",
              description: "Vamos completar seu cadastro.",
            });
            navigate('/cadastro');
            return;
          }
          
          throw error;
        }

        console.log('📊 AuthCallback: Dados do perfil:', data);

        // 🎯 LÓGICA INTELIGENTE: Detectar onde o usuário deve ir
        if (data.cadastro_status === 'completo') {
          // Cadastro completo - vai para feed
          console.log('✅ AuthCallback: Cadastro completo, indo para feed');
          toast({
            title: "Login realizado!",
            description: "Bem-vinda de volta!",
          });
          navigate('/feed');
        } else {
          // Cadastro incompleto - detectar step correto
          let targetStep = data.cadastro_step || 'google';
          
          // Detectar step baseado nos dados preenchidos (mesma lógica do hook)
          if (!data.telefone) {
            targetStep = 'phone';
          } else if (data.telefone && !data.telefone_verificado) {
            targetStep = 'code';
          } else if (data.telefone_verificado && !data.nome) {
            targetStep = 'personal';
          } else if (data.nome && !data.endereco) {
            targetStep = 'address';
          }

          console.log('🔄 AuthCallback: Cadastro incompleto, indo para cadastro no step:', targetStep);
          
          // Sincronizar step no banco se necessário
          if (targetStep !== data.cadastro_step) {
            console.log('🔄 AuthCallback: Sincronizando step no banco:', data.cadastro_step, '->', targetStep);
            await supabase
              .from('profiles')
              .update({ cadastro_step: targetStep })
              .eq('id', user.id);
          }

          toast({
            title: "Continuando cadastro...",
            description: "Vamos finalizar seu cadastro.",
          });
          navigate('/cadastro');
        }
      } catch (error) {
        console.error('❌ AuthCallback: Erro no callback de auth:', error);
        toast({
          title: "Erro",
          description: "Ocorreu um erro durante o login. Tente novamente.",
          variant: "destructive",
        });
        navigate('/auth');
      }
    };

    // Delay maior para garantir que tudo foi carregado
    const timer = setTimeout(handleAuthCallback, 1500);
    
    return () => clearTimeout(timer);
  }, [user, navigate, toast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-primary to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <LoadingSpinner className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Finalizando login...
        </h2>
        <p className="text-gray-600">
          Aguarde enquanto verificamos sua conta
        </p>
      </div>
    </div>
  );
};

export default AuthCallback;
