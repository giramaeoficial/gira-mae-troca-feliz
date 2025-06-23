
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter, X } from 'lucide-react';
import LocationFilter from './LocationFilter';

interface AdvancedFiltersProps {
  onFiltersChange: (filters: any) => void;
  currentFilters: any;
}

const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({ 
  onFiltersChange, 
  currentFilters 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState(currentFilters);

  const categorias = [
    'roupas', 'calcados', 'brinquedos', 'livros', 
    'material_escolar', 'acessorios', 'mobiliario', 'eletronicos'
  ];

  const estadosConservacao = [
    'novo', 'semi_novo', 'usado_bom', 'usado_regular'
  ];

  const updateLocalFilter = (key: string, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
  };

  const applyFilters = () => {
    onFiltersChange(localFilters);
    setIsOpen(false);
  };

  const clearFilters = () => {
    const clearedFilters = {
      categoria: '',
      estadoConservacao: '',
      valorMin: '',
      valorMax: '',
      tamanho: '',
      // Manter filtros de localização
      apenasProximos: localFilters.apenasProximos,
      raioKm: localFilters.raioKm,
      mesmaEscola: localFilters.mesmaEscola,
      mesmoBairro: localFilters.mesmoBairro,
      paraMeusFilhos: localFilters.paraMeusFilhos
    };
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const getActiveFiltersCount = () => {
    return Object.values(currentFilters).filter(value => 
      value && value !== '' && value !== false
    ).length;
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
          {/* Filtros de Localização */}
          <LocationFilter />

          {/* Filtros de Produto */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Produto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="categoria">Categoria</Label>
                <Select
                  value={localFilters.categoria}
                  onValueChange={(value) => updateLocalFilter('categoria', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as categorias" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas as categorias</SelectItem>
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
                  value={localFilters.estadoConservacao}
                  onValueChange={(value) => updateLocalFilter('estadoConservacao', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Qualquer estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Qualquer estado</SelectItem>
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
                  value={localFilters.tamanho}
                  onChange={(e) => updateLocalFilter('tamanho', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Filtros de Preço */}
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
                    value={localFilters.valorMin}
                    onChange={(e) => updateLocalFilter('valorMin', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="valor-max">Máximo</Label>
                  <Input
                    id="valor-max"
                    type="number"
                    placeholder="100"
                    value={localFilters.valorMax}
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
