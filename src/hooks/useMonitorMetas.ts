
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useRecompensas } from '@/components/recompensas/ProviderRecompensas';

export const useMonitorMetas = () => {
  const { user } = useAuth();
  const { mostrarRecompensa } = useRecompensas();

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
            mostrarRecompensa({
              tipo: 'meta',
              valor: metaAtualizada.girinhas_bonus,
              descricao: `Você conquistou a meta ${metaAtualizada.tipo_meta.toUpperCase()}!`,
              meta: metaAtualizada.tipo_meta
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(metasChannel);
    };
  }, [user, mostrarRecompensa]);
};
