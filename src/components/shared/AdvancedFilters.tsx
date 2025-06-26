
import React, { useState, memo } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Search, Filter, X, Heart, Users, School, MapPin } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useFeedFilters } from '@/contexts/FeedFiltersContext';
import { LocationDetectionButton } from '@/components/location/LocationDetectionButton';
import { useConfigCategorias } from '@/hooks/useConfigCategorias';
import { useSubcategorias } from '@/hooks/useSubcategorias';

// Interface para uso com props (Feed.tsx) - mantida para compatibilidade
interface AdvancedFiltersWithProps {
  filters: {
    busca: string;
    categoria: string;
    ordem: string;
    escola: any;
  };
  onFilterChange: (filters: any) => void;
  onSearch: () => void;
  location: { estado: string; cidade: string } | null;
}

// Interface para uso com contexto (FeedOptimized.tsx)
interface AdvancedFiltersWithContext {
  onSearch?: () => void;
}

type AdvancedFiltersProps = AdvancedFiltersWithProps | AdvancedFiltersWithContext;

const AdvancedFilters: React.FC<AdvancedFiltersProps> = memo((props) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Verificar se está usando contexto ou props
  const isUsingContext = !('filters' in props);
  
  // Usar contexto se disponível, senão usar props
  let filters, updateFilter, updateFilters, resetFilters, getActiveFiltersCount, setLocationDetected;
  
  if (isUsingContext) {
    const contextData = useFeedFilters();
    filters = contextData.filters;
    updateFilter = contextData.updateFilter;
    updateFilters = contextData.updateFilters;
    resetFilters = contextData.resetFilters;
    getActiveFiltersCount = contextData.getActiveFiltersCount;
    setLocationDetected = contextData.setLocationDetected;
  } else {
    // Usar props para compatibilidade com Feed.tsx
    const propsData = props as AdvancedFiltersWithProps;
    filters = {
      busca: propsData.filters.busca,
      categoria: propsData.filters.categoria,
      subcategoria: '',
      ordem: propsData.filters.ordem,
      mesmaEscola: false,
      mesmoBairro: false,
      paraFilhos: false,
      apenasFavoritos: false,
      apenasSeguidoras: false,
      location: propsData.location,
      locationDetected: false,
      precoMin: 0,
      precoMax: 200,
    };
    updateFilter = (key: string, value: any) => {
      if (key === 'busca' || key === 'categoria' || key === 'ordem') {
        propsData.onFilterChange({ ...propsData.filters, [key]: value });
      }
    };
    updateFilters = (updates: any) => {
      propsData.onFilterChange({ ...propsData.filters, ...updates });
    };
    resetFilters = () => {
      propsData.onFilterChange({
        busca: '',
        categoria: 'todas',
        ordem: 'recentes',
        escola: null
      });
    };
    getActiveFiltersCount = () => {
      let count = 0;
      if (propsData.filters.categoria !== 'todas') count++;
      if (propsData.filters.escola) count++;
      return count;
    };
    setLocationDetected = () => {}; // No-op para compatibilidade
  }

  const activeFiltersCount = getActiveFiltersCount();
  const onSearch = 'onSearch' in props ? props.onSearch : undefined;

  // Hooks para categorias e subcategorias
  const { configuracoes } = useConfigCategorias();
  const { subcategorias, isLoading: isLoadingSubcategorias } = useSubcategorias();

  // Filtrar subcategorias baseado na categoria selecionada
  const subcategoriasFiltradas = React.useMemo(() => {
    if (!subcategorias || !filters.categoria || filters.categoria === 'todas') return [];
    
    const filtradas = subcategorias.filter(sub => sub.categoria_pai === filters.categoria);
    
    // Remover duplicatas baseado no nome
    const subcategoriasUnicas = filtradas.reduce((acc, sub) => {
      if (!acc.some(item => item.nome === sub.nome)) {
        acc.push(sub);
      }
      return acc;
    }, [] as typeof filtradas);
    
    return subcategoriasUnicas;
  }, [subcategorias, filters.categoria]);

  const handleLocationDetected = (location: { cidade: string; estado: string; bairro?: string }) => {
    if (setLocationDetected) {
      setLocationDetected(location);
    }
  };

  const handleLocationInputChange = (value: string) => {
    if (value) {
      // Parse manual input - formato simples: "Cidade, UF"
      const parts = value.split(',').map(s => s.trim());
      if (parts.length >= 2) {
        updateFilter('location', {
          cidade: parts[0],
          estado: parts[1],
          bairro: parts[2] || undefined
        });
        updateFilter('locationDetected', false);
      }
    } else {
      updateFilter('location', null);
      updateFilter('locationDetected', false);
    }
  };

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-sm mb-4">
      <CardContent className="p-4 space-y-4">
        {/* Barra de busca principal - sempre visível */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar roupinha, brinquedo..."
            value={filters.busca}
            onChange={(e) => updateFilter('busca', e.target.value)}
            className="pl-10 h-12 text-base"
          />
        </div>

        {/* LOCALIZAÇÃO - Nova seção */}
        {isUsingContext && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <MapPin className="w-4 h-4" />
              <span>LOCALIZAÇÃO</span>
            </div>
            
            <div className="space-y-2">
              <Input
                placeholder="Digite sua cidade..."
                value={filters.location ? `${filters.location.cidade}, ${filters.location.estado}` : ''}
                onChange={(e) => handleLocationInputChange(e.target.value)}
                className="h-10"
              />
              
              <LocationDetectionButton
                onLocationDetected={handleLocationDetected}
                className="h-10"
              />
            </div>
          </div>
        )}

        {/* CATEGORIA e SUBCATEGORIA lado a lado */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">CATEGORIA</label>
            <Select 
              value={filters.categoria} 
              onValueChange={(value) => {
                updateFilter('categoria', value);
                // Limpar subcategoria quando categoria muda
                if (isUsingContext) {
                  updateFilter('subcategoria', '');
                }
              }}
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas</SelectItem>
                {configuracoes?.map(config => (
                  <SelectItem key={config.codigo} value={config.codigo}>
                    <span className="flex items-center gap-2">
                      <span className="text-sm">{config.icone}</span>
                      {config.nome}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">SUBCATEGORIA</label>
            <Select 
              value={filters.subcategoria || ''} 
              onValueChange={(value) => updateFilter('subcategoria', value)}
              disabled={!filters.categoria || filters.categoria === 'todas' || isLoadingSubcategorias}
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder={
                  !filters.categoria || filters.categoria === 'todas' ? "Selecione categoria" :
                  isLoadingSubcategorias ? "Carregando..." :
                  subcategoriasFiltradas.length === 0 ? "Nenhuma disponível" :
                  "Todas"
                } />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas</SelectItem>
                {subcategoriasFiltradas.map(sub => (
                  <SelectItem key={sub.id} value={sub.nome}>
                    <span className="flex items-center gap-2">
                      <span className="text-sm">{sub.icone}</span>
                      {sub.nome}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* PREÇO - Slider de faixa */}
        {isUsingContext && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                PREÇO: {filters.precoMin} - {filters.precoMax} Girinhas
              </label>
            </div>
            <Slider
              value={[filters.precoMin, filters.precoMax]}
              onValueChange={([min, max]) => {
                updateFilter('precoMin', min);
                updateFilter('precoMax', max);
              }}
              max={200}
              min={0}
              step={5}
              className="w-full"
            />
          </div>
        )}

        {/* ORDENAÇÃO */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">ORDENAR POR</label>
          <Select 
            value={filters.ordem} 
            onValueChange={(value) => updateFilter('ordem', value)}
          >
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recentes">Mais recentes</SelectItem>
              <SelectItem value="menor-preco">Menor preço</SelectItem>
              <SelectItem value="maior-preco">Maior preço</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Filtros especiais - apenas se usando contexto */}
        {isUsingContext && (
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={filters.apenasFavoritos ? "default" : "outline"}
              size="sm"
              onClick={() => updateFilter('apenasFavoritos', !filters.apenasFavoritos)}
              className="h-10 text-xs font-medium"
            >
              <Heart className={`w-4 h-4 mr-2 ${filters.apenasFavoritos ? 'fill-current' : ''}`} />
              Favoritos
            </Button>

            <Button
              variant={filters.apenasSeguidoras ? "default" : "outline"}
              size="sm"
              onClick={() => updateFilter('apenasSeguidoras', !filters.apenasSeguidoras)}
              className="h-10 text-xs font-medium"
            >
              <Users className="w-4 h-4 mr-2" />
              Seguidas
            </Button>
          </div>
        )}

        {/* Filtros avançados - colapsáveis - apenas se usando contexto */}
        {isUsingContext && (
          <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    Filtros Avançados
                  </span>
                  {activeFiltersCount > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </div>
                <span className="text-xs text-gray-500">
                  {isExpanded ? 'Ocultar' : 'Mostrar'}
                </span>
              </Button>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="space-y-3 mt-3">
              {/* Filtros de localização */}
              {filters.location && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <MapPin className="w-4 h-4" />
                    <span>Filtros de localização</span>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-2">
                    <Button
                      variant={filters.mesmoBairro ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateFilter('mesmoBairro', !filters.mesmoBairro)}
                      className="justify-start h-10"
                      disabled={!filters.location.bairro}
                    >
                      <MapPin className="w-4 h-4 mr-2" />
                      Mesmo bairro {filters.location.bairro && `(${filters.location.bairro})`}
                    </Button>
                  </div>
                </div>
              )}

              {/* Filtros de escola */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <School className="w-4 h-4" />
                  <span>Filtros de escola</span>
                </div>
                
                <Button
                  variant={filters.mesmaEscola ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateFilter('mesmaEscola', !filters.mesmaEscola)}
                  className="justify-start h-10 w-full"
                >
                  <School className="w-4 h-4 mr-2" />
                  Mesma escola
                </Button>
              </div>

              {/* Filtros personalizados */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <Filter className="w-4 h-4" />
                  <span>Filtros personalizados</span>
                </div>
                
                <Button
                  variant={filters.paraFilhos ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateFilter('paraFilhos', !filters.paraFilhos)}
                  className="justify-start h-10 w-full"
                >
                  Para meus filhos
                </Button>
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Botões de ação */}
        <div className="flex gap-2 pt-2">
          {onSearch && (
            <Button 
              onClick={onSearch}
              className="flex-1 h-12 bg-gradient-to-r from-primary to-pink-500 hover:from-primary/90 hover:to-pink-500/90"
            >
              <Search className="w-4 h-4 mr-2" />
              Buscar Itens
            </Button>
          )}
          
          {activeFiltersCount > 0 && (
            <Button
              variant="outline"
              onClick={resetFilters}
              className="h-12 px-4"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Tags de filtros ativos - apenas se usando contexto */}
        {isUsingContext && activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            {filters.apenasFavoritos && (
              <Badge variant="secondary" className="text-xs">
                <Heart className="w-3 h-3 mr-1 fill-current" />
                Favoritos
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-1 h-auto p-0"
                  onClick={() => updateFilter('apenasFavoritos', false)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </Badge>
            )}
            
            {filters.apenasSeguidoras && (
              <Badge variant="secondary" className="text-xs">
                <Users className="w-3 h-3 mr-1" />
                Seguidas
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-1 h-auto p-0"
                  onClick={() => updateFilter('apenasSeguidoras', false)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </Badge>
            )}
            
            {filters.mesmaEscola && (
              <Badge variant="secondary" className="text-xs">
                <School className="w-3 h-3 mr-1" />
                Mesma escola
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-1 h-auto p-0"
                  onClick={() => updateFilter('mesmaEscola', false)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </Badge>
            )}
            
            {filters.mesmoBairro && (
              <Badge variant="secondary" className="text-xs">
                <MapPin className="w-3 h-3 mr-1" />
                Mesmo bairro
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-1 h-auto p-0"
                  onClick={() => updateFilter('mesmoBairro', false)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </Badge>
            )}
            
            {filters.paraFilhos && (
              <Badge variant="secondary" className="text-xs">
                Para meus filhos
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-1 h-auto p-0"
                  onClick={() => updateFilter('paraFilhos', false)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </Badge>
            )}
            
            {filters.categoria !== 'todas' && (
              <Badge variant="secondary" className="text-xs">
                {filters.categoria}
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-1 h-auto p-0"
                  onClick={() => updateFilter('categoria', 'todas')}
                >
                  <X className="w-3 h-3" />
                </Button>
              </Badge>
            )}

            {filters.subcategoria && (
              <Badge variant="secondary" className="text-xs">
                {filters.subcategoria}
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-1 h-auto p-0"
                  onClick={() => updateFilter('subcategoria', '')}
                >
                  <X className="w-3 h-3" />
                </Button>
              </Badge>
            )}

            {filters.location && (
              <Badge variant="secondary" className="text-xs">
                <MapPin className="w-3 h-3 mr-1" />
                {filters.location.cidade}, {filters.location.estado}
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-1 h-auto p-0"
                  onClick={() => {
                    updateFilter('location', null);
                    updateFilter('locationDetected', false);
                  }}
                >
                  <X className="w-3 h-3" />
                </Button>
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
});

AdvancedFilters.displayName = 'AdvancedFilters';

export default AdvancedFilters;
