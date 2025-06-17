
import React, { useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import EscolaFilter from '@/components/escolas/EscolaFilter';
import { Tables } from '@/integrations/supabase/types';
import { useEscolas } from '@/hooks/useEscolas';

type Escola = Tables<'escolas_inep'>;

interface AdvancedFiltersProps {
  filters: {
    busca: string;
    categoria: string;
    ordem: string;
    escola: Escola | null;
  };
  onFilterChange: (filters: any) => void;
  onSearch: () => void;
  location: { estado: string; cidade: string } | null;
}

const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  filters,
  onFilterChange,
  onSearch,
  location
}) => {
  const { buscarEscolas } = useEscolas();

  // Quando a localização mudar, buscar escolas automaticamente
  useEffect(() => {
    if (location?.estado && location?.cidade) {
      buscarEscolas('', location.estado, location.cidade);
    }
  }, [location, buscarEscolas]);

  const updateFilter = (key: string, value: any) => {
    onFilterChange({ ...filters, [key]: value });
  };

  if (!location) {
    return (
      <Card className="mb-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardContent className="p-6 text-center">
          <div className="text-gray-500 mb-2">
            <h3 className="font-medium text-gray-700">Selecione sua localização</h3>
            <p className="text-sm text-gray-500 mt-1">
              Escolha seu estado e cidade para ver os itens disponíveis na sua região
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar por título ou descrição..."
              value={filters.busca}
              onChange={(e) => updateFilter('busca', e.target.value)}
              className="pl-10 h-12"
            />
          </div>
          
          {/* Filtros em linha */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select 
              value={filters.categoria} 
              onValueChange={(value) => updateFilter('categoria', value)}
            >
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas</SelectItem>
                <SelectItem value="roupa">👗 Roupa</SelectItem>
                <SelectItem value="brinquedo">🧸 Brinquedo</SelectItem>
                <SelectItem value="calcado">👟 Calçado</SelectItem>
                <SelectItem value="acessorio">🎀 Acessório</SelectItem>
                <SelectItem value="kit">📦 Kit</SelectItem>
                <SelectItem value="outro">🔖 Outro</SelectItem>
              </SelectContent>
            </Select>
            
            <Select 
              value={filters.ordem} 
              onValueChange={(value) => updateFilter('ordem', value)}
            >
              <SelectTrigger className="h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recentes">Mais Recentes</SelectItem>
                <SelectItem value="menor-preco">Menor Preço</SelectItem>
                <SelectItem value="maior-preco">Maior Preço</SelectItem>
              </SelectContent>
            </Select>

            <EscolaFilter 
              value={filters.escola}
              onChange={(escola) => updateFilter('escola', escola)}
              preSelectedLocation={location}
            />
          </div>

          {/* Botão de buscar */}
          <Button 
            onClick={onSearch}
            className="w-full h-12 bg-gradient-to-r from-primary to-pink-500 text-white font-medium"
          >
            <Search className="w-4 h-4 mr-2" />
            Buscar Itens
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdvancedFilters;
