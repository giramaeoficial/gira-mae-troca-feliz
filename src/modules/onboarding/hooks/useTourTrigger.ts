import { useEffect } from 'react';
import { useGiraTour } from '../core/useGiraTour';
import { TriggerCondition } from '../types';

interface TriggerOptions {
  condition: TriggerCondition;
  delay?: number;
}

export const useTourTrigger = (tourId: string, options: TriggerOptions) => {
  const { startTour, checkTourEligibility } = useGiraTour();

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (options.condition === 'first-visit') {
      if (checkTourEligibility(tourId)) {
        timeoutId = setTimeout(() => {
          startTour(tourId);
        }, options.delay || 0);
      }
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [tourId, options.condition, options.delay, startTour, checkTourEligibility]);
};