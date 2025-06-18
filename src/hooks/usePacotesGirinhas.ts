
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

type PacoteGirinhas = Tables<'pacotes_girinhas'>;

export const usePacotesGirinhas = () => {
  const [pacotes, setPacotes] = useState<PacoteGirinhas[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingPacotes, setLoadingPacotes] = useState<Set<string>>(new Set()); // Loading por pacote
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const fetchPacotes = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('pacotes_girinhas')
        .select('*')
        .eq('ativo', true)
        .order('valor_girinhas', { ascending: true });

      if (fetchError) throw fetchError;

      setPacotes(data || []);
    } catch (err) {
      console.error('Erro ao buscar pacotes:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const comprarGirinhas = async (pacoteId: string) => {
    // Adicionar este pacote ao set de loading
    setLoadingPacotes(prev => new Set([...prev, pacoteId]));
    
    try {
      // Buscar dados do pacote
      const pacote = pacotes.find(p => p.id === pacoteId);
      if (!pacote) {
        throw new Error('Pacote não encontrado');
      }

      // Obter usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      console.log('Processando compra de Girinhas:', {
        pacoteId,
        valorGirinhas: pacote.valor_girinhas,
        valorReal: pacote.valor_real,
        userId: user.id
      });

      // Simular processamento de pagamento (sempre aprovado para demo)
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
        console.error('Erro ao criar compra:', compraError);
        throw compraError;
      }

      console.log('Compra criada com sucesso:', compra);

      // Adicionar Girinhas à carteira via transação (usando tipo 'compra')
      const { error: transacaoError } = await supabase
        .from('transacoes')
        .insert({
          user_id: user.id,
          tipo: 'compra',
          valor: pacote.valor_girinhas,
          quantidade_girinhas: pacote.valor_girinhas,
          descricao: `Compra de pacote: ${pacote.nome}`,
          cotacao_utilizada: 1.0000 // Cotação padrão para compras
        });

      if (transacaoError) {
        console.error('Erro ao criar transação:', transacaoError);
        throw transacaoError;
      }

      console.log('Transação criada com sucesso');

      // Forçar atualização imediata da carteira
      console.log('Invalidando queries da carteira...');
      
      // Invalidar todas as queries relacionadas
      await queryClient.invalidateQueries({ queryKey: ['carteira'] });
      await queryClient.invalidateQueries({ queryKey: ['transacoes'] });
      await queryClient.invalidateQueries({ queryKey: ['cotacao-girinhas'] });
      
      // Forçar refetch da carteira específica do usuário
      await queryClient.refetchQueries({ queryKey: ['carteira', user.id] });
      
      console.log('Queries invalidadas e refetch executado');

      toast({
        title: "💳 Compra realizada com sucesso!",
        description: `${pacote.valor_girinhas} Girinhas foram adicionadas à sua carteira!`,
      });

      return true;
    } catch (err) {
      console.error('Erro completo ao processar compra:', err);
      
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
      // Remover este pacote do set de loading
      setLoadingPacotes(prev => {
        const newSet = new Set(prev);
        newSet.delete(pacoteId);
        return newSet;
      });
    }
  };

  // Função para verificar se um pacote específico está carregando
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
