
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const useCommonSchool = (itemOwnerId: string) => {
  const { user } = useAuth();

  const { data: hasCommonSchool } = useQuery({
    queryKey: ['common-school', user?.id, itemOwnerId],
    queryFn: async () => {
      if (!user?.id || user.id === itemOwnerId) return false;

      // Buscar escolas dos filhos do usuário atual
      const { data: myKidsSchools } = await supabase
        .from('filhos')
        .select('escola_id')
        .eq('mae_id', user.id)
        .not('escola_id', 'is', null);

      if (!myKidsSchools?.length) return false;

      const mySchoolIds = myKidsSchools.map(f => f.escola_id);

      // Verificar se o dono do item tem filhos na mesma escola
      const { data: ownerKidsSchools } = await supabase
        .from('filhos')
        .select('escola_id')
        .eq('mae_id', itemOwnerId)
        .in('escola_id', mySchoolIds);

      return (ownerKidsSchools?.length || 0) > 0;
    },
    enabled: !!user?.id && !!itemOwnerId && user.id !== itemOwnerId
  });

  return { hasCommonSchool: hasCommonSchool || false };
};
