
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export const usePactoEntrada = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Verificar progresso da missão
  const { data: progressoMissao, isLoading } = useQuery({
    queryKey: ['progresso-primeiros-passos', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('missoes_usuarios')
        .select(`
          progresso_atual,
          progresso_necessario,
          status,
          missoes!inner(titulo, recompensa_girinhas, condicoes)
        `)
        .eq('user_id', user.id)
        .eq('missoes.titulo', 'Primeiros Passos')
        .maybeSingle();

      if (error) {
        console.error('Erro ao buscar progresso:', error);
        return null;
      }

      return data;
    },
    enabled: !!user?.id
  });

  // Publicar item e atualizar progresso
  const publicarItem = useMutation({
    mutationFn: async (itemData: any) => {
      if (!user?.id) throw new Error('Usuário não autenticado');

      // Criar o item
      const { data: item, error: itemError } = await supabase
        .from('itens')
        .insert({
          ...itemData,
          publicado_por: user.id,
          status: 'disponivel'
        })
        .select()
        .single();

      if (itemError) throw itemError;

      // Verificar e atualizar progresso da missão
      await supabase.rpc('verificar_progresso_missoes', {
        p_user_id: user.id
      });

      return item;
    },
    onSuccess: () => {
      toast.success('Item publicado com sucesso! 🎉');
      queryClient.invalidateQueries({ queryKey: ['progresso-primeiros-passos'] });
      queryClient.invalidateQueries({ queryKey: ['missao-primeiros-passos'] });
    },
    onError: (error: any) => {
      console.error('Erro ao publicar item:', error);
      toast.error('Erro ao publicar item. Tente novamente.');
    }
  });

  const itensPublicados = progressoMissao?.progresso_atual || 0;
  const itensNecessarios = progressoMissao?.progresso_necessario || 2;
  const missaoCompleta = progressoMissao?.status === 'completa';
  const recompensaGirinhas = progressoMissao?.missoes?.recompensa_girinhas || 100;

  return {
    progressoMissao,
    isLoading,
    publicarItem,
    itensPublicados,
    itensNecessarios,
    missaoCompleta,
    recompensaGirinhas,
    isPublishing: publicarItem.isPending
  };
};
