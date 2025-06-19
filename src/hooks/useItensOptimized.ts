
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Tables } from '@/integrations/supabase/types';
import { uploadImage, generateImagePath } from '@/utils/supabaseStorage';

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

// Hook otimizado para buscar todos os itens
export const useItensDisponiveis = () => {
  return useQuery({
    queryKey: ['itens', 'disponiveis'],
    queryFn: async (): Promise<Item[]> => {
      console.log('🔍 Buscando itens disponíveis...');
      
      const { data, error } = await supabase
        .from('itens')
        .select(`
          *,
          publicado_por_profile:profiles(nome, avatar_url, cidade, reputacao)
        `)
        .eq('status', 'disponivel')
        .order('created_at', { ascending: false })
        .limit(50); // Limitar para melhor performance

      if (error) {
        console.error('Erro ao buscar itens:', error);
        throw error;
      }
      
      const itensFormatados = data?.map(item => ({
        ...item,
        publicado_por_profile: item.publicado_por_profile || undefined,
        mesma_escola: false
      })) || [];
      
      console.log(`✅ ${itensFormatados.length} itens carregados`);
      return itensFormatados;
    },
    staleTime: 60000, // 1 minuto
    gcTime: 300000, // 5 minutos
    refetchOnWindowFocus: false,
    retry: 2
  });
};

// Hook para buscar meus itens
export const useMeusItens = (userId: string) => {
  return useQuery({
    queryKey: ['itens', 'meus', userId],
    queryFn: async (): Promise<Item[]> => {
      const { data, error } = await supabase
        .from('itens')
        .select('*')
        .eq('publicado_por', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return data?.map(item => ({
        ...item,
        mesma_escola: false
      })) || [];
    },
    enabled: !!userId,
    staleTime: 120000, // 2 minutos
    gcTime: 300000
  });
};

// Hook para buscar itens de um usuário específico
export const useItensUsuario = (userId: string) => {
  return useQuery({
    queryKey: ['itens', 'usuario', userId],
    queryFn: async (): Promise<Item[]> => {
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
      
      return data?.map(item => ({
        ...item,
        publicado_por_profile: item.publicado_por_profile || undefined,
        mesma_escola: false
      })) || [];
    },
    enabled: !!userId,
    staleTime: 120000,
    gcTime: 300000
  });
};

// Hook para buscar um item específico
export const useItem = (itemId: string) => {
  return useQuery({
    queryKey: ['item', itemId],
    queryFn: async (): Promise<Item | null> => {
      const { data, error } = await supabase
        .from('itens')
        .select(`
          *,
          publicado_por_profile:profiles(nome, avatar_url, cidade, reputacao)
        `)
        .eq('id', itemId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
      }
      
      return {
        ...data,
        publicado_por_profile: data.publicado_por_profile || undefined,
        mesma_escola: false
      };
    },
    enabled: !!itemId,
    staleTime: 180000, // 3 minutos
    gcTime: 300000
  });
};

// Mutation para publicar item
export const usePublicarItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ itemData, fotos }: { itemData: any, fotos: File[] }) => {
      console.log('📤 Iniciando upload de', fotos.length, 'fotos...');
      
      // Upload das fotos
      const fotosUrls: string[] = [];
      
      for (const foto of fotos) {
        const fileName = generateImagePath(itemData.publicado_por, foto.name);
        console.log('⬆️ Fazendo upload da foto:', fileName);
        
        await uploadImage({
          bucket: 'itens',
          path: fileName,
          file: foto
        });

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

      return true;
    },
    onSuccess: () => {
      // Invalidar apenas queries específicas
      queryClient.invalidateQueries({ queryKey: ['itens', 'disponiveis'] });
      queryClient.invalidateQueries({ queryKey: ['itens', 'meus'] });
      
      toast({
        title: "Sucesso!",
        description: "Item publicado com sucesso"
      });
    },
    onError: (error: any) => {
      console.error('❌ Erro ao publicar item:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao publicar item",
        variant: "destructive"
      });
    }
  });
};

// Mutation para atualizar item
export const useAtualizarItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ itemId, dadosAtualizados }: { itemId: string, dadosAtualizados: any }) => {
      const { error } = await supabase
        .from('itens')
        .update(dadosAtualizados)
        .eq('id', itemId);

      if (error) throw error;
      return true;
    },
    onSuccess: (_, { itemId }) => {
      // Invalidar queries específicas
      queryClient.invalidateQueries({ queryKey: ['item', itemId] });
      queryClient.invalidateQueries({ queryKey: ['itens', 'disponiveis'] });
      queryClient.invalidateQueries({ queryKey: ['itens', 'meus'] });
      
      toast({
        title: "Sucesso!",
        description: "Item atualizado com sucesso"
      });
    },
    onError: (error: any) => {
      console.error('❌ Erro ao atualizar item:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar item",
        variant: "destructive"
      });
    }
  });
};
