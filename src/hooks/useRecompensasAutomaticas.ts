
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useBonificacoes } from '@/hooks/useBonificacoes';
import { supabase } from '@/integrations/supabase/client';

export const useRecompensasAutomaticas = () => {
  const { user } = useAuth();
  const { 
    processarBonusTrocaConcluida, 
    processarBonusAvaliacao,
    processarBonusCadastro,
    verificarEProcessarMetas
  } = useBonificacoes();

  useEffect(() => {
    if (!user) return;

    // Processar bônus de cadastro se for novo usuário
    const verificarNovoCadastro = async () => {
      const userCreatedAt = new Date(user.created_at);
      const agora = new Date();
      const diferencaMinutos = (agora.getTime() - userCreatedAt.getTime()) / (1000 * 60);
      
      // Se foi criado há menos de 10 minutos, considerar novo usuário
      if (diferencaMinutos < 10) {
        await processarBonusCadastro();
      }
    };

    verificarNovoCadastro();

    // Configurar listener para mudanças em reservas (trocas concluídas)
    const reservasChannel = supabase
      .channel('reservas-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'reservas',
          filter: `usuario_reservou=eq.${user.id}`
        },
        (payload) => {
          const novaReserva = payload.new as any;
          if (novaReserva.confirmado_por_reservador && 
              novaReserva.confirmado_por_vendedor && 
              novaReserva.status === 'confirmada') {
            processarBonusTrocaConcluida(novaReserva.id);
            verificarEProcessarMetas();
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'reservas',
          filter: `usuario_item=eq.${user.id}`
        },
        (payload) => {
          const novaReserva = payload.new as any;
          if (novaReserva.confirmado_por_reservador && 
              novaReserva.confirmado_por_vendedor && 
              novaReserva.status === 'confirmada') {
            processarBonusTrocaConcluida(novaReserva.id);
            verificarEProcessarMetas();
          }
        }
      )
      .subscribe();

    // Configurar listener para avaliações
    const avaliacoesChannel = supabase
      .channel('avaliacoes-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'avaliacoes',
          filter: `avaliador_id=eq.${user.id}`
        },
        () => {
          // Dar um pequeno delay para garantir que a transação seja processada
          setTimeout(() => {
            processarBonusAvaliacao();
          }, 1000);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(reservasChannel);
      supabase.removeChannel(avaliacoesChannel);
    };
  }, [user]);

  return {
    // Hook de monitoramento automático, não retorna nada específico
  };
};
