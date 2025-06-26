
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface TamanhoCategoria {
  id: string;
  categoria: string;
  subcategoria?: string;
  tipo_tamanho: string;
  valor: string;
  label_display: string;
  idade_minima_meses?: number;
  idade_maxima_meses?: number;
  ordem: number;
  ativo: boolean;
}

export const useTamanhosPorCategoria = (categoria?: string) => {
  return useQuery({
    queryKey: ['tamanhos-categoria', categoria],
    queryFn: async (): Promise<TamanhoCategoria[]> => {
      if (!categoria) return [];
      
      const { data, error } = await supabase
        .from('categorias_tamanhos')
        .select('*')
        .eq('categoria', categoria)
        .eq('ativo', true)
        .order('ordem');

      if (error) throw error;
      return data || [];
    },
    enabled: !!categoria,
    staleTime: 300000, // 5 minutos
    gcTime: 600000 // 10 minutos
  });
};

export const useTiposTamanho = (categoria?: string) => {
  const { data: tamanhos = [] } = useTamanhosPorCategoria(categoria);
  
  // Agrupar tamanhos por tipo
  const tiposTamanho = tamanhos.reduce((acc, tamanho) => {
    if (!acc[tamanho.tipo_tamanho]) {
      acc[tamanho.tipo_tamanho] = [];
    }
    acc[tamanho.tipo_tamanho].push(tamanho);
    return acc;
  }, {} as Record<string, TamanhoCategoria[]>);

  return {
    tiposTamanho,
    tipos: Object.keys(tiposTamanho),
    isLoading: !categoria
  };
};
