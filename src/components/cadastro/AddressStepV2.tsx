
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';

interface AddressStepV2Props {
  onComplete: () => void;
}

const AddressStepV2: React.FC<AddressStepV2Props> = ({ onComplete }) => {
  const [formData, setFormData] = useState({
    aceita_entrega_domicilio: false,
    raio_entrega_km: 5,
    ponto_retirada_preferido: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    
    // Simular salvamento dos dados (implementar lógica real aqui)
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Endereço salvo!",
        description: "Configurações de entrega registradas com sucesso.",
      });
      onComplete();
    }, 2000);
  };

  return (
    <div className="px-6 pb-5 pt-1">
      <div className="max-h-96 overflow-y-auto">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Endereço e Entrega
        </h3>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Aceita entrega em domicílio?</h4>
              <p className="text-sm text-gray-600">
                Permite que compradores retirem itens na sua casa
              </p>
            </div>
            <Switch
              checked={formData.aceita_entrega_domicilio}
              onCheckedChange={(checked) => handleInputChange('aceita_entrega_domicilio', checked)}
            />
          </div>

          {formData.aceita_entrega_domicilio && (
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Raio de entrega: {formData.raio_entrega_km}km
              </label>
              <Slider
                value={[formData.raio_entrega_km]}
                onValueChange={(value) => handleInputChange('raio_entrega_km', value[0])}
                max={20}
                min={1}
                step={1}
                className="w-full"
              />
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Ponto de retirada preferido
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Ex: Shopping, praça, escola, etc.
            </p>
            <Input
              placeholder="Digite o local preferido para encontros"
              value={formData.ponto_retirada_preferido}
              onChange={(e) => handleInputChange('ponto_retirada_preferido', e.target.value)}
              disabled={isLoading}
            />
          </div>
        </div>
      </div>
      
      <Button 
        onClick={handleSubmit} 
        disabled={isLoading}
        className="w-full bg-primary hover:bg-primary/90 mt-4"
      >
        {isLoading ? 'Salvando...' : 'Finalizar Cadastro'}
      </Button>
    </div>
  );
};

export default AddressStepV2;
