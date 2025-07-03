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
  const oneSignalInitialized = useRef(false);
  const initializationAttempts = useRef(0);
  const maxInitializationAttempts = 3;

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

  // Aguardar OneSignal carregar completamente
  const waitForOneSignalReady = useCallback((): Promise<void> => {
    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(() => {
        if (window.OneSignal?.User?.addAlias && window.OneSignal?.User?.PushSubscription) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);

      // Timeout após 15 segundos
      setTimeout(() => {
        clearInterval(checkInterval);
        reject(new Error('OneSignal não carregou em 15 segundos'));
      }, 15000);
    });
  }, []);

  // Verificar se o usuário está subscrito
  const checkSubscriptionStatus = useCallback(async (): Promise<boolean> => {
    try {
      if (!window.OneSignal?.User?.PushSubscription) {
        return false;
      }

      // Aguardar um pouco para o subscription ser criado
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const playerId = await window.OneSignal.User.PushSubscription.id;
      const isOptedIn = window.OneSignal.User.PushSubscription.optedIn;
      
      console.log('🔍 Verificando subscription:', { playerId, isOptedIn });
      
      return !!(playerId && isOptedIn);
    } catch (error) {
      console.warn('Erro ao verificar subscription:', error);
      return false;
    }
  }, []);

  // Inicializar OneSignal com retry
  const initializeOneSignal = useCallback(async () => {
    if (oneSignalInitialized.current || !user || typeof window === 'undefined') return;
    
    if (initializationAttempts.current >= maxInitializationAttempts) {
      console.warn('❌ Máximo de tentativas de inicialização do OneSignal atingido');
      return;
    }

    initializationAttempts.current++;
    console.log(`🚀 Inicializando OneSignal (tentativa ${initializationAttempts.current}/${maxInitializationAttempts}) para usuário:`, user.id);

    try {
      // Aguardar OneSignal carregar
      await waitForOneSignalReady();
      
      // Verificar se já está inicializado
      if (oneSignalInitialized.current) return;

      oneSignalInitialized.current = true;
      console.log('✅ OneSignal carregado, registrando usuário...');

      // Registrar External User ID
      await window.OneSignal.User.addAlias('external_id', user.id);
      console.log('✅ External User ID registrado:', user.id);

      // Verificar subscription após um tempo
      setTimeout(async () => {
        try {
          const isSubscribed = await checkSubscriptionStatus();
          const playerId = await window.OneSignal.User.PushSubscription.id;
          
          console.log('🎯 Status final do OneSignal:', { 
            playerId, 
            isSubscribed,
            browserPermission: Notification.permission 
          });

          if (isSubscribed) {
            console.log('✅ Usuário totalmente configurado no OneSignal');
          } else {
            console.log('⚠️ Usuário registrado mas não subscrito - precisa aceitar permissões');
          }
        } catch (error) {
          console.warn('⚠️ Erro ao verificar status final:', error);
        }
      }, 3000);

    } catch (error) {
      console.error(`❌ Erro ao inicializar OneSignal (tentativa ${initializationAttempts.current}):`, error);
      oneSignalInitialized.current = false;
      
      // Retry após um tempo se não atingiu o limite
      if (initializationAttempts.current < maxInitializationAttempts) {
        setTimeout(() => {
          initializeOneSignal();
        }, 5000);
      }
    }
  }, [user, waitForOneSignalReady, checkSubscriptionStatus]);

  // Solicitar permissão para push notifications
  const requestPushPermission = async () => {
    try {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          await updatePreferences({ push_enabled: true });
          setPushEnabled(true);
          
          // Reinicializar OneSignal após aceitar permissão
          oneSignalInitialized.current = false;
          initializationAttempts.current = 0;
          
          setTimeout(async () => {
            try {
              await initializeOneSignal();
              
              // Verificar se ficou subscrito após alguns segundos
              setTimeout(async () => {
                const isSubscribed = await checkSubscriptionStatus();
                if (isSubscribed) {
                  toast.success('Notificações ativadas com sucesso!');
                } else {
                  toast.info('Permissão concedida! Aguarde alguns segundos para finalizar a configuração...');
                }
              }, 5000);
            } catch (error) {
              console.error('❌ Erro ao reinicializar OneSignal após permissão:', error);
              toast.error('Erro ao configurar notificações');
            }
          }, 1000);
          
          return true;
        } else {
          toast.error('Permissão negada. Você pode ativá-la manualmente nas configurações do seu navegador.');
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

  // Effect para inicializar OneSignal quando necessário
  useEffect(() => {
    if (user && !oneSignalInitialized.current) {
      // Aguardar um pouco antes de inicializar
      const timer = setTimeout(initializeOneSignal, 3000);
      return () => clearTimeout(timer);
    }
  }, [user, initializeOneSignal]);

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
    oneSignalInitialized: oneSignalInitialized.current,
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
