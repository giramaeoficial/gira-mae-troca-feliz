
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import type { Notification, NotificationPreferences } from '@/types/notifications';

// Singleton para gerenciar channels
class ChannelManager {
  private static instance: ChannelManager;
  private channels: Map<string, any> = new Map();

  static getInstance(): ChannelManager {
    if (!ChannelManager.instance) {
      ChannelManager.instance = new ChannelManager();
    }
    return ChannelManager.instance;
  }

  getOrCreateChannel(key: string, factory: () => any): any {
    if (!this.channels.has(key)) {
      const channel = factory();
      this.channels.set(key, channel);
    }
    return this.channels.get(key);
  }

  removeChannel(key: string): void {
    const channel = this.channels.get(key);
    if (channel) {
      try {
        supabase.removeChannel(channel);
      } catch (error) {
        console.warn('Error removing channel:', error);
      }
      this.channels.delete(key);
    }
  }

  removeAllChannels(): void {
    this.channels.forEach((channel, key) => {
      try {
        supabase.removeChannel(channel);
      } catch (error) {
        console.warn('Error removing channel:', key, error);
      }
    });
    this.channels.clear();
  }
}

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

  // Refs para controle de estado
  const isLoadingRef = useRef(false);
  const channelManager = useRef(ChannelManager.getInstance());

  // Carregar notificações in-app
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

      // Converter dados do Supabase para o tipo correto
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
      } else {
        // Criar preferências padrão
        const { data: newPrefs, error: insertError } = await supabase
          .from('user_notification_preferences')
          .insert({
            user_id: user.id,
            mensagens: true,
            reservas: true,
            girinhas: true,
            sistema: true,
            push_enabled: false
          })
          .select()
          .single();

        if (insertError) {
          console.error('Erro ao criar preferências:', insertError);
        } else if (newPrefs) {
          setPreferences({
            mensagens: newPrefs.mensagens,
            reservas: newPrefs.reservas,
            girinhas: newPrefs.girinhas,
            sistema: newPrefs.sistema,
            push_enabled: newPrefs.push_enabled
          });
          setPushEnabled(newPrefs.push_enabled);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar preferências:', error);
    }
  }, [user]);

  // Solicitar permissão para push notifications e registrar no OneSignal
  const requestPushPermission = async () => {
    try {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          await updatePreferences({ push_enabled: true });
          setPushEnabled(true);
          
          // Registrar usuário no OneSignal após aceitar permissão
          if (user && window.OneSignal?.User) {
            try {
              console.log('🔗 Registrando usuário no OneSignal após aceitar permissão:', user.id);
              await window.OneSignal.User.addAlias('external_id', user.id);
              
              // Verificar se o registro funcionou
              const playerId = await window.OneSignal.User.PushSubscription.id;
              console.log('✅ OneSignal Player ID após aceitar permissão:', playerId);
              
              toast.success('Usuário registrado no OneSignal com sucesso!');
            } catch (error) {
              console.error('❌ Erro ao registrar no OneSignal após permissão:', error);
            }
          }
          
          return true;
        }
      }
      return false;
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
        console.error('Erro ao enviar notificação via edge function:', error);
        throw error;
      }

      console.log('Notificação enviada com sucesso:', result);
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

  // Effect para carregar dados do usuário
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

  // Registrar usuário no OneSignal quando necessário
  useEffect(() => {
    const registerUserInOneSignal = async () => {
      if (!user || !window.OneSignal?.User) return;
      
      const browserPermission = 'Notification' in window ? Notification.permission : 'denied';
      if (browserPermission !== 'granted') return;
      
      try {
        console.log('🔗 Registrando usuário no OneSignal (External User ID):', user.id);
        await window.OneSignal.User.addAlias('external_id', user.id);
        
        const playerId = await window.OneSignal.User.PushSubscription.id;
        console.log('✅ OneSignal Player ID:', playerId);
        
        console.log('✅ Usuário registrado no OneSignal com External User ID');
      } catch (error) {
        console.error('❌ Erro ao registrar usuário no OneSignal:', error);
      }
    };

    // Aguardar OneSignal carregar
    const timer = setTimeout(registerUserInOneSignal, 2000);
    return () => clearTimeout(timer);
  }, [user]);

  // Realtime subscription
  useEffect(() => {
    if (!user) return;

    const channelKey = `notifications-${user.id}`;
    
    const channel = channelManager.current.getOrCreateChannel(channelKey, () => {
      return supabase
        .channel(channelKey)
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
    });

    return () => {
      channelManager.current.removeChannel(channelKey);
    };
  }, [user]);

  // Cleanup global no unmount
  useEffect(() => {
    return () => {
      channelManager.current.removeAllChannels();
    };
  }, []);

  return {
    // In-App Notifications
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    
    // Push Notifications
    pushEnabled,
    playerId: null, // Não mais necessário
    oneSignalInitialized: true, // Sistema agora é gerenciado via edge function
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
