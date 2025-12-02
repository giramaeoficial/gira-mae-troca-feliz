import React, { useState, useCallback, useMemo } from 'react';
import { GiraTourContext } from './GiraTourContext';
import { tourEngine } from './tourEngine';
import { tours, TourId } from '../tours';
import type { OnboardingState } from '../types';

export const GiraTourProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<OnboardingState>({
    completedTours: [], // Should come from persistence (Supabase)
    currentTourId: null,
    isTourActive: false,
  });

  const startTour = useCallback((tourId: string) => {
    const tourConfig = tours[tourId as TourId];
    if (!tourConfig) {
      console.warn(`Tour ${tourId} not found`);
      return;
    }

    setState(prev => ({ ...prev, currentTourId: tourId, isTourActive: true }));

    tourEngine.start(
      tourConfig,
      () => {
        // onComplete
        console.log(`Tour ${tourId} finished`);
        if (tourConfig.onComplete) tourConfig.onComplete('current-user-id');
        setState(prev => ({
          ...prev,
          isTourActive: false,
          currentTourId: null,
          completedTours: [...prev.completedTours, tourId]
        }));
      },
      () => {
        // onCancel
        console.log(`Tour ${tourId} cancelled`);
        if (tourConfig.onCancel) tourConfig.onCancel('current-user-id', 'unknown-step');
        setState(prev => ({ ...prev, isTourActive: false, currentTourId: null }));
      }
    );
  }, []);

  const stopTour = useCallback(() => {
    tourEngine.stop();
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