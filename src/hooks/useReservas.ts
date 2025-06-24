import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

// --- TIPOS (Sem alterações) ---
type ReservaComRelacionamentos = Tables<'reservas'> & {
  codigo_confirmacao?: string;
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

// --- HOOK ---
export const useReservas = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [reservas, setReservas] = useState<ReservaComRelacionamentos[]>([]);
  const [filasEspera, setFilasEspera] = useState<FilaEsperaComRelacionamentos[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const invalidateItemQueries = async (itemId?: string) => {
    const queries = ['itens', 'meus-itens', 'itens-usuario'];
    if (itemId) {
      queryClient.invalidateQueries({ queryKey: ['item', itemId] });
    }
    queries.forEach(queryKey => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
    });
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
        .select(`*, codigo_confirmacao, itens (titulo, fotos, valor_girinhas)`)
        .or(`usuario_reservou.eq.${user.id},usuario_item.eq.${user.id}`)
        .order('created_at', { ascending: false })
        .limit(20);
      if (reservasError) throw reservasError;

      const { data: filasData, error: filasError } = await supabase
        .from('fila_espera')
        .select(`*, itens (titulo, fotos, valor_girinhas, publicado_por)`)
        .eq('usuario_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);
      if (filasError) throw filasError;
      
      const userIds = new Set<string>();
      reservasData?.forEach(r => { userIds.add(r.usuario_reservou); userIds.add(r.usuario_item); });
      filasData?.forEach(f => { if (f.itens?.publicado_por) userIds.add(f.itens.publicado_por); });
      
      const { data: profilesData } = await supabase.from('profiles').select('id, nome, avatar_url').in('id', Array.from(userIds));
      const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || []);
      
      const reservasComPerfis = (reservasData || []).map(reserva => {
        let tempo_restante;
        if (reserva.status === 'pendente') {
          tempo_restante = Math.max(0, new Date(reserva.prazo_expiracao).getTime() - new Date().getTime());
        }
        return { ...reserva, profiles_reservador: profilesMap.get(reserva.usuario_reservou) || null, profiles_vendedor: profilesMap.get(reserva.usuario_item) || null, tempo_restante };
      });
      
      const filasComPerfis = (filasData || []).map(fila => ({ ...fila, profiles_vendedor: fila.itens?.publicado_por ? profilesMap.get(fila.itens.publicado_por) || null : null }));
      
      setReservas(reservasComPerfis);
      setFilasEspera(filasComPerfis);
    } catch (err) {
      console.error('Erro ao buscar reservas:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const entrarNaFila = async (itemId: string): Promise<boolean> => {
    // ... (Esta função já está correta e foi mantida) ...
    if (!user) return false;
    setLoading(true);
    try {
        const { data, error } = await supabase
            .rpc('entrar_fila_espera', { p_item_id: itemId, p_usuario_id: user.id });

        if (error || (data && !(data as any).sucesso)) {
            const errorMessage = error?.message || (data as any)?.erro || "Não foi possível reservar.";
            toast({ title: "Erro ao reservar", description: errorMessage, variant: "destructive" });
            return false;
        }

        toast({ title: "Item reservado! 🎉", description: "As Girinhas foram bloqueadas. Use o código de confirmação na entrega." });
        await Promise.all([fetchReservas(), invalidateItemQueries(itemId)]);
        return true;
    } catch (err) {
        console.error('Erro ao entrar na fila:', err);
        toast({ title: "Erro ao entrar na fila", description: err instanceof Error ? err.message : "Tente novamente.", variant: "destructive" });
        return false;
    } finally {
        setLoading(false);
    }
  };

  const sairDaFila = async (itemId: string): Promise<boolean> => {
    // ... (Sua função original, que foi removida por engano, restaurada) ...
    if (!user) return false;
    try {
      const { error } = await supabase.rpc('sair_fila_espera', { p_item_id: itemId, p_usuario_id: user.id });
      if (error) throw error;
      toast({ title: "Saiu da fila! 👋", description: "Você foi removido da fila de espera." });
      await Promise.all([fetchReservas(), invalidateItemQueries(itemId)]);
      return true;
    } catch (err) {
      console.error('Erro ao sair da fila:', err);
      toast({ title: "Erro ao sair da fila", description: err instanceof Error ? err.message : "Tente novamente.", variant: "destructive" });
      return false;
    }
  };

  const cancelarReserva = async (reservaId: string): Promise<boolean> => {
    // ... (Sua função original, restaurada) ...
    if (!user) return false;
    setLoading(true);
    try {
      const { error } = await supabase.rpc('cancelar_reserva', { p_reserva_id: reservaId, p_usuario_id: user.id });
      if (error) throw error;
      toast({ title: "Reserva cancelada", description: "As Girinhas foram reembolsadas." });
      const reserva = reservas.find(r => r.id === reservaId);
      await Promise.all([fetchReservas(), invalidateItemQueries(reserva?.item_id)]);
      return true;
    } catch (err) {
      console.error('Erro ao cancelar reserva:', err);
      toast({ title: "Erro ao cancelar reserva", description: err instanceof Error ? err.message : "Tente novamente.", variant: "destructive" });
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  const finalizarTrocaComCodigo = async (reservaId: string, codigo: string): Promise<boolean> => {
    // ... (A nova função de finalização que criamos, mantida) ...
    if (!user) return false;
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('finalizar_troca_com_codigo', { p_reserva_id: reservaId, p_codigo_confirmacao: codigo });
      if (error) {
        if (error.message.includes('Código de confirmação inválido')) {
            toast({ title: "Código Inválido", description: "O código informado não está correto.", variant: "destructive"});
        } else if (error.message.includes('troca já foi finalizada')) {
             toast({ title: "Troca já finalizada", description: "Esta operação já foi concluída.", variant: "info"});
        } else { throw error; }
        return false;
      }
      if (data) {
        toast({ title: "Troca Finalizada! 🤝", description: "A troca foi concluída com sucesso!" });
      }
      const reserva = reservas.find(r => r.id === reservaId);
      await Promise.all([fetchReservas(), invalidateItemQueries(reserva?.item_id)]);
      return true;
    } catch (err) {
      console.error('Erro ao finalizar troca:', err);
      toast({ title: "Erro ao finalizar troca", description: err instanceof Error ? err.message : "Tente novamente.", variant: "destructive" });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Funções de utilidade que também foram removidas e agora restauradas
  const isItemReservado = (itemId: string): boolean => {
    return reservas.some(r => r.item_id === itemId && r.status === 'pendente');
  };

  const getFilaEspera = (itemId: string): number => {
    return filasEspera.filter(f => f.item_id === itemId).length;
  };

  useEffect(() => {
    if (user) {
      fetchReservas();
    }
  }, [user]);

  // ====================================================================
  //               ✨ RETORNO DO HOOK COMPLETO E CORRIGIDO ✨
  // ====================================================================
  return {
    reservas,
    filasEspera,
    loading,
    error,
    criarReserva: entrarNaFila,
    entrarNaFila,
    sairDaFila,
    removerDaReserva: cancelarReserva, // Mantendo o alias que você tinha
    confirmarEntrega: finalizarTrocaComCodigo, // Alias para a nova função, para que a UI quebre o mínimo possível
    cancelarReserva,
    isItemReservado,
    getFilaEspera,
    refetch: fetchReservas
  };
};
