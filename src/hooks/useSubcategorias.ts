
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Subcategoria {
  id: string;
  categoria_pai: string;
  nome: string;
  icone: string;
  ativo: boolean;
  ordem: number;
}

export const useSubcategorias = () => {
  const { data: subcategorias = [], isLoading } = useQuery({
    queryKey: ['subcategorias'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subcategorias_itens')
        .select('*')
        .eq('ativo', true)
        .order('categoria_pai')
        .order('ordem');

      if (error) throw error;
      return data as Subcategoria[];
    }
  });

  return {
    subcategorias,
    isLoading
  };
};
