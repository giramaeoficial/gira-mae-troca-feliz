
import { useEffect, useRef, useCallback } from 'react';
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

  const cleanupChannels = useCallback(() => {
    channelsRef.current.forEach(channel => {
      supabase.removeChannel(channel);
    });
    channelsRef.current = [];
  }, []);

  useEffect(() => {
    if (!user || isInitializedRef.current) return;
    
    isInitializedRef.current = true;
    cleanupChannels();

    // Apenas monitorar se tiver recompensas habilitadas
    if (mostrarRecompensa && toast) {
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
            const metaAnterior = payload.old as any;
            
            if (metaAtualizada.conquistado && !metaAnterior.conquistado) {
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

      channelsRef.current.push(metasChannel);
    }

    return () => {
      cleanupChannels();
      isInitializedRef.current = false;
    };
  }, [user?.id, cleanupChannels, mostrarRecompensa, toast]);
};
