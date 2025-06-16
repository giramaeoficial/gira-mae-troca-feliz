
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

type Indicacao = Tables<'indicacoes'>;

export const useIndicacoes = () => {
  const { user } = useAuth();
  const [indicacoes, setIndicacoes] = useState<Indicacao[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buscarMinhasIndicacoes = async () => {
    if (!user) return [];

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('indicacoes')
        .select(`
          *,
          profiles!indicacoes_indicado_id_fkey (
            id,
            nome,
            avatar_url,
            created_at
          )
        `)
        .eq('indicador_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setIndicacoes(data || []);
      return data || [];
    } catch (err) {
      console.error('Erro ao buscar indicações:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar indicações');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const registrarIndicacao = async (indicadoId: string) => {
    if (!user) return false;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('indicacoes')
        .insert({
          indicador_id: user.id,
          indicado_id: indicadoId
        });

      if (error) throw error;

      // Recarregar indicações
      await buscarMinhasIndicacoes();
      
      return true;
    } catch (err) {
      console.error('Erro ao registrar indicação:', err);
      setError(err instanceof Error ? err.message : 'Erro ao registrar indicação');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const obterEstatisticas = async () => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('indicacoes')
        .select(`
          *,
          profiles!indicacoes_indicado_id_fkey (
            id,
            nome,
            created_at
          )
        `)
        .eq('indicador_id', user.id);

      if (error) throw error;

      const items = data || [];
      
      return {
        totalIndicacoes: items.length,
        bonusCadastro: items.filter(item => 
          item.profiles && item.bonus_cadastro_pago
        ).length,
        bonusPrimeiroItem: items.filter(item => 
          item.profiles && item.bonus_primeiro_item_pago
        ).length,
        bonusPrimeiraCompra: items.filter(item => 
          item.profiles && item.bonus_primeira_compra_pago
        ).length,
        totalBonusRecebido: items.reduce((total, item) => {
          let bonus = 0;
          if (item.bonus_cadastro_pago) bonus += 2;
          if (item.bonus_primeiro_item_pago) bonus += 3;
          if (item.bonus_primeira_compra_pago) bonus += 5;
          return total + bonus;
        }, 0)
      };
    } catch (err) {
      console.error('Erro ao obter estatísticas:', err);
      return null;
    }
  };

  useEffect(() => {
    if (user) {
      buscarMinhasIndicacoes();
    }
  }, [user]);

  return {
    indicacoes,
    loading,
    error,
    buscarMinhasIndicacoes,
    registrarIndicacao,
    obterEstatisticas
  };
};
