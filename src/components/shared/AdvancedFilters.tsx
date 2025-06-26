
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
import { useSubcategorias } from '@/hooks/useSubcategorias';

interface AdvancedFiltersProps {
  onSearch?: () => void;
}

const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({ onSearch }) => {
  const { filters, updateFilter, updateFilters, getActiveFiltersCount, setLocationDetected } = useFeedFilters();
  const { configuracoes } = useConfigCategorias();
  const { subcategorias: allSubcategorias } = useSubcategorias();
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

  // Convert configuracoes to categorias format
  const categorias = configuracoes?.map(config => ({
    id: config.codigo,
    nome: config.nome,
    icone: config.icone
  })) || [];

  // Get subcategorias for selected category
  const subcategorias = filters.categoria !== 'todas' 
    ? allSubcategorias.filter(sub => sub.categoria_pai === filters.categoria).map(sub => sub.nome)
    : [];

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div className="bg-white rounded-lg shadow-sm border mb-6">
      {/* Header com título */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Filtros Inteligentes</h2>
          <Button variant="ghost" size="sm" className="text-primary">
            + Publicar
          </Button>
        </div>
        {filters.location && (
          <p className="text-sm text-gray-500 mt-1 flex items-center">
            <MapPin className="w-4 h-4 mr-1" />
            {filters.location.cidade}, {filters.location.estado}
          </p>
        )}
      </div>

      {/* Busca Principal */}
      <div className="p-4 space-y-4">
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
          <Button onClick={handleSearch} className="bg-gradient-to-r from-primary to-pink-500 px-6">
            Buscar
          </Button>
        </div>

        {/* Filtros Básicos - Layout em grid compacto */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Categoria */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-1 block">Categoria</Label>
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

          {/* Ordenação */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-1 block">Ordenar por</Label>
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

        {/* Subcategoria (só se houver categoria selecionada) */}
        {subcategorias.length > 0 && (
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-1 block">Subcategoria</Label>
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

        {/* Localização */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-1 block">Localização</Label>
          {filters.location ? (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
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
        <div className="flex items-center justify-between pt-2">
          <Button
            variant="ghost"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-sm flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filtros Avançados
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-1 bg-green-100 text-green-800">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
          
          {activeFiltersCount > 0 && (
            <Button variant="ghost" size="sm" onClick={handleResetFilters} className="text-gray-500">
              Limpar filtros
            </Button>
          )}
        </div>

        {/* Filtros Avançados Expandidos */}
        {showAdvanced && (
          <div className="space-y-4 pt-4 border-t border-gray-100">
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

            {/* Switches de Filtros - Grid 2x3 */}
            <div className="grid grid-cols-2 gap-3">
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

              <div className="flex items-center space-x-2 col-span-2">
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
    </div>
  );
};

export default AdvancedFilters;
