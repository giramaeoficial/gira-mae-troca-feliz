import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Location {
  cidade: string;
  estado: string;
  bairro?: string;
}

interface Item {
  id: string;
  titulo: string;
  descricao: string;
  categoria: string;
  estado_conservacao: string;
  tamanho?: string;
  tamanho_valor?: string;
  genero?: string;
  valor_girinhas: number;
  publicado_por: string;
  status: string;
  fotos?: string[];
  created_at: string;
  updated_at: string;
  filho_id?: string;
  estado_manual?: string;
  cidade_manual?: string;
  publicado_por_profile?: {
    nome: string;
    avatar_url?: string;
    cidade?: string;
    reputacao?: number;
  };
  mesma_escola?: boolean;
}

interface UseItensInteligentesProps {
  termo?: string;
  categoria?: string;
  subcategoria?: string;
  genero?: string;
  tamanho?: string;
  estadoConservacao?: string;
  precoMin?: number;
  precoMax?: number;
  localizacao?: string;
  raio?: number;
  coordenadas?: { latitude: number; longitude: number } | null;
  ordenacao?: 'recentes' | 'preco_menor' | 'preco_maior' | 'distancia';
  enabled?: boolean;
}

export const useItensInteligentes = ({
  termo,
  categoria,
  subcategoria,
  genero,
  tamanho,
  estadoConservacao,
  precoMin = 0,
  precoMax = 1000,
  localizacao,
  raio = 10,
  coordenadas,
  ordenacao = 'recentes',
  enabled = true
}: UseItensInteligentesProps) => {
  const { toast } = useToast();

  const fetchItens = async ({ pageParam = 0 }) => {
    let query = supabase
      .from('itens')
      .select(`
        *,
        publicado_por_profile:profiles(nome, avatar_url, cidade, reputacao)
      `)
      .eq('status', 'disponivel')
      .gte('valor_girinhas', precoMin)
      .lte('valor_girinhas', precoMax)
      .range(pageParam * 10, (pageParam + 1) * 10 - 1);

    if (termo) {
      query = query.ilike('titulo', `%${termo}%`);
    }

    if (categoria) {
      query = query.eq('categoria', categoria);
    }

    if (subcategoria) {
      query = query.eq('subcategoria', subcategoria);
    }

    if (genero) {
      query = query.eq('genero', genero);
    }

    if (tamanho) {
      query = query.eq('tamanho_valor', tamanho);
    }

    if (estadoConservacao) {
      query = query.eq('estado_conservacao', estadoConservacao);
    }

    if (ordenacao === 'preco_menor') {
      query = query.order('valor_girinhas', { ascending: true });
    } else if (ordenacao === 'preco_maior') {
      query = query.order('valor_girinhas', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query;

    if (error) {
      console.error('Erro ao buscar itens:', error);
      toast({
        title: 'Erro ao carregar itens',
        description: error.message,
      });
    }

    return data;
  };

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch
  } = useInfiniteQuery(
    ['itensInteligentes', termo, categoria, subcategoria, genero, tamanho, estadoConservacao, precoMin, precoMax, ordenacao],
    fetchItens,
    {
      getNextPageParam: (lastPage, allPages) => {
        return lastPage && lastPage.length === 10 ? allPages.length : undefined;
      },
      enabled: enabled,
    }
  );

  return {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch
  };
};

interface UseMeusItensProps {
  userId: string;
}

export const useMeusItens = (userId: string) => {
  const { toast } = useToast();

  const fetchMeusItens = async () => {
    if (!userId) return null;

    const { data, error } = await supabase
      .from('itens')
      .select('*')
      .eq('publicado_por', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar meus itens:', error);
      toast({
        title: 'Erro ao carregar seus itens',
        description: error.message,
      });
    }

    return data || [];
  };

  const { data, isLoading, error, refetch } = useQuery(
    ['meusItens', userId],
    fetchMeusItens,
    {
      enabled: !!userId,
    }
  );

  return {
    data,
    isLoading,
    error,
    refetch
  };
};
