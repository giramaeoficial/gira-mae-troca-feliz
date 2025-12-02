import React, { useRef, useState, useEffect, useCallback } from 'react';
import { GiraAvatar } from './GiraAvatar';
import { TourButtons } from './TourButtons';
import type { GiraEmotion } from '../types';
import { GripHorizontal } from 'lucide-react';

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
  const containerRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, offsetX: 0, offsetY: 0 });

  // Reset offset when step changes
  useEffect(() => {
    setOffset({ x: 0, y: 0 });
  }, [currentStep]);

  const handleDragStart = useCallback((clientX: number, clientY: number) => {
    setIsDragging(true);
    dragStartRef.current = {
      x: clientX,
      y: clientY,
      offsetX: offset.x,
      offsetY: offset.y,
    };
  }, [offset]);

  const handleDragMove = useCallback((clientX: number, clientY: number) => {
    if (!isDragging) return;
    
    const deltaX = clientX - dragStartRef.current.x;
    const deltaY = clientY - dragStartRef.current.y;
    
    setOffset({
      x: dragStartRef.current.offsetX + deltaX,
      y: dragStartRef.current.offsetY + deltaY,
    });
  }, [isDragging]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleDragStart(e.clientX, e.clientY);
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    handleDragStart(touch.clientX, touch.clientY);
  };

  // Global listeners for drag
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      handleDragMove(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      handleDragMove(touch.clientX, touch.clientY);
    };

    const handleEnd = () => {
      handleDragEnd();
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, handleDragMove, handleDragEnd]);

  return (
    <div 
      ref={containerRef}
      className="bg-white p-4 sm:p-6 rounded-2xl max-w-sm relative overflow-hidden select-none"
      style={{ 
        transform: `translate(${offset.x}px, ${offset.y}px)`,
        transition: isDragging ? 'none' : 'transform 0.2s ease-out',
      }}
    >
      {/* Drag handle */}
      <div 
        className="absolute top-0 left-0 w-full h-8 bg-pink-500 flex items-center justify-center cursor-grab active:cursor-grabbing touch-none"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <GripHorizontal className="w-5 h-5 text-white/70" />
      </div>
      
      <div className="flex gap-3 sm:gap-4 items-start pt-6">
        <div className="flex-shrink-0">
          <GiraAvatar emotion={emotion} size="sm" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-1 leading-tight">{title}</h3>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{text}</p>
        </div>
      </div>

      <div className="mt-3 sm:mt-4 flex items-center justify-between text-xs text-gray-400 font-medium">
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