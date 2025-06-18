
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
  const [isComprandoGirinhas, setIsComprandoGirinhas] = useState(false);
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
    setIsComprandoGirinhas(true);
    try {
      // Buscar dados do pacote
      const pacote = pacotes.find(p => p.id === pacoteId);
      if (!pacote) {
        throw new Error('Pacote não encontrado');
      }

      // Simular processamento de pagamento (sempre aprovado para demo)
      const paymentId = `demo_${Date.now()}`;

      // Obter usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

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

      if (compraError) throw compraError;

      // Adicionar Girinhas à carteira via transação
      const { error: transacaoError } = await supabase
        .from('transacoes')
        .insert({
          user_id: user.id,
          tipo: 'compra',
          valor: pacote.valor_girinhas,
          quantidade_girinhas: pacote.valor_girinhas,
          descricao: `Compra de pacote: ${pacote.nome}`
        });

      if (transacaoError) throw transacaoError;

      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['carteira'] });
      queryClient.invalidateQueries({ queryKey: ['transacoes'] });
      queryClient.invalidateQueries({ queryKey: ['cotacao-girinhas'] });

      toast({
        title: "💳 Compra realizada!",
        description: `${pacote.valor_girinhas} Girinhas adicionadas à sua carteira!`,
      });

      return true;
    } catch (err) {
      console.error('Erro ao processar compra:', err);
      toast({
        title: "Erro na compra",
        description: err instanceof Error ? err.message : "Não foi possível processar a compra.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsComprandoGirinhas(false);
    }
  };

  useEffect(() => {
    fetchPacotes();
  }, []);

  return {
    pacotes,
    loading,
    error,
    isComprandoGirinhas,
    comprarGirinhas,
    refetch: fetchPacotes
  };
};
