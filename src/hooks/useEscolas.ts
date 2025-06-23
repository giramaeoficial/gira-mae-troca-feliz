
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

// Use the proper Supabase type for schools
export type Escola = Tables<'escolas_inep'>;

interface UseEscolasParams {
  searchTerm?: string;
  uf?: string;
  municipio?: string;
}

export const useEscolas = (params?: UseEscolasParams) => {
  const [escolas, setEscolas] = useState<Escola[]>([]);
  const [municipios, setMunicipios] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMunicipios, setLoadingMunicipios] = useState(false);

  // Query para buscar escolas automaticamente se os parâmetros estão presentes
  const queryResult = useQuery({
    queryKey: ['escolas', params],
    queryFn: async () => {
      let query = supabase
        .from('escolas_inep')
        .select('codigo_inep, escola, uf, municipio, endereco, categoria_administrativa')
        .order('escola')
        .limit(1000);

      // Aplicar filtros se fornecidos
      if (params?.uf) {
        query = query.eq('uf', params.uf);
      }

      if (params?.municipio) {
        query = query.eq('municipio', params.municipio);
      }

      if (params?.searchTerm && params.searchTerm.length >= 3) {
        query = query.ilike('escola', `%${params.searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Escola[];
    },
    enabled: !!(params?.searchTerm && params.searchTerm.length >= 3)
  });

  const buscarEscolas = async (nome: string, estado: string, cidade: string) => {
    if (!estado || !cidade || nome.length < 3) return;
    
    setLoading(true);
    try {
      let query = supabase
        .from('escolas_inep')
        .select('codigo_inep, escola, uf, municipio, endereco, categoria_administrativa')
        .eq('uf', estado)
        .eq('municipio', cidade)
        .order('escola')
        .limit(100);

      if (nome) {
        query = query.ilike('escola', `%${nome}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao buscar escolas:', error);
        return;
      }

      setEscolas(data || []);
    } catch (error) {
      console.error('Erro ao buscar escolas:', error);
    } finally {
      setLoading(false);
    }
  };

  const buscarMunicipios = async (estado: string) => {
    if (!estado) return;
    
    setLoadingMunicipios(true);
    try {
      const { data, error } = await supabase
        .from('escolas_inep')
        .select('municipio')
        .eq('uf', estado)
        .order('municipio');

      if (error) {
        console.error('Erro ao buscar municípios:', error);
        return;
      }

      // Extrair municípios únicos
      const municipiosUnicos = [...new Set(data?.map(item => item.municipio).filter(Boolean))];
      setMunicipios(municipiosUnicos);
    } catch (error) {
      console.error('Erro ao buscar municípios:', error);
    } finally {
      setLoadingMunicipios(false);
    }
  };

  return {
    escolas: queryResult.data || escolas,
    isLoading: queryResult.isLoading,
    municipios,
    loading,
    loadingMunicipios,
    buscarEscolas,
    buscarMunicipios
  };
};
