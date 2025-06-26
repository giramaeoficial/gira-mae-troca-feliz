
import React, { useState } from 'react';
import { useFeedFilters } from '@/contexts/FeedFiltersContext';
import { useConfigCategorias } from '@/hooks/useConfigCategorias';
import { useSubcategorias } from '@/hooks/useSubcategorias';
import { FiltersHeader } from '@/components/filters/FiltersHeader';
import { SearchBar } from '@/components/filters/SearchBar';
import { BasicFilters } from '@/components/filters/BasicFilters';
import { LocationFilter } from '@/components/filters/LocationFilter';
import { AdvancedFiltersToggle } from '@/components/filters/AdvancedFiltersToggle';
import { AdvancedFiltersContent } from '@/components/filters/AdvancedFiltersContent';

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
      <FiltersHeader 
        location={filters.location}
        locationDetected={filters.locationDetected}
      />

      <div className="p-4 space-y-4">
        <SearchBar
          value={filters.busca}
          onChange={(value) => updateFilter('busca', value)}
          onSearch={handleSearch}
        />

        <BasicFilters
          categoria={filters.categoria}
          ordem={filters.ordem}
          subcategoria={filters.subcategoria}
          categorias={categorias}
          subcategorias={subcategorias}
          onCategoriaChange={(value) => updateFilter('categoria', value)}
          onOrdemChange={(value) => updateFilter('ordem', value)}
          onSubcategoriaChange={(value) => updateFilter('subcategoria', value === "todas_sub" ? '' : value)}
        />

        <LocationFilter
          location={filters.location}
          locationDetected={filters.locationDetected}
          onLocationDetected={handleLocationDetected}
          onLocationClear={() => updateFilters({ location: null, locationDetected: false })}
        />

        <AdvancedFiltersToggle
          showAdvanced={showAdvanced}
          activeFiltersCount={activeFiltersCount}
          onToggle={() => setShowAdvanced(!showAdvanced)}
          onResetFilters={handleResetFilters}
        />

        {showAdvanced && (
          <AdvancedFiltersContent
            precoMin={filters.precoMin}
            precoMax={filters.precoMax}
            mesmaEscola={filters.mesmaEscola}
            mesmoBairro={filters.mesmoBairro}
            paraFilhos={filters.paraFilhos}
            apenasFavoritos={filters.apenasFavoritos}
            apenasSeguidoras={filters.apenasSeguidoras}
            onPrecoChange={([min, max]) => updateFilters({ precoMin: min, precoMax: max })}
            onMesmaEscolaChange={(checked) => updateFilter('mesmaEscola', checked)}
            onMesmoBairroChange={(checked) => updateFilter('mesmoBairro', checked)}
            onParaFilhosChange={(checked) => updateFilter('paraFilhos', checked)}
            onApenasFavoritosChange={(checked) => updateFilter('apenasFavoritos', checked)}
            onApenasSeguidorasChange={(checked) => updateFilter('apenasSeguidoras', checked)}
          />
        )}
      </div>
    </div>
  );
};

export default AdvancedFilters;
