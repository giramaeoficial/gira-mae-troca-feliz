
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useFilhosPorEscola } from '@/hooks/useFilhosPorEscola';
import { supabase } from '@/integrations/supabase/client';

export interface ProximityFilters {
  apenasProximos: boolean;
  raioKm: number;
  mesmaEscola: boolean;
  mesmoBairro: boolean;
  paraMeusFilhos: boolean;
}

export const useProximityFilters = () => {
  const { user } = useAuth();
  const { escolasDosMeusFilhos } = useFilhosPorEscola();
  const [filters, setFilters] = useState<ProximityFilters>({
    apenasProximos: false,
    raioKm: 10,
    mesmaEscola: false,
    mesmoBairro: false,
    paraMeusFilhos: false
  });

  const aplicarFiltrosProximidade = async (baseQuery: any) => {
    if (!user) return baseQuery;

    let query = baseQuery;

    // Filtro por mesma escola
    if (filters.mesmaEscola && escolasDosMeusFilhos.length > 0) {
      const escolaIds = escolasDosMeusFilhos.map(escola => escola.codigo_inep);
      
      query = query.or(
        escolaIds.map(id => `escola_id.eq.${id}`).join(',')
      );
    }

    // Filtro por mesmo bairro
    if (filters.mesmoBairro) {
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('bairro')
        .eq('id', user.id)
        .single();

      if (userProfile?.bairro) {
        query = query.eq('publicado_por.bairro', userProfile.bairro);
      }
    }

    // Filtro para filhos (por tamanho e categoria)
    if (filters.paraMeusFilhos) {
      // Implementar lógica baseada nos tamanhos dos filhos
      // Por enquanto, filtrar apenas categorias relevantes
      query = query.in('categoria', ['roupas', 'calcados', 'acessorios', 'brinquedos']);
    }

    return query;
  };

  const updateFilters = (newFilters: Partial<ProximityFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  return {
    filters,
    updateFilters,
    aplicarFiltrosProximidade
  };
};
