import Shepherd from 'shepherd.js';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { GiraTooltip } from '../components/GiraTooltip';
import type { TourConfig } from '../types';

declare global {
  interface Window {
    Shepherd: any;
  }
}

const isMobile = () => window.innerWidth < 640;

const getMobilePosition = (originalPosition: string | undefined): string => {
  if (!isMobile()) return originalPosition || 'bottom';
  if (originalPosition === 'top') return 'bottom';
  if (originalPosition === 'left' || originalPosition === 'right') return 'bottom';
  return originalPosition || 'bottom';
};

export class TourEngine {
  private tourInstance: any;

  constructor() {
    this.tourInstance = null;
  }

  start(config: TourConfig, onComplete: () => void, onCancel: () => void) {
    if (this.tourInstance) {
      this.tourInstance.cancel();
    }

    this.tourInstance = new Shepherd.Tour({
      useModalOverlay: true,
      defaultStepOptions: {
        classes: 'gira-tour-element',
        scrollTo: { behavior: 'smooth', block: 'center' },
        cancelIcon: { enabled: false },
        modalOverlayOpeningPadding: 8,
        modalOverlayOpeningRadius: 8,
        // CORREÇÃO: Forçar estratégia fixed para evitar problemas de posicionamento e offset
        popperOptions: {
          strategy: 'fixed',
          modifiers: [
            { name: 'offset', options: { offset: [0, 12] } },
            { name: 'preventOverflow', options: { padding: 12 } }
          ]
        }
      }
    });

    config.steps.forEach((step, index) => {
      const isCentered = !step.attachTo;

      const attachTo = step.attachTo ? {
        element: step.attachTo.element,
        on: getMobilePosition(step.attachTo.on),
      } : undefined;

      // Classes customizadas - adiciona gira-tour-centered quando não tem attachTo
      const stepClasses = isCentered
        ? 'gira-tour-element gira-tour-centered'
        : 'gira-tour-element';

      this.tourInstance.addStep({
        id: step.id,
        title: step.title,
        text: step.text,
        attachTo: attachTo,
        classes: stepClasses,
        highlightClass: step.highlightClass || 'gira-highlight',
        beforeShowPromise: step.beforeShow ? () => Promise.resolve(step.beforeShow!()) : undefined,
        buttons: [],
        when: {
          show: () => {
            const currentStepElement = this.tourInstance.getCurrentStep().el;
            const contentElement = currentStepElement.querySelector('.shepherd-content');

            // Adicionar classe extra para centralização se não tem attachTo
            if (isCentered) {
              currentStepElement.classList.add('gira-tour-centered');
            }

            if (contentElement) {
              contentElement.innerHTML = '';
              const container = document.createElement('div');
              contentElement.appendChild(container);

              const root = ReactDOM.createRoot(container);
              root.render(
                React.createElement(GiraTooltip, {
                  title: step.title,
                  text: step.text,
                  emotion: step.giraEmotion,
                  currentStep: index + 1,
                  totalSteps: config.steps.length,
                  onNext: () => this.tourInstance.next(),
                  onBack: () => this.tourInstance.back(),
                  onSkip: () => this.tourInstance.cancel(),
                  isCentered: isCentered,
                })
              );
            }
          }
        }
      });
    });

    this.tourInstance.on('complete', () => {
      onComplete();
    });

    this.tourInstance.on('cancel', () => {
      onCancel();
    });

    this.tourInstance.start();
  }

  stop() {
    if (this.tourInstance) {
      this.tourInstance.cancel();
    }
  }
}

export const tourEngine = new TourEngine();
