
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Filter, X, School, Home, Users } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';

interface AdvancedFiltersProps {
  filters: {
    busca: string;
    categoria: string;
    ordem: string;
    escola: any;
    estadoConservacao?: string;
    tamanho?: string;
    valorMin?: string;
    valorMax?: string;
    estado?: string;
    cidade?: string;
    bairro?: string;
    mesmaEscola?: boolean;
    mesmoBairro?: boolean;
    paraFilhos?: boolean;
    proximidade?: {
      enabled: boolean;
      maxDistance: number;
    };
  };
  onFilterChange: (filters: any) => void;
  onSearch?: () => void;
  location?: { estado: string; cidade: string } | null;
}

const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({ 
  filters,
  onFilterChange,
  onSearch,
  location
}) => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState({
    ...filters,
    estadoConservacao: filters.estadoConservacao || '',
    tamanho: filters.tamanho || '',
    valorMin: filters.valorMin || '',
    valorMax: filters.valorMax || '',
    mesmaEscola: filters.mesmaEscola || false,
    mesmoBairro: filters.mesmoBairro || false,
    paraFilhos: filters.paraFilhos || false,
    proximidade: filters.proximidade || { enabled: false, maxDistance: 10 }
  });

  const categorias = [
    'roupas', 'calcados', 'brinquedos', 'livros', 
    'material_escolar', 'acessorios', 'mobiliario', 'eletronicos'
  ];

  const estadosConservacao = [
    'novo', 'semi_novo', 'usado_bom', 'usado_regular'
  ];

  const updateLocalFilter = (key: string, value: any) => {
    if (key.includes('.')) {
      const [parent, child] = key.split('.');
      setLocalFilters(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value
        }
      }));
    } else {
      setLocalFilters(prev => ({ ...prev, [key]: value }));
    }
  };

  const applyFilters = () => {
    onFilterChange(localFilters);
    if (onSearch) onSearch();
    setIsOpen(false);
  };

  const clearFilters = () => {
    const clearedFilters = {
      busca: '',
      categoria: 'todas',
      ordem: 'recentes',
      escola: null,
      valorMin: '',
      valorMax: '',
      tamanho: '',
      estadoConservacao: '',
      mesmaEscola: false,
      mesmoBairro: false,
      paraFilhos: false,
      proximidade: { enabled: false, maxDistance: 10 }
    };
    setLocalFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const getActiveFiltersCount = () => {
    return Object.values(localFilters).filter(value => {
      if (typeof value === 'boolean') return value;
      if (typeof value === 'object' && value?.enabled) return true;
      return value && value !== '' && value !== false && value !== 'todas' && value !== 'recentes';
    }).length;
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <Filter className="w-4 h-4 mr-2" />
          Filtros
          {getActiveFiltersCount() > 0 && (
            <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center">
              {getActiveFiltersCount()}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Filtros Avançados</SheetTitle>
        </SheetHeader>
        
        <div className="space-y-6 py-6">
          {/* Filtros de Proximidade */}
          {user && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Proximidade
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Apenas itens próximos</Label>
                  <Switch 
                    checked={localFilters.proximidade.enabled}
                    onCheckedChange={(checked) => 
                      updateLocalFilter('proximidade.enabled', checked)
                    }
                  />
                </div>
                
                {localFilters.proximidade.enabled && (
                  <div>
                    <Label>Distância máxima: {localFilters.proximidade.maxDistance}km</Label>
                    <Slider
                      value={[localFilters.proximidade.maxDistance]}
                      onValueChange={([value]) => 
                        updateLocalFilter('proximidade.maxDistance', value)
                      }
                      max={50}
                      min={1}
                      step={1}
                      className="mt-2"
                    />
                  </div>
                )}
                
                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <Checkbox 
                      checked={localFilters.mesmaEscola}
                      onCheckedChange={(checked) => 
                        updateLocalFilter('mesmaEscola', checked)
                      }
                    />
                    <School className="w-4 h-4" />
                    Mesma escola dos meus filhos
                  </Label>
                  
                  <Label className="flex items-center gap-2">
                    <Checkbox 
                      checked={localFilters.mesmoBairro}
                      onCheckedChange={(checked) => 
                        updateLocalFilter('mesmoBairro', checked)
                      }
                    />
                    <Home className="w-4 h-4" />
                    Mesmo bairro que eu
                  </Label>
                  
                  <Label className="flex items-center gap-2">
                    <Checkbox 
                      checked={localFilters.paraFilhos}
                      onCheckedChange={(checked) => 
                        updateLocalFilter('paraFilhos', checked)
                      }
                    />
                    <Users className="w-4 h-4" />
                    Itens que servem para meus filhos
                  </Label>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Produto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="categoria">Categoria</Label>
                <Select
                  value={localFilters.categoria === 'todas' ? '' : localFilters.categoria}
                  onValueChange={(value) => updateLocalFilter('categoria', value || 'todas')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as categorias" />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.map(cat => (
                      <SelectItem key={cat} value={cat}>
                        {cat.replace('_', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="estado">Estado de Conservação</Label>
                <Select
                  value={localFilters.estadoConservacao || ''}
                  onValueChange={(value) => updateLocalFilter('estadoConservacao', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Qualquer estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {estadosConservacao.map(estado => (
                      <SelectItem key={estado} value={estado}>
                        {estado.replace('_', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="tamanho">Tamanho</Label>
                <Input
                  id="tamanho"
                  placeholder="Ex: 2-3 anos, 36, M"
                  value={localFilters.tamanho || ''}
                  onChange={(e) => updateLocalFilter('tamanho', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Preço (Girinhas)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="valor-min">Mínimo</Label>
                  <Input
                    id="valor-min"
                    type="number"
                    placeholder="0"
                    value={localFilters.valorMin || ''}
                    onChange={(e) => updateLocalFilter('valorMin', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="valor-max">Máximo</Label>
                  <Input
                    id="valor-max"
                    type="number"
                    placeholder="100"
                    value={localFilters.valorMax || ''}
                    onChange={(e) => updateLocalFilter('valorMax', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-2 pt-4">
          <Button onClick={applyFilters} className="flex-1">
            Aplicar Filtros
          </Button>
          <Button variant="outline" onClick={clearFilters}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AdvancedFilters;
