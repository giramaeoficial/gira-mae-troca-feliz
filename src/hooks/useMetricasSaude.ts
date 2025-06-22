
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface MetricasSaude {
  cotacao_implicita: number;
  burn_rate: number;
  velocity: number;
  burn_por_mae_ativa: number;
  itens_no_teto: number;
  concentracao_saldo: number;
  dados_brutos: {
    reais_entrados_30d: number;
    girinhas_vivas: number;
    girinhas_queimadas_30d: number;
    girinhas_emitidas_30d: number;
    girinhas_trocadas_30d: number;
    maes_ativas_30d: number;
  };
}

export const useMetricasSaude = () => {
  const { 
    data: metricas, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['metricas-saude'],
    queryFn: async (): Promise<MetricasSaude> => {
      const { data, error } = await supabase.rpc('calcular_metricas_saude');
      if (error) throw error;
      return data as MetricasSaude;
    },
    staleTime: 30000, // 30 segundos
    refetchInterval: 60000, // 1 minuto
  });

  // Função para determinar status de saúde
  const getStatusSaude = (metrica: string, valor: number) => {
    const limites = {
      cotacao_implicita: { min: 0.90, max: 1.10, alertaMin: 0.85, alertaMax: 1.15 },
      burn_rate: { min: 4, max: 7, alertaMin: 3, alertaMax: 10 },
      velocity: { min: 0.30, max: 0.60, alertaMin: 0.20, alertaMax: 0.80 },
      burnPorMaeAtiva: { estavel: true, variacaoMax: 20 },
      itens_no_teto: { max: 40, alerta: 50 },
      concentracao_saldo: { max: 25, alerta: 30 }
    };

    const limite = limites[metrica as keyof typeof limites];
    
    if (metrica === 'cotacao_implicita') {
      if (valor >= limite.min && valor <= limite.max) return 'saudavel';
      if (valor >= limite.alertaMin && valor <= limite.alertaMax) return 'alerta';
      return 'critico';
    }
    
    if (metrica === 'burn_rate' || metrica === 'velocity') {
      if (valor >= limite.min && valor <= limite.max) return 'saudavel';
      if (valor >= limite.alertaMin && valor <= limite.alertaMax) return 'alerta';
      return 'critico';
    }
    
    if (metrica === 'itens_no_teto' || metrica === 'concentracao_saldo') {
      if (valor <= limite.max) return 'saudavel';
      if (valor <= limite.alerta) return 'alerta';
      return 'critico';
    }
    
    return 'saudavel';
  };

  return {
    metricas,
    isLoading,
    error,
    refetch,
    getStatusSaude,
  };
};
