
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface LocationData {
  estados: string[];
  cidades: string[];
  bairros: string[];
}

export const useLocationFilters = () => {
  const { data: locations, isLoading } = useQuery({
    queryKey: ['item-locations'],
    queryFn: async (): Promise<LocationData> => {
      const { data, error } = await supabase
        .from('itens')
        .select('endereco_estado, endereco_cidade, endereco_bairro')
        .not('endereco_estado', 'is', null)
        .eq('status', 'disponivel')
        .order('endereco_estado');

      if (error) throw error;

      const estados = [...new Set(data?.map(i => i.endereco_estado).filter(Boolean))];
      const cidades = [...new Set(data?.map(i => i.endereco_cidade).filter(Boolean))];
      const bairros = [...new Set(data?.map(i => i.endereco_bairro).filter(Boolean))];

      return { estados, cidades, bairros };
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  return {
    locations: locations || { estados: [], cidades: [], bairros: [] },
    isLoading
  };
};
