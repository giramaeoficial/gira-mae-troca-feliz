
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ConfigSistema {
  taxa_transferencia: { percentual: number };
  taxa_transacao: { percentual: number };
  cotacao_min_max: { min: number; max: number };
  markup_emissao: { percentual: number };
  validade_girinhas: { meses: number };
  queima_por_transacao: { quantidade: number };
}

export const useConfigSistema = () => {
  const { data: config, isLoading, refetch } = useQuery({
    queryKey: ['config-sistema'],
    queryFn: async (): Promise<ConfigSistema> => {
      const { data, error } = await supabase
        .from('config_sistema')
        .select('chave, valor');

      if (error) throw error;

      // Converter array de configurações em objeto
      const configObj = data.reduce((acc, item) => {
        acc[item.chave] = item.valor;
        return acc;
      }, {} as any);

      return {
        taxa_transferencia: configObj.taxa_transferencia || { percentual: 1.0 },
        taxa_transacao: configObj.taxa_transacao || { percentual: 5.0 },
        cotacao_min_max: configObj.cotacao_min_max || { min: 0.80, max: 1.30 },
        markup_emissao: configObj.markup_emissao || { percentual: 30.0 },
        validade_girinhas: configObj.validade_girinhas || { meses: 12 },
        queima_por_transacao: configObj.queima_por_transacao || { quantidade: 1.0 }
      };
    },
    staleTime: 60000, // 1 minuto
    refetchInterval: 300000, // 5 minutos
  });

  const taxaTransferencia = config?.taxa_transferencia?.percentual || 1.0;
  const taxaTransacao = config?.taxa_transacao?.percentual || 5.0;

  return {
    config,
    taxaTransferencia,
    taxaTransacao,
    isLoadingConfig: isLoading,
    refetchConfig: refetch,
  };
};
