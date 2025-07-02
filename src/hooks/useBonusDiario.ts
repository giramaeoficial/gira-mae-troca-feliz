
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { TipoTransacaoEnum } from '@/types/transacao.types';

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

interface ConfigValue {
  ativo?: boolean;
  girinhas?: number;
  horas?: number;
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

      const ativoConfig = configObj.bonus_diario_ativo as ConfigValue;
      const valorConfig = configObj.bonus_diario_valor as ConfigValue;
      const validadeConfig = configObj.bonus_diario_validade as ConfigValue;

      return {
        ativo: ativoConfig?.ativo ?? true,
        valor_girinhas: valorConfig?.girinhas ?? 5,
        validade_horas: validadeConfig?.horas ?? 24
      };
    },
    staleTime: 60000, // 1 minuto
  });

  // Verificar status do bônus diário do usuário
  const { data: status, isLoading } = useQuery({
    queryKey: ['bonus-diario-status', user?.id],
    queryFn: async (): Promise<StatusBonusDiario> => {
      if (!user?.id) throw new Error('Usuário não autenticado');

      // ✅ CORREÇÃO: Usar novo tipo enum
      const { data: ultimoBonus, error } = await supabase
        .from('transacoes')
        .select('created_at')
        .eq('user_id', user.id)
        .eq('tipo', 'bonus_diario' as TipoTransacaoEnum)
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

      // ✅ CORREÇÃO: Usar função validada do backend
      const transacaoId = await supabase.rpc('criar_transacao_validada', {
        p_user_id: user.id,
        p_tipo: 'bonus_diario' as TipoTransacaoEnum,
        p_valor: valorGirinhas,
        p_descricao: `Bônus diário - ${valorGirinhas} Girinhas`,
        p_metadados: {
          validade_horas: validadeHoras,
          tipo_bonus: 'diario'
        }
      });

      if (!transacaoId) {
        throw new Error('Falha ao criar transação de bônus');
      }

      // Buscar carteira atual
      const { data: carteiraAtual } = await supabase
        .from('carteiras')
        .select('saldo_atual, total_recebido')
        .eq('user_id', user.id)
        .single();

      const saldoAtual = carteiraAtual?.saldo_atual || 0;
      const totalRecebidoAtual = carteiraAtual?.total_recebido || 0;

      // Atualizar carteira
      const { error: carteiraError } = await supabase
        .from('carteiras')
        .update({
          saldo_atual: Number(saldoAtual) + valorGirinhas,
          total_recebido: Number(totalRecebidoAtual) + valorGirinhas
        })
        .eq('user_id', user.id);

      if (carteiraError) throw carteiraError;

      return { transacao_id: transacaoId, valor: valorGirinhas };
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
