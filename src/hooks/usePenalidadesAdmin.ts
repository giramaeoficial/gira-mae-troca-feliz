import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PenalidadeAdmin {
  id: string;
  usuario_id: string;
  tipo: string;
  nivel: number;
  motivo?: string;
  expira_em?: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
  // Dados do usuário
  profiles: {
    nome: string;
    email?: string;
    username?: string;
  };
}

export const usePenalidadesAdmin = () => {
  const [penalidades, setPenalidades] = useState<PenalidadeAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [applyingPenalty, setApplyingPenalty] = useState(false);
  const { toast } = useToast();

  const fetchPenalidades = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('penalidades_usuario')
        .select(`
          *,
          profiles!inner(nome, email, username)
        `)
        .eq('ativo', true)
        .gte('nivel', 2) // Apenas penalidades nível 2 e 3
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPenalidades(data || []);
    } catch (err) {
      console.error('Erro ao buscar penalidades:', err);
      toast({
        title: "Erro",
        description: "Erro ao carregar penalidades",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const removerPenalidade = async (penalidadeId: string) => {
    try {
      setRemovingId(penalidadeId);
      
      const { error } = await supabase
        .rpc('remover_penalidade', { p_penalidade_id: penalidadeId });

      if (error) throw error;

      // Remover da lista local
      setPenalidades(prev => prev.filter(p => p.id !== penalidadeId));
      
      toast({
        title: "Sucesso",
        description: "Penalidade removida com sucesso",
      });
    } catch (err) {
      console.error('Erro ao remover penalidade:', err);
      toast({
        title: "Erro", 
        description: "Erro ao remover penalidade",
        variant: "destructive"
      });
    } finally {
      setRemovingId(null);
    }
  };

  const aplicarPenalidade = async (dados: {
    usuario_id: string;
    tipo: string;
    nivel: number;
    motivo: string;
    duracao_dias?: number;
  }) => {
    try {
      setApplyingPenalty(true);
      
      const { error } = await supabase
        .rpc('aplicar_penalidade', {
          p_usuario_id: dados.usuario_id,
          p_tipo: dados.tipo,
          p_nivel: dados.nivel,
          p_motivo: dados.motivo,
          p_duracao_dias: dados.duracao_dias
        });

      if (error) throw error;

      // Refresh da lista
      await fetchPenalidades();
      
      toast({
        title: "Sucesso",
        description: "Penalidade aplicada com sucesso",
      });
    } catch (err) {
      console.error('Erro ao aplicar penalidade:', err);
      toast({
        title: "Erro",
        description: "Erro ao aplicar penalidade",
        variant: "destructive"
      });
    } finally {
      setApplyingPenalty(false);
    }
  };

  const limparPenalidadesExpiradas = async () => {
    try {
      const { data, error } = await supabase
        .rpc('limpar_penalidades_expiradas');

      if (error) throw error;

      if (data > 0) {
        await fetchPenalidades(); // Refresh da lista
        toast({
          title: "Sucesso",
          description: `${data} penalidade(s) expirada(s) removida(s)`,
        });
      } else {
        toast({
          title: "Info",
          description: "Nenhuma penalidade expirada encontrada",
        });
      }
    } catch (err) {
      console.error('Erro ao limpar penalidades:', err);
      toast({
        title: "Erro",
        description: "Erro ao limpar penalidades expiradas",
        variant: "destructive"
      });
    }
  };

  const getNivelTexto = (nivel: number) => {
    switch (nivel) {
      case 1: return 'Leve';
      case 2: return 'Médio';
      case 3: return 'Grave';
      default: return 'Desconhecido';
    }
  };

  const getCorNivel = (nivel: number) => {
    switch (nivel) {
      case 1: return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 2: return 'text-orange-600 bg-orange-50 border-orange-200';
      case 3: return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTipoTexto = (tipo: string) => {
    switch (tipo) {
      case 'item_rejeitado': return 'Item Rejeitado';
      case 'denuncia_falsa': return 'Denúncia Falsa';
      default: return tipo;
    }
  };

  // Auto-refresh a cada 2 minutos
  useEffect(() => {
    fetchPenalidades();
    const interval = setInterval(fetchPenalidades, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return {
    penalidades,
    loading,
    removingId,
    applyingPenalty,
    refetch: fetchPenalidades,
    removerPenalidade,
    aplicarPenalidade,
    limparPenalidadesExpiradas,
    getNivelTexto,
    getCorNivel,
    getTipoTexto
  };
};