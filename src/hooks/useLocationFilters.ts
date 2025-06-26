
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useState, useCallback } from 'react';

export interface LocationData {
  estados: string[];
  cidades: string[];
  bairros: string[];
}

export const useLocationFilters = () => {
  const [selectedEstado, setSelectedEstado] = useState<string>('');

  // Buscar estados dos perfis de usuários (não dos itens)
  const { data: estados = [], isLoading: isLoadingEstados } = useQuery({
    queryKey: ['profile-estados'],
    queryFn: async (): Promise<string[]> => {
      const { data, error } = await supabase
        .from('profiles')
        .select('estado')
        .not('estado', 'is', null)
        .order('estado');

      if (error) throw error;

      return [...new Set(data?.map(p => p.estado).filter(Boolean))];
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Buscar cidades baseado no estado selecionado dos perfis
  const { data: cidades = [], isLoading: isLoadingCidades } = useQuery({
    queryKey: ['profile-cidades', selectedEstado],
    queryFn: async (): Promise<string[]> => {
      if (!selectedEstado) return [];

      const { data, error } = await supabase
        .from('profiles')
        .select('cidade')
        .eq('estado', selectedEstado)
        .not('cidade', 'is', null)
        .order('cidade');

      if (error) throw error;

      return [...new Set(data?.map(p => p.cidade).filter(Boolean))];
    },
    enabled: !!selectedEstado,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Buscar bairros dos perfis
  const { data: bairros = [], isLoading: isLoadingBairros } = useQuery({
    queryKey: ['profile-bairros'],
    queryFn: async (): Promise<string[]> => {
      const { data, error } = await supabase
        .from('profiles')
        .select('bairro')
        .not('bairro', 'is', null)
        .order('bairro');

      if (error) throw error;

      return [...new Set(data?.map(p => p.bairro).filter(Boolean))];
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  const updateSelectedEstado = useCallback((estado: string) => {
    setSelectedEstado(estado);
  }, []);

  const resetFilters = useCallback(() => {
    setSelectedEstado('');
  }, []);

  return {
    locations: { estados, cidades, bairros },
    isLoading: isLoadingEstados || isLoadingCidades || isLoadingBairros,
    selectedEstado,
    updateSelectedEstado,
    resetFilters,
    isLoadingCidades
  };
};
