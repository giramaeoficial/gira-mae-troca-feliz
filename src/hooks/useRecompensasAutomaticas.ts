
import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useBonificacoes } from '@/hooks/useBonificacoes';
import { supabase } from '@/integrations/supabase/client';

export const useRecompensasAutomaticas = () => {
  const { user } = useAuth();
  const { processarBonusCadastro } = useBonificacoes();
  
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
    cleanupChannels();

    // Apenas processar bônus de cadastro uma vez
    const userKey = `cadastro-${user.id}`;
    if (!processedRef.current.has(userKey)) {
      processedRef.current.add(userKey);
      
      const userCreatedAt = new Date(user.created_at);
      const agora = new Date();
      const diferencaMinutos = (agora.getTime() - userCreatedAt.getTime()) / (1000 * 60);
      
      if (diferencaMinutos < 10) {
        processarBonusCadastro();
      }
    }

    return () => {
      cleanupChannels();
      isInitializedRef.current = false;
    };
  }, [user?.id, cleanupChannels, processarBonusCadastro]);

  return {};
};
