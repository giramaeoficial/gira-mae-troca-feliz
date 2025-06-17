
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { useFilhosPorEscola } from './useFilhosPorEscola';
import { toast } from '@/components/ui/use-toast';

type Item = Tables<'itens'> & {
  publicado_por_profile?: Tables<'profiles'>;
  mesma_escola?: boolean;
  escola_vendedor?: string;
};

interface UseItensProps {
  categoria?: string;
  filtroEscola?: boolean;
  limite?: number;
}

export const useItens = ({ categoria, filtroEscola = false, limite = 20 }: UseItensProps = {}) => {
  const [itens, setItens] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { escolasDosMeusFilhos } = useFilhosPorEscola();

  const fetchItens = async () => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('itens')
        .select(`
          *,
          publicado_por_profile:profiles!itens_publicado_por_fkey (
            id,
            nome,
            avatar_url,
            cidade,
            bairro
          )
        `)
        .eq('status', 'disponivel')
        .order('created_at', { ascending: false })
        .limit(limite);

      if (categoria && categoria !== 'todos') {
        query = query.eq('categoria', categoria);
      }

      const { data: itensData, error: itensError } = await query;

      if (itensError) throw itensError;

      // Se filtro por escola está ativo, buscar dados das escolas dos vendedores
      let itensComEscola = itensData || [];

      if (filtroEscola && escolasDosMeusFilhos.length > 0) {
        // Buscar filhos dos vendedores para verificar escolas
        const vendedorIds = itensData?.map(item => item.publicado_por) || [];
        
        if (vendedorIds.length > 0) {
          const { data: filhosVendedores, error: filhosError } = await supabase
            .from('filhos')
            .select(`
              mae_id,
              escola_id,
              escolas_inep!filhos_escola_id_fkey (
                codigo_inep,
                escola
              )
            `)
            .in('mae_id', vendedorIds)
            .not('escola_id', 'is', null);

          if (!filhosError && filhosVendedores) {
            // Mapear escolas por vendedor
            const escolasPorVendedor = new Map();
            filhosVendedores.forEach(filho => {
              if (filho.escola_id && filho.escolas_inep) {
                const vendedorId = filho.mae_id;
                if (!escolasPorVendedor.has(vendedorId)) {
                  escolasPorVendedor.set(vendedorId, []);
                }
                escolasPorVendedor.get(vendedorId).push({
                  id: filho.escola_id,
                  nome: filho.escolas_inep.escola
                });
              }
            });

            // Marcar itens da mesma escola
            itensComEscola = itensData.map(item => {
              const escolasDoVendedor = escolasPorVendedor.get(item.publicado_por) || [];
              const temEscolaEmComum = escolasDoVendedor.some((escola: any) => 
                escolasDosMeusFilhos.includes(escola.id)
              );

              return {
                ...item,
                mesma_escola: temEscolaEmComum,
                escola_vendedor: escolasDoVendedor.length > 0 ? escolasDoVendedor[0].nome : undefined
              } as Item;
            });

            // Se filtro está ativo, mostrar apenas itens da mesma escola primeiro
            if (filtroEscola) {
              itensComEscola.sort((a, b) => {
                if (a.mesma_escola && !b.mesma_escola) return -1;
                if (!a.mesma_escola && b.mesma_escola) return 1;
                return 0;
              });
            }
          }
        }
      }

      setItens(itensComEscola as Item[]);
    } catch (err) {
      console.error('Erro ao buscar itens:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const buscarItemPorId = async (itemId: string): Promise<Item | null> => {
    try {
      const { data, error } = await supabase
        .from('itens')
        .select(`
          *,
          publicado_por_profile:profiles!itens_publicado_por_fkey (
            id,
            nome,
            avatar_url,
            cidade,
            bairro,
            telefone,
            instagram
          )
        `)
        .eq('id', itemId)
        .single();

      if (error) throw error;
      return data as Item;
    } catch (err) {
      console.error('Erro ao buscar item:', err);
      return null;
    }
  };

  const buscarMeusItens = async (userId: string): Promise<Item[]> => {
    try {
      const { data, error } = await supabase
        .from('itens')
        .select(`
          *,
          publicado_por_profile:profiles!itens_publicado_por_fkey (
            id,
            nome,
            avatar_url,
            cidade,
            bairro
          )
        `)
        .eq('publicado_por', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Item[];
    } catch (err) {
      console.error('Erro ao buscar meus itens:', err);
      return [];
    }
  };

  const buscarItensDoUsuario = async (userId: string): Promise<Item[]> => {
    try {
      const { data, error } = await supabase
        .from('itens')
        .select(`
          *,
          publicado_por_profile:profiles!itens_publicado_por_fkey (
            id,
            nome,
            avatar_url,
            cidade,
            bairro
          )
        `)
        .eq('publicado_por', userId)
        .eq('status', 'disponivel')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Item[];
    } catch (err) {
      console.error('Erro ao buscar itens do usuário:', err);
      return [];
    }
  };

  const publicarItem = async (itemData: any, fotos: File[]): Promise<boolean> => {
    try {
      // Upload das fotos primeiro
      const fotosUrls: string[] = [];
      
      for (const foto of fotos) {
        const fileName = `${Date.now()}-${foto.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('itens')
          .upload(fileName, foto);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('itens')
          .getPublicUrl(fileName);

        fotosUrls.push(urlData.publicUrl);
      }

      // Criar item
      const { error } = await supabase
        .from('itens')
        .insert({
          ...itemData,
          fotos: fotosUrls
        });

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Item publicado com sucesso"
      });

      return true;
    } catch (err) {
      console.error('Erro ao publicar item:', err);
      toast({
        title: "Erro",
        description: "Erro ao publicar item",
        variant: "destructive"
      });
      return false;
    }
  };

  const atualizarItem = async (itemId: string, updates: any): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('itens')
        .update(updates)
        .eq('id', itemId);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Item atualizado com sucesso"
      });

      return true;
    } catch (err) {
      console.error('Erro ao atualizar item:', err);
      toast({
        title: "Erro",
        description: "Erro ao atualizar item",
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    fetchItens();
  }, [categoria, filtroEscola, escolasDosMeusFilhos.length, limite]);

  return {
    itens,
    loading,
    error,
    refetch: fetchItens,
    buscarItemPorId,
    buscarMeusItens,
    buscarItensDoUsuario,
    publicarItem,
    atualizarItem
  };
};
