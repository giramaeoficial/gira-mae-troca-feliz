import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

// ====================================================================
// HOOK PARA GERENCIAR AVANÇO DE ONBOARDING STEPS
// ====================================================================

interface StepAdvanceResult {
  success: boolean;
  newStep: number;
  message: string;
}

export const useOnboardingStep = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // ====================================================================
  // MUTATION PARA COMPLETAR STEP DO WHATSAPP
  // ====================================================================
  const completeWhatsAppStep = useMutation({
    mutationFn: async (): Promise<StepAdvanceResult> => {
      if (!user?.id) {
        throw new Error('Usuário não autenticado');
      }

      const { data, error } = await supabase.rpc('complete_whatsapp_step', {
        p_user_id: user.id
      });

      if (error) {
        throw new Error(`Erro ao completar step WhatsApp: ${error.message}`);
      }

      return {
        success: data,
        newStep: 2,
        message: 'WhatsApp confirmado! Agora verifique o código.'
      };
    },
    onSuccess: (result) => {
      if (result.success) {
        // Invalidar cache do sistema de roteamento
        queryClient.invalidateQueries({ queryKey: ['rota-usuario'] });
        
        toast({
          title: "Sucesso!",
          description: result.message,
        });
      }
    },
    onError: (error: Error) => {
      console.error('❌ Erro ao completar step WhatsApp:', error);
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // ====================================================================
  // MUTATION PARA COMPLETAR STEP DO ENDERECO  
  // ====================================================================
  const completeEnderecoStep = useMutation({
    mutationFn: async (): Promise<StepAdvanceResult> => {
      if (!user?.id) {
        throw new Error('Usuário não autenticado');
      }

      const { data, error } = await supabase.rpc('complete_endereco_step', {
        p_user_id: user.id
      });

      if (error) {
        throw new Error(`Erro ao completar step endereço: ${error.message}`);
      }

      return {
        success: data,
        newStep: 4,
        message: 'Dados completos! Agora complete o ritual de mãe novata.'
      };
    },
    onSuccess: (result) => {
      if (result.success) {
        // Invalidar cache do sistema de roteamento
        queryClient.invalidateQueries({ queryKey: ['rota-usuario'] });
        
        toast({
          title: "Sucesso!",
          description: result.message,
        });
      }
    },
    onError: (error: Error) => {
      console.error('❌ Erro ao completar step endereço:', error);
      toast({
        title: "Erro", 
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // ====================================================================
  // FUNÇÃO PARA VERIFICAR STEP ATUAL
  // ====================================================================
  const getCurrentStep = async (): Promise<number> => {
    if (!user?.id) {
      return 1;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('onboarding_step')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('❌ Erro ao buscar step atual:', error);
        return 1;
      }

      return data?.onboarding_step || 1;
    } catch (error) {
      console.error('❌ Erro inesperado ao buscar step:', error);
      return 1;
    }
  };

  // ====================================================================
  // RETORNO DO HOOK
  // ====================================================================
  return {
    // Mutations
    completeWhatsAppStep: completeWhatsAppStep.mutate,
    completeEnderecoStep: completeEnderecoStep.mutate,
    
    // Loading states
    isCompletingWhatsApp: completeWhatsAppStep.isPending,
    isCompletingEndereco: completeEnderecoStep.isPending,
    
    // Utilitários
    getCurrentStep,
  };
};