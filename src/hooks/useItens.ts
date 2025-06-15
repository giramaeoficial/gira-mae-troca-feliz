
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

type Item = Tables<'itens'>;

export const useItens = () => {
  const { user } = useAuth();
  const [itens, setItens] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buscarItens = async (filtros?: {
    categoria?: string;
    busca?: string;
    tamanho?: string;
    valorMin?: number;
    valorMax?: number;
  }) => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('itens')
        .select(`
          *,
          profiles!publicado_por (
            id,
            nome,
            avatar_url,
            bairro,
            cidade,
            reputacao
          )
        `)
        .eq('status', 'disponivel')
        .order('created_at', { ascending: false });

      // Aplicar filtros
      if (filtros?.categoria && filtros.categoria !== 'todos') {
        query = query.eq('categoria', filtros.categoria);
      }

      if (filtros?.busca) {
        query = query.or(`titulo.ilike.%${filtros.busca}%,descricao.ilike.%${filtros.busca}%`);
      }

      if (filtros?.tamanho) {
        query = query.eq('tamanho', filtros.tamanho);
      }

      if (filtros?.valorMin !== undefined) {
        query = query.gte('valor_girinhas', filtros.valorMin);
      }

      if (filtros?.valorMax !== undefined) {
        query = query.lte('valor_girinhas', filtros.valorMax);
      }

      // Excluir itens do próprio usuário se estiver logado
      if (user) {
        query = query.neq('publicado_por', user.id);
      }

      const { data, error } = await query;

      if (error) throw error;

      setItens(data || []);
      return data || [];
    } catch (err) {
      console.error('Erro ao buscar itens:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar itens');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const buscarMeusItens = async () => {
    if (!user) return [];

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('itens')
        .select('*')
        .eq('publicado_por', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (err) {
      console.error('Erro ao buscar meus itens:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar meus itens');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const buscarItensDoUsuario = async (usuarioId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('itens')
        .select('*')
        .eq('publicado_por', usuarioId)
        .eq('status', 'disponivel')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (err) {
      console.error('Erro ao buscar itens do usuário:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar itens do usuário');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const buscarItemPorId = async (itemId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('itens')
        .select(`
          *,
          profiles!publicado_por (
            id,
            nome,
            avatar_url,
            bairro,
            cidade,
            reputacao,
            telefone
          )
        `)
        .eq('id', itemId)
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Erro ao buscar item:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar item');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const publicarItem = async (novoItem: {
    titulo: string;
    descricao: string;
    categoria: string;
    tamanho?: string;
    estado_conservacao: string;
    valor_girinhas: number;
    fotos?: string[];
  }) => {
    if (!user) return false;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('itens')
        .insert({
          ...novoItem,
          publicado_por: user.id
        });

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Erro ao publicar item:', err);
      setError(err instanceof Error ? err.message : 'Erro ao publicar item');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const atualizarItem = async (itemId: string, updates: Partial<Item>) => {
    if (!user) return false;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('itens')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', itemId)
        .eq('publicado_por', user.id); // Garantir que só o dono pode editar

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Erro ao atualizar item:', err);
      setError(err instanceof Error ? err.message : 'Erro ao atualizar item');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deletarItem = async (itemId: string) => {
    if (!user) return false;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('itens')
        .delete()
        .eq('id', itemId)
        .eq('publicado_por', user.id); // Garantir que só o dono pode deletar

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Erro ao deletar item:', err);
      setError(err instanceof Error ? err.message : 'Erro ao deletar item');
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    buscarItens();
  }, [user]);

  return {
    itens,
    loading,
    error,
    buscarItens,
    buscarMeusItens,
    buscarItensDoUsuario,
    buscarItemPorId,
    publicarItem,
    atualizarItem,
    deletarItem
  };
};
