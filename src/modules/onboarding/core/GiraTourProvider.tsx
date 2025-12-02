import React, { useState, useCallback, useMemo } from 'react';
import { GiraTourContext } from './GiraTourContext';
import { tourEngine } from './tourEngine';
import { tours, TourId } from '../tours';
import type { OnboardingState } from '../types';
import { supabase } from '@/integrations/supabase/client';

const STORAGE_KEY = 'giramae_completed_tours';

const getPersistedTours = (): string[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
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

// Helper para concluir jornada no banco
const concluirJornadaNoBanco = async (tourId: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Encontrar jornada correspondente ao tour
    const jornadaId = `tour-${tourId.replace('-tour', '')}`;
    
    await supabase.rpc('concluir_jornada', {
      p_user_id: user.id,
      p_jornada_id: jornadaId,
    });
  } catch (error) {
    console.warn('Erro ao concluir jornada:', error);
  }
};

export const GiraTourProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<OnboardingState>({
    completedTours: getPersistedTours(),
    currentTourId: null,
    isTourActive: false,
  });

  const startTour = useCallback((tourId: string) => {
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

    setState(prev => ({ ...prev, currentTourId: tourId, isTourActive: true }));

    tourEngine.start(
      tourConfig,
      async () => {
        // onComplete
        console.log(`Tour ${tourId} finished`);
        if (tourConfig.onComplete) tourConfig.onComplete('current-user-id');
        
        // Concluir jornada no banco e dar recompensa
        await concluirJornadaNoBanco(tourId);
        
        setState(prev => {
          const newCompletedTours = [...prev.completedTours, tourId];
          persistTours(newCompletedTours);
          return {
            ...prev,
            isTourActive: false,
            currentTourId: null,
            completedTours: newCompletedTours
          };
        });
      },
      () => {
        // onCancel
        console.log(`Tour ${tourId} cancelled`);
        if (tourConfig.onCancel) tourConfig.onCancel('current-user-id', 'unknown-step');
        setState(prev => ({ ...prev, isTourActive: false, currentTourId: null }));
      }
    );
  }, [state.isTourActive]);

  const stopTour = useCallback(() => {
    tourEngine.stop();
    setState(prev => ({ ...prev, isTourActive: false, currentTourId: null }));
  }, []);

  const checkTourEligibility = useCallback((tourId: string) => {
    const tour = tours[tourId as TourId];
    if (!tour) return false;
    
    // Logic for 'first-visit'
    if (tour.triggerCondition === 'first-visit' && state.completedTours.includes(tourId)) {
      return tour.allowReplay || false;
    }
    
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
