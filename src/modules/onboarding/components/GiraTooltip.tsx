import React from 'react';
import { GiraAvatar } from './GiraAvatar';
import { TourButtons } from './TourButtons';
import type { GiraEmotion } from '../types';

interface GiraTooltipProps {
  title: string;
  text: string;
  emotion: GiraEmotion;
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

// This component is rendered INSIDE the Shepherd step element via ReactDOM
export const GiraTooltip: React.FC<GiraTooltipProps> = ({
  title,
  text,
  emotion,
  currentStep,
  totalSteps,
  onNext,
  onBack,
  onSkip
}) => {
  const isFirst = currentStep === 1;
  const isLast = currentStep === totalSteps;

  return (
    <div className="bg-white p-6 rounded-2xl max-w-sm relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-2 bg-pink-500" />
      
      <div className="flex gap-4 items-start">
        <div className="flex-shrink-0 -mt-2">
          <GiraAvatar emotion={emotion} size="md" />
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-800 mb-1">{title}</h3>
          <p className="text-sm text-gray-600 leading-relaxed">{text}</p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-gray-400 font-medium">
        <span>Passo {currentStep} de {totalSteps}</span>
        <div className="flex gap-1">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div 
              key={i} 
              className={`h-1.5 w-1.5 rounded-full ${i + 1 <= currentStep ? 'bg-pink-500' : 'bg-gray-200'}`}
            />
          ))}
        </div>
      </div>

      <TourButtons 
        onNext={onNext} 
        onBack={onBack} 
        onSkip={onSkip}
        isFirst={isFirst}
        isLast={isLast}
      />
    </div>
  );
};