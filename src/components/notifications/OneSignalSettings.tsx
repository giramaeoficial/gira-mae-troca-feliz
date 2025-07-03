// 1. Atualizar OneSignalSettings.tsx - Usar External User ID
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNotificationSystem } from '@/hooks/useNotificationSystem';
import { useAuth } from '@/hooks/useAuth';
import { Bell, BellOff, AlertTriangle, CheckCircle, Smartphone } from 'lucide-react';
import { toast } from 'sonner';

export const OneSignalSettings: React.FC = () => {
  const { 
    pushEnabled: isPermissionGranted,
    requestPushPermission,
    sendTestNotification 
  } = useNotificationSystem();
  const { user } = useAuth();

  const isPushSupported = typeof window !== 'undefined' && 'Notification' in window;
  const browserPermission = isPushSupported ? Notification.permission : 'denied';

  // Registrar usuário no OneSignal quando já tem permissão (USANDO EXTERNAL USER ID)
  useEffect(() => {
    const registerUserInOneSignal = async () => {
      if (!user || !browserPermission || browserPermission !== 'granted') return;
      
      // Aguardar OneSignal carregar se necessário
      if (typeof window !== 'undefined' && window.OneSignal?.User) {
        try {
          console.log('🔗 Registrando usuário no OneSignal v16 (External User ID):', user.id);
          
          // ✅ NOVA ABORDAGEM: Usar addAlias em vez de addTag
          await window.OneSignal.User.addAlias('external_id', user.id);
          
          // Verificar se o registro funcionou
          const playerId = await window.OneSignal.User.PushSubscription.id;
          console.log('✅ OneSignal Player ID:', playerId);
          
          console.log('✅ Usuário registrado no OneSignal com External User ID');
        } catch (error) {
          console.error('❌ Erro ao registrar usuário no OneSignal:', error);
        }
      }
    };

    // Pequeno delay para garantir que OneSignal carregou
    const timer = setTimeout(registerUserInOneSignal, 2000);
    return () => clearTimeout(timer);
  }, [user, browserPermission]);

  const handleRequestPermission = async () => {
    try {
      const granted = await requestPushPermission();
      if (granted && user) {
        toast.success('Permissão concedida! Notificações ativadas.');
        
        // Registrar no OneSignal após aceitar permissão (USANDO EXTERNAL USER ID)
        setTimeout(async () => {
          if (window.OneSignal?.User) {
            try {
              console.log('🔗 Registrando usuário após aceitar permissão (External User ID):', user.id);
              
              // ✅ NOVA ABORDAGEM: Usar addAlias
              await window.OneSignal.User.addAlias('external_id', user.id);
              
              // Verificar registro
              const playerId = await window.OneSignal.User.PushSubscription.id;
              console.log('✅ OneSignal Player ID após registro:', playerId);
              
              console.log('✅ Usuário registrado no OneSignal após permissão');
              toast.success('Usuário registrado com sucesso!');
            } catch (error) {
              console.error('❌ Erro ao registrar após permissão:', error);
            }
          }
        }, 3000);
      } else {
        toast.error('Permissão negada. Você pode ativá-la manualmente nas configurações do seu navegador.');
      }
    } catch (error) {
      toast.error('Ocorreu um erro ao solicitar a permissão.');
    }
  };

  const handleTestNotification = async () => {
    if (!user) {
      toast.error('Usuário não encontrado');
      return;
    }

    // Garantir que usuário está registrado antes de testar (USANDO EXTERNAL USER ID)
    if (window.OneSignal?.User && browserPermission === 'granted') {
      try {
        console.log('🔗 Verificando registro do usuário antes do teste (External User ID)...');
        
        // ✅ NOVA ABORDAGEM: Usar addAlias em vez de addTag
        await window.OneSignal.User.addAlias('external_id', user.id);
        
        // Verificar Player ID
        const playerId = await window.OneSignal.User.PushSubscription.id;
        console.log('✅ OneSignal Player ID antes do teste:', playerId);
        
        console.log('✅ Usuário registrado/verificado antes do teste');
      } catch (error) {
        console.warn('⚠️ Aviso ao verificar registro:', error);
      }
    }

    // Enviar notificação de teste
    await sendTestNotification();
    toast.info('Notificação de teste enviada!', {
      description: 'Você deve recebê-la em seu dispositivo em alguns instantes.',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="w-5 h-5" />
          Alertas no Dispositivo (Push)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm text-gray-600">
          Receba alertas importantes, como novas mensagens e atualizações de reservas,
          mesmo quando o aplicativo não estiver aberto.
        </p>

        {/* Status da Configuração */}
        <div className="space-y-3">
          <div className={`flex items-center justify-between p-3 rounded-lg ${
            browserPermission === 'granted' ? 'bg-green-50 text-green-800' : 
            browserPermission === 'denied' ? 'bg-red-50 text-red-800' : 'bg-yellow-50 text-yellow-800'
          }`}>
            <div className="flex items-center gap-2">
              {browserPermission === 'granted' && <CheckCircle className="w-5 h-5" />}
              {browserPermission === 'denied' && <BellOff className="w-5 h-5" />}
              {browserPermission === 'default' && <AlertTriangle className="w-5 h-5" />}
              <span className="font-medium">Permissão do Navegador</span>
            </div>
            <span className="font-semibold">
              {browserPermission === 'granted' ? 'Concedida' :
               browserPermission === 'denied' ? 'Negada' : 'Pendente'}
            </span>
          </div>
        </div>

        {/* Ações do Usuário */}
        <div className="space-y-3 pt-4 border-t">
          {browserPermission !== 'granted' && (
            <Button onClick={handleRequestPermission} className="w-full">
              <Bell className="w-4 h-4 mr-2" />
              Ativar Alertas no Dispositivo
            </Button>
          )}

          {browserPermission === 'denied' && (
             <p className="text-xs text-center text-red-600 p-2 bg-red-50 rounded-md">
                Você bloqueou as notificações. Para reativar, acesse as configurações de permissão do seu navegador para este site.
            </p>
          )}

          {browserPermission === 'granted' && (
            <Button onClick={handleTestNotification} variant="outline" className="w-full">
              Testar Notificação
            </Button>
          )}
        </div>

        {user && browserPermission === 'granted' && (
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-600">
              <strong>Status:</strong> Configurado e ativo para o usuário {user.id.slice(0, 8)}... (External User ID)
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
