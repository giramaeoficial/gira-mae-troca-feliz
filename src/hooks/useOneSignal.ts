
import { useState, useEffect } from 'react';
import OneSignal from 'react-onesignal';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export const useOneSignal = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const initializeOneSignal = async () => {
      try {
        // Verificar se OneSignal já está inicializado
        if (isInitialized) return;

        // Verificar se tem APP_ID configurado
        const appId = import.meta.env.VITE_ONESIGNAL_APP_ID || '26d188ec-fdd6-41b3-86fe-b571cce6b3a5';
        
        if (!appId) {
          console.warn('OneSignal APP_ID não configurado');
          return;
        }

        // Verificar permissão atual
        const currentPermission = Notification.permission;
        setIsPermissionGranted(currentPermission === 'granted');
        
        if (currentPermission === 'granted') {
          // Obter Player ID se disponível usando a API correta
          try {
            const pushSubscription = await OneSignal.User.PushSubscription.getIdAsync();
            if (pushSubscription) {
              setPlayerId(pushSubscription);
              console.log('OneSignal Player ID:', pushSubscription);
            }
          } catch (error) {
            console.log('Player ID não disponível ainda:', error);
          }
          
          // Associar com usuário logado
          if (user?.id) {
            try {
              await OneSignal.User.addTag('user_id', user.id);
              if (user.email) {
                await OneSignal.User.addTag('email', user.email);
              }
              console.log('Tags do usuário adicionadas no OneSignal');
            } catch (error) {
              console.log('Erro ao adicionar tags:', error);
            }
          }
          
          setIsInitialized(true);
          console.log('OneSignal inicializado com sucesso');
        } else {
          console.log('Permissão de notificação não concedida');
        }
      } catch (error) {
        console.error('Erro ao configurar OneSignal:', error);
      }
    };

    // Só inicializar se estiver em um ambiente seguro
    if (typeof window !== 'undefined' && (window.location.protocol === 'https:' || window.location.hostname === 'localhost')) {
      initializeOneSignal();
    } else {
      console.warn('OneSignal requer HTTPS ou localhost');
    }
  }, [user, isInitialized]);

  const requestPermission = async () => {
    try {
      // Usar API nativa do browser para solicitar permissão
      const permission = await Notification.requestPermission();
      const isGranted = permission === 'granted';
      setIsPermissionGranted(isGranted);
      
      if (isGranted) {
        // Tentar obter Player ID após permissão concedida
        try {
          setTimeout(async () => {
            const pushSubscription = await OneSignal.User.PushSubscription.getIdAsync();
            if (pushSubscription) setPlayerId(pushSubscription);
          }, 2000);
        } catch (error) {
          console.log('Erro ao obter Player ID:', error);
        }
        setIsInitialized(true);
      }
      
      return isGranted;
    } catch (error) {
      console.error('Erro ao solicitar permissão:', error);
      return false;
    }
  };

  const sendTestNotification = async () => {
    try {
      if (!isPermissionGranted) {
        const permission = await requestPermission();
        if (!permission) {
          toast.error('Permissão de notificação necessária');
          return;
        }
      }

      // Testar notificação local do browser
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('GiraMãe - Teste', {
          body: 'Notificações estão funcionando!',
          icon: '/favicon.ico',
          tag: 'test-notification'
        });
        toast.success('Notificação de teste enviada!');
      } else {
        toast.error('Permissões de notificação não disponíveis');
      }
    } catch (error) {
      console.error('Erro ao enviar notificação de teste:', error);
      toast.error('Erro ao enviar notificação de teste');
    }
  };

  const sendNotificationToUser = async (
    userId: string,
    title: string,
    message: string,
    data?: any
  ) => {
    try {
      const restApiKey = import.meta.env.VITE_ONESIGNAL_REST_API_KEY;
      const appId = import.meta.env.VITE_ONESIGNAL_APP_ID || '26d188ec-fdd6-41b3-86fe-b571cce6b3a5';
      
      if (!restApiKey) {
        console.warn('OneSignal REST API Key não configurado');
        return;
      }

      const response = await fetch('https://onesignal.com/api/v1/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${restApiKey}`
        },
        body: JSON.stringify({
          app_id: appId,
          filters: [
            { field: 'tag', key: 'user_id', relation: '=', value: userId }
          ],
          headings: { en: title },
          contents: { en: message },
          data: data || {},
          web_url: window.location.origin
        })
      });
      
      const result = await response.json();
      console.log('Notificação enviada:', result);
      return result;
    } catch (error) {
      console.error('Erro ao enviar notificação:', error);
      throw error;
    }
  };

  return {
    isInitialized,
    playerId,
    isPermissionGranted,
    requestPermission,
    sendTestNotification,
    sendNotificationToUser,
    isPushSupported: typeof window !== 'undefined' && 'Notification' in window
  };
};
