
import React from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface ActionFeedbackProps {
  state: 'loading' | 'success' | 'error' | 'idle';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const ActionFeedback: React.FC<ActionFeedbackProps> = ({
  state,
  className,
  size = 'md'
}) => {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  if (state === 'idle') return null;

  return (
    <div className={cn('flex items-center justify-center', className)}>
      {state === 'loading' && (
        <Loader2 className={cn('animate-spin text-primary', sizeMap[size])} />
      )}
      {state === 'success' && (
        <CheckCircle className={cn('text-green-500', sizeMap[size])} />
      )}
      {state === 'error' && (
        <XCircle className={cn('text-red-500', sizeMap[size])} />
      )}
    </div>
  );
};

export default ActionFeedback;
