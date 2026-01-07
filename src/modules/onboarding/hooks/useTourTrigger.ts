import { useEffect } from 'react';
import { useGiraTour } from '../core/useGiraTour';
import { TriggerCondition } from '../types';

interface TriggerOptions {
  condition: TriggerCondition;
  delay?: number;
}

export const useTourTrigger = (tourId: string, options: TriggerOptions) => {
  const { startTour, checkTourEligibility, state } = useGiraTour();

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    // Não disparar se já tem tour ativo
    if (state.isTourActive) return;

    if (options.condition === 'first-visit') {
      if (checkTourEligibility(tourId)) {
        timeoutId = setTimeout(() => {
          // Verificar novamente antes de iniciar (pode ter mudado)
          if (!state.isTourActive) {
            startTour(tourId);
          }
        }, options.delay || 0);
      }
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [tourId, options.condition, options.delay, startTour, checkTourEligibility, state.isTourActive]);
};
