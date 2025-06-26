
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
      if (!categoria) {
        console.log('⚠️ Nenhuma categoria fornecida para buscar tamanhos');
        return [];
      }
      
      console.log('🔍 Buscando tamanhos para categoria:', categoria);
      
      // Tentar buscar exato primeiro
      let { data, error } = await supabase
        .from('categorias_tamanhos')
        .select('*')
        .eq('categoria', categoria)
        .eq('ativo', true)
        .order('ordem');

      // Se não encontrou nada, tentar variações
      if (!data || data.length === 0) {
        console.log('🔍 Tentando variações para categoria:', categoria);
        
        const categoriaPlural = categoria.endsWith('s') ? categoria : categoria + 's';
        const categoriaSingular = categoria.endsWith('s') ? categoria.slice(0, -1) : categoria;
        
        const { data: dataVariacoes, error: errorVariacoes } = await supabase
          .from('categorias_tamanhos')
          .select('*')
          .in('categoria', [categoriaPlural, categoriaSingular])
          .eq('ativo', true)
          .order('ordem');
        
        data = dataVariacoes;
        error = errorVariacoes;
        
        console.log('🔍 Tentativas de variação:', {
          original: categoria,
          plural: categoriaPlural,
          singular: categoriaSingular,
          encontrados: data?.length || 0
        });
      }

      if (error) {
        console.error('❌ Erro ao buscar tamanhos:', error);
        throw error;
      }

      console.log('✅ Tamanhos encontrados:', {
        categoria,
        total: data?.length || 0,
        tipos: [...new Set(data?.map(t => t.tipo_tamanho) || [])],
        dados: data
      });
      
      return data || [];
    },
    enabled: !!categoria,
    staleTime: 300000, // 5 minutos
    gcTime: 600000 // 10 minutos
  });
};

export const useTiposTamanho = (categoria?: string) => {
  const { data: tamanhos = [], isLoading, error } = useTamanhosPorCategoria(categoria);
  
  // Agrupar tamanhos por tipo
  const tiposTamanho = tamanhos.reduce((acc, tamanho) => {
    if (!acc[tamanho.tipo_tamanho]) {
      acc[tamanho.tipo_tamanho] = [];
    }
    acc[tamanho.tipo_tamanho].push(tamanho);
    return acc;
  }, {} as Record<string, TamanhoCategoria[]>);

  console.log('🔍 Tipos de tamanho agrupados:', {
    categoria,
    tipos: Object.keys(tiposTamanho),
    total_tamanhos: tamanhos.length,
    agrupamento: Object.entries(tiposTamanho).map(([tipo, items]) => ({
      tipo,
      quantidade: items.length
    }))
  });

  return {
    tiposTamanho,
    tipos: Object.keys(tiposTamanho),
    isLoading: isLoading || !categoria,
    error
  };
};
