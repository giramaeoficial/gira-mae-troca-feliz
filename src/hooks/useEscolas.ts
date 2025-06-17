
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

type Escola = Tables<'escolas_inep'>;

interface UseEscolasReturn {
  escolas: Escola[];
  loading: boolean;
  error: string | null;
  buscarEscolas: (termo: string, uf?: string, municipio?: string) => Promise<void>;
  escolaSelecionada: Escola | null;
  selecionarEscola: (escola: Escola | null) => void;
}

export const useEscolas = (): UseEscolasReturn => {
  const [escolas, setEscolas] = useState<Escola[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [escolaSelecionada, setEscolaSelecionada] = useState<Escola | null>(null);

  const buscarEscolas = async (termo: string, uf?: string, municipio?: string) => {
    if (termo.length < 3) {
      setEscolas([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('escolas_inep')
        .select('*')
        .or(`escola.ilike.%${termo}%,municipio.ilike.%${termo}%`)
        .limit(20);

      if (uf) {
        query = query.eq('uf', uf);
      }

      if (municipio) {
        query = query.ilike('municipio', `%${municipio}%`);
      }

      const { data, error: searchError } = await query;

      if (searchError) throw searchError;

      setEscolas(data || []);
    } catch (err) {
      console.error('Erro ao buscar escolas:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const selecionarEscola = (escola: Escola | null) => {
    setEscolaSelecionada(escola);
  };

  return {
    escolas,
    loading,
    error,
    buscarEscolas,
    escolaSelecionada,
    selecionarEscola
  };
};
