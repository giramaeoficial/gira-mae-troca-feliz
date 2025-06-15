
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ConfiguracaoBonus {
  id: string;
  tipo_bonus: string;
  valor_girinhas: number;
  descricao: string;
  ativo: boolean;
}

export const useConfiguracoesBonus = () => {
  const [configuracoes, setConfiguracoes] = useState<ConfiguracaoBonus[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchConfiguracoes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('configuracoes_bonus')
        .select('*')
        .order('tipo_bonus');

      if (error) throw error;
      setConfiguracoes(data || []);
    } catch (error) {
      console.error('Erro ao buscar configurações:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as configurações.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const obterValorBonus = (tipo: string): number => {
    const config = configuracoes.find(c => c.tipo_bonus === tipo && c.ativo);
    return config?.valor_girinhas || 0;
  };

  useEffect(() => {
    fetchConfiguracoes();
  }, []);

  return {
    configuracoes,
    loading,
    obterValorBonus,
    refetch: fetchConfiguracoes
  };
};
