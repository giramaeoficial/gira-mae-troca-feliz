
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
      console.log('🔄 Buscando progresso do cadastro para:', user.id);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('cadastro_status, cadastro_step')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('❌ Erro ao buscar progresso:', error);
        throw error;
      }

      console.log('✅ Progresso encontrado:', data);
      
      setProgress({
        step: data.cadastro_step || 'google',
        status: (data.cadastro_status as 'incompleto' | 'completo') || 'incompleto'
      });
    } catch (error: any) {
      console.error('❌ Erro ao buscar progresso:', error);
      
      // FASE 3: Tratamento de erro melhorado
      if (error.code === 'PGRST116') {
        // Perfil não encontrado - pode ser usuário novo
        console.log('⚠️ Perfil não encontrado - usuário novo?');
        setProgress({
          step: 'google',
          status: 'incompleto'
        });
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível carregar o progresso do cadastro. Tente recarregar a página.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const updateProgress = useCallback(async (step: string, status?: 'incompleto' | 'completo') => {
    if (!user) {
      console.error('❌ Não é possível atualizar progresso sem usuário');
      return false;
    }

    try {
      console.log('🔄 Atualizando progresso:', { step, status: status || progress.status });
      
      const { error } = await supabase
        .from('profiles')
        .update({
          cadastro_step: step,
          cadastro_status: status || progress.status
        })
        .eq('id', user.id);

      if (error) {
        console.error('❌ Erro ao atualizar progresso:', error);
        throw error;
      }

      console.log('✅ Progresso atualizado com sucesso');
      
      setProgress(prev => ({
        ...prev,
        step,
        status: status || prev.status
      }));

      return true;
    } catch (error: any) {
      console.error('❌ Erro ao atualizar progresso:', error);
      
      // FASE 3: Tratamento de erro com retry automático
      if (error.code === 'PGRST116') {
        toast({
          title: "Erro de sincronização",
          description: "Tente novamente em alguns segundos.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível salvar o progresso. Tente novamente.",
          variant: "destructive",
        });
      }
      return false;
    }
  }, [user, progress.status, toast]);

  const completeStep = useCallback(async (currentStep: string, nextStep?: string) => {
    console.log('🔄 Completando step:', currentStep, '-> próximo:', nextStep);
    
    const stepOrder = ['google', 'phone', 'code', 'personal', 'address'];
    const currentIndex = stepOrder.indexOf(currentStep);
    const next = nextStep || (currentIndex < stepOrder.length - 1 ? stepOrder[currentIndex + 1] : 'complete');
    
    if (next === 'complete') {
      console.log('✅ Cadastro completo!');
      return await updateProgress('complete', 'completo');
    } else {
      console.log('➡️ Avançando para:', next);
      return await updateProgress(next);
    }
  }, [updateProgress]);

  const resetProgress = useCallback(async () => {
    console.log('🔄 Resetando progresso do cadastro');
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
