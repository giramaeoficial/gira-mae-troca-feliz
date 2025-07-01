
import { useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useUserData } from '@/contexts/UserDataContext';

export const useFavoritos = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { favoritos, loading, refetchFavoritos, verificarSeFavorito } = useUserData();

  const adicionarFavorito = useCallback(async (itemId: string): Promise<boolean> => {
    if (!user?.id) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para adicionar favoritos.",
        variant: "destructive",
      });
      return false;
    }

    if (verificarSeFavorito(itemId)) {
      return true;
    }

    try {
      const { error } = await supabase
        .from('favoritos')
        .insert({
          user_id: user.id,
          item_id: itemId
        });

      if (error) {
        console.error('Erro ao adicionar favorito:', error);
        throw error;
      }

      toast({
        title: "Adicionado aos favoritos! ❤️",
        description: "Item adicionado à sua lista de desejos.",
      });

      // Atualizar dados do contexto
      await refetchFavoritos();
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
  }, [user?.id, toast, verificarSeFavorito, refetchFavoritos]);

  const removerFavorito = useCallback(async (itemId: string): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      const { error } = await supabase
        .from('favoritos')
        .delete()
        .eq('user_id', user.id)
        .eq('item_id', itemId);

      if (error) {
        console.error('Erro ao remover favorito:', error);
        throw error;
      }

      toast({
        title: "Removido dos favoritos",
        description: "Item removido da sua lista de desejos.",
      });

      // Atualizar dados do contexto
      await refetchFavoritos();
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
  }, [user?.id, toast, refetchFavoritos]);

  const toggleFavorito = useCallback(async (itemId: string): Promise<boolean> => {
    const ehFavorito = verificarSeFavorito(itemId);
    
    if (ehFavorito) {
      return await removerFavorito(itemId);
    } else {
      return await adicionarFavorito(itemId);
    }
  }, [verificarSeFavorito, removerFavorito, adicionarFavorito]);

  return {
    favoritos,
    loading,
    verificarSeFavorito,
    adicionarFavorito,
    removerFavorito,
    toggleFavorito,
    refetch: refetchFavoritos
  };
};
