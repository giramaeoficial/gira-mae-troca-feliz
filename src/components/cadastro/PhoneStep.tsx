
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface PhoneStepProps {
  phone: string;
  onPhoneChange: (phone: string) => void;
  onComplete: () => void;
}

const PhoneStep: React.FC<PhoneStepProps> = ({ phone, onPhoneChange, onComplete }) => {
  const handleSubmit = () => {
    if (phone.trim()) {
      onComplete();
    }
  };

  return (
    <div className="px-6 pb-5 pt-1">
      <p className="text-sm text-gray-600 mb-2">
        Vamos te enviar um código por SMS para validar seu número.
      </p>
      <Input
        type="tel"
        placeholder="+55 31999999999"
        value={phone}
        onChange={(e) => onPhoneChange(e.target.value)}
        className="mb-3"
      />
      <Button 
        onClick={handleSubmit} 
        className="w-full bg-primary hover:bg-primary/90"
      >
        Continuar
      </Button>
    </div>
  );
};

export default PhoneStep;
