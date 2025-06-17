
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

type Filho = Tables<'filhos'>;
type EscolaSimplificada = {
  codigo_inep: number;
  escola: string;
  municipio: string;
  uf: string;
  categoria_administrativa: string;
};

interface FilhoComEscola extends Filho {
  escola?: EscolaSimplificada | null;
}

export const useFilhosPorEscola = () => {
  const { user } = useAuth();
  const [filhos, setFilhos] = useState<FilhoComEscola[]>([]);
  const [escolasDosMeusFilhos, setEscolasDosMeusFilhos] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      carregarFilhos();
    }
  }, [user]);

  const carregarFilhos = async () => {
    if (!user) return;

    try {
      const { data: filhosData, error } = await supabase
        .from('filhos')
        .select(`
          *,
          escolas_inep!filhos_escola_id_fkey (
            codigo_inep,
            escola,
            municipio,
            uf,
            categoria_administrativa
          )
        `)
        .eq('mae_id', user.id);

      if (error) throw error;

      const filhosComEscola = filhosData?.map(filho => ({
        ...filho,
        escola: filho.escolas_inep ? {
          codigo_inep: filho.escolas_inep.codigo_inep,
          escola: filho.escolas_inep.escola || '',
          municipio: filho.escolas_inep.municipio || '',
          uf: filho.escolas_inep.uf || '',
          categoria_administrativa: filho.escolas_inep.categoria_administrativa || ''
        } : null
      })) || [];

      setFilhos(filhosComEscola);

      // Extrair IDs das escolas dos filhos
      const escolasIds = filhosComEscola
        .filter(filho => filho.escola_id)
        .map(filho => filho.escola_id as number);

      setEscolasDosMeusFilhos([...new Set(escolasIds)]);
    } catch (error) {
      console.error('Erro ao carregar filhos:', error);
    } finally {
      setLoading(false);
    }
  };

  const temFilhoNaEscola = (escolaId: number) => {
    return escolasDosMeusFilhos.includes(escolaId);
  };

  const getEscolasDosMeusFilhos = () => {
    return filhos
      .filter(filho => filho.escola)
      .map(filho => filho.escola!)
      .filter((escola, index, array) => 
        array.findIndex(e => e.codigo_inep === escola.codigo_inep) === index
      );
  };

  return {
    filhos,
    escolasDosMeusFilhos,
    loading,
    temFilhoNaEscola,
    getEscolasDosMeusFilhos,
    refetch: carregarFilhos
  };
};
