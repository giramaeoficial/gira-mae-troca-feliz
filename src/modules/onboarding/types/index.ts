export type GiraEmotion = 
  | 'idle' 
  | 'waving' 
  | 'talking' 
  | 'pointing' 
  | 'thinking' 
  | 'celebrating' 
  | 'thumbsup';

export interface TourStepConfig {
  id: string;
  title: string;
  text: string;
  giraEmotion: GiraEmotion;
  attachTo: {
    element: string;
    on: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  } | null;
  highlightClass?: string;
  beforeShow?: () => Promise<void> | void;
}

export type TriggerCondition = 'first-visit' | 'manual' | 'event';

export interface TourConfig {
  id: string;
  name: string;
  description: string;
  triggerCondition: TriggerCondition;
  triggerDelay?: number;
  validRoutes: string[];
  reward?: number;
  allowReplay?: boolean;
  steps: TourStepConfig[];
  onComplete?: (userId?: string) => Promise<void>;
  onCancel?: (userId?: string, stepId?: string) => Promise<void>;
}

export interface OnboardingState {
  completedTours: string[];
  currentTourId: string | null;
  isTourActive: boolean;
}

export interface GiraTourContextType {
  startTour: (tourId: string) => void;
  stopTour: () => void;
  state: OnboardingState;
  checkTourEligibility: (tourId: string) => boolean;
}