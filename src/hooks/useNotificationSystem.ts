
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import OneSignal from 'react-onesignal';
import type { Notification, NotificationPreferences } from '@/types/notifications';

export const useNotificationSystem = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [oneSignalInitialized, setOneSignalInitialized] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    mensagens: true,
    reservas: true,
    girinhas: true,
    sistema: true,
    push_enabled: false
  });
  const [loading, setLoading] = useState(true);

  // Inicializar OneSignal uma única vez
  const initializeOneSignal = useCallback(async () => {
    if (oneSignalInitialized || typeof window === 'undefined') return;

    try {
      // Verificar se está em ambiente seguro
      if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
        console.warn('OneSignal requer HTTPS ou localhost');
        return;
      }

      const appId = '26d188ec-fdd6-41b3-86fe-b571cce6b3a5';
      
      await OneSignal.init({
        appId: appId,
        allowLocalhostAsSecureOrigin: true,
        serviceWorkerParam: { scope: '/' },
        serviceWorkerPath: 'OneSignalSDKWorker.js'
      });

      // Verificar status da permissão
      const permission = Notification.permission;
      setPushEnabled(permission === 'granted');

      // Configurar listener para mudanças no push subscription
      if (permission === 'granted') {
        OneSignal.User.PushSubscription.addEventListener('change', (event) => {
          if (event.current.id) {
            setPlayerId(event.current.id);
            console.log('OneSignal Player ID:', event.current.id);
          }
        });

        // Tentar obter ID atual
        const currentId = OneSignal.User.PushSubscription.id;
        if (currentId) {
          setPlayerId(currentId);
        }

        // Associar com usuário logado
        if (user?.id) {
          await OneSignal.User.addTag('user_id', user.id);
          if (user.email) {
            await OneSignal.User.addTag('email', user.email);
          }
        }
      }

      setOneSignalInitialized(true);
      console.log('OneSignal inicializado com sucesso');
    } catch (error) {
      console.error('Erro ao inicializar OneSignal:', error);
    }
  }, [oneSignalInitialized, user]);

  // Carregar notificações in-app
  const loadNotifications = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Erro ao carregar notificações:', error);
        return;
      }

      // Converter dados do Supabase para o tipo correto
      const convertedNotifications: Notification[] = (data || []).map(item => ({
        id: item.id,
        user_id: item.user_id,
        type: item.type as any, // Type assertion necessária aqui
        title: item.title,
        message: item.message,
        data: (typeof item.data === 'string' ? JSON.parse(item.data) : item.data) || {},
        read: item.read,
        created_at: item.created_at
      }));

      setNotifications(convertedNotifications);
      setUnreadCount(convertedNotifications.filter(n => !n.read).length);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Carregar preferências
  const loadPreferences = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao carregar preferências:', error);
        return;
      }

      if (data) {
        setPreferences({
          mensagens: data.mensagens,
          reservas: data.reservas,
          girinhas: data.girinhas,
          sistema: data.sistema,
          push_enabled: data.push_enabled
        });
      }
    } catch (error) {
      console.error('Erro ao carregar preferências:', error);
    }
  }, [user]);

  // Solicitar permissão para push notifications
  const requestPushPermission = async () => {
    try {
      const permission = await Notification.requestPermission();
      const isGranted = permission === 'granted';
      setPushEnabled(isGranted);

      if (isGranted && oneSignalInitialized) {
        // Configurar listener após permissão concedida
        OneSignal.User.PushSubscription.addEventListener('change', (event) => {
          if (event.current.id) {
            setPlayerId(event.current.id);
          }
        });

        // Tentar obter ID após delay
        setTimeout(() => {
          const currentId = OneSignal.User.PushSubscription.id;
          if (currentId) {
            setPlayerId(currentId);
          }
        }, 2000);
      }

      return isGranted;
    } catch (error) {
      console.error('Erro ao solicitar permissão:', error);
      return false;
    }
  };

  // Marcar notificação como lida
  const markAsRead = useCallback(async (notificationId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Erro ao marcar como lida:', error);
        return;
      }

      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Erro ao marcar como lida:', error);
    }
  }, [user]);

  // Marcar todas como lidas
  const markAllAsRead = useCallback(async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);

      if (error) {
        console.error('Erro ao marcar todas como lidas:', error);
        return;
      }

      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      toast.success('Todas as notificações foram marcadas como lidas');
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
    }
  }, [user]);

  // Atualizar preferências
  const updatePreferences = useCallback(async (newPrefs: Partial<NotificationPreferences>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_notification_preferences')
        .upsert({
          user_id: user.id,
          ...preferences,
          ...newPrefs,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Erro ao atualizar preferências:', error);
        toast.error('Erro ao atualizar preferências');
        return;
      }

      setPreferences(prev => ({ ...prev, ...newPrefs }));
      toast.success('Preferências atualizadas!');
    } catch (error) {
      console.error('Erro ao atualizar preferências:', error);
      toast.error('Erro ao atualizar preferências');
    }
  }, [user, preferences]);

  // Enviar notificação (push + in-app)
  const sendNotification = useCallback(async (params: {
    userId: string;
    type: string;
    title: string;
    message: string;
    data?: Record<string, any>;
  }) => {
    const { userId, type, title, message, data = {} } = params;

    try {
      // 1. Salvar notificação in-app no banco
      const { error: dbError } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          type,
          title,
          message,
          data,
          read: false
        });

      if (dbError) {
        console.error('Erro ao salvar notificação no banco:', dbError);
      }

      // 2. Enviar push notification via OneSignal (se disponível)
      if (oneSignalInitialized && playerId) {
        try {
          const restApiKey = ''; // Configurar quando necessário
          const appId = '26d188ec-fdd6-41b3-86fe-b571cce6b3a5';

          if (restApiKey) {
            await fetch('https://onesignal.com/api/v1/notifications', {
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
                data: data,
                web_url: window.location.origin
              })
            });
          }
        } catch (pushError) {
          console.error('Erro ao enviar push notification:', pushError);
        }
      }

      console.log('Notificação enviada:', { userId, type, title, message });
    } catch (error) {
      console.error('Erro ao enviar notificação:', error);
      throw error;
    }
  }, [oneSignalInitialized, playerId]);

  // Enviar notificação de teste
  const sendTestNotification = useCallback(async () => {
    if (!pushEnabled) {
      const permission = await requestPushPermission();
      if (!permission) {
        toast.error('Permissão de notificação necessária');
        return;
      }
    }

    // Testar notificação do browser
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('GiraMãe - Teste', {
        body: 'Sistema de notificações funcionando!',
        icon: '/favicon.ico',
        tag: 'test-notification'
      });
      toast.success('Notificação de teste enviada!');
    } else {
      toast.error('Permissões de notificação não disponíveis');
    }
  }, [pushEnabled, requestPushPermission]);

  // Effects
  useEffect(() => {
    initializeOneSignal();
  }, [initializeOneSignal]);

  useEffect(() => {
    if (user) {
      loadPreferences();
      loadNotifications();
    }
  }, [user, loadPreferences, loadNotifications]);

  // Realtime subscription para notificações
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        const newNotification = payload.new as any;
        const convertedNotification: Notification = {
          id: newNotification.id,
          user_id: newNotification.user_id,
          type: newNotification.type,
          title: newNotification.title,
          message: newNotification.message,
          data: (typeof newNotification.data === 'string' ? JSON.parse(newNotification.data) : newNotification.data) || {},
          read: newNotification.read,
          created_at: newNotification.created_at
        };
        
        setNotifications(prev => [convertedNotification, ...prev]);
        setUnreadCount(prev => prev + 1);
        
        // Toast notification
        toast(convertedNotification.title, {
          description: convertedNotification.message,
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    // In-App Notifications
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    
    // Push Notifications
    pushEnabled,
    playerId,
    oneSignalInitialized,
    requestPushPermission,
    sendTestNotification,
    
    // Preferences
    preferences,
    updatePreferences,
    
    // Unified sending
    sendNotification,
    
    // Utility
    refetch: loadNotifications
  };
};
