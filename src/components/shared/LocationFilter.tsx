
import React, { useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin } from 'lucide-react';
import { useLocationFilters } from '@/hooks/useLocationFilters';

interface LocationFilterProps {
  value: { estado: string; cidade: string } | null;
  onChange: (location: { estado: string; cidade: string } | null) => void;
}

const LocationFilter: React.FC<LocationFilterProps> = ({ value, onChange }) => {
  const { 
    locations, 
    isLoading, 
    selectedEstado, 
    updateSelectedEstado, 
    isLoadingCidades 
  } = useLocationFilters();

  const handleEstadoChange = (estado: string) => {
    updateSelectedEstado(estado);
    onChange({ estado, cidade: '' }); // Reset cidade quando estado muda
  };

  const handleCidadeChange = (cidade: string) => {
    onChange({ estado: value?.estado || selectedEstado, cidade });
  };

  // Sincronizar estado interno com valor externo
  useEffect(() => {
    if (value?.estado && value.estado !== selectedEstado) {
      updateSelectedEstado(value.estado);
    }
  }, [value?.estado, selectedEstado, updateSelectedEstado]);

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

      <Select 
        value={value?.cidade || ''} 
        onValueChange={handleCidadeChange}
        disabled={!value?.estado && !selectedEstado}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder={
            !value?.estado && !selectedEstado ? "Selecione UF primeiro" :
            isLoadingCidades ? "Carregando..." :
            "Cidade"
          } />
        </SelectTrigger>
        <SelectContent>
          {isLoadingCidades ? (
            <SelectItem value="loading" disabled>Carregando...</SelectItem>
          ) : locations.cidades.length > 0 ? (
            locations.cidades.map(cidade => (
              <SelectItem key={cidade} value={cidade}>
                {cidade}
              </SelectItem>
            ))
          ) : (
            <SelectItem value="empty" disabled>
              {!value?.estado && !selectedEstado ? "Selecione um estado primeiro" : "Nenhuma cidade encontrada"}
            </SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};

export default LocationFilter;
