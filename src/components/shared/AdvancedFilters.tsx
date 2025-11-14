import React, { useState } from 'react';
import { useFeedFilters } from '@/contexts/FeedFiltersContext';
import { useConfigCategorias } from '@/hooks/useConfigCategorias';
import { useSubcategorias } from '@/hooks/useSubcategorias';
import { useTiposTamanho } from '@/hooks/useTamanhosPorCategoria';
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
  
  // ✅ Hook para buscar tamanhos baseado na categoria
  const { tiposTamanho } = useTiposTamanho(filters.categoria !== 'todas' ? filters.categoria : undefined);
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
      genero: 'todos',
      tamanho: 'todos',
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

  // ✅ CORRIGIDO: Obter TODOS os tamanhos disponíveis (não só o primeiro tipo)
  const tamanhosDisponiveis = React.useMemo(() => {
    console.log('🔍 [AdvancedFilters] tiposTamanho recebido:', tiposTamanho);
    console.log('🔍 [AdvancedFilters] Tipo do objeto:', typeof tiposTamanho);
    console.log('🔍 [AdvancedFilters] Keys do objeto:', Object.keys(tiposTamanho || {}));
    
    if (!tiposTamanho || typeof tiposTamanho !== 'object') {
      console.log('⚠️ [AdvancedFilters] tiposTamanho inválido');
      return [];
    }

    try {
      // Pegar todos os tamanhos de todos os tipos (roupas, calçados, etc)
      const todosTamanhos = Object.values(tiposTamanho).flat();
      
      console.log('📦 [AdvancedFilters] Todos os tamanhos (flat):', todosTamanhos);
      console.log('📊 [AdvancedFilters] Quantidade total:', todosTamanhos.length);
      
      if (!Array.isArray(todosTamanhos) || todosTamanhos.length === 0) {
        console.log('⚠️ [AdvancedFilters] Array vazio ou inválido');
        return [];
      }

      // Remover duplicatas baseado no valor E ordenar por 'ordem'
      const tamanhosUnicos = todosTamanhos.reduce((acc, tamanho) => {
        if (tamanho && tamanho.valor && !acc.some(item => item?.valor === tamanho.valor)) {
          acc.push(tamanho);
        }
        return acc;
      }, [] as typeof todosTamanhos);

      console.log('✅ [AdvancedFilters] Tamanhos únicos:', tamanhosUnicos.length);
      console.log('📋 [AdvancedFilters] Valores:', tamanhosUnicos.map(t => t.valor));

      // Ordenar pelos campos 'ordem' do banco de dados
      const tamanhosOrdenados = tamanhosUnicos.sort((a, b) => {
        const ordemA = a && typeof a.ordem === 'number' ? a.ordem : 999;
        const ordemB = b && typeof b.ordem === 'number' ? b.ordem : 999;
        return ordemA - ordemB;
      });

      console.log('🎯 [AdvancedFilters] Tamanhos finais ordenados:', tamanhosOrdenados.map(t => `${t.valor} (ordem: ${t.ordem})`));
      
      return tamanhosOrdenados;
    } catch (error) {
      console.error('❌ [AdvancedFilters] Erro ao processar tamanhos:', error);
      return [];
    }
  }, [tiposTamanho]);

  // ✅ Reset tamanho quando categoria muda para 'todas'
  React.useEffect(() => {
    if (filters.categoria === 'todas') {
      updateFilter('tamanho', 'todos');
    }
  }, [filters.categoria, updateFilter]);

  // ✅ Reset tamanho se o valor selecionado não existe mais nos tamanhos disponíveis
  React.useEffect(() => {
    if (filters.tamanho && filters.tamanho !== 'todos' && tamanhosDisponiveis.length > 0) {
      const tamanhoExiste = tamanhosDisponiveis.some(t => t.valor === filters.tamanho);
      if (!tamanhoExiste) {
        console.log('⚠️ Tamanho selecionado não existe na nova categoria, resetando...');
        updateFilter('tamanho', 'todos');
      }
    }
  }, [tamanhosDisponiveis, filters.tamanho, updateFilter]);

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
          genero={filters.genero}
          tamanho={filters.tamanho}
          categorias={categorias}
          subcategorias={subcategorias}
          tamanhosDisponiveis={tamanhosDisponiveis}
          onCategoriaChange={(value) => updateFilter('categoria', value)}
          onOrdemChange={(value) => updateFilter('ordem', value)}
          onSubcategoriaChange={(value) => updateFilter('subcategoria', value === "todas_sub" ? '' : value)}
          onGeneroChange={(value) => updateFilter('genero', value)}
          onTamanhoChange={(value) => updateFilter('tamanho', value)}
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
