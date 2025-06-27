
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useStepData } from '@/hooks/useStepData';

interface AddressStepV2Props {
  onComplete: () => void;
}

interface AddressFormData {
  aceita_entrega_domicilio: boolean;
  raio_entrega_km: number;
  ponto_retirada_preferido: string;
}

const AddressStepV2: React.FC<AddressStepV2Props> = ({ onComplete }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { saveStepData, getStepData } = useStepData();
  
  const [formData, setFormData] = useState<AddressFormData>({
    aceita_entrega_domicilio: false,
    raio_entrega_km: 5,
    ponto_retirada_preferido: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  // Carregar dados salvos do step
  useEffect(() => {
    const loadData = async () => {
      const savedData = await getStepData('address');
      if (savedData && typeof savedData === 'object' && Object.keys(savedData).length > 0) {
        console.log('📋 Carregando dados salvos do step address:', savedData);
        setFormData(prev => ({ 
          ...prev, 
          ...(savedData as Partial<AddressFormData>)
        }));
      }
    };
    loadData();
  }, [getStepData]);

  const handleInputChange = (field: string, value: any) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    
    // Salvar dados automaticamente
    saveStepData('address', newData);
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Usuário não encontrado.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('💾 Salvando dados de endereço:', formData);

      // Salvar dados no perfil permanente
      const { error } = await supabase
        .from('profiles')
        .update({
          aceita_entrega_domicilio: formData.aceita_entrega_domicilio,
          raio_entrega_km: formData.raio_entrega_km,
          ponto_retirada_preferido: formData.ponto_retirada_preferido,
          cadastro_status: 'completo',
          cadastro_step: 'complete'
        })
        .eq('id', user.id);

      if (error) {
        console.error('❌ Erro ao salvar endereço:', error);
        throw error;
      }

      console.log('✅ Dados de endereço salvos com sucesso');
      
      toast({
        title: "Endereço salvo!",
        description: "Configurações de entrega registradas com sucesso.",
      });
      
      onComplete();
    } catch (error: any) {
      console.error('❌ Erro no salvamento:', error);
      toast({
        title: "Erro ao salvar",
        description: error.message || "Não foi possível salvar os dados. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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
