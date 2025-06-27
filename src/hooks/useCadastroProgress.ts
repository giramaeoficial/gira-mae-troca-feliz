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

  // Função para determinar o step correto baseado nos dados reais
  const determineCurrentStep = useCallback((profileData: any) => {
    if (!profileData) return 'google';
    
    // Se cadastro está completo
    if (profileData.cadastro_status === 'completo') {
      return 'address'; // Retorna o último step quando completo
    }

    // Lógica rigorosa baseada em dados verificados
    if (!profileData.telefone) {
      return 'phone';
    }
    
    // Se tem telefone mas não foi verificado, ir para code
    if (profileData.telefone && !profileData.telefone_verificado) {
      return 'code';
    }
    
    // Se telefone foi verificado mas não tem nome, ir para personal
    if (profileData.telefone_verificado && !profileData.nome) {
      return 'personal';
    }
    
    // Se tem nome mas não tem configurações de endereço, ir para address
    if (profileData.nome && (
      profileData.aceita_entrega_domicilio === null || 
      profileData.aceita_entrega_domicilio === undefined
    )) {
      return 'address';
    }
    
    // Se chegou até aqui, cadastro deveria estar completo
    return 'address'; // Retorna o último step
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
        .select(`
          cadastro_status, 
          cadastro_step, 
          telefone, 
          telefone_verificado,
          nome, 
          aceita_entrega_domicilio,
          verification_code_expires
        `)
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('❌ Erro ao buscar progresso:', error);
        
        if (error.code === 'PGRST116') {
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
      
      // Determinar step atual baseado nos dados REAIS
      const currentStep = determineCurrentStep(data);
      const isComplete = data.cadastro_status === 'completo';
      
      console.log('✅ Step determinado:', {
        stepNoBanco: data.cadastro_step,
        stepDetectado: currentStep,
        isComplete: isComplete,
        dadosVerificados: {
          telefone: !!data.telefone,
          telefoneVerificado: !!data.telefone_verificado,
          nome: !!data.nome,
          enderecoConfigurado: data.aceita_entrega_domicilio !== null
        }
      });
      
      setProgress({
        step: currentStep,
        status: isComplete ? 'completo' : 'incompleto'
      });

      // Sincronizar step no banco se necessário (mas não forçar se dados estão inconsistentes)
      if (currentStep !== data.cadastro_step && !isComplete) {
        console.log('🔄 Sincronizando step no banco:', data.cadastro_step, '->', currentStep);
        
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ 
            cadastro_step: currentStep,
            cadastro_status: isComplete ? 'completo' : 'incompleto'
          })
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
    
    // Validações específicas por step
    if (currentStep === 'phone') {
      // Para phone step, só avançar se telefone foi salvo
      try {
        const { data } = await supabase
          .from('profiles')
          .select('telefone')
          .eq('id', user?.id)
          .single();
        
        if (!data?.telefone) {
          console.error('❌ Telefone não foi salvo');
          return false;
        }
      } catch (error) {
        console.error('❌ Erro ao validar telefone:', error);
        return false;
      }
    }
    
    if (currentStep === 'code') {
      // Para code step, só avançar se telefone foi verificado
      try {
        const { data } = await supabase
          .from('profiles')
          .select('telefone_verificado')
          .eq('id', user?.id)
          .single();
        
        if (!data?.telefone_verificado) {
          console.error('❌ Telefone não foi verificado');
          return false;
        }
      } catch (error) {
        console.error('❌ Erro ao validar verificação:', error);
        return false;
      }
    }
    
    const currentIndex = STEP_ORDER.indexOf(currentStep);
    const next = nextStep || (currentIndex < STEP_ORDER.length - 1 ? STEP_ORDER[currentIndex + 1] : 'address');
    
    if (currentIndex === STEP_ORDER.length - 1 || next === currentStep) {
      console.log('✅ Cadastro completo!');
      return await updateProgress('address', 'completo');
    } else {
      console.log('➡️ Avançando para:', next);
      return await updateProgress(next);
    }
  }, [updateProgress, user]);

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
