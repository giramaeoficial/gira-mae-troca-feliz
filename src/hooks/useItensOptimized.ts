
import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Location {
  cidade: string;
  estado: string;
  bairro?: string;
}

export interface Item {
  id: string;
  titulo: string;
  descricao: string;
  categoria: string;
  subcategoria?: string;
  estado_conservacao: string;
  tamanho?: string;
  tamanho_categoria?: string;
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
      throw error;
    }

    return { data: data || [], nextPage: data && data.length === 10 ? pageParam + 1 : undefined };
  };

  return useInfiniteQuery({
    queryKey: ['itensInteligentes', categoria, subcategoria, genero, tamanho, estadoConservacao, precoMin, precoMax, ordenacao],
    queryFn: fetchItens,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    enabled: enabled,
    initialPageParam: 0,
  });
};

interface UseMeusItensProps {
  userId: string;
}

export const useMeusItens = (userId: string) => {
  const { toast } = useToast();

  const fetchMeusItens = async () => {
    if (!userId) return [];

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
      throw error;
    }

    return data || [];
  };

  return useQuery({
    queryKey: ['meusItens', userId],
    queryFn: fetchMeusItens,
    enabled: !!userId,
  });
};

export const useAtualizarItem = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ itemId, dadosAtualizados }: { itemId: string; dadosAtualizados: any }) => {
      const { error } = await supabase
        .from('itens')
        .update(dadosAtualizados)
        .eq('id', itemId);

      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['itensInteligentes'] });
      queryClient.invalidateQueries({ queryKey: ['meusItens'] });
      toast({
        title: "Sucesso!",
        description: "Item atualizado com sucesso"
      });
    },
    onError: (error: any) => {
      console.error('Erro ao atualizar item:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar item",
        variant: "destructive"
      });
    }
  });
};

export const usePublicarItem = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ itemData, fotos }: { itemData: any; fotos: File[] }) => {
      const { error } = await supabase
        .from('itens')
        .insert({
          ...itemData,
          fotos: fotos.map(f => URL.createObjectURL(f)) // Simplified for now
        });

      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['itensInteligentes'] });
      toast({
        title: "Sucesso!",
        description: "Item publicado com sucesso"
      });
    },
    onError: (error: any) => {
      console.error('Erro ao publicar item:', error);
      toast({
        title: "Erro",
        description: "Erro ao publicar item",
        variant: "destructive"
      });
    }
  });
};
