
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNotificationSystem } from '@/hooks/useNotificationSystem';
import { useAuth } from '@/hooks/useAuth';
import { Bell, BellOff, AlertTriangle, CheckCircle, Smartphone, RefreshCw, Clock, Wifi, WifiOff } from 'lucide-react';
import { toast } from 'sonner';

export const OneSignalSettings: React.FC = () => {
  const { 
    pushEnabled: isPermissionGranted,
    requestPushPermission,
    sendTestNotification 
  } = useNotificationSystem();
  const { user } = useAuth();
  
  const [oneSignalStatus, setOneSignalStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [subscriptionStatus, setSubscriptionStatus] = useState<'checking' | 'subscribed' | 'not_subscribed'>('checking');

  const isPushSupported = typeof window !== 'undefined' && 'Notification' in window;
  const browserPermission = isPushSupported ? Notification.permission : 'denied';

  // Verificar status do OneSignal
  useEffect(() => {
    const checkOneSignalStatus = () => {
      if (typeof window === 'undefined') return;
      
      if (window.OneSignal?.User?.PushSubscription) {
        setOneSignalStatus('ready');
        
        // Verificar subscription
        const checkSubscription = async () => {
          try {
            const playerId = await window.OneSignal.User.PushSubscription.id;
            const isOptedIn = window.OneSignal.User.PushSubscription.optedIn;
            
            if (playerId && isOptedIn) {
              setSubscriptionStatus('subscribed');
            } else {
              setSubscriptionStatus('not_subscribed');
            }
          } catch (error) {
            console.warn('Erro ao verificar subscription:', error);
            setSubscriptionStatus('not_subscribed');
          }
        };
        
        checkSubscription();
      } else {
        setOneSignalStatus('error');
      }
    };

    // Verificar imediatamente
    checkOneSignalStatus();
    
    // Verificar periodicamente
    const interval = setInterval(checkOneSignalStatus, 3000);
    
    return () => clearInterval(interval);
  }, []);

  const handleRequestPermission = async () => {
    try {
      const granted = await requestPushPermission();
      if (granted && user) {
        toast.success('Permissão concedida! Configurando notificações...');
        
        // Verificar subscription após alguns segundos
        setTimeout(() => {
          setSubscriptionStatus('checking');
        }, 2000);
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

    if (browserPermission !== 'granted') {
      toast.error('Você precisa aceitar as permissões de notificação primeiro');
      return;
    }

    // Enviar notificação de teste
    await sendTestNotification();
    toast.info('Notificação de teste enviada!', {
      description: 'Você deve recebê-la em seu dispositivo em alguns instantes.',
    });
  };

  const handleRefreshPermission = () => {
    window.location.reload();
  };

  const getStatusColor = () => {
    if (browserPermission === 'granted' && subscriptionStatus === 'subscribed') {
      return 'bg-green-50 text-green-800 border-green-200';
    }
    if (browserPermission === 'denied') {
      return 'bg-red-50 text-red-800 border-red-200';
    }
    return 'bg-yellow-50 text-yellow-800 border-yellow-200';
  };

  const getStatusIcon = () => {
    if (browserPermission === 'granted' && subscriptionStatus === 'subscribed') {
      return <CheckCircle className="w-5 h-5" />;
    }
    if (browserPermission === 'denied') {
      return <BellOff className="w-5 h-5" />;
    }
    if (subscriptionStatus === 'checking') {
      return <Clock className="w-5 h-5 animate-spin" />;
    }
    return <AlertTriangle className="w-5 h-5" />;
  };

  const getStatusText = () => {
    if (browserPermission === 'granted' && subscriptionStatus === 'subscribed') {
      return 'Totalmente Configurado';
    }
    if (browserPermission === 'denied') {
      return 'Bloqueado';
    }
    if (browserPermission === 'granted' && subscriptionStatus === 'not_subscribed') {
      return 'Aguardando Configuração';
    }
    if (subscriptionStatus === 'checking') {
      return 'Verificando...';
    }
    return 'Não Configurado';
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
          <div className={`flex items-center justify-between p-3 rounded-lg border ${getStatusColor()}`}>
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              <span className="font-medium">Status das Notificações</span>
            </div>
            <span className="font-semibold">
              {getStatusText()}
            </span>
          </div>

          {/* Status do OneSignal */}
          <div className={`flex items-center justify-between p-2 rounded-md text-sm ${
            oneSignalStatus === 'ready' ? 'bg-blue-50 text-blue-700' : 
            oneSignalStatus === 'error' ? 'bg-orange-50 text-orange-700' : 'bg-gray-50 text-gray-600'
          }`}>
            <div className="flex items-center gap-2">
              {oneSignalStatus === 'ready' ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
              <span>Serviço de Notificações</span>
            </div>
            <span className="font-medium">
              {oneSignalStatus === 'ready' ? 'Conectado' : 
               oneSignalStatus === 'error' ? 'Desconectado' : 'Carregando...'}
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
             <div className="space-y-2">
               <p className="text-xs text-center text-red-600 p-2 bg-red-50 rounded-md">
                  Você bloqueou as notificações. Para reativar, acesse as configurações de permissão do seu navegador para este site.
               </p>
               <Button onClick={handleRefreshPermission} variant="outline" className="w-full">
                 <RefreshCw className="w-4 h-4 mr-2" />
                 Atualizar Status
               </Button>
             </div>
          )}

          {browserPermission === 'granted' && (
            <Button onClick={handleTestNotification} variant="outline" className="w-full">
              Testar Notificação
            </Button>
          )}
        </div>

        {/* Informações do Sistema */}
        {user && (
          <div className="space-y-2">
            {browserPermission === 'granted' && subscriptionStatus === 'subscribed' && (
              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                <p className="text-xs text-green-700 font-medium">
                  ✅ Totalmente configurado para o usuário {user.id.slice(0, 8)}...
                </p>
                <p className="text-xs text-green-600 mt-1">
                  Você receberá notificações push normalmente.
                </p>
              </div>
            )}

            {browserPermission === 'granted' && subscriptionStatus === 'not_subscribed' && (
              <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                <p className="text-xs text-yellow-700 font-medium">
                  ⏳ Configuração em andamento...
                </p>
                <p className="text-xs text-yellow-600 mt-1">
                  Aguarde alguns segundos para a configuração ser finalizada. Se demorar muito, atualize a página.
                </p>
              </div>
            )}

            {oneSignalStatus === 'error' && (
              <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                <p className="text-xs text-orange-700 font-medium">
                  ⚠️ Problema de conexão detectado
                </p>
                <p className="text-xs text-orange-600 mt-1">
                  O serviço de notificações está com problemas. Tente atualizar a página ou aguarde alguns minutos.
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
