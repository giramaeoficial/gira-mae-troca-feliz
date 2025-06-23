
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin } from 'lucide-react';
import { ESTADOS_BRASIL, CIDADES_PRINCIPAIS } from '@/constants/estados';

interface LocationFilterProps {
  value: { estado: string; cidade: string } | null;
  onChange: (location: { estado: string; cidade: string } | null) => void;
}

const LocationFilter: React.FC<LocationFilterProps> = ({ value, onChange }) => {
  const handleEstadoChange = (estado: string) => {
    onChange({ estado, cidade: value?.cidade || '' });
  };

  const handleCidadeChange = (cidade: string) => {
    onChange({ estado: value?.estado || '', cidade });
  };

  return (
    <div className="flex items-center gap-2">
      <MapPin className="w-4 h-4 text-muted-foreground" />
      <Select value={value?.estado || ''} onValueChange={handleEstadoChange}>
        <SelectTrigger className="w-20">
          <SelectValue placeholder="UF" />
        </SelectTrigger>
        <SelectContent>
          {ESTADOS_BRASIL.map(estado => (
            <SelectItem key={estado.sigla} value={estado.sigla}>
              {estado.sigla}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={value?.cidade || ''} onValueChange={handleCidadeChange}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Cidade" />
        </SelectTrigger>
        <SelectContent>
          {CIDADES_PRINCIPAIS.map(cidade => (
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
