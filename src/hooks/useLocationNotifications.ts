
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { toast } from '@/components/ui/use-toast';

type LocationNotifications = Tables<'user_location_notifications'>;

export const useLocationNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<LocationNotifications | null>(null);
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
        .maybeSingle();

      if (error) throw error;

      if (!data) {
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
      } else {
        setNotifications(data);
      }
    } catch (error) {
      console.error('Erro ao carregar preferências:', error);
    } finally {
      setLoading(false);
    }
  };

  const atualizarPreferencias = async (updates: Partial<LocationNotifications>) => {
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
      toast({
        title: "Preferências atualizadas",
        description: "Suas preferências de notificação foram salvas com sucesso"
      });
    } catch (error) {
      console.error('Erro ao atualizar preferências:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar preferências",
        variant: "destructive"
      });
    }
  };

  return {
    notifications,
    loading,
    atualizarPreferencias,
    refetch: carregarPreferencias
  };
};
