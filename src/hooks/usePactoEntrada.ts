import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export const usePactoEntrada = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Verificar progresso da missão baseado nos itens realmente publicados
  const { data: progressoMissao, isLoading } = useQuery({
    queryKey: ['progresso-pacto-entrada', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      // Buscar quantos itens o usuário realmente publicou
      const { data: itens, error: itensError } = await supabase
        .from('itens')
        .select('id, created_at, titulo')
        .eq('publicado_por', user.id)
        .order('created_at', { ascending: true });

      if (itensError) {
        console.error('Erro ao buscar itens publicados:', itensError);
        return {
          progresso_atual: 0,
          progresso_necessario: 2,
          status: 'em_progresso' as const,
          itens_publicados: [],
          missoes: {
            titulo: 'Primeiros Passos',
            recompensa_girinhas: 100
          }
        };
      }

      const itensPublicados = itens?.length || 0;
      const status = itensPublicados >= 2 ? 'completa' : 'em_progresso';

      // Buscar dados da missão na tabela missoes_usuarios (se existir)
      const { data: missaoUsuario } = await supabase
        .from('missoes_usuarios')
        .select(`
          status,
          data_completada,
          missoes!inner(titulo, recompensa_girinhas, condicoes)
        `)
        .eq('user_id', user.id)
        .eq('missoes.titulo', 'Primeiros Passos')
        .maybeSingle();

      // Se a missão foi completada mas não existe registro, criar automaticamente
      if (status === 'completa' && !missaoUsuario) {
        const { data: missaoData } = await supabase
          .from('missoes')
          .select('id')
          .eq('titulo', 'Primeiros Passos')
          .eq('ativo', true)
          .maybeSingle();

        if (missaoData) {
          await supabase
            .from('missoes_usuarios')
            .upsert({
              user_id: user.id,
              missao_id: missaoData.id,
              progresso_atual: itensPublicados,
              progresso_necessario: 2,
              status: 'completa',
              data_completada: new Date().toISOString()
            });
        }
      }

      return {
        progresso_atual: itensPublicados,
        progresso_necessario: 2,
        status,
        itens_publicados: itens || [],
        missoes: missaoUsuario?.missoes || {
          titulo: 'Primeiros Passos',
          recompensa_girinhas: 100
        }
      };
    },
    enabled: !!user?.id,
    refetchOnWindowFocus: false,
    staleTime: 10000 // Cache por 10 segundos
  });

  // Simular publicação de item (não salva no banco ainda)
  const publicarItemSimulado = useMutation({
    mutationFn: async (itemData: any) => {
      if (!user?.id) throw new Error('Usuário não autenticado');

      // Por enquanto, apenas simula o sucesso
      // Quando for implementar o salvamento real, usar este código:
      /*
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
      */

      // Simulação de delay de rede
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      return {
        id: 'simulated-' + Date.now(),
        titulo: itemData.titulo,
        ...itemData
      };
    },
    onSuccess: (data) => {
      toast.success('Item publicado com sucesso! 🎉');
      console.log('📝 Item simulado criado:', data);
      
      // Invalidar queries para recarregar o progresso
      queryClient.invalidateQueries({ queryKey: ['progresso-pacto-entrada'] });
      queryClient.invalidateQueries({ queryKey: ['pacto-entrada-status'] });
    },
    onError: (error: any) => {
      console.error('Erro ao publicar item:', error);
      toast.error('Erro ao publicar item. Tente novamente.');
    }
  });

  // Valores derivados
  const itensPublicados = progressoMissao?.progresso_atual || 0;
  const itensNecessarios = progressoMissao?.progresso_necessario || 2;
  const missaoCompleta = progressoMissao?.status === 'completa';
  const recompensaGirinhas = progressoMissao?.missoes?.recompensa_girinhas || 100;
  const itensRestantes = Math.max(0, itensNecessarios - itensPublicados);
  const progressoPercentual = Math.round((itensPublicados / itensNecessarios) * 100);

  return {
    // Dados brutos
    progressoMissao,
    isLoading,
    
    // Função de publicação (simulada por enquanto)
    publicarItem: publicarItemSimulado,
    isPublishing: publicarItemSimulado.isPending,
    
    // Valores calculados
    itensPublicados,
    itensNecessarios,
    itensRestantes,
    missaoCompleta,
    recompensaGirinhas,
    progressoPercentual,
    
    // Lista de itens já publicados
    itensJaPublicados: progressoMissao?.itens_publicados || [],
    
    // Status helpers
    precisaPublicar: !missaoCompleta,
    podeColetarRecompensa: missaoCompleta && progressoMissao?.status !== 'coletada'
  };
};
