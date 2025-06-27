
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface CodeStepV2Props {
  onComplete: () => void;
}

const CodeStepV2: React.FC<CodeStepV2Props> = ({ onComplete }) => {
  const [codeInputs, setCodeInputs] = useState(['', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleCodeInput = (index: number, value: string) => {
    if (value.length > 1) return; // Apenas um dígito
    
    const newInputs = [...codeInputs];
    newInputs[index] = value;
    setCodeInputs(newInputs);

    // Focar no próximo input
    if (value && index < 3) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleSubmit = async () => {
    const code = codeInputs.join('');
    
    if (code.length !== 4) {
      toast({
        title: "Código incompleto",
        description: "Por favor, insira o código de 4 dígitos.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    // Simular validação do código (implementar lógica real aqui)
    setTimeout(() => {
      if (code === '1234') { // Código mock para teste
        setIsLoading(false);
        toast({
          title: "Código validado!",
          description: "Telefone confirmado com sucesso.",
        });
        onComplete();
      } else {
        setIsLoading(false);
        toast({
          title: "Código inválido",
          description: "Verifique o código e tente novamente.",
          variant: "destructive",
        });
      }
    }, 2000);
  };

  return (
    <div className="px-6 pb-5 pt-1">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Insira o código
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Digite o código de 4 dígitos que enviamos por SMS.
        </p>
        
        <div className="flex gap-3 justify-center mb-4">
          {codeInputs.map((value, index) => (
            <Input
              key={index}
              id={`code-${index}`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={value}
              onChange={(e) => handleCodeInput(index, e.target.value)}
              className="w-12 h-12 text-center text-lg font-semibold"
              disabled={isLoading}
            />
          ))}
        </div>
        
        <Button 
          onClick={handleSubmit} 
          disabled={isLoading}
          className="w-full bg-primary hover:bg-primary/90"
        >
          {isLoading ? 'Validando...' : 'Validar Código'}
        </Button>
        
        <div className="text-center mt-3">
          <button className="text-sm text-primary hover:underline">
            Não recebeu o código? Reenviar
          </button>
        </div>
      </div>
    </div>
  );
};

export default CodeStepV2;
