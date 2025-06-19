
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useRecompensas } from '@/components/recompensas/ProviderRecompensas';
import { Tables } from '@/integrations/supabase/types';

type CompraGirinhas = Tables<'compras_girinhas'> & {
  pacotes_girinhas?: {
    nome: string;
    valor_girinhas: number;
    desconto_percentual: number;
  } | null;
};

export const useComprasGirinhas = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { mostrarRecompensa } = useRecompensas();
  const [compras, setCompras] = useState<CompraGirinhas[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCompras = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('compras_girinhas')
        .select(`
          *,
          pacotes_girinhas (
            nome,
            valor_girinhas,
            desconto_percentual
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setCompras(data || []);
    } catch (err) {
      console.error('Erro ao buscar compras:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const simularCompra = async (pacoteId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      console.log('🛒 [useComprasGirinhas] Iniciando compra de pacote:', pacoteId);

      // Buscar dados do pacote
      const { data: pacote, error: pacoteError } = await supabase
        .from('pacotes_girinhas')
        .select('*')
        .eq('id', pacoteId)
        .single();

      if (pacoteError || !pacote) {
        throw new Error('Pacote não encontrado');
      }

      console.log('📦 [useComprasGirinhas] Pacote encontrado:', pacote);

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
        console.error('❌ Erro ao criar compra:', compraError);
        throw compraError;
      }

      console.log('✅ [useComprasGirinhas] Compra registrada:', compra);

      // Obter data de expiração configurada
      const { data: dataExpiracao } = await supabase.rpc('obter_data_expiracao');

      // Inserir transação diretamente (o trigger irá processar automaticamente)
      const { error: transacaoError } = await supabase
        .from('transacoes')
        .insert({
          user_id: user.id,
          tipo: 'compra',
          valor: pacote.valor_girinhas,
          descricao: `Compra de pacote: ${pacote.nome}`,
          data_expiracao: dataExpiracao
        });

      if (transacaoError) {
        console.error('❌ Erro ao criar transação:', transacaoError);
        throw transacaoError;
      }

      console.log('✅ [useComprasGirinhas] Transação criada - trigger processará automaticamente');

      // Mostrar celebração especial para compras
      const economiaTexto = pacote.desconto_percentual > 0 
        ? ` (Você economizou ${pacote.desconto_percentual}%!)` 
        : '';

      setTimeout(() => {
        mostrarRecompensa({
          tipo: 'cadastro', // Usando este tipo para ter estilo especial
          valor: pacote.valor_girinhas,
          descricao: `Parabéns pela compra do ${pacote.nome}!${economiaTexto} Agora você pode fazer trocas incríveis.`
        });
      }, 500);

      // Toast imediato
      toast({
        title: "💳 Compra realizada!",
        description: `${pacote.valor_girinhas} Girinhas adicionadas à sua carteira com validade de 12 meses!`,
      });

      // Recarregar dados
      await fetchCompras();
      
      return true;
    } catch (err) {
      console.error('❌ [useComprasGirinhas] Erro ao processar compra:', err);
      setError(err instanceof Error ? err.message : 'Erro ao processar compra');
      
      toast({
        title: "Erro na compra",
        description: "Não foi possível processar a compra. Tente novamente.",
        variant: "destructive",
      });
      
      return false;
    }
  };

  useEffect(() => {
    fetchCompras();
  }, [user]);

  return {
    compras,
    loading,
    error,
    refetch: fetchCompras,
    simularCompra
  };
};
