
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';

type Item = Tables<'itens'>;
type NovoItem = {
  titulo: string;
  descricao: string;
  categoria: 'roupa' | 'brinquedo' | 'calcado' | 'acessorio' | 'kit' | 'outro';
  estado_conservacao: 'novo' | 'otimo' | 'bom' | 'razoavel';
  tamanho?: string | null;
  valor_girinhas: number;
};

type AtualizarItem = Partial<NovoItem> & { 
  id: string;
  fotos?: string[];
};

export const useItens = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const uploadImage = async (file: File): Promise<string | null> => {
    if (!user) {
      console.error('Usuário não autenticado para upload');
      return null;
    }

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      console.log('Fazendo upload da imagem:', fileName);

      const { data, error } = await supabase.storage
        .from('item-photos')
        .upload(fileName, file);

      if (error) {
        console.error('Erro no upload da imagem:', error);
        throw error;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('item-photos')
        .getPublicUrl(data.path);

      console.log('Upload bem-sucedido, URL:', publicUrl);
      return publicUrl;
    } catch (error) {
      console.error('Erro ao fazer upload da imagem:', error);
      return null;
    }
  };

  const publicarItem = async (itemData: NovoItem, imagens: File[]): Promise<boolean> => {
    if (!user) {
      console.error('Usuário não autenticado');
      toast({
        title: "Erro",
        description: "Você precisa estar logado para publicar um item.",
        variant: "destructive",
      });
      return false;
    }

    try {
      setLoading(true);
      console.log('Iniciando publicação do item para usuário:', user.id);
      console.log('Dados do item:', itemData);

      // Upload das imagens
      const fotosUrls: string[] = [];
      for (const imagem of imagens) {
        const url = await uploadImage(imagem);
        if (url) fotosUrls.push(url);
      }

      console.log('URLs das fotos:', fotosUrls);

      // Preparar dados para inserção
      const dadosParaInserir = {
        ...itemData,
        publicado_por: user.id,
        fotos: fotosUrls
      };

      console.log('Dados finais para inserção:', dadosParaInserir);

      // Inserir item no banco
      const { data, error } = await supabase
        .from('itens')
        .insert(dadosParaInserir)
        .select()
        .single();

      if (error) {
        console.error('Erro detalhado na inserção:', error);
        throw error;
      }

      console.log('Item inserido com sucesso:', data);

      toast({
        title: "Item publicado com sucesso! 🎉",
        description: `${itemData.titulo} foi adicionado à sua lista de itens.`,
      });

      return true;
    } catch (error) {
      console.error('Erro ao publicar item:', error);
      toast({
        title: "Erro ao publicar item",
        description: error instanceof Error ? error.message : "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const atualizarItem = async (itemData: AtualizarItem, novasImagens?: File[]): Promise<boolean> => {
    if (!user) {
      console.error('Usuário não autenticado');
      toast({
        title: "Erro",
        description: "Você precisa estar logado para editar um item.",
        variant: "destructive",
      });
      return false;
    }

    try {
      setLoading(true);
      console.log('Iniciando atualização do item:', itemData.id);

      // Upload de novas imagens se fornecidas
      let novasFotosUrls: string[] = [];
      if (novasImagens && novasImagens.length > 0) {
        for (const imagem of novasImagens) {
          const url = await uploadImage(imagem);
          if (url) novasFotosUrls.push(url);
        }
      }

      // Preparar dados para atualização (removendo o id dos dados)
      const { id, ...dadosParaAtualizacao } = itemData;
      
      // Se há novas fotos, substituir as existentes
      if (novasFotosUrls.length > 0) {
        dadosParaAtualizacao.fotos = novasFotosUrls;
      }

      console.log('Dados para atualização:', dadosParaAtualizacao);

      // Atualizar item no banco
      const { data, error } = await supabase
        .from('itens')
        .update(dadosParaAtualizacao)
        .eq('id', id)
        .eq('publicado_por', user.id) // Garantir que só pode editar próprios itens
        .select()
        .single();

      if (error) {
        console.error('Erro detalhado na atualização:', error);
        throw error;
      }

      console.log('Item atualizado com sucesso:', data);

      toast({
        title: "Item atualizado com sucesso! ✨",
        description: `As alterações foram salvas.`,
      });

      return true;
    } catch (error) {
      console.error('Erro ao atualizar item:', error);
      toast({
        title: "Erro ao atualizar item",
        description: error instanceof Error ? error.message : "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const buscarMeusItens = async (): Promise<Item[]> => {
    if (!user) {
      console.log('Usuário não autenticado para buscar itens');
      return [];
    }

    try {
      console.log('Buscando itens do usuário:', user.id);
      
      const { data, error } = await supabase
        .from('itens')
        .select('*')
        .eq('publicado_por', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar itens:', error);
        throw error;
      }

      console.log('Itens encontrados:', data);
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar itens:', error);
      return [];
    }
  };

  return {
    publicarItem,
    atualizarItem,
    buscarMeusItens,
    loading
  };
};
