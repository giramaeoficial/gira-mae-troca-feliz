
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { toast } from 'sonner';

type LocationNotification = Tables<'user_location_notifications'>;

export const useLocationNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<LocationNotification | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      carregarPreferencias();
    }
  }, [user]);

  const carregarPreferencias = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_location_notifications')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setNotifications(data);
      } else {
        // Criar preferências padrão
        const defaultPrefs = {
          user_id: user.id,
          items_mesma_escola: true,
          items_mesmo_bairro: true,
          items_raio_km: 5,
          novas_maes_escola: false,
          novas_maes_bairro: false,
          frequencia: 'imediata' as const,
          horario_resumo: '09:00:00',
          ativo: true
        };

        const { data: newData, error: insertError } = await supabase
          .from('user_location_notifications')
          .insert(defaultPrefs)
          .select()
          .single();

        if (insertError) throw insertError;
        setNotifications(newData);
      }
    } catch (error) {
      console.error('Erro ao carregar preferências de notificação:', error);
      toast.error('Erro ao carregar preferências de notificação');
    } finally {
      setLoading(false);
    }
  };

  const atualizarPreferencias = async (updates: Partial<LocationNotification>) => {
    if (!user || !notifications) return;

    try {
      const { data, error } = await supabase
        .from('user_location_notifications')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setNotifications(data);
      toast.success('Preferências atualizadas!');
    } catch (error) {
      console.error('Erro ao atualizar preferências:', error);
      toast.error('Erro ao atualizar preferências');
    }
  };

  return {
    notifications,
    loading,
    atualizarPreferencias,
    refetch: carregarPreferencias
  };
};
