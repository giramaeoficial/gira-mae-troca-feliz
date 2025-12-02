import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { GiraTourContext } from './GiraTourContext';
import { tourEngine } from './tourEngine';
import { tours, TourId } from '../tours';
import type { OnboardingState } from '../types';

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
      () => {
        // onComplete
        console.log(`Tour ${tourId} finished`);
        if (tourConfig.onComplete) tourConfig.onComplete('current-user-id');
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
