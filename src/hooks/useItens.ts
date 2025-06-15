
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';

type Item = Tables<'itens'>;
type NovoItem = Omit<TablesInsert<'itens'>, 'publicado_por' | 'id' | 'created_at' | 'updated_at'>;

export const useItens = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const uploadImage = async (file: File): Promise<string | null> => {
    if (!user) return null;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('item-photos')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('item-photos')
        .getPublicUrl(data.path);

      return publicUrl;
    } catch (error) {
      console.error('Erro ao fazer upload da imagem:', error);
      return null;
    }
  };

  const publicarItem = async (itemData: NovoItem, imagens: File[]): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para publicar um item.",
        variant: "destructive",
      });
      return false;
    }

    try {
      setLoading(true);

      // Upload das imagens
      const fotosUrls: string[] = [];
      for (const imagem of imagens) {
        const url = await uploadImage(imagem);
        if (url) fotosUrls.push(url);
      }

      // Inserir item no banco
      const { error } = await supabase
        .from('itens')
        .insert({
          ...itemData,
          publicado_por: user.id,
          fotos: fotosUrls
        });

      if (error) throw error;

      toast({
        title: "Item publicado com sucesso! 🎉",
        description: `${itemData.titulo} foi adicionado à sua lista de itens.`,
      });

      return true;
    } catch (error) {
      console.error('Erro ao publicar item:', error);
      toast({
        title: "Erro ao publicar item",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const buscarMeusItens = async (): Promise<Item[]> => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('itens')
        .select('*')
        .eq('publicado_por', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar itens:', error);
      return [];
    }
  };

  return {
    publicarItem,
    buscarMeusItens,
    loading
  };
};
