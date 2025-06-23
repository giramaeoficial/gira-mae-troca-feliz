
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Escola {
  codigo_inep: number;
  escola: string;
  uf: string;
  municipio: string;
  endereco: string;
}

export const useEscolas = () => {
  const { data: escolas = [], isLoading } = useQuery({
    queryKey: ['escolas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('escolas_inep')
        .select('codigo_inep, escola, uf, municipio, endereco')
        .limit(1000)
        .order('escola');

      if (error) throw error;
      return data as Escola[];
    }
  });

  return {
    escolas,
    isLoading
  };
};
