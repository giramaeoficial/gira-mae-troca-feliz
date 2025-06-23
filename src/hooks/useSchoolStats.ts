
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SchoolStats {
  [codigo_inep: number]: number;
}

export const useSchoolStats = () => {
  const [schoolStats, setSchoolStats] = useState<SchoolStats>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarEstatisticasEscolas();
  }, []);

  const carregarEstatisticasEscolas = async () => {
    try {
      // Buscar quantidade de mães por escola
      const { data, error } = await supabase
        .from('filhos')
        .select('escola_id, mae_id')
        .not('escola_id', 'is', null);

      if (error) throw error;

      // Contar mães únicas por escola
      const stats: SchoolStats = {};
      data?.forEach(filho => {
        if (filho.escola_id) {
          if (!stats[filho.escola_id]) {
            stats[filho.escola_id] = new Set();
          }
          stats[filho.escola_id].add(filho.mae_id);
        }
      });

      // Converter Sets para contadores
      const finalStats: SchoolStats = {};
      Object.keys(stats).forEach(escolaId => {
        finalStats[parseInt(escolaId)] = stats[parseInt(escolaId)].size;
      });

      setSchoolStats(finalStats);
    } catch (error) {
      console.error('Erro ao carregar estatísticas das escolas:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMaesNaEscola = (codigoInep: number): number => {
    return schoolStats[codigoInep] || 0;
  };

  return {
    schoolStats,
    loading,
    getMaesNaEscola,
    refetch: carregarEstatisticasEscolas
  };
};
