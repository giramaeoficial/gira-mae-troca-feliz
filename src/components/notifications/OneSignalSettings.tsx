
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNotificationSystem } from '@/hooks/useNotificationSystem';
import { useAuth } from '@/hooks/useAuth';
import { Bell, BellOff, CheckCircle, Smartphone, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export const OneSignalSettings: React.FC = () => {
  const { 
    pushEnabled,
    requestPushPermission,
    sendTestNotification,
    updatePreferences
  } = useNotificationSystem();
  const { user } = useAuth();
  
  const [oneSignalReady, setOneSignalReady] = useState(false);

  const isPushSupported = typeof window !== 'undefined' && 'Notification' in window;
  const browserPermission = isPushSupported ? Notification.permission : 'denied';

  // Verificar se OneSignal está pronto
  useEffect(() => {
    const checkOneSignal = () => {
      if (window.OneSignal) {
        setOneSignalReady(true);
      }
    };

    const interval = setInterval(checkOneSignal, 1000);
    checkOneSignal();
    
    return () => clearInterval(interval);
  }, []);

  const handleRequestPermission = async () => {
    try {
      const granted = await requestPushPermission();
      if (!granted) {
        toast.error('Permissão negada. Ative nas configurações do navegador.');
      }
    } catch (error) {
      toast.error('Erro ao solicitar permissão.');
    }
  };

  const handleDisablePushNotifications = async () => {
    try {
      await updatePreferences({ push_enabled: false });
      toast.success('Notificações push desativadas!');
    } catch (error) {
      toast.error('Erro ao desativar notificações push');
    }
  };

  const handleTestNotification = async () => {
    if (!user) {
      toast.error('Usuário não encontrado');
      return;
    }

    if (browserPermission !== 'granted') {
      toast.error('Aceite as permissões de notificação primeiro');
      return;
    }

    await sendTestNotification();
  };

  const getStatusColor = () => {
    if (browserPermission === 'granted' && pushEnabled) {
      return 'bg-green-50 text-green-800 border-green-200';
    }
    if (browserPermission === 'denied') {
      return 'bg-red-50 text-red-800 border-red-200';
    }
    return 'bg-yellow-50 text-yellow-800 border-yellow-200';
  };

  const getStatusIcon = () => {
    if (browserPermission === 'granted' && pushEnabled) {
      return <CheckCircle className="w-5 h-5" />;
    }
    if (browserPermission === 'denied') {
      return <BellOff className="w-5 h-5" />;
    }
    return <Bell className="w-5 h-5" />;
  };

  const getStatusText = () => {
    if (browserPermission === 'granted' && pushEnabled) {
      return 'Ativo';
    }
    if (browserPermission === 'denied') {
      return 'Bloqueado';
    }
    return 'Inativo';
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
          Receba alertas importantes mesmo quando o aplicativo não estiver aberto.
        </p>

        {/* Status */}
        <div className={`flex items-center justify-between p-3 rounded-lg border ${getStatusColor()}`}>
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className="font-medium">Status das Notificações</span>
          </div>
          <span className="font-semibold">{getStatusText()}</span>
        </div>

        {/* Ações */}
        <div className="space-y-3 pt-4 border-t">
          {/* Não permitido */}
          {browserPermission !== 'granted' && (
            <Button onClick={handleRequestPermission} className="w-full">
              <Bell className="w-4 h-4 mr-2" />
              Ativar Alertas no Dispositivo
            </Button>
          )}

          {/* Bloqueado */}
          {browserPermission === 'denied' && (
            <div className="space-y-2">
              <p className="text-xs text-center text-red-600 p-2 bg-red-50 rounded-md">
                Notificações bloqueadas. Ative nas configurações do navegador.
              </p>
              <Button onClick={() => window.location.reload()} variant="outline" className="w-full">
                <RefreshCw className="w-4 h-4 mr-2" />
                Atualizar Status
              </Button>
            </div>
          )}

          {/* Permitido */}
          {browserPermission === 'granted' && (
            <div className="space-y-2">
              {pushEnabled ? (
                <Button 
                  onClick={handleDisablePushNotifications} 
                  variant="destructive"
                  className="w-full"
                >
                  <BellOff className="w-4 h-4 mr-2" />
                  Desativar Alertas
                </Button>
              ) : (
                <Button onClick={handleRequestPermission} className="w-full">
                  <Bell className="w-4 h-4 mr-2" />
                  Reativar Alertas
                </Button>
              )}

              <Button onClick={handleTestNotification} variant="outline" className="w-full">
                Testar Notificação
              </Button>
            </div>
          )}
        </div>

        {/* Status do Sistema */}
        {user && (
          <div className="space-y-2">
            {browserPermission === 'granted' && pushEnabled && (
              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                <p className="text-xs text-green-700 font-medium">
                  ✅ Configurado para {user.email}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  Você receberá notificações push normalmente.
                </p>
              </div>
            )}

            {!oneSignalReady && (
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-700 font-medium">
                  🔄 Carregando sistema de notificações...
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
