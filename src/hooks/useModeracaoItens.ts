import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ItemModeracaoData {
  moderacao_id: string;
  moderacao_status: string;
  status: string;
  data_moderacao: string;
  item_id: string;
  titulo: string;
  descricao: string;
  categoria: string;
  subcategoria?: string;
  valor_girinhas: number;
  estado_conservacao: string;
  fotos?: string[];
  genero?: string;
  tamanho_valor?: string;
  tamanho_categoria?: string;
  primeira_foto: string | null;
  usuario_nome: string;
  usuario_id: string;
  data_publicacao: string;
  tem_denuncia: boolean;
  motivo_denuncia: string | null;
  total_denuncias: number;
  denuncia_id?: string;
  descricao_denuncia?: string;
  data_denuncia?: string;
}

export const useModeracaoItens = () => {
  const [itens, setItens] = useState<ItemModeracaoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchItensPendentes = async () => {
    try {
      setLoading(true);
      
      // Usar a nova view que prioriza itens denunciados
      const { data, error: directError } = await supabase
        .from('itens_moderacao_completa')
        .select('*');

      if (directError) throw directError;

      const itensFormatados: ItemModeracaoData[] = data?.map((item: any) => ({
        moderacao_id: item.moderacao_id,
        moderacao_status: item.moderacao_status,
        status: item.moderacao_status,
        data_moderacao: item.data_moderacao,
        item_id: item.item_id,
        titulo: item.titulo,
        descricao: item.descricao || '',
        categoria: item.categoria,
        subcategoria: item.subcategoria,
        valor_girinhas: item.valor_girinhas,
        estado_conservacao: item.estado_conservacao || 'usado',
        fotos: item.fotos,
        genero: item.genero,
        tamanho_valor: item.tamanho_valor,
        tamanho_categoria: item.tamanho_categoria,
        primeira_foto: item.primeira_foto,
        usuario_nome: item.usuario_nome,
        usuario_id: item.usuario_id || item.publicado_por,
        data_publicacao: item.data_publicacao,
        tem_denuncia: item.tem_denuncia,
        motivo_denuncia: item.motivo_denuncia,
        total_denuncias: item.total_denuncias,
        denuncia_id: item.denuncia_id,
        descricao_denuncia: item.descricao_denuncia,
        data_denuncia: item.data_denuncia
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

  const aceitarDenuncia = async (denunciaId: string, comentario: string = 'denuncia_procedente', observacoes?: string) => {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase.rpc('aceitar_denuncia', {
        p_denuncia_id: denunciaId,
        p_moderador_id: user.id,
        p_comentario: comentario,
        p_observacoes: observacoes
      });

      if (error) throw error;

      toast({
        title: "Denúncia aceita",
        description: "O item foi removido da plataforma.",
      });
      
      await fetchItensPendentes();
      return data;
    } catch (err: any) {
      toast({
        title: "Erro",
        description: "Falha ao aceitar denúncia: " + err.message,
        variant: "destructive",
      });
      throw err;
    }
  };

  const rejeitarDenuncia = async (denunciaId: string, observacoes?: string) => {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase.rpc('rejeitar_denuncia', {
        p_denuncia_id: denunciaId,
        p_moderador_id: user.id,
        p_observacoes: observacoes
      });

      if (error) throw error;

      toast({
        title: "Denúncia rejeitada",
        description: "O item foi mantido na plataforma.",
      });
      
      await fetchItensPendentes();
      return data;
    } catch (err: any) {
      toast({
        title: "Erro",
        description: "Falha ao rejeitar denúncia: " + err.message,
        variant: "destructive",
      });
      throw err;
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
    aceitarDenuncia,
    rejeitarDenuncia,
    refetch: fetchItensPendentes
  };
};