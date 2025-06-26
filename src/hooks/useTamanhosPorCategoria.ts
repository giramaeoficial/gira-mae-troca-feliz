
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface TamanhoItem {
  valor: string;
  label_display: string;
  idade_minima_meses?: number;
  idade_maxima_meses?: number;
}

export const useTamanhosPorCategoria = (categoria?: string) => {
  return useQuery({
    queryKey: ['tamanhos-categoria', categoria],
    queryFn: async (): Promise<Record<string, TamanhoItem[]>> => {
      const { data, error } = await supabase
        .from('categorias_tamanhos')
        .select('*')
        .eq('ativo', true)
        .order('ordem');

      if (error) throw error;

      const grouped = data.reduce((acc, item) => {
        if (!acc[item.categoria]) {
          acc[item.categoria] = [];
        }
        acc[item.categoria].push({
          valor: item.valor,
          label_display: item.label_display,
          idade_minima_meses: item.idade_minima_meses,
          idade_maxima_meses: item.idade_maxima_meses
        });
        return acc;
      }, {} as Record<string, TamanhoItem[]>);

      return grouped;
    },
    enabled: true
  });
};

export const useTiposTamanho = (categoria?: string) => {
  const query = useTamanhosPorCategoria(categoria);
  
  return {
    ...query,
    data: query.data || {}
  };
};
