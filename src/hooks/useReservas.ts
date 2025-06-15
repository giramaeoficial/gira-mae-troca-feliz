
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';

type ReservaComRelacionamentos = Tables<'reservas'> & {
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
  posicao_fila?: number;
  tempo_restante?: number;
};

export const useReservas = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reservas, setReservas] = useState<ReservaComRelacionamentos[]>([]);
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
          )
        `)
        .or(`usuario_reservou.eq.${user.id},usuario_item.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Para cada reserva, buscar os perfis e calcular posição na fila
      const reservasComPerfis = await Promise.all(
        (data || []).map(async (reserva) => {
          // Buscar perfil do reservador
          const { data: perfilReservador } = await supabase
            .from('profiles')
            .select('nome, avatar_url')
            .eq('id', reserva.usuario_reservou)
            .single();

          // Buscar perfil do vendedor
          const { data: perfilVendedor } = await supabase
            .from('profiles')
            .select('nome, avatar_url')
            .eq('id', reserva.usuario_item)
            .single();

          // Calcular posição na fila para reservas em espera
          let posicao_fila = undefined;
          if (reserva.status === 'fila_espera') {
            const { count } = await supabase
              .from('reservas')
              .select('*', { count: 'exact', head: true })
              .eq('item_id', reserva.item_id)
              .in('status', ['pendente', 'fila_espera'])
              .lt('created_at', reserva.created_at);
            
            posicao_fila = (count || 0) + 1;
          }

          // Calcular tempo restante para reservas ativas
          let tempo_restante = undefined;
          if (reserva.status === 'pendente') {
            const agora = new Date();
            const expiracao = new Date(reserva.prazo_expiracao);
            tempo_restante = Math.max(0, expiracao.getTime() - agora.getTime());
          }

          return {
            ...reserva,
            profiles_reservador: perfilReservador,
            profiles_vendedor: perfilVendedor,
            posicao_fila,
            tempo_restante
          };
        })
      );

      setReservas(reservasComPerfis);
    } catch (err) {
      console.error('Erro ao buscar reservas:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const entrarNaFila = async (itemId: string, valorGirinhas: number): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para entrar na fila.",
        variant: "destructive",
      });
      return false;
    }

    try {
      // Verificar se já existe reserva ativa para este item
      const { data: reservaAtiva } = await supabase
        .from('reservas')
        .select('*')
        .eq('item_id', itemId)
        .eq('status', 'pendente')
        .single();

      if (reservaAtiva) {
        // Item já reservado, adicionar à fila de espera
        const { error } = await supabase
          .from('reservas')
          .insert({
            item_id: itemId,
            usuario_reservou: user.id,
            usuario_item: reservaAtiva.usuario_item,
            valor_girinhas: valorGirinhas,
            status: 'fila_espera'
          });

        if (error) throw error;

        toast({
          title: "Adicionado à fila! 📋",
          description: "Você foi adicionado à lista de espera. Te avisaremos quando for sua vez!",
        });
      } else {
        // Item disponível, fazer reserva normal
        return await criarReserva(itemId, valorGirinhas);
      }

      await fetchReservas();
      return true;
    } catch (err) {
      console.error('Erro ao entrar na fila:', err);
      toast({
        title: "Erro ao entrar na fila",
        description: err instanceof Error ? err.message : "Tente novamente.",
        variant: "destructive",
      });
      return false;
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

  const removerDaReserva = async (reservaId: string): Promise<boolean> => {
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
          description: "As Girinhas foram reembolsadas e o próximo da fila foi notificado.",
        });
      } else {
        toast({
          title: "Reserva cancelada",
          description: "Cancelamento realizado. O próximo da fila foi notificado.",
        });
      }

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
    return await removerDaReserva(reservaId);
  };

  const isItemReservado = (itemId: string): boolean => {
    return reservas.some(r => 
      r.item_id === itemId && 
      r.status === 'pendente'
    );
  };

  const getFilaEspera = (itemId: string): number => {
    return reservas.filter(r => 
      r.item_id === itemId && 
      r.status === 'fila_espera'
    ).length;
  };

  useEffect(() => {
    fetchReservas();
  }, [user]);

  return {
    reservas,
    loading,
    error,
    criarReserva,
    entrarNaFila,
    removerDaReserva,
    confirmarEntrega,
    cancelarReserva,
    isItemReservado,
    getFilaEspera,
    refetch: fetchReservas
  };
};
