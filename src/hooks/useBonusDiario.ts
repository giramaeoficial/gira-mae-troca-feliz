
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface BonusDiarioConfig {
  ativo: boolean;
  valor_girinhas: number;
  validade_horas: number;
}

interface StatusBonusDiario {
  pode_coletar: boolean;
  ultimo_bonus: string | null;
  proxima_coleta: string | null;
  horas_restantes: number;
  ja_coletou_hoje: boolean;
}

export const useBonusDiario = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar configuração do bônus diário
  const { data: config } = useQuery({
    queryKey: ['bonus-diario-config'],
    queryFn: async (): Promise<BonusDiarioConfig> => {
      const { data, error } = await supabase
        .from('config_sistema')
        .select('chave, valor')
        .in('chave', ['bonus_diario_ativo', 'bonus_diario_valor', 'bonus_diario_validade']);

      if (error) throw error;

      const configObj = data.reduce((acc, item) => {
        acc[item.chave] = item.valor;
        return acc;
      }, {} as any);

      return {
        ativo: configObj.bonus_diario_ativo?.ativo ?? true,
        valor_girinhas: configObj.bonus_diario_valor?.girinhas ?? 5,
        validade_horas: configObj.bonus_diario_validade?.horas ?? 24
      };
    },
    staleTime: 60000, // 1 minuto
  });

  // Verificar status do bônus diário do usuário
  const { data: status, isLoading } = useQuery({
    queryKey: ['bonus-diario-status', user?.id],
    queryFn: async (): Promise<StatusBonusDiario> => {
      if (!user?.id) throw new Error('Usuário não autenticado');

      // Buscar último bônus diário
      const { data: ultimoBonus, error } = await supabase
        .from('transacoes')
        .select('created_at')
        .eq('user_id', user.id)
        .eq('tipo', 'bonus')
        .like('descricao', 'Bônus diário%')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      const agora = new Date();
      const ultimoBonusData = ultimoBonus?.created_at ? new Date(ultimoBonus.created_at) : null;
      
      let pode_coletar = true;
      let horas_restantes = 0;
      let proxima_coleta = null;
      let ja_coletou_hoje = false;

      if (ultimoBonusData) {
        const horasDesdeUltimo = (agora.getTime() - ultimoBonusData.getTime()) / (1000 * 60 * 60);
        const horasNecessarias = config?.validade_horas ?? 24;
        
        if (horasDesdeUltimo < horasNecessarias) {
          pode_coletar = false;
          ja_coletou_hoje = true;
          horas_restantes = Math.ceil(horasNecessarias - horasDesdeUltimo);
          proxima_coleta = new Date(ultimoBonusData.getTime() + (horasNecessarias * 60 * 60 * 1000)).toISOString();
        }
      }

      return {
        pode_coletar: pode_coletar && (config?.ativo ?? true),
        ultimo_bonus: ultimoBonusData?.toISOString() ?? null,
        proxima_coleta,
        horas_restantes,
        ja_coletou_hoje
      };
    },
    enabled: !!user?.id && !!config,
    refetchInterval: 60000, // Atualizar a cada minuto
  });

  // Mutation para coletar bônus diário
  const coletarBonusMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('Usuário não autenticado');
      if (!config?.ativo) throw new Error('Bônus diário está desativado');
      if (!status?.pode_coletar) throw new Error('Bônus diário não disponível');

      const valorGirinhas = config.valor_girinhas;
      const validadeHoras = config.validade_horas;
      
      // Calcular data de expiração
      const dataExpiracao = new Date();
      dataExpiracao.setHours(dataExpiracao.getHours() + validadeHoras);

      // Criar transação de bônus diário
      const { data, error } = await supabase
        .from('transacoes')
        .insert({
          user_id: user.id,
          tipo: 'bonus',
          valor: valorGirinhas,
          descricao: `Bônus diário - ${valorGirinhas} Girinhas`,
          data_expiracao: dataExpiracao.toISOString().split('T')[0]
        })
        .select()
        .single();

      if (error) throw error;

      // Atualizar carteira
      const { error: carteiraError } = await supabase
        .from('carteiras')
        .update({
          saldo_atual: supabase.rpc('coalesce', { value: 0 }) + valorGirinhas,
          total_recebido: supabase.rpc('coalesce', { value: 0 }) + valorGirinhas
        })
        .eq('user_id', user.id);

      if (carteiraError) throw carteiraError;

      return data;
    },
    onSuccess: () => {
      const valorGirinhas = config?.valor_girinhas ?? 5;
      const validadeHoras = config?.validade_horas ?? 24;
      
      toast({
        title: "🎁 Bônus Diário Coletado!",
        description: `+${valorGirinhas} Girinhas adicionadas! Válidas por ${validadeHoras}h.`,
      });

      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['bonus-diario-status'] });
      queryClient.invalidateQueries({ queryKey: ['carteira'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao coletar bônus",
        description: error.message || "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    }
  });

  return {
    config,
    status,
    isLoading,
    coletarBonus: coletarBonusMutation.mutate,
    isColetando: coletarBonusMutation.isPending,
    podeColetarBonus: status?.pode_coletar && config?.ativo,
    proximaColeta: status?.proxima_coleta,
    horasRestantes: status?.horas_restantes ?? 0,
    jaColetouHoje: status?.ja_coletou_hoje ?? false,
  };
};
