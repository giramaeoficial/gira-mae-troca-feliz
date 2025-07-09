// src/pages/AuthCallback.tsx - VERSÃO CORRIGIDA SEM LOOP

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import LoadingSpinner from '@/components/loading/LoadingSpinner';
import { useToast } from '@/hooks/use-toast';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const handleAuthCallback = async () => {
      // Aguardar auth carregar
      if (authLoading) {
        console.log('⏳ AuthCallback: Aguardando auth carregar...');
        return;
      }

      // Se não há usuário, redirecionar para auth
      if (!user) {
        console.log('❌ AuthCallback: Nenhum usuário encontrado, redirecionando para /auth');
        navigate('/auth', { replace: true });
        return;
      }

      // Evitar processamento duplo
      if (processing) {
        console.log('⏳ AuthCallback: Já processando...');
        return;
      }

      setProcessing(true);
      console.log('🔄 AuthCallback: Iniciando processamento para usuário:', user.id);

      try {
        // Buscar dados do perfil
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('cadastro_status, cadastro_step, telefone_verificado, nome, endereco')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('❌ AuthCallback: Erro ao buscar perfil:', error);
          
          if (error.code === 'PGRST116') {
            // Perfil não encontrado - usuário novo
            console.log('👤 AuthCallback: Perfil não encontrado, usuário novo - indo para feed (CadastroCompletoGuard interceptará)');
            toast({
              title: "Bem-vindo!",
              description: "Vamos completar seu cadastro.",
            });
            navigate('/feed', { replace: true });
            return;
          }
          
          throw error;
        }

        console.log('📊 AuthCallback: Dados do perfil encontrados:', profile);

        // SEMPRE vai para /feed - o CadastroCompletoGuard interceptará se necessário
        if (profile.cadastro_status === 'completo') {
          console.log('✅ AuthCallback: Cadastro completo, indo para feed');
          toast({
            title: "Login realizado!",
            description: "Bem-vinda de volta à GiraMãe!",
          });
        } else {
          console.log('🔄 AuthCallback: Cadastro incompleto, indo para feed (CadastroCompletoGuard interceptará)');
          toast({
            title: "Continuando cadastro...",
            description: "Vamos finalizar seu cadastro.",
          });
        }

        // Sempre navegar para /feed - o CadastroCompletoGuard cuida do resto
        navigate('/feed', { replace: true });

      } catch (error) {
        console.error('❌ AuthCallback: Erro no processamento:', error);
        toast({
          title: "Erro no login",
          description: "Ocorreu um erro. Tente fazer login novamente.",
          variant: "destructive",
        });
        navigate('/auth', { replace: true });
      } finally {
        setProcessing(false);
      }
    };

    // Delay para garantir que o auth foi carregado
    const timer = setTimeout(handleAuthCallback, 1000);
    return () => clearTimeout(timer);
  }, [user, authLoading, navigate, toast, processing]);

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
