import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useConfigSistema } from '@/hooks/useConfigSistema';
import { useCarteira } from '@/hooks/useCarteira';

interface DadosTransferencia {
  destinatario_id: string;
  quantidade: number;
}

interface ResultadoTransferencia {
  sucesso: boolean;
  transferencia_id?: string;
  mensagem?: string;
  erro?: string;
}

export const useTransferenciaP2P = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { taxaTransferencia, isLoadingConfig } = useConfigSistema();
  const { saldo } = useCarteira();

  // Estados locais do formulário
  const [quantidade, setQuantidade] = useState('');
  const [usuarioSelecionado, setUsuarioSelecionado] = useState<any>(null);

  // Cálculos derivados
  const valorQuantidade = parseFloat(quantidade) || 0;
  const taxa = (valorQuantidade * taxaTransferencia) / 100;
  const valorLiquido = valorQuantidade - taxa;

  // Validações
  const podeTransferir = 
    usuarioSelecionado && 
    valorQuantidade > 0 && 
    valorQuantidade <= saldo &&
    !isLoadingConfig;

  const temSaldoSuficiente = valorQuantidade <= saldo;

  // Mutation para transferência
  const transferirMutation = useMutation({
    mutationFn: async (dados: DadosTransferencia): Promise<ResultadoTransferencia> => {
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Validações finais
      if (!dados.destinatario_id || !dados.quantidade) {
        throw new Error('Dados obrigatórios não informados');
      }

      if (dados.quantidade <= 0) {
        throw new Error('Quantidade deve ser maior que zero');
      }

      if (dados.quantidade > 10000) {
        throw new Error('Quantidade máxima: 10.000 Girinhas');
      }

      if (dados.quantidade > saldo) {
        throw new Error('Saldo insuficiente');
      }

      console.log('🔄 Iniciando transferência P2P:', dados);

      // Usar Edge Function que já implementa toda a lógica
      const { data: authData } = await supabase.auth.getSession();
      if (!authData.session?.access_token) {
        throw new Error('Sessão expirada. Faça login novamente.');
      }

      const response = await fetch('/functions/v1/transferir-p2p', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authData.session.access_token}`,
        },
        body: JSON.stringify({
          destinatario_id: dados.destinatario_id,
          quantidade: dados.quantidade
        })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Erro na transferência');
      }

      return result;
    },
    onSuccess: (resultado) => {
      // Limpar formulário
      setQuantidade('');
      setUsuarioSelecionado(null);

      // Invalidar apenas os caches necessários
      queryClient.invalidateQueries({ queryKey: ['carteira', user?.id] });

      // Toast de sucesso
      toast({
        title: "✅ Transferência realizada!",
        description: resultado.mensagem || `${valorQuantidade.toFixed(2)} Girinhas transferidas com sucesso.`,
      });

      console.log('✅ Transferência concluída:', resultado);
    },
    onError: (error: any) => {
      console.error('❌ Erro na transferência:', error);
      
      // Mapeamento de erros específicos
      let mensagemErro = "Erro na transferência. Tente novamente.";
      
      if (error.message?.includes('Saldo insuficiente')) {
        mensagemErro = "Saldo insuficiente para esta transferência.";
      } else if (error.message?.includes('não encontrado')) {
        mensagemErro = "Destinatário não encontrado.";
      } else if (error.message?.includes('Muitas transferências')) {
        mensagemErro = "Muitas transferências recentes. Aguarde um momento.";
      } else if (error.message?.includes('Sessão expirada')) {
        mensagemErro = "Sua sessão expirou. Faça login novamente.";
      } else if (error.message) {
        mensagemErro = error.message;
      }
      
      toast({
        title: "❌ Erro na transferência",
        description: mensagemErro,
        variant: "destructive",
      });
    },
  });

  // Função para executar transferência
  const executarTransferencia = () => {
    if (!usuarioSelecionado || !quantidade) {
      toast({
        title: "Dados incompletos",
        description: "Selecione um destinatário e informe a quantidade.",
        variant: "destructive",
      });
      return;
    }

    transferirMutation.mutate({
      destinatario_id: usuarioSelecionado.id,
      quantidade: valorQuantidade,
    });
  };

  // Função para limpar formulário
  const limparFormulario = () => {
    setQuantidade('');
    setUsuarioSelecionado(null);
  };

  return {
    // === DADOS DO FORMULÁRIO ===
    quantidade,
    setQuantidade,
    usuarioSelecionado, 
    setUsuarioSelecionado,

    // === CÁLCULOS ===
    valorQuantidade,
    taxa,
    valorLiquido,
    taxaPercentual: taxaTransferencia,

    // === VALIDAÇÕES ===
    podeTransferir,
    temSaldoSuficiente,
    saldoAtual: saldo,

    // === ESTADOS ===
    isTransferindo: transferirMutation.isPending,
    isLoadingConfig,

    // === AÇÕES ===
    executarTransferencia,
    limparFormulario,
  };
};