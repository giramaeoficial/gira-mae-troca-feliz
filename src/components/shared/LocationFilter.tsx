
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin } from 'lucide-react';

interface LocationFilterProps {
  value: { estado: string; cidade: string } | null;
  onChange: (location: { estado: string; cidade: string } | null) => void;
}

const LocationFilter: React.FC<LocationFilterProps> = ({ value, onChange }) => {
  const estados = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  const cidades = [
    'São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Brasília',
    'Salvador', 'Fortaleza', 'Manaus', 'Curitiba', 'Recife',
    'Goiânia', 'Belém', 'Porto Alegre'
  ];

  return (
    <div className="flex items-center gap-2">
      <MapPin className="w-4 h-4 text-muted-foreground" />
      <Select
        value={value?.estado || ''}
        onValueChange={(estado) => {
          if (estado && value?.cidade) {
            onChange({ estado, cidade: value.cidade });
          }
        }}
      >
        <SelectTrigger className="w-20">
          <SelectValue placeholder="UF" />
        </SelectTrigger>
        <SelectContent>
          {estados.map(estado => (
            <SelectItem key={estado} value={estado}>
              {estado}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={value?.cidade || ''}
        onValueChange={(cidade) => {
          if (cidade && value?.estado) {
            onChange({ estado: value.estado, cidade });
          }
        }}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Cidade" />
        </SelectTrigger>
        <SelectContent>
          {cidades.map(cidade => (
            <SelectItem key={cidade} value={cidade}>
              {cidade}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default LocationFilter;
