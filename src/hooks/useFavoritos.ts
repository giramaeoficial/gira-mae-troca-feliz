
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';

type Favorito = Tables<'favoritos'>;

export const useFavoritos = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [favoritos, setFavoritos] = useState<Favorito[]>([]);
  const [loading, setLoading] = useState(false);

  const buscarFavoritos = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('favoritos')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setFavoritos(data || []);
    } catch (error) {
      console.error('Erro ao buscar favoritos:', error);
    } finally {
      setLoading(false);
    }
  };

  const verificarSeFavorito = (itemId: string): boolean => {
    return favoritos.some(fav => fav.item_id === itemId);
  };

  const adicionarFavorito = async (itemId: string): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para adicionar favoritos.",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('favoritos')
        .insert({
          user_id: user.id,
          item_id: itemId
        });

      if (error) throw error;

      toast({
        title: "Adicionado aos favoritos! ❤️",
        description: "Item adicionado à sua lista de desejos.",
      });

      // Atualizar lista local
      await buscarFavoritos();
      return true;
    } catch (error) {
      console.error('Erro ao adicionar favorito:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar aos favoritos.",
        variant: "destructive",
      });
      return false;
    }
  };

  const removerFavorito = async (itemId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('favoritos')
        .delete()
        .eq('user_id', user.id)
        .eq('item_id', itemId);

      if (error) throw error;

      toast({
        title: "Removido dos favoritos",
        description: "Item removido da sua lista de desejos.",
      });

      // Atualizar lista local
      await buscarFavoritos();
      return true;
    } catch (error) {
      console.error('Erro ao remover favorito:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover dos favoritos.",
        variant: "destructive",
      });
      return false;
    }
  };

  const toggleFavorito = async (itemId: string): Promise<boolean> => {
    const ehFavorito = verificarSeFavorito(itemId);
    
    if (ehFavorito) {
      return await removerFavorito(itemId);
    } else {
      return await adicionarFavorito(itemId);
    }
  };

  useEffect(() => {
    if (user) {
      buscarFavoritos();
    }
  }, [user]);

  return {
    favoritos,
    loading,
    verificarSeFavorito,
    adicionarFavorito,
    removerFavorito,
    toggleFavorito,
    refetch: buscarFavoritos
  };
};
