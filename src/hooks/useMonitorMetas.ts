
import { useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useRecompensas } from '@/components/recompensas/ProviderRecompensas';
import { useToast } from '@/hooks/use-toast';

export const useMonitorMetas = () => {
  const { user } = useAuth();
  const { mostrarRecompensa } = useRecompensas();
  const { toast } = useToast();
  const channelsRef = useRef<any[]>([]);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    // Evitar múltiplas inicializações
    if (!user || isInitializedRef.current) return;
    
    console.log('RecompensasAutomaticas iniciando para user:', user.id);
    isInitializedRef.current = true;

    // Limpar canais existentes primeiro
    channelsRef.current.forEach(channel => {
      supabase.removeChannel(channel);
    });
    channelsRef.current = [];

    // Monitorar mudanças nas metas
    const metasChannel = supabase
      .channel(`metas-changes-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'metas_usuarios',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const metaAtualizada = payload.new as any;
          
          if (metaAtualizada.conquistado && !payload.old.conquistado) {
            setTimeout(() => {
              mostrarRecompensa({
                tipo: 'meta',
                valor: metaAtualizada.girinhas_bonus,
                descricao: `Incrível! Você conquistou o distintivo ${metaAtualizada.tipo_meta.toUpperCase()}!`,
                meta: metaAtualizada.tipo_meta
              });

              toast({
                title: `🎯 Meta ${metaAtualizada.tipo_meta.toUpperCase()} alcançada!`,
                description: `Fantástico! +${metaAtualizada.girinhas_bonus} Girinhas de bônus!`,
              });
            }, 1000);
          }
        }
      )
      .subscribe();

    // Monitorar novas transações de bônus
    const transacoesChannel = supabase
      .channel(`transacoes-bonus-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'transacoes',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const transacao = payload.new as any;
          
          if (transacao.tipo === 'bonus' && transacao.descricao?.includes('promocional')) {
            setTimeout(() => {
              mostrarRecompensa({
                tipo: 'cadastro',
                valor: transacao.valor,
                descricao: 'Surpresa! Você recebeu Girinhas promocionais!'
              });
            }, 500);
          }
        }
      )
      .subscribe();

    // Armazenar canais para cleanup
    channelsRef.current = [metasChannel, transacoesChannel];

    return () => {
      console.log('Cleanup RecompensasAutomaticas para user:', user.id);
      channelsRef.current.forEach(channel => {
        supabase.removeChannel(channel);
      });
      channelsRef.current = [];
      isInitializedRef.current = false;
    };
  }, [user?.id, mostrarRecompensa, toast]);

  // Cleanup quando o componente for desmontado
  useEffect(() => {
    return () => {
      channelsRef.current.forEach(channel => {
        supabase.removeChannel(channel);
      });
    };
  }, []);
};
