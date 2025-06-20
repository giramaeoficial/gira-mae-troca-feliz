
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface ConfigExtensao {
  ativo: boolean;
  percentual: number;
  dias: number;
}

interface ResultadoExtensao {
  sucesso: boolean;
  erro?: string;
  custo?: number;
  dias_adicionados?: number;
  nova_data_expiracao?: string;
  girinhas_salvas?: number;
}

interface PodeEstenderResponse {
  pode_estender: boolean;
  motivo: string;
}

export const useExtensaoValidadeSegura = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar configurações de extensão
  const { data: config } = useQuery({
    queryKey: ['extensao-validade-config'],
    queryFn: async (): Promise<ConfigExtensao> => {
      const { data, error } = await supabase
        .from('config_sistema')
        .select('chave, valor')
        .in('chave', ['extensao_validade_ativa', 'extensao_validade_percentual', 'extensao_validade_dias']);

      if (error) throw error;

      const configObj = data.reduce((acc, item) => {
        acc[item.chave] = item.valor;
        return acc;
      }, {} as any);

      return {
        ativo: configObj.extensao_validade_ativa?.ativo ?? true,
        percentual: configObj.extensao_validade_percentual?.percentual ?? 20,
        dias: configObj.extensao_validade_dias?.dias ?? 30
      };
    },
    staleTime: 60000, // 1 minuto
  });

  // Função para calcular custo de extensão
  const calcularCustoExtensao = (valorExpirando: number): number => {
    const percentual = config?.percentual ?? 20;
    return Math.max(Math.round(valorExpirando * (percentual / 100)), 1);
  };

  // Verificar se transação pode ser estendida
  const verificarPodeEstender = async (transacaoId: string): Promise<boolean> => {
    if (!user?.id) return false;
    
    const { data, error } = await supabase.rpc('pode_estender_transacao', {
      p_user_id: user.id,
      p_transacao_id: transacaoId
    });

    if (error) {
      console.error('Erro ao verificar se pode estender:', error);
      return false;
    }

    // Tratar o retorno como objeto e fazer type assertion segura
    const resultado = data as PodeEstenderResponse;
    return resultado?.pode_estender ?? false;
  };

  // Mutation para estender validade (usando função segura do backend)
  const estenderValidadeMutation = useMutation({
    mutationFn: async (transacaoId: string): Promise<ResultadoExtensao> => {
      if (!user?.id) throw new Error('Usuário não autenticado');
      if (!config?.ativo) throw new Error('Extensão de validade está desativada');

      console.log('🔒 [ExtensãoSegura] Chamando função segura do backend para transação:', transacaoId);

      const { data, error } = await supabase.rpc('estender_validade_girinhas_seguro', {
        p_user_id: user.id,
        p_transacao_id: transacaoId
      });

      if (error) {
        console.error('❌ Erro na extensão segura:', error);
        throw new Error(error.message || 'Erro ao estender validade');
      }

      console.log('✅ [ExtensãoSegura] Resultado do backend:', data);
      
      // Type assertion segura para o resultado
      return data as unknown as ResultadoExtensao;
    },
    onSuccess: (resultado) => {
      if (resultado.sucesso) {
        const diasExtensao = resultado.dias_adicionados ?? 30;
        const custoExtensao = resultado.custo ?? 0;
        const girinhasSalvas = resultado.girinhas_salvas ?? 0;
        
        toast({
          title: "✨ Validade Estendida com Segurança!",
          description: `${girinhasSalvas} Girinhas foram salvas por +${diasExtensao} dias! Custou ${custoExtensao} Girinha${custoExtensao !== 1 ? 's' : ''}.`,
        });

        // Invalidar queries relacionadas
        queryClient.invalidateQueries({ queryKey: ['girinhas-expiracao'] });
        queryClient.invalidateQueries({ queryKey: ['carteira'] });
      } else {
        toast({
          title: "Erro na Extensão",
          description: resultado.erro || "Não foi possível estender a validade.",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      console.error('❌ Erro na extensão:', error);
      toast({
        title: "Erro na Extensão",
        description: error.message || "Não foi possível estender a validade. Verifique seu saldo.",
        variant: "destructive",
      });
    }
  });

  return {
    config,
    calcularCustoExtensao,
    verificarPodeEstender,
    estenderValidade: estenderValidadeMutation.mutate,
    isExtendendo: estenderValidadeMutation.isPending,
    podeEstender: config?.ativo ?? false
  };
};
