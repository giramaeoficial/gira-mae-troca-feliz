import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ItemModeracaoData {
  moderacao_id: string;
  moderacao_status: string;
  data_moderacao: string;
  item_id: string;
  titulo: string;
  categoria: string;
  valor_girinhas: number;
  primeira_foto: string | null;
  usuario_nome: string;
  data_publicacao: string;
  tem_denuncia: boolean;
  motivo_denuncia: string | null;
  total_denuncias: number;
}

export const useModeracaoItens = () => {
  const [itens, setItens] = useState<ItemModeracaoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchItensPendentes = async () => {
    try {
      setLoading(true);
      
      // Buscar itens para moderação
      const { data, error: directError } = await supabase
        .from('moderacao_itens')
        .select('*')
        .eq('status', 'pendente')
        .order('created_at', { ascending: false });

      if (directError) throw directError;

      const itensFormatados: ItemModeracaoData[] = data?.map((item: any) => ({
        moderacao_id: item.id,
        moderacao_status: item.status,
        data_moderacao: item.created_at,
        item_id: item.item_id,
        titulo: 'Item #' + item.item_id.slice(0, 8),
        categoria: 'roupas',
        valor_girinhas: 10,
        primeira_foto: null,
        usuario_nome: 'Usuário',
        data_publicacao: item.created_at,
        tem_denuncia: !!item.denuncia_id,
        motivo_denuncia: null,
        total_denuncias: 0
      })) || [];

      setItens(itensFormatados);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error('Erro ao buscar itens para moderação:', err);
    } finally {
      setLoading(false);
    }
  };

  const aprovarItem = async (moderacaoId: string) => {
    try {
      const { error } = await supabase
        .from('moderacao_itens')
        .update({
          status: 'aprovado',
          moderador_id: (await supabase.auth.getUser()).data.user?.id,
          moderado_em: new Date().toISOString(),
          observacoes: 'Item aprovado'
        })
        .eq('id', moderacaoId);

      if (error) throw error;

      toast({
        title: "Item aprovado",
        description: "O item foi aprovado e está disponível no feed.",
      });

      // Atualizar lista
      await fetchItensPendentes();
    } catch (err: any) {
      toast({
        title: "Erro",
        description: "Falha ao aprovar item: " + err.message,
        variant: "destructive",
      });
    }
  };

  const rejeitarItem = async (moderacaoId: string, comentario: string, observacoes?: string) => {
    try {
      const { error } = await supabase
        .from('moderacao_itens')
        .update({
          status: 'rejeitado',
          moderador_id: (await supabase.auth.getUser()).data.user?.id,
          moderado_em: new Date().toISOString(),
          comentario_predefinido: comentario,
          observacoes: observacoes || 'Item rejeitado'
        })
        .eq('id', moderacaoId);

      if (error) throw error;

      toast({
        title: "Item rejeitado",
        description: "O item foi rejeitado e removido do feed.",
      });

      // Atualizar lista
      await fetchItensPendentes();
    } catch (err: any) {
      toast({
        title: "Erro",
        description: "Falha ao rejeitar item: " + err.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchItensPendentes();
  }, []);

  return {
    itens,
    loading,
    error,
    aprovarItem,
    rejeitarItem,
    refetch: fetchItensPendentes
  };
};