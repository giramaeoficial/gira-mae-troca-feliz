
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, MapPin } from 'lucide-react';
import { useAddress, type Address } from '@/hooks/useAddress';

interface AddressInputProps {
  value?: Partial<Address>;
  onChange: (address: Address) => void;
  disabled?: boolean;
  showAllFields?: boolean;
}

const AddressInput: React.FC<AddressInputProps> = ({
  value = {},
  onChange,
  disabled = false,
  showAllFields = true
}) => {
  const { loading, error, fetchAddress, formatCep } = useAddress();
  const [address, setAddress] = useState<Partial<Address>>(value);

  useEffect(() => {
    setAddress(value);
  }, [value]);

  const handleCepChange = async (cep: string) => {
    const formattedCep = formatCep(cep);
    const newAddress = { ...address, cep: formattedCep };
    setAddress(newAddress);

    if (formattedCep.replace(/\D/g, '').length === 8) {
      const fetchedAddress = await fetchAddress(formattedCep);
      if (fetchedAddress) {
        const completeAddress = {
          ...fetchedAddress,
          complemento: address.complemento || '',
          ponto_referencia: address.ponto_referencia || ''
        };
        setAddress(completeAddress);
        onChange(completeAddress);
      }
    }
  };

  const handleFieldChange = (field: keyof Address, value: string) => {
    const newAddress = { ...address, [field]: value };
    setAddress(newAddress);
    if (newAddress.cep && newAddress.endereco && newAddress.cidade && newAddress.estado) {
      onChange(newAddress as Address);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="h-4 w-4 text-primary" />
        <h3 className="font-medium">Endereço</h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="cep">CEP *</Label>
          <div className="relative">
            <Input
              id="cep"
              placeholder="00000-000"
              value={address.cep || ''}
              onChange={(e) => handleCepChange(e.target.value)}
              disabled={disabled}
              maxLength={9}
            />
            {loading && (
              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin" />
            )}
          </div>
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>

        <div>
          <Label htmlFor="estado">Estado *</Label>
          <Input
            id="estado"
            placeholder="SP"
            value={address.estado || ''}
            onChange={(e) => handleFieldChange('estado', e.target.value.toUpperCase())}
            disabled={disabled}
            maxLength={2}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="endereco">Endereço *</Label>
        <Input
          id="endereco"
          placeholder="Rua, Avenida..."
          value={address.endereco || ''}
          onChange={(e) => handleFieldChange('endereco', e.target.value)}
          disabled={disabled}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="bairro">Bairro *</Label>
          <Input
            id="bairro"
            placeholder="Nome do bairro"
            value={address.bairro || ''}
            onChange={(e) => handleFieldChange('bairro', e.target.value)}
            disabled={disabled}
          />
        </div>

        <div>
          <Label htmlFor="cidade">Cidade *</Label>
          <Input
            id="cidade"
            placeholder="Nome da cidade"
            value={address.cidade || ''}
            onChange={(e) => handleFieldChange('cidade', e.target.value)}
            disabled={disabled}
          />
        </div>
      </div>

      {showAllFields && (
        <>
          <div>
            <Label htmlFor="complemento">Complemento</Label>
            <Input
              id="complemento"
              placeholder="Apartamento, sala, etc."
              value={address.complemento || ''}
              onChange={(e) => handleFieldChange('complemento', e.target.value)}
              disabled={disabled}
            />
          </div>

          <div>
            <Label htmlFor="ponto_referencia">Ponto de Referência</Label>
            <Textarea
              id="ponto_referencia"
              placeholder="Próximo ao shopping, em frente à padaria..."
              value={address.ponto_referencia || ''}
              onChange={(e) => handleFieldChange('ponto_referencia', e.target.value)}
              disabled={disabled}
              rows={2}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default AddressInput;
