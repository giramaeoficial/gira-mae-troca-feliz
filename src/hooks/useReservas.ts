
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

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

type FilaEsperaComRelacionamentos = Tables<'fila_espera'> & {
  itens?: {
    titulo: string;
    fotos: string[] | null;
    valor_girinhas: number;
    publicado_por: string;
  } | null;
  profiles_vendedor?: {
    nome: string;
    avatar_url: string | null;
  } | null;
};

interface FilaEsperaResponse {
  tipo: 'reserva_direta' | 'fila_espera';
  reserva_id?: string;
  posicao?: number;
  total_fila?: number;
}

export const useReservas = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [reservas, setReservas] = useState<ReservaComRelacionamentos[]>([]);
  const [filasEspera, setFilasEspera] = useState<FilaEsperaComRelacionamentos[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Função para invalidar cache de itens
  const invalidateItemQueries = async (itemId?: string) => {
    if (itemId) {
      queryClient.invalidateQueries({ queryKey: ['item', itemId] });
    }
    queryClient.invalidateQueries({ queryKey: ['itens'] });
    queryClient.invalidateQueries({ queryKey: ['meus-itens'] });
    queryClient.invalidateQueries({ queryKey: ['itens-usuario'] });
  };

  const fetchReservas = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data: reservasData, error: reservasError } = await supabase
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

      if (reservasError) throw reservasError;

      const { data: filasData, error: filasError } = await supabase
        .from('fila_espera')
        .select(`
          *,
          itens (
            titulo,
            fotos,
            valor_girinhas,
            publicado_por
          )
        `)
        .eq('usuario_id', user.id)
        .order('created_at', { ascending: false });

      if (filasError) throw filasError;

      const reservasComPerfis = await Promise.all(
        (reservasData || []).map(async (reserva) => {
          const { data: perfilReservador } = await supabase
            .from('profiles')
            .select('nome, avatar_url')
            .eq('id', reserva.usuario_reservou)
            .single();

          const { data: perfilVendedor } = await supabase
            .from('profiles')
            .select('nome, avatar_url')
            .eq('id', reserva.usuario_item)
            .single();

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
            tempo_restante
          };
        })
      );

      const filasComPerfis = await Promise.all(
        (filasData || []).map(async (fila) => {
          let perfilVendedor = null;
          
          if (fila.itens?.publicado_por) {
            const { data } = await supabase
              .from('profiles')
              .select('nome, avatar_url')
              .eq('id', fila.itens.publicado_por)
              .single();
            perfilVendedor = data;
          }

          return {
            ...fila,
            profiles_vendedor: perfilVendedor
          };
        })
      );

      setReservas(reservasComPerfis);
      setFilasEspera(filasComPerfis);
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
      const { data, error } = await supabase
        .rpc('entrar_fila_espera', {
          p_item_id: itemId,
          p_usuario_id: user.id,
          p_valor_girinhas: valorGirinhas
        });

      if (error) {
        if (error.message.includes('Saldo insuficiente')) {
          toast({
            title: "Saldo insuficiente! 😔",
            description: `Você não tem Girinhas suficientes para esta reserva.`,
            variant: "destructive"
          });
        } else if (error.message.includes('já está na fila')) {
          toast({
            title: "Você já está na fila",
            description: "Você já está na fila de espera para este item.",
            variant: "destructive"
          });
        } else if (error.message.includes('já foi vendido')) {
          toast({
            title: "Item vendido",
            description: "Este item já foi vendido.",
            variant: "destructive"
          });
        } else {
          throw error;
        }
        return false;
      }

      const resultado = data as unknown as FilaEsperaResponse;

      if (resultado?.tipo === 'reserva_direta') {
        toast({
          title: "Item reservado! 🎉",
          description: "As Girinhas foram bloqueadas. Você tem 48h para combinar a entrega.",
        });
      } else if (resultado?.tipo === 'fila_espera') {
        toast({
          title: "Adicionado à fila! 📋",
          description: `Você é o ${resultado.posicao}º na fila. Te avisaremos quando for sua vez!`,
        });
      }

      // Atualizar dados e invalidar cache
      await Promise.all([
        fetchReservas(),
        invalidateItemQueries(itemId)
      ]);
      
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

  const sairDaFila = async (itemId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .rpc('sair_fila_espera', {
          p_item_id: itemId,
          p_usuario_id: user.id
        });

      if (error) {
        if (error.message.includes('não está na fila')) {
          toast({
            title: "Erro",
            description: "Você não está na fila para este item.",
            variant: "destructive"
          });
        } else {
          throw error;
        }
        return false;
      }

      toast({
        title: "Saiu da fila! 👋",
        description: "Você foi removido da fila de espera.",
      });

      await Promise.all([
        fetchReservas(),
        invalidateItemQueries(itemId)
      ]);
      
      return true;
    } catch (err) {
      console.error('Erro ao sair da fila:', err);
      toast({
        title: "Erro ao sair da fila",
        description: err instanceof Error ? err.message : "Tente novamente.",
        variant: "destructive",
      });
      return false;
    }
  };

  const criarReserva = async (itemId: string, valorGirinhas: number): Promise<boolean> => {
    return await entrarNaFila(itemId, valorGirinhas);
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

      // Buscar item_id da reserva para invalidar cache
      const reserva = reservas.find(r => r.id === reservaId);
      
      await Promise.all([
        fetchReservas(),
        invalidateItemQueries(reserva?.item_id)
      ]);
      
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

      // Buscar item_id da reserva para invalidar cache
      const reserva = reservas.find(r => r.id === reservaId);
      
      await Promise.all([
        fetchReservas(),
        invalidateItemQueries(reserva?.item_id)
      ]);
      
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
    filasEspera,
    loading,
    error,
    criarReserva,
    entrarNaFila,
    sairDaFila,
    removerDaReserva,
    confirmarEntrega,
    cancelarReserva,
    isItemReservado,
    getFilaEspera,
    refetch: fetchReservas
  };
};
