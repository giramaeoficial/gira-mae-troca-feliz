
import React from 'react';
import { Button } from '@/components/ui/button';
import EnderecoSection from '@/components/perfil/sections/EnderecoSection';

interface AddressStepProps {
  formData: {
    aceita_entrega_domicilio: boolean;
    raio_entrega_km: number;
    ponto_retirada_preferido: string;
  };
  onInputChange: (field: string, value: any) => void;
  onComplete: () => void;
}

const AddressStep: React.FC<AddressStepProps> = ({
  formData,
  onInputChange,
  onComplete
}) => {
  const handleSubmit = () => {
    onComplete();
  };

  return (
    <div className="px-6 pb-5 pt-1">
      <div className="max-h-96 overflow-y-auto">
        <EnderecoSection
          formData={formData}
          onInputChange={onInputChange}
        />
      </div>
      <Button 
        onClick={handleSubmit} 
        className="w-full bg-primary hover:bg-primary/90 mt-4"
      >
        Salvar Endereço
      </Button>
    </div>
  );
};

export default AddressStep;
