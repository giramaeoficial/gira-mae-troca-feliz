
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

type CompraGirinhas = Tables<'compras_girinhas'> & {
  pacotes_girinhas?: {
    nome: string;
    valor_girinhas: number;
  } | null;
};

export const useComprasGirinhas = () => {
  const { user } = useAuth();
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
            valor_girinhas
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
      // Simular ID de pagamento para demonstração
      const paymentId = `demo_${Date.now()}`;
      
      const { error } = await supabase
        .rpc('processar_compra_girinhas', {
          p_user_id: user.id,
          p_pacote_id: pacoteId,
          p_payment_id: paymentId
        });

      if (error) throw error;

      await fetchCompras();
      return true;
    } catch (err) {
      console.error('Erro ao processar compra:', err);
      setError(err instanceof Error ? err.message : 'Erro ao processar compra');
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
