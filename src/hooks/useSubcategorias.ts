
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
  const { data: subcategorias = [], isLoading, error } = useQuery({
    queryKey: ['subcategorias'],
    queryFn: async (): Promise<Subcategoria[]> => {
      console.log('🔍 Buscando subcategorias...');
      
      const { data, error } = await supabase
        .from('subcategorias')
        .select('*')
        .eq('ativo', true)
        .order('categoria_pai')
        .order('ordem');

      if (error) {
        console.error('❌ Erro ao buscar subcategorias:', error);
        throw error;
      }

      console.log('✅ Subcategorias encontradas:', data?.length || 0, data);
      return data || [];
    },
    staleTime: 300000, // 5 minutos
    gcTime: 600000 // 10 minutos
  });

  return {
    subcategorias,
    isLoading,
    error
  };
};
