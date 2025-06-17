
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FormProgressProps {
  steps: {
    label: string;
    completed: boolean;
    required: boolean;
  }[];
  className?: string;
}

const FormProgress: React.FC<FormProgressProps> = ({ steps, className }) => {
  const completedSteps = steps.filter(step => step.completed).length;
  const totalSteps = steps.length;
  const progressPercentage = (completedSteps / totalSteps) * 100;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Barra de progresso */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-gray-700">Progresso do formulário</span>
          <span className="text-gray-500">{completedSteps}/{totalSteps}</span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>

      {/* Lista de etapas */}
      <div className="grid grid-cols-2 gap-2">
        {steps.map((step, index) => (
          <div 
            key={index}
            className={cn(
              'flex items-center gap-2 text-sm p-2 rounded',
              step.completed 
                ? 'text-green-700 bg-green-50' 
                : step.required 
                  ? 'text-gray-600 bg-gray-50'
                  : 'text-gray-400 bg-gray-50'
            )}
          >
            {step.completed ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <Circle className="w-4 h-4 text-gray-400" />
            )}
            <span className="truncate">{step.label}</span>
          </div>
        ))}
      </div>

      {/* Dica próximos passos */}
      {progressPercentage < 100 && (
        <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded">
          💡 Preencha mais campos para melhorar suas chances de troca
        </div>
      )}
    </div>
  );
};

export default FormProgress;
