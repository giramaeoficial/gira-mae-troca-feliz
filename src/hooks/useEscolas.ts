
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Escola {
  codigo_inep: number;
  escola: string;
  uf: string;
  municipio: string;
  endereco: string;
  categoria_administrativa?: string;
}

interface UseEscolasParams {
  searchTerm?: string;
  uf?: string;
  municipio?: string;
}

export const useEscolas = (params?: UseEscolasParams) => {
  return useQuery({
    queryKey: ['escolas', params],
    queryFn: async () => {
      let query = supabase
        .from('escolas_inep')
        .select('codigo_inep, escola, uf, municipio, endereco, categoria_administrativa')
        .order('escola')
        .limit(1000);

      // Aplicar filtros se fornecidos
      if (params?.uf) {
        query = query.eq('uf', params.uf);
      }

      if (params?.municipio) {
        query = query.eq('municipio', params.municipio);
      }

      if (params?.searchTerm && params.searchTerm.length >= 3) {
        query = query.ilike('escola', `%${params.searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Escola[];
    },
    enabled: true
  });
};
