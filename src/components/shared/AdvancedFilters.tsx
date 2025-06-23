
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Filter, X, Heart, Users, School, MapPin } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface AdvancedFiltersProps {
  filters: {
    busca: string;
    categoria: string;
    ordem: string;
    escola: any;
    mesmaEscola?: boolean;
    mesmoBairro?: boolean;
    paraFilhos?: boolean;
    apenasFavoritos?: boolean;
    apenasSeguidoras?: boolean;
  };
  onFilterChange: (filters: any) => void;
  onSearch?: () => void;
  location?: { estado: string; cidade: string; bairro?: string } | null;
}

const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  filters,
  onFilterChange,
  onSearch,
  location
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterUpdate = (key: string, value: any) => {
    onFilterChange({ [key]: value });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.mesmaEscola) count++;
    if (filters.mesmoBairro) count++;
    if (filters.paraFilhos) count++;
    if (filters.apenasFavoritos) count++;
    if (filters.apenasSeguidoras) count++;
    if (filters.categoria !== 'todas') count++;
    return count;
  };

  const limparFiltros = () => {
    onFilterChange({
      busca: '',
      categoria: 'todas',
      ordem: 'recentes',
      escola: null,
      mesmaEscola: false,
      mesmoBairro: false,
      paraFilhos: false,
      apenasFavoritos: false,
      apenasSeguidoras: false,
    });
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-sm mb-4">
      <CardContent className="p-4 space-y-4">
        {/* Barra de busca principal - sempre visível */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar roupinha, brinquedo..."
            value={filters.busca}
            onChange={(e) => handleFilterUpdate('busca', e.target.value)}
            className="pl-10 h-12 text-base"
          />
        </div>

        {/* Filtros rápidos - sempre visíveis */}
        <div className="flex flex-wrap gap-2">
          <Select value={filters.categoria} onValueChange={(value) => handleFilterUpdate('categoria', value)}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas</SelectItem>
              <SelectItem value="roupas">Roupas</SelectItem>
              <SelectItem value="calcados">Calçados</SelectItem>
              <SelectItem value="brinquedos">Brinquedos</SelectItem>
              <SelectItem value="livros">Livros</SelectItem>
              <SelectItem value="acessorios">Acessórios</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.ordem} onValueChange={(value) => handleFilterUpdate('ordem', value)}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Ordenar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recentes">Mais recentes</SelectItem>
              <SelectItem value="menor-preco">Menor preço</SelectItem>
              <SelectItem value="maior-preco">Maior preço</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Filtros especiais - destaque mobile */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant={filters.apenasFavoritos ? "default" : "outline"}
            size="sm"
            onClick={() => handleFilterUpdate('apenasFavoritos', !filters.apenasFavoritos)}
            className="h-10 text-xs font-medium"
          >
            <Heart className={`w-4 h-4 mr-2 ${filters.apenasFavoritos ? 'fill-current' : ''}`} />
            Favoritos
          </Button>

          <Button
            variant={filters.apenasSeguidoras ? "default" : "outline"}
            size="sm"
            onClick={() => handleFilterUpdate('apenasSeguidoras', !filters.apenasSeguidoras)}
            className="h-10 text-xs font-medium"
          >
            <Users className="w-4 h-4 mr-2" />
            Seguidas
          </Button>
        </div>

        {/* Filtros avançados - colapsáveis */}
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
            {location && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <MapPin className="w-4 h-4" />
                  <span>Filtros de localização</span>
                </div>
                
                <div className="grid grid-cols-1 gap-2">
                  <Button
                    variant={filters.mesmoBairro ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleFilterUpdate('mesmoBairro', !filters.mesmoBairro)}
                    className="justify-start h-10"
                    disabled={!location.bairro}
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    Mesmo bairro {location.bairro && `(${location.bairro})`}
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
                onClick={() => handleFilterUpdate('mesmaEscola', !filters.mesmaEscola)}
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
                onClick={() => handleFilterUpdate('paraFilhos', !filters.paraFilhos)}
                className="justify-start h-10 w-full"
              >
                Para meus filhos
              </Button>
            </div>
          </CollapsibleContent>
        </Collapsible>

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
              onClick={limparFiltros}
              className="h-12 px-4"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Tags de filtros ativos */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            {filters.apenasFavoritos && (
              <Badge variant="secondary" className="text-xs">
                <Heart className="w-3 h-3 mr-1 fill-current" />
                Favoritos
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-1 h-auto p-0"
                  onClick={() => handleFilterUpdate('apenasFavoritos', false)}
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
                  onClick={() => handleFilterUpdate('apenasSeguidoras', false)}
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
                  onClick={() => handleFilterUpdate('mesmaEscola', false)}
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
                  onClick={() => handleFilterUpdate('mesmoBairro', false)}
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
                  onClick={() => handleFilterUpdate('paraFilhos', false)}
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
                  onClick={() => handleFilterUpdate('categoria', 'todas')}
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
};

export default AdvancedFilters;
