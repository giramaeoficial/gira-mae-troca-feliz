
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import OneSignal from 'react-onesignal';
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

  // Refs para controle de estado
  const isLoadingRef = useRef(false);
  const channelManager = useRef(ChannelManager.getInstance());
  const oneSignalInitRef = useRef(false);

  // Inicializar OneSignal uma única vez (DESABILITADO TEMPORARIAMENTE)
  const initializeOneSignal = useCallback(async () => {
    if (oneSignalInitRef.current) return;
    oneSignalInitRef.current = true;

    // TEMPORARIAMENTE DESABILITADO para resolver problemas de Service Worker
    console.log('OneSignal temporariamente desabilitado');
    setOneSignalInitialized(false);
    return;
  }, []);

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

  // Carregar preferências com query defensiva
  const loadPreferences = useCallback(async () => {
    if (!user) return;

    try {
      // Usar maybeSingle() em vez de single() para não falhar se não existir
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
      } else {
        // Se não existe, criar com valores padrão
        console.log('Criando preferências padrão para o usuário');
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
        }
      }
    } catch (error) {
      console.error('Erro ao carregar preferências:', error);
    }
  }, [user]);

  // Solicitar permissão para push notifications (DESABILITADO)
  const requestPushPermission = async () => {
    try {
      // TEMPORARIAMENTE DESABILITADO
      console.log('Push notifications temporariamente desabilitado');
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

      // 2. Push notification via OneSignal TEMPORARIAMENTE DESABILITADO
      console.log('Push notification via OneSignal temporariamente desabilitado');

      console.log('Notificação enviada:', { userId, type, title, message });
    } catch (error) {
      console.error('Erro ao enviar notificação:', error);
      throw error;
    }
  }, []);

  // Enviar notificação de teste (SIMPLIFICADA)
  const sendTestNotification = useCallback(async () => {
    // Testar apenas notificação in-app por enquanto
    if (user) {
      await sendNotification({
        userId: user.id,
        type: 'sistema',
        title: 'GiraMãe - Teste',
        message: 'Sistema de notificações in-app funcionando!'
      });
      toast.success('Notificação de teste criada!');
    } else {
      toast.error('Usuário não encontrado');
    }
  }, [user, sendNotification]);

  // Effect para inicialização única do OneSignal
  useEffect(() => {
    initializeOneSignal();
  }, [initializeOneSignal]);

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

  // Realtime subscription com singleton pattern
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
