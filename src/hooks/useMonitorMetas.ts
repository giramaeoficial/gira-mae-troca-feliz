
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useRecompensas } from '@/components/recompensas/ProviderRecompensas';
import { useToast } from '@/hooks/use-toast';

export const useMonitorMetas = () => {
  const { user } = useAuth();
  const { mostrarRecompensa } = useRecompensas();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;

    // Monitorar mudanças nas metas
    const metasChannel = supabase
      .channel('metas-changes')
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
          
          // Se a meta foi conquistada agora
          if (metaAtualizada.conquistado && !payload.old.conquistado) {
            // Pequeno delay para garantir que outras transações sejam processadas
            setTimeout(() => {
              mostrarRecompensa({
                tipo: 'meta',
                valor: metaAtualizada.girinhas_bonus,
                descricao: `Incrível! Você conquistou o distintivo ${metaAtualizada.tipo_meta.toUpperCase()}!`,
                meta: metaAtualizada.tipo_meta
              });

              // Toast adicional para reforçar
              toast({
                title: `🎯 Meta ${metaAtualizada.tipo_meta.toUpperCase()} alcançada!`,
                description: `Fantástico! +${metaAtualizada.girinhas_bonus} Girinhas de bônus!`,
              });
            }, 1000);
          }
        }
      )
      .subscribe();

    // Monitorar novas transações de bônus para celebrar
    const transacoesChannel = supabase
      .channel('transacoes-bonus')
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
          
          // Celebrar bônus especiais que não são capturados em outros lugares
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

    return () => {
      supabase.removeChannel(metasChannel);
      supabase.removeChannel(transacoesChannel);
    };
  }, [user, mostrarRecompensa, toast]);
};
