
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

type Escola = Tables<'escolas_inep'>;

interface UseEscolasReturn {
  escolas: Escola[];
  municipios: string[];
  loading: boolean;
  loadingMunicipios: boolean;
  error: string | null;
  buscarEscolas: (termo?: string, uf?: string, municipio?: string) => Promise<void>;
  buscarMunicipios: (uf: string) => Promise<void>;
  escolaSelecionada: Escola | null;
  selecionarEscola: (escola: Escola | null) => void;
}

export const useEscolas = (): UseEscolasReturn => {
  const [escolas, setEscolas] = useState<Escola[]>([]);
  const [municipios, setMunicipios] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMunicipios, setLoadingMunicipios] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [escolaSelecionada, setEscolaSelecionada] = useState<Escola | null>(null);

  const buscarMunicipios = useCallback(async (uf: string) => {
    if (!uf) {
      setMunicipios([]);
      return;
    }

    setLoadingMunicipios(true);
    setError(null);

    try {
      const { data, error: searchError } = await supabase
        .from('escolas_inep')
        .select('municipio')
        .eq('uf', uf)
        .not('municipio', 'is', null)
        .order('municipio');

      if (searchError) throw searchError;

      // Extrair municípios únicos
      const municipiosUnicos = Array.from(new Set(data?.map(item => item.municipio) || []));
      setMunicipios(municipiosUnicos);
    } catch (err) {
      console.error('Erro ao buscar municípios:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoadingMunicipios(false);
    }
  }, []);

  const buscarEscolas = useCallback(async (termo?: string, uf?: string, municipio?: string) => {
    // Agora só precisamos de estado e município
    if (!uf || !municipio) {
      setEscolas([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('escolas_inep')
        .select('*')
        .eq('uf', uf)
        .ilike('municipio', `%${municipio}%`)
        .limit(50); // Aumentamos o limite já que não temos filtro de nome

      // Se o termo for fornecido, aplicamos filtro adicional
      if (termo && termo.length >= 2) {
        query = query.ilike('escola', `%${termo}%`);
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
  }, []);

  const selecionarEscola = useCallback((escola: Escola | null) => {
    setEscolaSelecionada(escola);
    
    // Salvar no localStorage
    if (escola) {
      localStorage.setItem('ultimaEscolaFiltrada', JSON.stringify(escola));
    } else {
      localStorage.removeItem('ultimaEscolaFiltrada');
    }
  }, []);

  // Carregar escola do localStorage na inicialização
  useEffect(() => {
    const escolaSalva = localStorage.getItem('ultimaEscolaFiltrada');
    if (escolaSalva) {
      try {
        const escola = JSON.parse(escolaSalva);
        setEscolaSelecionada(escola);
      } catch (error) {
        console.error('Erro ao carregar escola do localStorage:', error);
        localStorage.removeItem('ultimaEscolaFiltrada');
      }
    }
  }, []);

  return {
    escolas,
    municipios,
    loading,
    loadingMunicipios,
    error,
    buscarEscolas,
    buscarMunicipios,
    escolaSelecionada,
    selecionarEscola
  };
};
