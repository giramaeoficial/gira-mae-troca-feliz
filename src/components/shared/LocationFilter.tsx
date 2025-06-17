
import React, { useState } from 'react';
import { MapPin, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useEscolas } from '@/hooks/useEscolas';

const ESTADOS_BRASIL = [
  { sigla: 'AC', nome: 'Acre' },
  { sigla: 'AL', nome: 'Alagoas' },
  { sigla: 'AP', nome: 'Amapá' },
  { sigla: 'AM', nome: 'Amazonas' },
  { sigla: 'BA', nome: 'Bahia' },
  { sigla: 'CE', nome: 'Ceará' },
  { sigla: 'DF', nome: 'Distrito Federal' },
  { sigla: 'ES', nome: 'Espírito Santo' },
  { sigla: 'GO', nome: 'Goiás' },
  { sigla: 'MA', nome: 'Maranhão' },
  { sigla: 'MT', nome: 'Mato Grosso' },
  { sigla: 'MS', nome: 'Mato Grosso do Sul' },
  { sigla: 'MG', nome: 'Minas Gerais' },
  { sigla: 'PA', nome: 'Pará' },
  { sigla: 'PB', nome: 'Paraíba' },
  { sigla: 'PR', nome: 'Paraná' },
  { sigla: 'PE', nome: 'Pernambuco' },
  { sigla: 'PI', nome: 'Piauí' },
  { sigla: 'RJ', nome: 'Rio de Janeiro' },
  { sigla: 'RN', nome: 'Rio Grande do Norte' },
  { sigla: 'RS', nome: 'Rio Grande do Sul' },
  { sigla: 'RO', nome: 'Rondônia' },
  { sigla: 'RR', nome: 'Roraima' },
  { sigla: 'SC', nome: 'Santa Catarina' },
  { sigla: 'SP', nome: 'São Paulo' },
  { sigla: 'SE', nome: 'Sergipe' },
  { sigla: 'TO', nome: 'Tocantins' }
];

interface LocationFilterProps {
  value: { estado: string; cidade: string } | null;
  onChange: (location: { estado: string; cidade: string } | null) => void;
}

const LocationFilter: React.FC<LocationFilterProps> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tempEstado, setTempEstado] = useState(value?.estado || '');
  const [tempCidade, setTempCidade] = useState(value?.cidade || '');

  const { municipios, loadingMunicipios, buscarMunicipios } = useEscolas();

  const handleEstadoChange = (estado: string) => {
    setTempEstado(estado);
    setTempCidade('');
    if (estado) {
      buscarMunicipios(estado);
    }
  };

  const handleAplicar = () => {
    if (tempEstado && tempCidade) {
      onChange({ estado: tempEstado, cidade: tempCidade });
      setIsOpen(false);
    }
  };

  const handleLimpar = () => {
    setTempEstado('');
    setTempCidade('');
    onChange(null);
    setIsOpen(false);
  };

  const getDisplayText = () => {
    if (value) {
      return `${value.cidade}, ${value.estado}`;
    }
    return 'Selecionar localização';
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className="h-10 px-3 justify-between text-left font-normal w-full max-w-xs"
        >
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="truncate text-sm">
              {getDisplayText()}
            </span>
          </div>
          <ChevronDown className="w-4 h-4 opacity-50" />
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Selecionar Localização</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Estado</label>
            <Select value={tempEstado} onValueChange={handleEstadoChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o estado" />
              </SelectTrigger>
              <SelectContent>
                {ESTADOS_BRASIL.map((uf) => (
                  <SelectItem key={uf.sigla} value={uf.sigla}>
                    {uf.sigla} - {uf.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Cidade</label>
            <Select 
              value={tempCidade} 
              onValueChange={setTempCidade}
              disabled={!tempEstado || loadingMunicipios}
            >
              <SelectTrigger>
                <SelectValue 
                  placeholder={
                    loadingMunicipios 
                      ? "Carregando..." 
                      : !tempEstado 
                        ? "Selecione o estado primeiro"
                        : "Selecione a cidade"
                  } 
                />
              </SelectTrigger>
              <SelectContent>
                {municipios.map((municipio) => (
                  <SelectItem key={municipio} value={municipio}>
                    {municipio}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleLimpar}
              className="flex-1"
            >
              Limpar
            </Button>
            <Button
              onClick={handleAplicar}
              disabled={!tempEstado || !tempCidade}
              className="flex-1"
            >
              Aplicar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LocationFilter;
