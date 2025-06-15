import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';

type Item = Tables<'itens'>;

export const useItens = () => {
  const [itens, setItens] = useState<Item[]>([]);
  const { toast } = useToast();

  const buscarItens = async () => {
    try {
      const { data, error } = await supabase
        .from('itens')
        .select(`
          *,
          profiles:publicado_por (
            id,
            nome,
            avatar_url,
            bairro,
            cidade,
            reputacao
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setItens(data || []);
    } catch (error) {
      console.error('Erro ao buscar itens:', error);
    }
  };

  const publicarItem = async (item: Tables<'itens'>) => {
    try {
      const { error } = await supabase
        .from('itens')
        .insert(item);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Item publicado com sucesso!",
      });

      await buscarItens();
    } catch (error) {
      console.error('Erro ao publicar item:', error);
      toast({
        title: "Erro",
        description: "Não foi possível publicar o item.",
        variant: "destructive",
      });
    }
  };

  const editarItem = async (item: Tables<'itens'>) => {
    try {
      const { error } = await supabase
        .from('itens')
        .update(item)
        .eq('id', item.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Item editado com sucesso!",
      });

      await buscarItens();
    } catch (error) {
      console.error('Erro ao editar item:', error);
      toast({
        title: "Erro",
        description: "Não foi possível editar o item.",
        variant: "destructive",
      });
    }
  };

  const buscarItemPorId = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('itens')
        .select(`
          *,
          profiles:publicado_por (
            id,
            nome,
            avatar_url,
            bairro,
            cidade,
            reputacao
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao buscar item:', error);
      return null;
    }
  };

  return {
    itens,
    buscarItens,
    publicarItem,
    editarItem,
    buscarItemPorId
  };
};
