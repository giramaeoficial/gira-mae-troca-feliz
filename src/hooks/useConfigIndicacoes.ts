
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

export const useConfigIndicacoes = () => {
  const [configuracoes, setConfiguracoes] = useState<ConfiguracaoBonus[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchConfiguracoes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('configuracoes_bonus')
        .select('*')
        .in('tipo_bonus', [
          'indicacao_cadastro',
          'indicacao_primeiro_item', 
          'indicacao_primeira_compra',
          'bonus_cadastro_indicado'
        ])
        .order('tipo_bonus');

      if (error) throw error;
      setConfiguracoes(data || []);
    } catch (error) {
      console.error('Erro ao buscar configurações:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as configurações de indicação.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const atualizarConfiguracao = async (id: string, valor: number, ativo: boolean) => {
    try {
      // Validar valor
      if (valor < 0 || valor > 100) {
        toast({
          title: "Erro de Validação",
          description: "O valor deve estar entre 0 e 100 Girinhas.",
          variant: "destructive",
        });
        return false;
      }

      const { error } = await supabase
        .from('configuracoes_bonus')
        .update({ 
          valor_girinhas: valor,
          ativo: ativo,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Configuração atualizada com sucesso!",
      });

      // Recarregar dados
      await fetchConfiguracoes();
      return true;
    } catch (error) {
      console.error('Erro ao atualizar:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a configuração.",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchConfiguracoes();
  }, []);

  return {
    configuracoes,
    loading,
    atualizarConfiguracao,
    refetch: fetchConfiguracoes
  };
};
