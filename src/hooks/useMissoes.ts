
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export interface Missao {
  id: string;
  titulo: string;
  descricao: string;
  tipo_missao: 'basic' | 'engagement' | 'social';
  categoria: string;
  icone: string;
  recompensa_girinhas: number;
  validade_recompensa_meses: number;
  condicoes: {
    tipo: string;
    quantidade: number;
  };
  prazo_dias?: number;
  progresso_atual?: number;
  progresso_necessario?: number;
  status?: 'em_progresso' | 'completa' | 'coletada' | 'expirada';
  data_completada?: string;
}

export interface LimiteMissoes {
  total_girinhas_coletadas: number;
  limite_maximo: number;
  proximo_reset: string;
}

interface ColetarRecompensaResponse {
  sucesso: boolean;
  girinhas_recebidas?: number;
  erro?: string;
}

export const useMissoes = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar missões do usuário
  const { data: missoes = [], isLoading } = useQuery({
    queryKey: ['missoes', user?.id],
    queryFn: async () => {
      console.log('🔍 Buscando missões para usuário:', user?.id);
      
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('missoes')
        .select(`
          *,
          missoes_usuarios (
            progresso_atual,
            progresso_necessario,
            status,
            data_completada
          )
        `)
        .eq('ativo', true)
        .order('tipo_missao')
        .order('recompensa_girinhas', { ascending: false });

      if (error) {
        console.error('❌ Erro ao buscar missões:', error);
        throw error;
      }

      console.log('✅ Missões encontradas:', data?.length);

      return data.map(missao => ({
        ...missao,
        condicoes: missao.condicoes as { tipo: string; quantidade: number },
        progresso_atual: missao.missoes_usuarios?.[0]?.progresso_atual || 0,
        progresso_necessario: missao.missoes_usuarios?.[0]?.progresso_necessario || (missao.condicoes as any).quantidade,
        status: missao.missoes_usuarios?.[0]?.status || 'em_progresso',
        data_completada: missao.missoes_usuarios?.[0]?.data_completada
      })) as Missao[];
    },
    enabled: !!user?.id
  });

  // Buscar limites do usuário
  const { data: limite } = useQuery({
    queryKey: ['limite-missoes', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('limites_missoes_usuarios')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as LimiteMissoes;
    },
    enabled: !!user?.id
  });

  // Coletar recompensa
  const coletarRecompensa = useMutation({
    mutationFn: async (missaoId: string) => {
      console.log('🎁 Tentando coletar recompensa da missão:', missaoId);
      console.log('👤 Usuário:', user?.id);
      
      if (!user?.id) {
        console.error('❌ Usuário não autenticado');
        throw new Error('Usuário não autenticado');
      }

      // Verificar se a missão existe e está completa
      const missao = missoes.find(m => m.id === missaoId);
      console.log('📋 Dados da missão encontrada:', missao);
      
      if (!missao) {
        console.error('❌ Missão não encontrada:', missaoId);
        throw new Error('Missão não encontrada');
      }

      if (missao.status !== 'completa') {
        console.error('❌ Missão não está completa. Status atual:', missao.status);
        throw new Error('Missão não está completa');
      }

      console.log('🚀 Chamando função do Supabase: coletar_recompensa_missao');
      console.log('📊 Parâmetros enviados:', {
        p_user_id: user.id,
        p_missao_id: missaoId
      });
      
      try {
        const { data, error } = await supabase.rpc('coletar_recompensa_missao', {
          p_user_id: user.id,
          p_missao_id: missaoId
        });

        console.log('📥 Resposta da função:', { data, error });

        if (error) {
          console.error('❌ Erro na função do Supabase:', error);
          console.error('🔍 Detalhes do erro:', {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint
          });
          
          // Se o erro for relacionado a constraint, dar uma mensagem mais clara
          if (error.message?.includes('transacoes_tipo_check') || error.message?.includes('violates check constraint')) {
            throw new Error('Erro no tipo de transação. Por favor, contate o suporte.');
          }
          
          throw error;
        }
        
        return data as unknown as ColetarRecompensaResponse;
      } catch (functionError) {
        console.error('💥 Erro capturado ao chamar função RPC:', functionError);
        throw functionError;
      }
    },
    onSuccess: (data) => {
      console.log('🎉 Sucesso ao coletar recompensa:', data);
      
      if (data.sucesso) {
        toast({
          title: "🎉 Recompensa coletada!",
          description: `Você recebeu ${data.girinhas_recebidas} Girinhas`,
        });
        
        queryClient.invalidateQueries({ queryKey: ['missoes'] });
        queryClient.invalidateQueries({ queryKey: ['limite-missoes'] });
        queryClient.invalidateQueries({ queryKey: ['carteira'] });
      } else {
        console.error('❌ Falha ao coletar:', data.erro);
        toast({
          title: "Erro ao coletar recompensa",
          description: data.erro || "Erro desconhecido",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      console.error('❌ Erro ao coletar recompensa:', error);
      
      let errorMessage = "Tente novamente em alguns instantes";
      
      if (error.message?.includes('transacoes_tipo_check') || error.message?.includes('violates check constraint')) {
        errorMessage = "Erro no tipo de transação. A configuração do sistema precisa ser ajustada.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Erro ao coletar recompensa",
        description: errorMessage,
        variant: "destructive",
      });
    }
  });

  // Verificar progresso
  const verificarProgresso = useMutation({
    mutationFn: async () => {
      console.log('🔄 Verificando progresso das missões');
      
      if (!user?.id) throw new Error('Usuário não autenticado');

      const { error } = await supabase.rpc('verificar_progresso_missoes', {
        p_user_id: user.id
      });

      if (error) {
        console.error('❌ Erro ao verificar progresso:', error);
        throw error;
      }
      
      console.log('✅ Progresso verificado com sucesso');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['missoes'] });
    }
  });

  // Estatísticas
  const missoesCompletas = missoes.filter(m => m.status === 'completa').length;
  const missoesColetadas = missoes.filter(m => m.status === 'coletada').length;
  const totalGirinhasDisponiveis = missoes
    .filter(m => m.status === 'completa')
    .reduce((total, m) => total + m.recompensa_girinhas, 0);

  const progressoTotal = limite ? {
    atual: limite.total_girinhas_coletadas,
    maximo: limite.limite_maximo,
    percentual: Math.round((limite.total_girinhas_coletadas / limite.limite_maximo) * 100)
  } : null;

  console.log('📊 Estatísticas das missões:', {
    total: missoes.length,
    completas: missoesCompletas,
    coletadas: missoesColetadas,
    disponiveisParaColetar: totalGirinhasDisponiveis
  });

  return {
    missoes,
    limite,
    isLoading,
    coletarRecompensa,
    verificarProgresso,
    missoesCompletas,
    missoesColetadas,
    totalGirinhasDisponiveis,
    progressoTotal
  };
};
