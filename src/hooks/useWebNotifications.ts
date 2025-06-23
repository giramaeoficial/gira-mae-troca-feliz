
import { useState, useEffect, useCallback } from 'react';
import { WebNotificationService } from '@/services/notifications/WebNotificationService';
import { OneSignalProvider } from '@/services/notifications/providers/OneSignalProvider';
import { ResendProvider } from '@/services/notifications/providers/ResendProvider';
import { InAppNotification, NotificationChannel } from '@/types/notifications';
import { useAuth } from './useAuth';

const ONESIGNAL_API_KEY = import.meta.env.VITE_ONESIGNAL_API_KEY || '';
const ONESIGNAL_APP_ID = import.meta.env.VITE_ONESIGNAL_APP_ID || '';
const RESEND_API_KEY = import.meta.env.VITE_RESEND_API_KEY || '';

export const useWebNotifications = () => {
  const { user } = useAuth();
  const [service] = useState(() => new WebNotificationService());
  const [inAppNotifications, setInAppNotifications] = useState<InAppNotification[]>([]);
  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    // Configurar provedores
    if (ONESIGNAL_API_KEY && ONESIGNAL_APP_ID) {
      const oneSignalProvider = new OneSignalProvider(ONESIGNAL_API_KEY, ONESIGNAL_APP_ID);
      service.setPushProvider(oneSignalProvider);
    }

    if (RESEND_API_KEY) {
      const resendProvider = new ResendProvider(RESEND_API_KEY);
      service.setEmailProvider(resendProvider);
    }

    // Verificar permissão de notificação
    if ('Notification' in window) {
      setPermissionGranted(Notification.permission === 'granted');
    }

    // Subscrever para notificações in-app
    const unsubscribe = service.subscribe(setInAppNotifications);
    
    return unsubscribe;
  }, [service]);

  const requestPermission = useCallback(async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setPermissionGranted(permission === 'granted');
      return permission === 'granted';
    }
    return false;
  }, []);

  const notificarBoasVindas = useCallback(async (nomeUsuario: string) => {
    if (!user) return;

    await service.enviarNotificacao({
      userId: user.id,
      templateType: 'sistema', // Mudança aqui
      variables: { nome: nomeUsuario },
      channels: ['push', 'in_app']
    });
  }, [service, user]);

  const notificarReserva = useCallback(async (
    itemTitulo: string, 
    valor: number, 
    vendedorNome: string,
    nomeComprador: string
  ) => {
    if (!user) return;

    await service.enviarNotificacao({
      userId: user.id,
      templateType: 'reserva_confirmada',
      variables: { 
        nome: nomeComprador,
        item_titulo: itemTitulo, 
        valor: valor,
        vendedor_nome: vendedorNome 
      },
      channels: ['push', 'in_app']
    });
  }, [service, user]);

  const notificarNovaMensagem = useCallback(async (
    destinatarioId: string,
    remetenteNome: string,
    itemTitulo: string,
    previewMensagem: string
  ) => {
    await service.enviarNotificacao({
      userId: destinatarioId,
      templateType: 'nova_mensagem',
      variables: {
        remetente_nome: remetenteNome,
        item_titulo: itemTitulo,
        preview_mensagem: previewMensagem
      },
      channels: ['push', 'in_app']
    });
  }, [service]);

  const notificarItemDisponivel = useCallback(async (
    usuarioId: string,
    itemTitulo: string,
    valor: number
  ) => {
    await service.enviarNotificacao({
      userId: usuarioId,
      templateType: 'sistema', // Mudança aqui
      variables: {
        item_titulo: itemTitulo,
        valor: valor
      },
      channels: ['push', 'in_app']
    });
  }, [service]);

  const markAsRead = useCallback((notificationId: string) => {
    service.markAsRead(notificationId);
  }, [service]);

  return {
    inAppNotifications,
    permissionGranted,
    requestPermission,
    notificarBoasVindas,
    notificarReserva,
    notificarNovaMensagem,
    notificarItemDisponivel,
    markAsRead
  };
};
