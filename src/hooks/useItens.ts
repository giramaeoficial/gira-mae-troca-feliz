
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';
import { useAuth } from '@/hooks/useAuth';

type Item = Tables<'itens'>;

export const useItens = () => {
  const [itens, setItens] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const buscarItens = async () => {
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const buscarTodosItens = async () => {
    try {
      setLoading(true);
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
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar todos os itens:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const buscarMeusItens = async () => {
    if (!user?.id) return [];
    
    try {
      setLoading(true);
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
        .eq('publicado_por', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setItens(data || []);
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar meus itens:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const publicarItem = async (itemData: any, fotos?: File[]) => {
    try {
      setLoading(true);
      
      let fotosUrls: string[] = [];
      
      // Upload das fotos se existirem
      if (fotos && fotos.length > 0) {
        for (const foto of fotos) {
          const fileName = `${Date.now()}_${foto.name}`;
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('item-photos')
            .upload(fileName, foto);

          if (uploadError) {
            console.error('Erro no upload:', uploadError);
            continue;
          }

          const { data: urlData } = supabase.storage
            .from('item-photos')
            .getPublicUrl(uploadData.path);
          
          fotosUrls.push(urlData.publicUrl);
        }
      }

      const { error } = await supabase
        .from('itens')
        .insert({
          ...itemData,
          fotos: fotosUrls.length > 0 ? fotosUrls : null,
          publicado_por: user?.id
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Item publicado com sucesso!",
      });

      await buscarItens();
      return true;
    } catch (error) {
      console.error('Erro ao publicar item:', error);
      toast({
        title: "Erro",
        description: "Não foi possível publicar o item.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const atualizarItem = async (itemData: any, novasFotos?: File[]) => {
    try {
      setLoading(true);
      
      let fotosUrls: string[] = [];
      
      // Upload das novas fotos se existirem
      if (novasFotos && novasFotos.length > 0) {
        for (const foto of novasFotos) {
          const fileName = `${Date.now()}_${foto.name}`;
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('item-photos')
            .upload(fileName, foto);

          if (uploadError) {
            console.error('Erro no upload:', uploadError);
            continue;
          }

          const { data: urlData } = supabase.storage
            .from('item-photos')
            .getPublicUrl(uploadData.path);
          
          fotosUrls.push(urlData.publicUrl);
        }
      }

      // Buscar fotos existentes
      const { data: itemAtual } = await supabase
        .from('itens')
        .select('fotos')
        .eq('id', itemData.id)
        .single();

      const fotosExistentes = itemAtual?.fotos || [];
      const todasFotos = [...fotosExistentes, ...fotosUrls];

      const { error } = await supabase
        .from('itens')
        .update({
          ...itemData,
          fotos: todasFotos.length > 0 ? todasFotos : null
        })
        .eq('id', itemData.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Item atualizado com sucesso!",
      });

      await buscarItens();
      return true;
    } catch (error) {
      console.error('Erro ao atualizar item:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o item.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const editarItem = async (item: Tables<'itens'>) => {
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const buscarItemPorId = async (id: string) => {
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  return {
    itens,
    loading,
    buscarItens,
    buscarTodosItens,
    buscarMeusItens,
    publicarItem,
    atualizarItem,
    editarItem,
    buscarItemPorId
  };
};
