// DEPRECATED: Este hook não é mais utilizado.
// O sistema agora usa apenas um endereço principal por usuário.
// Veja useUserAddress.ts para a nova implementação.

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { toast } from '@/components/ui/use-toast';

type UserAddress = Tables<'user_addresses'>;

export const useUserAddresses = () => {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      carregarEnderecos();
    }
  }, [user]);

  const carregarEnderecos = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at');

      if (error) throw error;
      setAddresses(data || []);
    } catch (error) {
      console.error('Erro ao carregar endereços:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar endereços adicionais",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const adicionarEndereco = async (endereco: Omit<UserAddress, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_addresses')
        .insert({
          ...endereco,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      
      setAddresses(prev => [...prev, data]);
      toast({
        title: "Sucesso!",
        description: "Endereço adicionado com sucesso"
      });
    } catch (error) {
      console.error('Erro ao adicionar endereço:', error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar endereço",
        variant: "destructive"
      });
    }
  };

  const atualizarEndereco = async (id: string, endereco: Partial<UserAddress>) => {
    try {
      const { error } = await supabase
        .from('user_addresses')
        .update({
          ...endereco,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      
      setAddresses(prev => prev.map(addr => 
        addr.id === id ? { ...addr, ...endereco } : addr
      ));
      
      toast({
        title: "Sucesso!",
        description: "Endereço atualizado com sucesso"
      });
    } catch (error) {
      console.error('Erro ao atualizar endereço:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar endereço",
        variant: "destructive"
      });
    }
  };

  const removerEndereco = async (id: string) => {
    try {
      const { error } = await supabase
        .from('user_addresses')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setAddresses(prev => prev.filter(addr => addr.id !== id));
      toast({
        title: "Sucesso!",
        description: "Endereço removido com sucesso"
      });
    } catch (error) {
      console.error('Erro ao remover endereço:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover endereço",
        variant: "destructive"
      });
    }
  };

  return {
    addresses,
    loading,
    adicionarEndereco,
    atualizarEndereco,
    removerEndereco,
    refetch: carregarEnderecos
  };
};
