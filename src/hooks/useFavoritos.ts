import { useState, useEffect, useCallback } from 'react';
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

  // ✅ CORREÇÃO: Memorizar a função buscarFavoritos com useCallback
  const buscarFavoritos = useCallback(async () => {
    if (!user) {
      console.log('Usuário não logado, limpando favoritos');
      setFavoritos([]);
      return;
    }

    try {
      setLoading(true);
      console.log('Buscando favoritos para usuário:', user.id);
      
      const { data, error } = await supabase
        .from('favoritos')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Erro ao buscar favoritos:', error);
        throw error;
      }
      
      console.log('Favoritos encontrados:', data);
      setFavoritos(data || []);
    } catch (error) {
      console.error('Erro ao buscar favoritos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar seus favoritos.",
        variant: "destructive",
      });
      setFavoritos([]);
    } finally {
      setLoading(false);
    }
  }, [user, toast]); // ✅ Dependências explícitas

  const verificarSeFavorito = useCallback((itemId: string): boolean => {
    const ehFavorito = favoritos.some(fav => fav.item_id === itemId);
    console.log(`Item ${itemId} é favorito:`, ehFavorito);
    return ehFavorito;
  }, [favoritos]); // ✅ Memorizar também esta função

  const adicionarFavorito = useCallback(async (itemId: string): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para adicionar favoritos.",
        variant: "destructive",
      });
      return false;
    }

    if (verificarSeFavorito(itemId)) {
      console.log('Item já é favorito, não adicionando novamente');
      return true;
    }

    try {
      console.log('Adicionando favorito:', itemId);
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

      // Atualizar lista local imediatamente
      setFavoritos(prev => [...prev, { 
        id: crypto.randomUUID(), 
        user_id: user.id, 
        item_id: itemId, 
        created_at: new Date().toISOString() 
      }]);

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
  }, [user, toast, verificarSeFavorito]); // ✅ Dependências explícitas

  const removerFavorito = useCallback(async (itemId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      console.log('Removendo favorito:', itemId);
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

      // Atualizar lista local imediatamente
      setFavoritos(prev => prev.filter(fav => fav.item_id !== itemId));

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
  }, [user, toast]); // ✅ Dependências explícitas

  const toggleFavorito = useCallback(async (itemId: string): Promise<boolean> => {
    const ehFavorito = verificarSeFavorito(itemId);
    console.log(`Toggle favorito para item ${itemId}, é favorito: ${ehFavorito}`);
    
    if (ehFavorito) {
      return await removerFavorito(itemId);
    } else {
      return await adicionarFavorito(itemId);
    }
  }, [verificarSeFavorito, removerFavorito, adicionarFavorito]); // ✅ Dependências explícitas

  // ✅ CORREÇÃO: useEffect agora só executa quando user.id muda
  useEffect(() => {
    console.log('useEffect useFavoritos - user:', user?.id);
    buscarFavoritos();
  }, [user?.id, buscarFavoritos]); // ✅ buscarFavoritos agora é estável

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
