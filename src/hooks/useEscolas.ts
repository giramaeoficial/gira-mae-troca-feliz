
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Escola {
  codigo_inep: number;
  escola: string;
  uf: string;
  municipio: string;
  endereco: string;
  categoria_administrativa?: string;
}

export const useEscolas = () => {
  const [municipios, setMunicipios] = useState<string[]>([]);
  const [loadingMunicipios, setLoadingMunicipios] = useState(false);
  const [escolas, setEscolas] = useState<Escola[]>([]);
  const [loading, setLoading] = useState(false);

  const { data: escolasData = [], isLoading } = useQuery({
    queryKey: ['escolas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('escolas_inep')
        .select('codigo_inep, escola, uf, municipio, endereco, categoria_administrativa')
        .limit(1000)
        .order('escola');

      if (error) throw error;
      return data as Escola[];
    }
  });

  const buscarMunicipios = async (estado: string) => {
    setLoadingMunicipios(true);
    try {
      const { data, error } = await supabase
        .from('escolas_inep')
        .select('municipio')
        .eq('uf', estado)
        .order('municipio');

      if (error) throw error;

      // Remover duplicatas
      const municipiosUnicos = [...new Set(data.map(item => item.municipio))];
      setMunicipios(municipiosUnicos);
    } catch (error) {
      console.error('Erro ao buscar municípios:', error);
      setMunicipios([]);
    } finally {
      setLoadingMunicipios(false);
    }
  };

  const buscarEscolas = async (nome: string, estado: string, cidade: string) => {
    setLoading(true);
    try {
      let query = supabase
        .from('escolas_inep')
        .select('codigo_inep, escola, uf, municipio, endereco, categoria_administrativa')
        .eq('uf', estado)
        .eq('municipio', cidade)
        .order('escola')
        .limit(50);

      if (nome && nome.length >= 3) {
        query = query.ilike('escola', `%${nome}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setEscolas(data as Escola[]);
    } catch (error) {
      console.error('Erro ao buscar escolas:', error);
      setEscolas([]);
    } finally {
      setLoading(false);
    }
  };

  return {
    escolas: escolas.length > 0 ? escolas : escolasData,
    isLoading,
    municipios,
    loading,
    loadingMunicipios,
    buscarEscolas,
    buscarMunicipios
  };
};
