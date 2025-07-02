
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { TipoTransacaoConfig } from '@/types/transacao.types';

export const useTiposTransacao = () => {
  const { data: tiposCredito, isLoading: loadingCredito } = useQuery({
    queryKey: ['tipos-credito'],
    queryFn: async (): Promise<TipoTransacaoConfig[]> => {
      const { data, error } = await supabase
        .from('tipos_credito')
        .select('*');
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  const { data: tiposDebito, isLoading: loadingDebito } = useQuery({
    queryKey: ['tipos-debito'],
    queryFn: async (): Promise<TipoTransacaoConfig[]> => {
      const { data, error } = await supabase
        .from('tipos_debito')
        .select('*');
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  const { data: configCompleta, isLoading: loadingConfig } = useQuery({
    queryKey: ['transacao-config'],
    queryFn: async (): Promise<TipoTransacaoConfig[]> => {
      const { data, error } = await supabase
        .from('transacao_config')
        .select('*')
        .eq('ativo', true)
        .order('categoria')
        .order('ordem_exibicao');
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  const obterConfigTipo = (tipo: string): TipoTransacaoConfig | undefined => {
    return configCompleta?.find(config => config.tipo === tipo);
  };

  const ehCredito = (tipo: string): boolean => {
    const config = obterConfigTipo(tipo);
    return config?.sinal === 1;
  };

  const ehDebito = (tipo: string): boolean => {
    const config = obterConfigTipo(tipo);
    return config?.sinal === -1;
  };

  return {
    tiposCredito: tiposCredito || [],
    tiposDebito: tiposDebito || [],
    configCompleta: configCompleta || [],
    obterConfigTipo,
    ehCredito,
    ehDebito,
    isLoading: loadingCredito || loadingDebito || loadingConfig
  };
};
