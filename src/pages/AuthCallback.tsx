// src/pages/AuthCallback.tsx - VERSÃO CORRIGIDA COM FUNÇÃO DO BANCO

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
        // ✅ NOVA LÓGICA: Usar a função do banco para determinar rota
        console.log('🎯 AuthCallback: Chamando função determinar_rota_usuario...');
        
        const { data: resultado, error: rpcError } = await supabase
          .rpc('determinar_rota_usuario');

        if (rpcError) {
          console.error('❌ AuthCallback: Erro na RPC:', rpcError);
          throw new Error(`Erro ao determinar rota: ${rpcError.message}`);
        }

        if (!resultado || resultado.length === 0) {
          console.error('❌ AuthCallback: Function não retornou dados');
          throw new Error('Function não retornou dados válidos');
        }

        const rotaData = resultado[0];
        console.log('✅ AuthCallback: Rota determinada:', {
          rota: rotaData.rota_destino,
          pode_acessar: rotaData.pode_acessar,
          motivo: rotaData.motivo
        });

        // Decidir mensagem e navegação baseado na resposta da função
        let toastTitle = "Login realizado!";
        let toastDescription = "Bem-vinda à GiraMãe!";

        switch (rotaData.motivo) {
          case 'cidade_liberada_ritual_completo':
          case 'cidade_liberada_acesso_total':
            toastTitle = "Login realizado!";
            toastDescription = "Bem-vinda de volta à GiraMãe!";
            break;

          case 'ritual_completo_aguardando_cidade':
          case 'missao_completa_aguardando_cidade':
            toastTitle = "Aguardando liberação";
            toastDescription = "Sua cidade ainda não foi liberada.";
            break;

          case 'ritual_mae_novata_primeiro_item':
          case 'nenhum_item_publicado':
            toastTitle = "Continuando cadastro...";
            toastDescription = "Vamos finalizar seu ritual de mãe novata!";
            break;

          case 'ritual_mae_novata_segundo_item':
          case 'um_item_publicado':
            toastTitle = "Quase lá!";
            toastDescription = "Falta apenas mais um item para completar!";
            break;

          case 'whatsapp_nao_verificado':
            toastTitle = "Continuando cadastro...";
            toastDescription = "Vamos verificar seu WhatsApp.";
            break;

          case 'termos_nao_aceitos':
          case 'politica_nao_aceita':
            toastTitle = "Continuando cadastro...";
            toastDescription = "Vamos finalizar os termos.";
            break;

          case 'endereco_incompleto':
          case 'cidade_estado_nao_preenchidos':
            toastTitle = "Continuando cadastro...";
            toastDescription = "Vamos completar seu endereço.";
            break;

          case 'admin_acesso_liberado':
            toastTitle = "Login Admin";
            toastDescription = "Acesso administrativo liberado!";
            break;

          default:
            toastTitle = "Login realizado!";
            toastDescription = "Redirecionando você...";
        }

        // Mostrar toast
        toast({
          title: toastTitle,
          description: toastDescription,
        });

        // Navegar para a rota determinada pela função
        console.log(`🚀 AuthCallback: Navegando para ${rotaData.rota_destino}`);
        navigate(rotaData.rota_destino, { replace: true });

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
