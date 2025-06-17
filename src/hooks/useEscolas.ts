
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
      console.log('Buscando municípios para UF:', uf);
      
      // Buscar todos os municípios únicos do estado usando distinct
      const { data, error: searchError } = await supabase
        .from('escolas_inep')
        .select('municipio')
        .eq('uf', uf)
        .not('municipio', 'is', null)
        .not('municipio', 'eq', '')
        .order('municipio');

      if (searchError) {
        console.error('Erro na query:', searchError);
        throw searchError;
      }

      console.log('Dados retornados:', data?.length, 'registros');

      // Processar municípios únicos
      const municipiosUnicos = Array.from(
        new Set(
          data
            ?.map(item => item.municipio?.trim())
            .filter(municipio => municipio && municipio.length > 0)
            || []
        )
      ).sort();
      
      console.log(`Encontrados ${municipiosUnicos.length} municípios únicos para ${uf}`);
      console.log('Primeiros 10 municípios:', municipiosUnicos.slice(0, 10));
      
      // Verificar se Canoas está na lista
      const temCanoas = municipiosUnicos.some(m => m.toLowerCase().includes('canoas'));
      console.log('Canoas encontrado:', temCanoas);
      
      setMunicipios(municipiosUnicos);
    } catch (err) {
      console.error('Erro ao buscar municípios:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoadingMunicipios(false);
    }
  }, []);

  const buscarEscolas = useCallback(async (termo?: string, uf?: string, municipio?: string) => {
    if (!uf || !municipio) {
      setEscolas([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Buscando escolas para:', { uf, municipio, termo });
      
      let query = supabase
        .from('escolas_inep')
        .select('*')
        .eq('uf', uf)
        .eq('municipio', municipio)
        .limit(100);

      if (termo && termo.length >= 2) {
        query = query.ilike('escola', `%${termo}%`);
      }

      const { data, error: searchError } = await query;

      if (searchError) throw searchError;

      console.log(`Encontradas ${data?.length || 0} escolas em ${municipio}, ${uf}`);
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
