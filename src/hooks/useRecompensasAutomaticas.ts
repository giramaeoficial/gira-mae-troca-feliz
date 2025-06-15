
import { useEffect, useRef, useCallback } from 'react';
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
  
  const channelsRef = useRef<any[]>([]);
  const processedRef = useRef(new Set<string>());
  const isInitializedRef = useRef(false);

  const cleanupChannels = useCallback(() => {
    channelsRef.current.forEach(channel => {
      supabase.removeChannel(channel);
    });
    channelsRef.current = [];
  }, []);

  useEffect(() => {
    if (!user || isInitializedRef.current) return;
    
    isInitializedRef.current = true;

    // Limpar canais anteriores
    cleanupChannels();

    // Processar bônus de cadastro se for novo usuário (apenas uma vez)
    const verificarNovoCadastro = async () => {
      const userCreatedAt = new Date(user.created_at);
      const agora = new Date();
      const diferencaMinutos = (agora.getTime() - userCreatedAt.getTime()) / (1000 * 60);
      
      // Se foi criado há menos de 10 minutos, considerar novo usuário
      if (diferencaMinutos < 10 && !processedRef.current.has(`cadastro-${user.id}`)) {
        processedRef.current.add(`cadastro-${user.id}`);
        await processarBonusCadastro();
      }
    };

    verificarNovoCadastro();

    // Configurar listener para mudanças em reservas (trocas concluídas)
    const reservasChannel = supabase
      .channel(`reservas-changes-${user.id}`)
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
          const reservaAnterior = payload.old as any;
          
          // Evitar processamento duplicado
          const reservaKey = `reserva-${novaReserva.id}-${novaReserva.status}`;
          if (processedRef.current.has(reservaKey)) return;
          
          if (novaReserva.confirmado_por_reservador && 
              novaReserva.confirmado_por_vendedor && 
              novaReserva.status === 'confirmada' &&
              reservaAnterior.status !== 'confirmada') {
            
            processedRef.current.add(reservaKey);
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
          const reservaAnterior = payload.old as any;
          
          // Evitar processamento duplicado
          const reservaKey = `reserva-${novaReserva.id}-${novaReserva.status}`;
          if (processedRef.current.has(reservaKey)) return;
          
          if (novaReserva.confirmado_por_reservador && 
              novaReserva.confirmado_por_vendedor && 
              novaReserva.status === 'confirmada' &&
              reservaAnterior.status !== 'confirmada') {
            
            processedRef.current.add(reservaKey);
            processarBonusTrocaConcluida(novaReserva.id);
            verificarEProcessarMetas();
          }
        }
      )
      .subscribe();

    channelsRef.current.push(reservasChannel);

    // Configurar listener para avaliações
    const avaliacoesChannel = supabase
      .channel(`avaliacoes-changes-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'avaliacoes',
          filter: `avaliador_id=eq.${user.id}`
        },
        (payload) => {
          const avaliacao = payload.new as any;
          const avaliacaoKey = `avaliacao-${avaliacao.id}`;
          
          if (!processedRef.current.has(avaliacaoKey)) {
            processedRef.current.add(avaliacaoKey);
            setTimeout(() => {
              processarBonusAvaliacao();
            }, 1000);
          }
        }
      )
      .subscribe();

    channelsRef.current.push(avaliacoesChannel);

    return () => {
      cleanupChannels();
      isInitializedRef.current = false;
    };
  }, [user?.id]);

  return {};
};
