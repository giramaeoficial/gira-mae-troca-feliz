
import { useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useBonificacoes } from '@/hooks/useBonificacoes';
import { supabase } from '@/integrations/supabase/client';

// Singleton instance tracking
let instanceCount = 0;
let debounceTimeouts: { [key: string]: NodeJS.Timeout } = {};

const debounce = (func: Function, delay: number, key: string) => {
  return (...args: any[]) => {
    if (debounceTimeouts[key]) {
      clearTimeout(debounceTimeouts[key]);
    }
    
    debounceTimeouts[key] = setTimeout(() => {
      func(...args);
      delete debounceTimeouts[key];
    }, delay);
  };
};

export const useRecompensasAutomaticas = () => {
  const { user } = useAuth();
  const { 
    processarBonusTrocaConcluida, 
    processarBonusAvaliacao,
    processarBonusCadastro,
    verificarEProcessarMetas
  } = useBonificacoes();
  
  const instanceRef = useRef<number>(0);
  const channelsRef = useRef<any[]>([]);

  useEffect(() => {
    if (!user) return;

    // Singleton pattern - apenas uma instância ativa por vez
    instanceCount++;
    instanceRef.current = instanceCount;
    
    console.log(`RecompensasAutomaticas instance ${instanceRef.current} iniciada`);

    // Se não é a instância mais recente, não executar
    if (instanceRef.current !== instanceCount) {
      console.log(`Instance ${instanceRef.current} não é a mais recente, ignorando`);
      return;
    }

    const initializeRecompensas = async () => {
      // Processar bônus de cadastro se for novo usuário (debounced)
      const processarCadastroDebounced = debounce(async () => {
        const userCreatedAt = new Date(user.created_at);
        const agora = new Date();
        const diferencaMinutos = (agora.getTime() - userCreatedAt.getTime()) / (1000 * 60);
        
        // Se foi criado há menos de 10 minutos, considerar novo usuário
        if (diferencaMinutos < 10) {
          await processarBonusCadastro();
        }
      }, 500, `cadastro-${user.id}`);

      processarCadastroDebounced();

      // Debounced functions para processar bônus
      const processarTrocaDebounced = debounce(async (reservaId: string) => {
        await processarBonusTrocaConcluida(reservaId);
        await verificarEProcessarMetas();
      }, 500, `troca-${user.id}`);

      const processarAvaliacaoDebounced = debounce(async () => {
        await processarBonusAvaliacao();
      }, 500, `avaliacao-${user.id}`);

      // Configurar listener para mudanças em reservas (trocas concluídas)
      const reservasChannelReservador = supabase
        .channel(`reservas-changes-reservador-${user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'reservas',
            filter: `usuario_reservou=eq.${user.id}`
          },
          (payload) => {
            // Verificar se ainda é a instância ativa
            if (instanceRef.current !== instanceCount) return;
            
            const novaReserva = payload.new as any;
            if (novaReserva.confirmado_por_reservador && 
                novaReserva.confirmado_por_vendedor && 
                novaReserva.status === 'confirmada') {
              console.log('Processando bônus de troca concluída (reservador)');
              processarTrocaDebounced(novaReserva.id);
            }
          }
        )
        .subscribe();

      const reservasChannelVendedor = supabase
        .channel(`reservas-changes-vendedor-${user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'reservas',
            filter: `usuario_item=eq.${user.id}`
          },
          (payload) => {
            // Verificar se ainda é a instância ativa
            if (instanceRef.current !== instanceCount) return;
            
            const novaReserva = payload.new as any;
            if (novaReserva.confirmado_por_reservador && 
                novaReserva.confirmado_por_vendedor && 
                novaReserva.status === 'confirmada') {
              console.log('Processando bônus de troca concluída (vendedor)');
              processarTrocaDebounced(novaReserva.id);
            }
          }
        )
        .subscribe();

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
          () => {
            // Verificar se ainda é a instância ativa
            if (instanceRef.current !== instanceCount) return;
            
            console.log('Processando bônus de avaliação');
            // Dar um pequeno delay adicional para garantir que a transação seja processada
            setTimeout(() => {
              processarAvaliacaoDebounced();
            }, 1000);
          }
        )
        .subscribe();

      // Armazenar referências dos canais para cleanup
      channelsRef.current = [
        reservasChannelReservador,
        reservasChannelVendedor,
        avaliacoesChannel
      ];
    };

    initializeRecompensas();

    // Cleanup function
    return () => {
      console.log(`Cleanup RecompensasAutomaticas instance ${instanceRef.current}`);
      
      // Limpar todos os canais
      channelsRef.current.forEach(channel => {
        if (channel) {
          supabase.removeChannel(channel);
        }
      });
      channelsRef.current = [];

      // Limpar timeouts de debounce relacionados a este usuário
      Object.keys(debounceTimeouts).forEach(key => {
        if (key.includes(user.id)) {
          clearTimeout(debounceTimeouts[key]);
          delete debounceTimeouts[key];
        }
      });
    };
  }, [user, processarBonusTrocaConcluida, processarBonusAvaliacao, processarBonusCadastro, verificarEProcessarMetas]);

  return {
    // Hook de monitoramento automático singleton
    instanceId: instanceRef.current
  };
};
