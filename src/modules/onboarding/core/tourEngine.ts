import Shepherd from 'shepherd.js';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { GiraTooltip } from '../components/GiraTooltip';
import type { TourConfig } from '../types';

// Extend Window to support Shepherd
declare global {
  interface Window {
    Shepherd: any;
  }
}

// Detecta se é mobile
const isMobile = () => window.innerWidth < 640;

// Ajusta posição para mobile - sempre abaixo do elemento
const getMobilePosition = (originalPosition: string | undefined): string => {
  if (!isMobile()) return originalPosition || 'bottom';
  
  // No mobile, preferir bottom para não cobrir elementos no topo
  if (originalPosition === 'top') return 'bottom';
  if (originalPosition === 'left' || originalPosition === 'right') return 'bottom';
  
  return originalPosition || 'bottom';
};

export class TourEngine {
  private tourInstance: any; // Shepherd.Tour type
  
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
      }
    });

    config.steps.forEach((step, index) => {
      // Ajusta attachTo para mobile
      const attachTo = step.attachTo ? {
        element: step.attachTo.element,
        on: getMobilePosition(step.attachTo.on),
      } : undefined;

      this.tourInstance.addStep({
        id: step.id,
        title: step.title,
        text: step.text,
        attachTo: attachTo,
        highlightClass: step.highlightClass || 'gira-highlight',
        beforeShowPromise: step.beforeShow ? () => Promise.resolve(step.beforeShow!()) : undefined,
        buttons: [], // We use custom buttons in React component
        when: {
          show: () => {
            // Mount React component into the step element
            const currentStepElement = this.tourInstance.getCurrentStep().el;
            const contentElement = currentStepElement.querySelector('.shepherd-content');
            
            if (contentElement) {
              // Clear default content
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