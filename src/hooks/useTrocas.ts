
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

type Troca = Tables<'reservas'> & {
  itens?: {
    titulo: string;
    fotos: string[] | null;
  } | null;
  profiles_reservador?: {
    nome: string;
    avatar_url: string | null;
  } | null;
  profiles_vendedor?: {
    nome: string;
    avatar_url: string | null;
  } | null;
};

export const useTrocas = () => {
  const { user } = useAuth();
  const [trocas, setTrocas] = useState<Troca[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrocas = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('reservas')
        .select(`
          *,
          itens (
            titulo,
            fotos
          ),
          profiles_reservador:profiles!reservas_usuario_reservou_fkey (
            nome,
            avatar_url
          ),
          profiles_vendedor:profiles!reservas_usuario_item_fkey (
            nome,
            avatar_url
          )
        `)
        .or(`usuario_reservou.eq.${user.id},usuario_item.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setTrocas(data || []);
    } catch (err) {
      console.error('Erro ao buscar trocas:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const marcarComoConfirmada = async (reservaId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .rpc('confirmar_entrega', {
          p_reserva_id: reservaId,
          p_usuario_id: user.id
        });

      if (error) throw error;

      // Recarregar dados
      await fetchTrocas();
      
      return data === true; // Retorna true se ambos confirmaram
    } catch (err) {
      console.error('Erro ao confirmar entrega:', err);
      setError(err instanceof Error ? err.message : 'Erro ao confirmar entrega');
      return false;
    }
  };

  const cancelarTroca = async (reservaId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .rpc('cancelar_reserva', {
          p_reserva_id: reservaId,
          p_usuario_id: user.id
        });

      if (error) throw error;

      // Recarregar dados
      await fetchTrocas();
      
      return data === true; // Retorna true se houve reembolso
    } catch (err) {
      console.error('Erro ao cancelar troca:', err);
      setError(err instanceof Error ? err.message : 'Erro ao cancelar troca');
      return false;
    }
  };

  useEffect(() => {
    fetchTrocas();
  }, [user]);

  return {
    trocas,
    loading,
    error,
    refetch: fetchTrocas,
    marcarComoConfirmada,
    cancelarTroca
  };
};
