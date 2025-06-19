
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

type PacoteGirinhas = Tables<'pacotes_girinhas'>;

export const usePacotesGirinhasOptimized = () => {
  const [pacotes, setPacotes] = useState<PacoteGirinhas[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingPacotes, setLoadingPacotes] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const fetchPacotes = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 [usePacotesGirinhas] Buscando pacotes disponíveis...');

      const { data, error: fetchError } = await supabase
        .from('pacotes_girinhas')
        .select('*')
        .eq('ativo', true)
        .order('valor_girinhas', { ascending: true });

      if (fetchError) throw fetchError;

      console.log(`✅ [usePacotesGirinhas] ${data?.length || 0} pacotes carregados`);
      setPacotes(data || []);
    } catch (err) {
      console.error('❌ [usePacotesGirinhas] Erro ao buscar pacotes:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const comprarGirinhas = async (pacoteId: string) => {
    setLoadingPacotes(prev => new Set([...prev, pacoteId]));
    
    try {
      const pacote = pacotes.find(p => p.id === pacoteId);
      if (!pacote) {
        throw new Error('Pacote não encontrado');
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      console.log('💳 [usePacotesGirinhas] Processando compra:', {
        pacoteId,
        valorGirinhas: pacote.valor_girinhas,
        valorReal: pacote.valor_real,
        userId: user.id
      });

      const paymentId = `demo_${Date.now()}`;

      // Criar registro da compra
      const { data: compra, error: compraError } = await supabase
        .from('compras_girinhas')
        .insert({
          user_id: user.id,
          pacote_id: pacoteId,
          valor_pago: pacote.valor_real,
          girinhas_recebidas: pacote.valor_girinhas,
          status: 'aprovado',
          payment_id: paymentId
        })
        .select()
        .single();

      if (compraError) {
        console.error('❌ Erro ao criar compra:', compraError);
        throw compraError;
      }

      // Adicionar Girinhas à carteira
      const { error: transacaoError } = await supabase
        .from('transacoes')
        .insert({
          user_id: user.id,
          tipo: 'compra',
          valor: pacote.valor_girinhas,
          quantidade_girinhas: pacote.valor_girinhas,
          descricao: `Compra de pacote: ${pacote.nome}`,
          cotacao_utilizada: 1.0000
        });

      if (transacaoError) {
        console.error('❌ Erro ao criar transação:', transacaoError);
        throw transacaoError;
      }

      // OTIMIZAÇÃO CRUCIAL: Invalidar apenas a carteira específica do usuário
      console.log('🔄 [usePacotesGirinhas] Invalidando APENAS cache da carteira do usuário...');
      await queryClient.invalidateQueries({ 
        queryKey: ['carteira', user.id], 
        exact: true 
      });
      
      // NÃO invalidar queries gerais ou fazer refetch desnecessários
      console.log('✅ [usePacotesGirinhas] Cache invalidado com precisão');

      toast({
        title: "💳 Compra realizada com sucesso!",
        description: `${pacote.valor_girinhas} Girinhas foram adicionadas à sua carteira!`,
      });

      return true;
    } catch (err) {
      console.error('❌ [usePacotesGirinhas] Erro completo ao processar compra:', err);
      
      let errorMessage = "Não foi possível processar a compra.";
      
      if (err instanceof Error) {
        if (err.message.includes('constraint')) {
          errorMessage = "Erro interno do sistema. Tente novamente em alguns instantes.";
        } else if (err.message.includes('não autenticado')) {
          errorMessage = "Você precisa estar logado para comprar Girinhas.";
        } else {
          errorMessage = err.message;
        }
      }
      
      toast({
        title: "Erro na compra",
        description: errorMessage,
        variant: "destructive",
      });
      
      return false;
    } finally {
      setLoadingPacotes(prev => {
        const newSet = new Set(prev);
        newSet.delete(pacoteId);
        return newSet;
      });
    }
  };

  const isPacoteLoading = (pacoteId: string) => {
    return loadingPacotes.has(pacoteId);
  };

  useEffect(() => {
    fetchPacotes();
  }, []);

  return {
    pacotes,
    loading,
    error,
    comprarGirinhas,
    isPacoteLoading,
    refetch: fetchPacotes
  };
};
