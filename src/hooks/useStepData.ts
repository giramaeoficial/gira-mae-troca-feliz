
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const useStepData = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const saveStepData = useCallback(async (step: string, data: any) => {
    if (!user) return false;

    try {
      setLoading(true);
      console.log('💾 Salvando dados do step:', step, data);

      const { error } = await supabase.rpc('save_step_data', {
        p_step: step,
        p_data: data
      });

      if (error) {
        console.error('❌ Erro ao salvar dados do step:', error);
        return false;
      }

      console.log('✅ Dados do step salvos com sucesso');
      return true;
    } catch (error) {
      console.error('❌ Erro ao salvar dados do step:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const getStepData = useCallback(async (step: string) => {
    if (!user) return {};

    try {
      setLoading(true);
      console.log('📋 Carregando dados do step:', step);

      const { data, error } = await supabase.rpc('get_step_data', {
        p_step: step
      });

      if (error) {
        console.error('❌ Erro ao carregar dados do step:', error);
        return {};
      }

      console.log('✅ Dados do step carregados:', data);
      return data || {};
    } catch (error) {
      console.error('❌ Erro ao carregar dados do step:', error);
      return {};
    } finally {
      setLoading(false);
    }
  }, [user]);

  const clearStepData = useCallback(async (step: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('cadastro_temp_data')
        .delete()
        .eq('user_id', user.id)
        .eq('step', step);

      if (error) {
        console.error('❌ Erro ao limpar dados do step:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('❌ Erro ao limpar dados do step:', error);
      return false;
    }
  }, [user]);

  const clearAllStepData = useCallback(async () => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('cadastro_temp_data')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        console.error('❌ Erro ao limpar todos os dados dos steps:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('❌ Erro ao limpar todos os dados dos steps:', error);
      return false;
    }
  }, [user]);

  return {
    saveStepData,
    getStepData,
    clearStepData,
    clearAllStepData,
    loading
  };
};
