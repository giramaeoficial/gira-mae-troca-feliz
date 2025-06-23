
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

  // Buscar estados (sempre carregado)
  const { data: estados = [], isLoading: isLoadingEstados } = useQuery({
    queryKey: ['item-estados'],
    queryFn: async (): Promise<string[]> => {
      const { data, error } = await supabase
        .from('itens')
        .select('endereco_estado')
        .not('endereco_estado', 'is', null)
        .eq('status', 'disponivel')
        .order('endereco_estado');

      if (error) throw error;

      return [...new Set(data?.map(i => i.endereco_estado).filter(Boolean))];
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Buscar cidades baseado no estado selecionado
  const { data: cidades = [], isLoading: isLoadingCidades } = useQuery({
    queryKey: ['item-cidades', selectedEstado],
    queryFn: async (): Promise<string[]> => {
      if (!selectedEstado) return [];

      const { data, error } = await supabase
        .from('itens')
        .select('endereco_cidade')
        .eq('endereco_estado', selectedEstado)
        .not('endereco_cidade', 'is', null)
        .eq('status', 'disponivel')
        .order('endereco_cidade');

      if (error) throw error;

      return [...new Set(data?.map(i => i.endereco_cidade).filter(Boolean))];
    },
    enabled: !!selectedEstado,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Buscar bairros (mantém a lógica original por enquanto)
  const { data: bairros = [], isLoading: isLoadingBairros } = useQuery({
    queryKey: ['item-bairros'],
    queryFn: async (): Promise<string[]> => {
      const { data, error } = await supabase
        .from('itens')
        .select('endereco_bairro')
        .not('endereco_bairro', 'is', null)
        .eq('status', 'disponivel')
        .order('endereco_bairro');

      if (error) throw error;

      return [...new Set(data?.map(i => i.endereco_bairro).filter(Boolean))];
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
