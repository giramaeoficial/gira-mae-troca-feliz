
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface FeedFilters {
  busca: string;
  categoria: string;
  ordem: string;
  mesmaEscola: boolean;
  mesmoBairro: boolean;
  paraFilhos: boolean;
  apenasFavoritos: boolean;
  apenasSeguidoras: boolean;
  location: { estado: string; cidade: string; bairro?: string } | null;
}

interface FeedFiltersContextType {
  filters: FeedFilters;
  updateFilter: (key: keyof FeedFilters, value: any) => void;
  updateFilters: (updates: Partial<FeedFilters>) => void;
  resetFilters: () => void;
  getActiveFiltersCount: () => number;
}

const defaultFilters: FeedFilters = {
  busca: '',
  categoria: 'todas',
  ordem: 'recentes',
  mesmaEscola: false,
  mesmoBairro: false,
  paraFilhos: false,
  apenasFavoritos: false,
  apenasSeguidoras: false,
  location: null,
};

const FeedFiltersContext = createContext<FeedFiltersContextType | undefined>(undefined);

export const FeedFiltersProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [filters, setFilters] = useState<FeedFilters>(defaultFilters);

  const updateFilter = useCallback((key: keyof FeedFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const updateFilters = useCallback((updates: Partial<FeedFilters>) => {
    setFilters(prev => ({ ...prev, ...updates }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const getActiveFiltersCount = useCallback(() => {
    let count = 0;
    if (filters.mesmaEscola) count++;
    if (filters.mesmoBairro) count++;
    if (filters.paraFilhos) count++;
    if (filters.apenasFavoritos) count++;
    if (filters.apenasSeguidoras) count++;
    if (filters.categoria !== 'todas') count++;
    return count;
  }, [filters]);

  const value = {
    filters,
    updateFilter,
    updateFilters,
    resetFilters,
    getActiveFiltersCount,
  };

  return (
    <FeedFiltersContext.Provider value={value}>
      {children}
    </FeedFiltersContext.Provider>
  );
};

export const useFeedFilters = (): FeedFiltersContextType => {
  const context = useContext(FeedFiltersContext);
  if (!context) {
    throw new Error('useFeedFilters deve ser usado dentro de um FeedFiltersProvider');
  }
  return context;
};
