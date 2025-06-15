
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';

type Reserva = Tables<'reservas'> & {
  itens?: {
    titulo: string;
    fotos: string[] | null;
    valor_girinhas: number;
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

export const useReservas = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReservas = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('reservas')
        .select(`
          *,
          itens (
            titulo,
            fotos,
            valor_girinhas
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

      if (error) throw error;

      setReservas(data || []);
    } catch (err) {
      console.error('Erro ao buscar reservas:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const criarReserva = async (itemId: string, valorGirinhas: number): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para fazer uma reserva.",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { data, error } = await supabase
        .rpc('processar_reserva', {
          p_item_id: itemId,
          p_usuario_reservou: user.id,
          p_valor: valorGirinhas
        });

      if (error) {
        if (error.message.includes('Saldo insuficiente')) {
          toast({
            title: "Saldo insuficiente! 😔",
            description: `Você não tem Girinhas suficientes para esta reserva.`,
            variant: "destructive"
          });
        } else if (error.message.includes('Item já reservado')) {
          toast({
            title: "Item já reservado",
            description: "Este item já foi reservado por outra mãe.",
            variant: "destructive"
          });
        } else if (error.message.includes('Item não disponível')) {
          toast({
            title: "Item indisponível",
            description: "Este item não está mais disponível.",
            variant: "destructive"
          });
        } else {
          throw error;
        }
        return false;
      }

      toast({
        title: "Item reservado! 🎉",
        description: "As Girinhas foram bloqueadas. Você tem 48h para combinar a entrega.",
      });

      // Recarregar reservas
      await fetchReservas();
      return true;
    } catch (err) {
      console.error('Erro ao criar reserva:', err);
      toast({
        title: "Erro ao reservar item",
        description: err instanceof Error ? err.message : "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
      return false;
    }
  };

  const confirmarEntrega = async (reservaId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .rpc('confirmar_entrega', {
          p_reserva_id: reservaId,
          p_usuario_id: user.id
        });

      if (error) throw error;

      if (data) {
        toast({
          title: "Troca Finalizada! 🤝",
          description: "Ambas confirmaram a entrega. A troca foi concluída com sucesso!",
        });
      } else {
        toast({
          title: "Entrega confirmada! ✅",
          description: "Aguardando a confirmação da outra mãe para finalizar a troca.",
        });
      }

      // Recarregar reservas
      await fetchReservas();
      return true;
    } catch (err) {
      console.error('Erro ao confirmar entrega:', err);
      toast({
        title: "Erro ao confirmar entrega",
        description: err instanceof Error ? err.message : "Tente novamente.",
        variant: "destructive",
      });
      return false;
    }
  };

  const cancelarReserva = async (reservaId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .rpc('cancelar_reserva', {
          p_reserva_id: reservaId,
          p_usuario_id: user.id
        });

      if (error) throw error;

      if (data) {
        toast({
          title: "Reserva cancelada",
          description: "As Girinhas foram reembolsadas.",
        });
      } else {
        toast({
          title: "Reserva cancelada",
          description: "Cancelamento realizado sem reembolso conforme política.",
          variant: "destructive"
        });
      }

      // Recarregar reservas
      await fetchReservas();
      return true;
    } catch (err) {
      console.error('Erro ao cancelar reserva:', err);
      toast({
        title: "Erro ao cancelar reserva",
        description: err instanceof Error ? err.message : "Tente novamente.",
        variant: "destructive",
      });
      return false;
    }
  };

  const isItemReservado = (itemId: string): boolean => {
    return reservas.some(r => 
      r.item_id === itemId && 
      r.status === 'pendente'
    );
  };

  useEffect(() => {
    fetchReservas();
  }, [user]);

  return {
    reservas,
    loading,
    error,
    criarReserva,
    confirmarEntrega,
    cancelarReserva,
    isItemReservado,
    refetch: fetchReservas
  };
};
