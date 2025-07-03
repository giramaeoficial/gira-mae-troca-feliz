
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import type { Notification, NotificationPreferences } from '@/types/notifications';
import type { RealtimeChannel } from '@supabase/supabase-js';

export const useNotificationSystem = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    mensagens: true,
    reservas: true,
    girinhas: true,
    sistema: true,
    push_enabled: false
  });
  const [loading, setLoading] = useState(true);

  const isLoadingRef = useRef(false);
  const registrationInProgress = useRef(false);
  const channelRef = useRef<RealtimeChannel | null>(null);

  // Carregar notificações
  const loadNotifications = useCallback(async () => {
    if (!user || isLoadingRef.current) return;
    
    isLoadingRef.current = true;
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

      const convertedNotifications: Notification[] = (data || []).map(item => ({
        id: item.id,
        user_id: item.user_id,
        type: item.type as any,
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
      isLoadingRef.current = false;
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
        .maybeSingle();

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
        setPushEnabled(data.push_enabled);
      }
    } catch (error) {
      console.error('Erro ao carregar preferências:', error);
    }
  }, [user]);

  // Registrar usuário no OneSignal
  const registerUserInOneSignal = useCallback(async (playerId?: string) => {
    if (!user || registrationInProgress.current) return false;
    
    registrationInProgress.current = true;
    
    try {
      console.log('🚀 Registrando usuário no OneSignal...');
      
      const { data, error } = await supabase.functions.invoke('register-onesignal-user', {
        body: {
          user_id: user.id,
          player_id: playerId
        }
      });

      if (error) {
        console.error('❌ Erro ao registrar usuário:', error);
        return false;
      }

      console.log('✅ Usuário registrado:', data);
      return true;
    } catch (error) {
      console.error('❌ Erro na edge function:', error);
      return false;
    } finally {
      registrationInProgress.current = false;
    }
  }, [user]);

  // Solicitar permissão para push notifications
  const requestPushPermission = async () => {
    try {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          // Aguardar OneSignal estar pronto
          setTimeout(async () => {
            try {
              let playerId: string | undefined;
              
              if (window.OneSignal?.User?.PushSubscription?.id) {
                playerId = window.OneSignal.User.PushSubscription.id || undefined;
              }
              
              const registered = await registerUserInOneSignal(playerId);
              if (registered) {
                await updatePreferences({ push_enabled: true });
                setPushEnabled(true);
                toast.success('Notificações ativadas com sucesso!');
              } else {
                toast.error('Erro ao configurar notificações');
              }
            } catch (error) {
              console.error('❌ Erro ao registrar usuário:', error);
              toast.error('Erro ao configurar notificações');
            }
          }, 2000);
          
          return true;
        } else {
          toast.error('Permissão negada para notificações');
        }
      }
      return false;
    } catch (error) {
      console.error('Erro ao solicitar permissão:', error);
      toast.error('Erro ao solicitar permissão para notificações');
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
      const { data: existingPrefs, error: selectError } = await supabase
        .from('user_notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (selectError && selectError.code !== 'PGRST116') {
        console.error('Erro ao buscar preferências:', selectError);
        throw selectError;
      }

      let result;
      if (existingPrefs) {
        result = await supabase
          .from('user_notification_preferences')
          .update({
            ...newPrefs,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);
      } else {
        result = await supabase
          .from('user_notification_preferences')
          .insert({
            user_id: user.id,
            mensagens: preferences.mensagens,
            reservas: preferences.reservas,
            girinhas: preferences.girinhas,
            sistema: preferences.sistema,
            push_enabled: preferences.push_enabled,
            ...newPrefs,
            updated_at: new Date().toISOString()
          });
      }

      if (result.error) {
        console.error('Erro ao atualizar preferências:', result.error);
        toast.error('Erro ao atualizar preferências');
        return;
      }

      setPreferences(prev => ({ ...prev, ...newPrefs }));
      if (newPrefs.push_enabled !== undefined) {
        setPushEnabled(newPrefs.push_enabled);
      }
      toast.success('Preferências atualizadas!');
    } catch (error) {
      console.error('Erro ao atualizar preferências:', error);
      toast.error('Erro ao atualizar preferências');
    }
  }, [user, preferences]);

  // Enviar notificação via edge function
  const sendNotification = useCallback(async (params: {
    userId: string;
    type: string;
    title: string;
    message: string;
    data?: Record<string, any>;
    sendPush?: boolean;
  }) => {
    const { userId, type, title, message, data = {}, sendPush = true } = params;

    try {
      const { data: result, error } = await supabase.functions.invoke('send-notification', {
        body: {
          user_id: userId,
          type,
          title,
          message,
          data,
          send_push: sendPush
        }
      });

      if (error) {
        console.error('Erro ao enviar notificação:', error);
        throw error;
      }

      console.log('Notificação enviada:', result);
      return result;
    } catch (error) {
      console.error('Erro ao enviar notificação:', error);
      throw error;
    }
  }, []);

  // Enviar notificação de teste
  const sendTestNotification = useCallback(async () => {
    if (user) {
      try {
        await sendNotification({
          userId: user.id,
          type: 'sistema',
          title: 'GiraMãe - Teste',
          message: 'Sistema de notificações funcionando perfeitamente!',
          data: { test: true }
        });
        toast.success('Notificação de teste enviada!');
      } catch (error) {
        toast.error('Erro ao enviar notificação de teste');
      }
    } else {
      toast.error('Usuário não encontrado');
    }
  }, [user, sendNotification]);

  // Effect para carregar dados
  useEffect(() => {
    if (user) {
      loadPreferences();
      loadNotifications();
    } else {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
    }
  }, [user, loadPreferences, loadNotifications]);

  // Realtime subscription com controle de canal único
  useEffect(() => {
    if (!user) {
      // Limpar canal existente se não há usuário
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      return;
    }

    // Se já existe um canal, não criar outro
    if (channelRef.current) {
      return;
    }

    console.log('🔄 Criando canal de notificações para:', user.id);

    const channel = supabase
      .channel(`notifications-${user.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        console.log('📨 Nova notificação recebida:', payload);
        
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
        
        toast(convertedNotification.title, {
          description: convertedNotification.message,
        });
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      console.log('🧹 Limpando canal de notificações');
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [user]);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    pushEnabled,
    requestPushPermission,
    sendTestNotification,
    preferences,
    updatePreferences,
    sendNotification,
    refetch: loadNotifications
  };
};
