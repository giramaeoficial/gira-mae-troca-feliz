
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin } from 'lucide-react';
import { useLocationFilters } from '@/hooks/useLocationFilters';

interface LocationFilterProps {
  value: { estado: string; cidade: string } | null;
  onChange: (location: { estado: string; cidade: string } | null) => void;
}

const LocationFilter: React.FC<LocationFilterProps> = ({ value, onChange }) => {
  const { locations, isLoading } = useLocationFilters();

  const handleEstadoChange = (estado: string) => {
    onChange({ estado, cidade: value?.cidade || '' });
  };

  const handleCidadeChange = (cidade: string) => {
    onChange({ estado: value?.estado || '', cidade });
  };

  // Filtrar cidades baseado no estado selecionado
  const availableCidades = React.useMemo(() => {
    if (!value?.estado) return locations.cidades;
    // Em uma implementação real, você filtraria as cidades pelo estado
    return locations.cidades;
  }, [value?.estado, locations.cidades]);

  return (
    <div className="flex items-center gap-2">
      <MapPin className="w-4 h-4 text-muted-foreground" />
      <Select value={value?.estado || ''} onValueChange={handleEstadoChange}>
        <SelectTrigger className="w-20">
          <SelectValue placeholder="UF" />
        </SelectTrigger>
        <SelectContent>
          {isLoading ? (
            <SelectItem value="loading" disabled>Carregando...</SelectItem>
          ) : locations.estados.length > 0 ? (
            locations.estados.map(estado => (
              <SelectItem key={estado} value={estado}>
                {estado}
              </SelectItem>
            ))
          ) : (
            <SelectItem value="empty" disabled>Nenhum estado encontrado</SelectItem>
          )}
        </SelectContent>
      </Select>

      <Select value={value?.cidade || ''} onValueChange={handleCidadeChange}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Cidade" />
        </SelectTrigger>
        <SelectContent>
          {isLoading ? (
            <SelectItem value="loading" disabled>Carregando...</SelectItem>
          ) : availableCidades.length > 0 ? (
            availableCidades.map(cidade => (
              <SelectItem key={cidade} value={cidade}>
                {cidade}
              </SelectItem>
            ))
          ) : (
            <SelectItem value="empty" disabled>Nenhuma cidade encontrada</SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};

export default LocationFilter;
