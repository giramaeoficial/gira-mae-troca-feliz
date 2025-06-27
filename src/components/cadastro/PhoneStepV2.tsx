
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface PhoneStepV2Props {
  onComplete: () => void;
}

const PhoneStepV2: React.FC<PhoneStepV2Props> = ({ onComplete }) => {
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!phone.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, insira seu número de telefone.",
        variant: "destructive",
      });
      return;
    }

    // Validação básica de telefone
    const phoneRegex = /^\+?\d{10,15}$/;
    if (!phoneRegex.test(phone.replace(/\s+/g, ''))) {
      toast({
        title: "Telefone inválido",
        description: "Por favor, insira um número de telefone válido.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    // Simular envio de SMS (implementar lógica real aqui)
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "SMS enviado!",
        description: "Verifique sua caixa de mensagens.",
      });
      onComplete();
    }, 2000);
  };

  return (
    <div className="px-6 pb-5 pt-1">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Adicione seu celular
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Vamos te enviar um código por SMS para validar seu número.
        </p>
        
        <Input
          type="tel"
          placeholder="+55 31999999999"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="mb-4"
          disabled={isLoading}
        />
        
        <Button 
          onClick={handleSubmit} 
          disabled={isLoading}
          className="w-full bg-primary hover:bg-primary/90"
        >
          {isLoading ? 'Enviando SMS...' : 'Continuar'}
        </Button>
      </div>
    </div>
  );
};

export default PhoneStepV2;
