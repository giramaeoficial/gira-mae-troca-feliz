
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import type { Address } from './useAddress';

export const useUserAddress = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-address', user?.id],
    queryFn: async (): Promise<Address | null> => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('cep, endereco, bairro, cidade, estado, complemento, ponto_referencia')
        .eq('id', user.id)
        .single();

      if (error || !data) return null;

      // Verificar se o usuário tem endereço completo
      if (!data.cep || !data.endereco || !data.cidade) return null;

      return {
        cep: data.cep || '',
        endereco: data.endereco || '',
        bairro: data.bairro || '',
        cidade: data.cidade || '',
        estado: data.estado || '',
        complemento: data.complemento || '',
        ponto_referencia: data.ponto_referencia || ''
      };
    },
    enabled: !!user?.id
  });
};
