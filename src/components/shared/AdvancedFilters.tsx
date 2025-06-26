
import React, { useState } from 'react';
import { Search, Filter, MapPin, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { LocationDetectionButton } from '@/components/location/LocationDetectionButton';
import { useFeedFilters } from '@/contexts/FeedFiltersContext';
import { useConfigCategorias } from '@/hooks/useConfigCategorias';

interface AdvancedFiltersProps {
  onSearch?: () => void;
}

const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({ onSearch }) => {
  const { filters, updateFilter, updateFilters, getActiveFiltersCount, setLocationDetected } = useFeedFilters();
  const { categorias, subcategoriasPorCategoria } = useConfigCategorias();
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSearch = () => {
    if (onSearch) {
      onSearch();
    }
  };

  const handleLocationDetected = (location: { cidade: string; estado: string; bairro?: string }) => {
    setLocationDetected(location);
  };

  const handleResetFilters = () => {
    updateFilters({
      busca: '',
      categoria: 'todas',
      subcategoria: '',
      ordem: 'recentes',
      mesmaEscola: false,
      mesmoBairro: false,
      paraFilhos: false,
      apenasFavoritos: false,
      apenasSeguidoras: false,
      precoMin: 0,
      precoMax: 200,
    });
  };

  const subcategorias = filters.categoria !== 'todas' 
    ? subcategoriasPorCategoria[filters.categoria] || []
    : [];

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 mb-6 space-y-4">
      {/* Busca Principal */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar itens..."
            value={filters.busca}
            onChange={(e) => updateFilter('busca', e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={handleSearch} className="bg-gradient-to-r from-primary to-pink-500">
          Buscar
        </Button>
      </div>

      {/* Filtros Básicos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Categoria */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">Categoria</Label>
          <Select value={filters.categoria} onValueChange={(value) => updateFilter('categoria', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Todas as categorias" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as categorias</SelectItem>
              {categorias.map((categoria) => (
                <SelectItem key={categoria.id} value={categoria.nome}>
                  {categoria.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Subcategoria */}
        {subcategorias.length > 0 && (
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">Subcategoria</Label>
            <Select value={filters.subcategoria || "todas_sub"} onValueChange={(value) => updateFilter('subcategoria', value === "todas_sub" ? '' : value)}>
              <SelectTrigger>
                <SelectValue placeholder="Todas as subcategorias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas_sub">Todas as subcategorias</SelectItem>
                {subcategorias.map((sub) => (
                  <SelectItem key={sub} value={sub}>
                    {sub}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Ordenação */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">Ordenar por</Label>
          <Select value={filters.ordem} onValueChange={(value) => updateFilter('ordem', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recentes">Mais recentes</SelectItem>
              <SelectItem value="menor-preco">Menor preço</SelectItem>
              <SelectItem value="maior-preco">Maior preço</SelectItem>
              <SelectItem value="distancia">Mais próximos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Localização */}
      <div>
        <Label className="text-sm font-medium text-gray-700 mb-2 block">Localização</Label>
        {filters.location ? (
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="text-sm">
                {filters.location.cidade}, {filters.location.estado}
                {filters.locationDetected && " (detectada automaticamente)"}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => updateFilters({ location: null, locationDetected: false })}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <LocationDetectionButton
            onLocationDetected={handleLocationDetected}
            className="w-full"
          />
        )}
      </div>

      {/* Toggle Filtros Avançados */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm"
        >
          <Filter className="w-4 h-4 mr-2" />
          Filtros Avançados
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
        
        {activeFiltersCount > 0 && (
          <Button variant="ghost" size="sm" onClick={handleResetFilters}>
            Limpar filtros
          </Button>
        )}
      </div>

      {/* Filtros Avançados */}
      {showAdvanced && (
        <div className="space-y-4 pt-4 border-t">
          {/* Faixa de Preço */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
              Faixa de Preço: {filters.precoMin} - {filters.precoMax} Girinhas
            </Label>
            <div className="px-2">
              <Slider
                value={[filters.precoMin, filters.precoMax]}
                onValueChange={([min, max]) => updateFilters({ precoMin: min, precoMax: max })}
                max={200}
                min={0}
                step={5}
                className="w-full"
              />
            </div>
          </div>

          <Separator />

          {/* Switches de Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="mesma-escola"
                checked={filters.mesmaEscola}
                onCheckedChange={(checked) => updateFilter('mesmaEscola', checked)}
              />
              <Label htmlFor="mesma-escola" className="text-sm">
                Mesma escola que eu
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="mesmo-bairro"
                checked={filters.mesmoBairro}
                onCheckedChange={(checked) => updateFilter('mesmoBairro', checked)}
              />
              <Label htmlFor="mesmo-bairro" className="text-sm">
                Mesmo bairro
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="para-filhos"
                checked={filters.paraFilhos}
                onCheckedChange={(checked) => updateFilter('paraFilhos', checked)}
              />
              <Label htmlFor="para-filhos" className="text-sm">
                Para meus filhos
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="apenas-favoritos"
                checked={filters.apenasFavoritos}
                onCheckedChange={(checked) => updateFilter('apenasFavoritos', checked)}
              />
              <Label htmlFor="apenas-favoritos" className="text-sm">
                Apenas favoritos
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="apenas-seguidoras"
                checked={filters.apenasSeguidoras}
                onCheckedChange={(checked) => updateFilter('apenasSeguidoras', checked)}
              />
              <Label htmlFor="apenas-seguidoras" className="text-sm">
                Apenas minhas seguidoras
              </Label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedFilters;
