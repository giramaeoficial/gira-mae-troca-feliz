
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

type PacoteGirinhas = Tables<'pacotes_girinhas'>;

export const usePacotesGirinhas = () => {
  const [pacotes, setPacotes] = useState<PacoteGirinhas[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    fetchPacotes();
  }, []);

  return {
    pacotes,
    loading,
    error,
    refetch: fetchPacotes
  };
};
