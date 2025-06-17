
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Tables } from '@/integrations/supabase/types';

export interface Item {
  id: string;
  titulo: string;
  descricao: string;
  categoria: string;
  estado_conservacao: string;
  tamanho?: string;
  valor_girinhas: number;
  publicado_por: string;
  status: string;
  fotos?: string[];
  created_at: string;
  updated_at: string;
  publicado_por_profile?: {
    nome: string;
    avatar_url?: string;
    cidade?: string;
    reputacao?: number;
  };
  mesma_escola?: boolean;
}

export const useItens = () => {
  const [itens, setItens] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const refetch = useCallback(async () => {
    setLoading(true);
    setError('');
    
    try {
      const { data, error } = await supabase
        .from('itens')
        .select(`
          *,
          publicado_por_profile:profiles(nome, avatar_url, cidade, reputacao)
        `)
        .eq('status', 'disponivel')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const itensFormatados = data?.map(item => ({
        ...item,
        publicado_por_profile: item.publicado_por_profile || undefined,
        mesma_escola: false
      })) || [];
      
      setItens(itensFormatados);
      return itensFormatados;
    } catch (err) {
      console.error('Erro ao buscar itens:', err);
      setError('Erro ao carregar itens');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const buscarItens = useCallback(async () => {
    return await refetch();
  }, [refetch]);

  const buscarMeusItens = useCallback(async (userId: string) => {
    setLoading(true);
    setError('');
    
    try {
      const { data, error } = await supabase
        .from('itens')
        .select('*')
        .eq('publicado_por', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const itensFormatados = data?.map(item => ({
        ...item,
        mesma_escola: false
      })) || [];
      
      setItens(itensFormatados);
      return itensFormatados;
    } catch (err) {
      console.error('Erro ao buscar meus itens:', err);
      setError('Erro ao carregar seus itens');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const buscarItensDoUsuario = useCallback(async (userId: string) => {
    setLoading(true);
    setError('');
    
    try {
      const { data, error } = await supabase
        .from('itens')
        .select(`
          *,
          publicado_por_profile:profiles(nome, avatar_url, cidade, reputacao)
        `)
        .eq('publicado_por', userId)
        .eq('status', 'disponivel')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const itensFormatados = data?.map(item => ({
        ...item,
        publicado_por_profile: item.publicado_por_profile || undefined,
        mesma_escola: false
      })) || [];
      
      setItens(itensFormatados);
      return itensFormatados;
    } catch (err) {
      console.error('Erro ao buscar itens do usuário:', err);
      setError('Erro ao carregar itens do usuário');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const buscarItemPorId = useCallback(async (itemId: string) => {
    setLoading(true);
    setError('');
    
    try {
      const { data, error } = await supabase
        .from('itens')
        .select(`
          *,
          publicado_por_profile:profiles(nome, avatar_url, cidade, reputacao)
        `)
        .eq('id', itemId)
        .single();

      if (error) throw error;
      
      const itemFormatado = {
        ...data,
        publicado_por_profile: data.publicado_por_profile || undefined,
        mesma_escola: false
      };
      
      return itemFormatado;
    } catch (err) {
      console.error('Erro ao buscar item:', err);
      setError('Erro ao carregar item');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const publicarItem = useCallback(async (itemData: any, fotos: File[]) => {
    setLoading(true);
    setError('');
    
    try {
      // Upload das fotos
      const fotosUrls: string[] = [];
      
      for (const foto of fotos) {
        const fileName = `${Date.now()}_${foto.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('itens')
          .upload(fileName, foto);

        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('itens')
          .getPublicUrl(fileName);
        
        fotosUrls.push(publicUrl);
      }

      // Inserir item no banco
      const { error: insertError } = await supabase
        .from('itens')
        .insert({
          ...itemData,
          fotos: fotosUrls
        });

      if (insertError) throw insertError;

      toast({
        title: "Sucesso!",
        description: "Item publicado com sucesso"
      });

      await refetch();
      return true;
    } catch (err) {
      console.error('Erro ao publicar item:', err);
      setError('Erro ao publicar item');
      toast({
        title: "Erro",
        description: "Erro ao publicar item",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [refetch]);

  const atualizarItem = useCallback(async (itemId: string, dadosAtualizados: any) => {
    setLoading(true);
    setError('');
    
    try {
      const { error } = await supabase
        .from('itens')
        .update(dadosAtualizados)
        .eq('id', itemId);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Item atualizado com sucesso"
      });

      await refetch();
      return true;
    } catch (err) {
      console.error('Erro ao atualizar item:', err);
      setError('Erro ao atualizar item');
      toast({
        title: "Erro",
        description: "Erro ao atualizar item",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [refetch]);

  return {
    itens,
    loading,
    error,
    refetch,
    buscarItens,
    buscarMeusItens,
    buscarItensDoUsuario,
    buscarItemPorId,
    publicarItem,
    atualizarItem
  };
};
