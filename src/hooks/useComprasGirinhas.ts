
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

  // ✅ MIGRADO: Usar sistema V2 atômico para compras
  const simularCompra = async (pacoteId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      console.log('🛒 [useComprasGirinhas] Iniciando compra V2 de pacote:', pacoteId);

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

      // ✅ MIGRADO: Usar processar_compra_girinhas_v2 (sistema atômico)
      const { data: resultadoCompra, error: compraError } = await supabase.rpc('processar_compra_girinhas_v2', {
        p_dados: {
          user_id: user.id,
          quantidade: pacote.valor_girinhas,
          payment_id: `pacote_${pacoteId}_${Date.now()}`
        }
      });

      if (compraError) {
        console.error('❌ Erro na compra V2:', compraError);
        throw compraError;
      }

      const resultado = resultadoCompra as { sucesso: boolean; erro?: string; transacao_id?: string };
      
      if (!resultado.sucesso) {
        throw new Error(resultado.erro || 'Erro ao processar compra');
      }

      console.log('✅ [useComprasGirinhas] Compra V2 processada:', resultado);

      // Criar registro da compra no histórico
      const { error: registroError } = await supabase
        .from('compras_girinhas')
        .insert({
          user_id: user.id,
          pacote_id: pacoteId,
          valor_pago: pacote.valor_real,
          girinhas_recebidas: pacote.valor_girinhas,
          status: 'aprovado',
          payment_id: `pacote_${pacoteId}_${Date.now()}`
        });

      if (registroError) {
        console.error('❌ Erro ao registrar compra:', registroError);
        // Não falhar aqui pois a compra já foi processada
      }

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
      console.error('❌ [useComprasGirinhas] Erro ao processar compra V2:', err);
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
