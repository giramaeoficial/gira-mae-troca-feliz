
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CadastroProgress {
  step: string;
  status: 'incompleto' | 'completo';
  data?: any;
}

export const useCadastroProgress = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [progress, setProgress] = useState<CadastroProgress>({
    step: 'google',
    status: 'incompleto'
  });
  const [loading, setLoading] = useState(true);

  const fetchProgress = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('cadastro_status, cadastro_step')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      setProgress({
        step: data.cadastro_step || 'google',
        status: (data.cadastro_status as 'incompleto' | 'completo') || 'incompleto'
      });
    } catch (error) {
      console.error('Erro ao buscar progresso:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o progresso do cadastro.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const updateProgress = useCallback(async (step: string, status?: 'incompleto' | 'completo') => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          cadastro_step: step,
          cadastro_status: status || progress.status
        })
        .eq('id', user.id);

      if (error) throw error;

      setProgress(prev => ({
        ...prev,
        step,
        status: status || prev.status
      }));

      return true;
    } catch (error) {
      console.error('Erro ao atualizar progresso:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o progresso.",
        variant: "destructive",
      });
      return false;
    }
  }, [user, progress.status, toast]);

  const completeStep = useCallback(async (currentStep: string, nextStep?: string) => {
    const stepOrder = ['google', 'phone', 'code', 'personal', 'address'];
    const currentIndex = stepOrder.indexOf(currentStep);
    const next = nextStep || (currentIndex < stepOrder.length - 1 ? stepOrder[currentIndex + 1] : 'complete');
    
    if (next === 'complete') {
      return await updateProgress('complete', 'completo');
    } else {
      return await updateProgress(next);
    }
  }, [updateProgress]);

  const resetProgress = useCallback(async () => {
    return await updateProgress('google', 'incompleto');
  }, [updateProgress]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  return {
    progress,
    loading,
    updateProgress,
    completeStep,
    resetProgress,
    refetch: fetchProgress
  };
};
