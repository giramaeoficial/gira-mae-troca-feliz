
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PactoEntradaStatus {
  isCompleto: boolean;
  itensContribuidos: number;
  totalItensNecessarios: number;
  recompensaColetada: boolean;
  loading: boolean;
}

export const usePactoEntrada = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [status, setStatus] = useState<PactoEntradaStatus>({
    isCompleto: false,
    itensContribuidos: 0,
    totalItensNecessarios: 2,
    recompensaColetada: false,
    loading: true
  });

  const checkPactoStatus = async () => {
    if (!user) {
      setStatus(prev => ({ ...prev, loading: false }));
      return;
    }

    try {
      // Verificar quantos itens o usuário já publicou
      const { data: itens, error: itensError } = await supabase
        .from('itens')
        .select('id')
        .eq('publicado_por', user.id)
        .eq('status', 'disponivel');

      if (itensError) throw itensError;

      const itensContribuidos = itens?.length || 0;
      const isCompleto = itensContribuidos >= 2;

      // Verificar se já coletou a recompensa de entrada
      const { data: transacao, error: transacaoError } = await supabase
        .from('transacoes')
        .select('id')
        .eq('user_id', user.id)
        .eq('tipo', 'bonus_cadastro')
        .eq('descricao', 'Recompensa Pacto de Entrada');

      if (transacaoError && transacaoError.code !== 'PGRST116') throw transacaoError;

      const recompensaColetada = !!transacao?.length;

      setStatus({
        isCompleto,
        itensContribuidos,
        totalItensNecessarios: 2,
        recompensaColetada,
        loading: false
      });

    } catch (error) {
      console.error('Erro ao verificar pacto de entrada:', error);
      setStatus(prev => ({ ...prev, loading: false }));
    }
  };

  const coletarRecompensaPacto = async () => {
    if (!user || !status.isCompleto || status.recompensaColetada) {
      return false;
    }

    try {
      // Criar transação de bônus diretamente na tabela
      const { error } = await supabase
        .from('transacoes')
        .insert({
          user_id: user.id,
          tipo: 'bonus_cadastro',
          valor: 100,
          descricao: 'Recompensa Pacto de Entrada'
        });

      if (error) throw error;

      // Buscar carteira atual para fazer o incremento
      const { data: carteiraAtual, error: buscarError } = await supabase
        .from('carteiras')
        .select('saldo_atual, total_recebido')
        .eq('user_id', user.id)
        .single();

      if (buscarError && buscarError.code !== 'PGRST116') {
        throw buscarError;
      }

      if (carteiraAtual) {
        // Atualizar carteira existente
        const { error: updateError } = await supabase
          .from('carteiras')
          .update({
            saldo_atual: carteiraAtual.saldo_atual + 100,
            total_recebido: carteiraAtual.total_recebido + 100
          })
          .eq('user_id', user.id);

        if (updateError) throw updateError;
      } else {
        // Criar nova carteira
        const { error: insertError } = await supabase
          .from('carteiras')
          .insert({
            user_id: user.id,
            saldo_atual: 100,
            total_recebido: 100,
            total_gasto: 0
          });

        if (insertError) throw insertError;
      }

      toast({
        title: "🎊 Recompensa coletada!",
        description: "Você recebeu 100 Girinhas pelo seu pacto de entrada!",
      });

      setStatus(prev => ({ ...prev, recompensaColetada: true }));
      return true;
    } catch (error) {
      console.error('Erro ao coletar recompensa:', error);
      toast({
        title: "Erro",
        description: "Não foi possível coletar a recompensa. Tente novamente.",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    checkPactoStatus();
  }, [user]);

  return {
    status,
    coletarRecompensaPacto,
    refetch: checkPactoStatus
  };
};
