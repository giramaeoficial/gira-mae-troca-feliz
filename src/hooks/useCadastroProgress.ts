
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CadastroProgress {
  step: string;
  status: 'incompleto' | 'completo';
  data?: any;
}

const STEP_ORDER = ['google', 'phone', 'code', 'personal', 'address'];

export const useCadastroProgress = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [progress, setProgress] = useState<CadastroProgress>({
    step: 'google',
    status: 'incompleto'
  });
  const [loading, setLoading] = useState(true);

  // Função para determinar o step correto baseado nos dados
  const determineCurrentStep = useCallback((profileData: any) => {
    if (!profileData) return 'google';
    
    // Se cadastro está completo
    if (profileData.cadastro_status === 'completo') {
      return 'complete';
    }

    // Lógica de detecção de step baseada nos dados preenchidos
    if (!profileData.telefone) {
      return 'phone';
    }
    
    if (profileData.telefone && !profileData.telefone_verificado) {
      return 'code';
    }
    
    if (profileData.telefone_verificado && !profileData.nome) {
      return 'personal';
    }
    
    if (profileData.nome && !profileData.endereco) {
      return 'address';
    }
    
    // Se chegou até aqui, cadastro deveria estar completo
    return 'address';
  }, []);

  const fetchProgress = useCallback(async () => {
    if (!user) {
      setProgress({
        step: 'google',
        status: 'incompleto'
      });
      setLoading(false);
      return;
    }

    try {
      console.log('🔄 Buscando progresso do cadastro para:', user.id);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('cadastro_status, cadastro_step, telefone, nome, endereco, telefone_verificado')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('❌ Erro ao buscar progresso:', error);
        
        if (error.code === 'PGRST116') {
          // Perfil não encontrado - usuário novo
          console.log('⚠️ Perfil não encontrado - usuário novo');
          setProgress({
            step: 'google',
            status: 'incompleto'
          });
          setLoading(false);
          return;
        }
        
        throw error;
      }

      console.log('📊 Dados do perfil encontrados:', data);
      
      // Determinar step atual baseado nos dados
      const currentStep = determineCurrentStep(data);
      
      console.log('✅ Step determinado:', {
        stepNoBanco: data.cadastro_step,
        stepDetectado: currentStep,
        dadosPreenchidos: {
          telefone: !!data.telefone,
          telefoneVerificado: !!data.telefone_verificado,
          nome: !!data.nome,
          endereco: !!data.endereco
        }
      });
      
      setProgress({
        step: currentStep,
        status: (data.cadastro_status as 'incompleto' | 'completo') || 'incompleto'
      });

      // Sincronizar step no banco se necessário
      if (currentStep !== data.cadastro_step && currentStep !== 'complete') {
        console.log('🔄 Sincronizando step no banco:', data.cadastro_step, '->', currentStep);
        
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ cadastro_step: currentStep })
          .eq('id', user.id);

        if (updateError) {
          console.error('⚠️ Erro ao sincronizar step:', updateError);
        }
      }

    } catch (error: any) {
      console.error('❌ Erro ao buscar progresso:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o progresso. Tente recarregar.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast, determineCurrentStep]);

  const updateProgress = useCallback(async (step: string, status?: 'incompleto' | 'completo') => {
    if (!user) {
      console.error('❌ Não é possível atualizar progresso sem usuário');
      return false;
    }

    try {
      console.log('🔄 Atualizando progresso:', { step, status: status || progress.status });
      
      const updateData: any = {
        cadastro_step: step
      };

      if (status) {
        updateData.cadastro_status = status;
      }
      
      const { error } = await supabase
        .from('profiles')
        .update(updateData)
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
      toast({
        title: "Erro",
        description: "Não foi possível salvar o progresso. Tente novamente.",
        variant: "destructive",
      });
      return false;
    }
  }, [user, progress.status, toast]);

  const completeStep = useCallback(async (currentStep: string, nextStep?: string) => {
    console.log('🔄 Completando step:', currentStep, '-> próximo:', nextStep);
    
    const currentIndex = STEP_ORDER.indexOf(currentStep);
    const next = nextStep || (currentIndex < STEP_ORDER.length - 1 ? STEP_ORDER[currentIndex + 1] : 'complete');
    
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

  // Carregar progresso na inicialização
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
