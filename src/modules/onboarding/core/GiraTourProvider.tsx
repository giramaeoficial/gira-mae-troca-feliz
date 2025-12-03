import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { GiraTourContext } from './GiraTourContext';
import { tourEngine } from './tourEngine';
import { tours, TourId } from '../tours';
import type { OnboardingState } from '../types';
import { supabase } from '@/integrations/supabase/client';
import { useRecompensas } from '@/components/recompensas/ProviderRecompensas';

const STORAGE_KEY = 'giramae_completed_tours';
const SKIPPED_KEY = 'giramae_skipped_tours';

const getPersistedTours = (): string[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const getSkippedTours = (): string[] => {
  try {
    const stored = localStorage.getItem(SKIPPED_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const persistTours = (completedTours: string[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(completedTours));
  } catch (error) {
    console.warn('Failed to persist completed tours:', error);
  }
};

const persistSkippedTours = (skippedTours: string[]) => {
  try {
    localStorage.setItem(SKIPPED_KEY, JSON.stringify(skippedTours));
  } catch (error) {
    console.warn('Failed to persist skipped tours:', error);
  }
};

interface ConcluirJornadaResult {
  sucesso: boolean;
  erro?: string;
  recompensa?: number;
  titulo?: string;
  icone?: string;
  transacao_id?: string;
}

export const GiraTourProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  const { mostrarRecompensa } = useRecompensas();
  
  const [state, setState] = useState<OnboardingState>({
    completedTours: getPersistedTours(),
    skippedTours: getSkippedTours(),
    currentTourId: null,
    isTourActive: false,
  });

  // Helper para concluir jornada no banco e dar recompensa
  const concluirJornadaNoBanco = useCallback(async (tourId: string): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // Encontrar jornada correspondente ao tour
      const jornadaId = `tour-${tourId.replace('-tour', '')}`;
      
      const { data, error } = await supabase.rpc('concluir_jornada', {
        p_user_id: user.id,
        p_jornada_id: jornadaId,
      });

      if (error) {
        console.warn('Erro ao concluir jornada:', error);
        return false;
      }

      const result = data as ConcluirJornadaResult | null;
      
      if (result?.sucesso) {
        // Invalidar queries para atualizar o checklist
        queryClient.invalidateQueries({ queryKey: ['jornadas-progresso'] });
        queryClient.invalidateQueries({ queryKey: ['carteira'] });

        // Mostrar celebração com confetes e tudo mais!
        mostrarRecompensa({
          tipo: 'jornada',
          valor: result.recompensa || 1,
          descricao: result.titulo || 'Tour concluído!',
          meta: result.icone,
        });

        return true;
      }

      return false;
    } catch (error) {
      console.warn('Erro ao concluir jornada:', error);
      return false;
    }
  }, [queryClient, mostrarRecompensa]);

  const startTour = useCallback((tourId: string, isManual: boolean = false) => {
    const tourConfig = tours[tourId as TourId];
    if (!tourConfig) {
      console.warn(`Tour ${tourId} not found`);
      return;
    }

    // Não iniciar se já tem tour ativo
    if (state.isTourActive) {
      console.warn(`Tour already active, skipping ${tourId}`);
      return;
    }

    // Não iniciar automaticamente se já foi completado
    if (state.completedTours.includes(tourId)) {
      console.warn(`Tour ${tourId} already completed`);
      return;
    }

    // Se não é manual e foi pulado, não inicia automaticamente
    if (!isManual && state.skippedTours.includes(tourId)) {
      console.warn(`Tour ${tourId} was skipped, won't auto-start`);
      return;
    }

    setState(prev => ({ ...prev, currentTourId: tourId, isTourActive: true }));

    tourEngine.start(
      tourConfig,
      async () => {
        // onComplete - tour finalizado com sucesso
        console.log(`Tour ${tourId} finished successfully`);
        
        // Concluir jornada no banco, dar recompensa e mostrar celebração
        await concluirJornadaNoBanco(tourId);
        
        setState(prev => {
          const newCompletedTours = prev.completedTours.includes(tourId) 
            ? prev.completedTours 
            : [...prev.completedTours, tourId];
          
          // Remover dos pulados se estava lá
          const newSkippedTours = prev.skippedTours.filter(t => t !== tourId);
          
          persistTours(newCompletedTours);
          persistSkippedTours(newSkippedTours);
          
          return {
            ...prev,
            isTourActive: false,
            currentTourId: null,
            completedTours: newCompletedTours,
            skippedTours: newSkippedTours,
          };
        });
      },
      () => {
        // onCancel - tour pulado/cancelado
        console.log(`Tour ${tourId} cancelled/skipped`);
        
        setState(prev => {
          // Adicionar aos pulados (não inicia automaticamente novamente)
          const newSkippedTours = prev.skippedTours.includes(tourId)
            ? prev.skippedTours
            : [...prev.skippedTours, tourId];
          
          persistSkippedTours(newSkippedTours);
          
          return { 
            ...prev, 
            isTourActive: false, 
            currentTourId: null,
            skippedTours: newSkippedTours,
          };
        });
      }
    );
  }, [state.isTourActive, state.completedTours, state.skippedTours, concluirJornadaNoBanco]);

  const stopTour = useCallback(() => {
    tourEngine.stop();
    setState(prev => ({ ...prev, isTourActive: false, currentTourId: null }));
  }, []);

  const checkTourEligibility = useCallback((tourId: string) => {
    // Se já completou, não é elegível
    if (state.completedTours.includes(tourId)) {
      return false;
    }
    
    const tour = tours[tourId as TourId];
    if (!tour) return false;
    
    return true;
  }, [state.completedTours]);

  const value = useMemo(() => ({
    startTour,
    stopTour,
    state,
    checkTourEligibility
  }), [startTour, stopTour, state, checkTourEligibility]);

  return (
    <GiraTourContext.Provider value={value}>
      {children}
    </GiraTourContext.Provider>
  );
};
