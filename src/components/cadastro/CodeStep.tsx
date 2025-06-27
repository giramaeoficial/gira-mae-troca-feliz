
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface CodeStepProps {
  phone: string;
  codeInputs: string[];
  onCodeChange: (index: number, value: string) => void;
  onComplete: () => void;
}

const CodeStep: React.FC<CodeStepProps> = ({ phone, codeInputs, onCodeChange, onComplete }) => {
  const handleCodeInput = (index: number, value: string) => {
    if (value.length <= 1) {
      onCodeChange(index, value);
      
      // Auto-focus next input
      if (value && index < 3) {
        const nextInput = document.getElementById(`code-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  const handleSubmit = () => {
    const code = codeInputs.join('');
    if (code.length === 4) {
      onComplete();
    }
  };

  return (
    <div className="px-6 pb-5 pt-1">
      <p className="text-sm text-gray-600 mb-2">
        Enviamos para <strong>{phone || '+55 31 98335-6459'}</strong>. 
        Se precisar, você pode alterar seu número.
      </p>
      <div className="flex gap-2 justify-center mb-3">
        {codeInputs.map((value, idx) => (
          <Input
            key={idx}
            id={`code-${idx}`}
            maxLength={1}
            value={value}
            onChange={(e) => handleCodeInput(idx, e.target.value)}
            className="w-12 h-12 text-center text-xl"
          />
        ))}
      </div>
      <div className="flex justify-center mb-3 space-x-4">
        <button className="text-primary text-sm hover:underline">
          Reenviar código por SMS
        </button>
        <button className="text-primary text-sm hover:underline">
          Reenviar código por ligação
        </button>
      </div>
      <Button 
        onClick={handleSubmit} 
        className="w-full bg-primary hover:bg-primary/90"
      >
        Confirmar código
      </Button>
    </div>
  );
};

export default CodeStep;
