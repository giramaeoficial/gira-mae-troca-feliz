import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import type { PerfilBeneficiario, HistoricoCredito } from '@/types/parcerias';

export function usePerfilBeneficiario(userId: string, programaId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Query: Perfil Completo do Beneficiário
  const { data: perfil, isLoading } = useQuery({
    queryKey: ['perfil-beneficiario', userId, programaId],
    queryFn: async (): Promise<PerfilBeneficiario | null> => {
      // Buscar validação do usuário
      const { data: validacao, error: validacaoError } = await supabase
        .from('parcerias_usuarios_validacao')
        .select('*')
        .eq('user_id', userId)
        .eq('programa_id', programaId)
        .eq('status', 'aprovado')
        .single();

      if (validacaoError || !validacao) return null;

      // Buscar profile separadamente
      const { data: profile } = await supabase
        .from('profiles')
        .select('nome, email, telefone, avatar_url')
        .eq('id', userId)
        .single();

      // Buscar histórico de créditos
      const { data: historico } = await supabase
        .from('parcerias_historico_creditos')
        .select('*')
        .eq('user_id', userId)
        .eq('programa_id', programaId)
        .order('mes_referencia', { ascending: false });

      const historicoCreditos: HistoricoCredito[] = (historico || []) as HistoricoCredito[];

      // Calcular resumo financeiro
      const totalCreditos = historicoCreditos.reduce((sum, h) => sum + h.valor_creditado, 0);

      const mesAtual = new Date().toISOString().slice(0, 7);
      const creditosMesAtual = historicoCreditos
        .filter(h => h.mes_referencia === mesAtual)
        .reduce((sum, h) => sum + h.valor_creditado, 0);

      const mesesComCredito = historicoCreditos.length;
      const mediaMensal = mesesComCredito > 0 ? totalCreditos / mesesComCredito : 0;

      // Buscar padrão de uso (simplificado)
      const { data: carteira } = await supabase
        .from('carteiras')
        .select('saldo_atual, total_gasto')
        .eq('user_id', userId)
        .single();

      return {
        id: validacao.id,
        user_id: userId,
        programa_id: programaId,
        nome: profile?.nome || '',
        email: profile?.email || '',
        telefone: profile?.telefone,
        avatar_url: profile?.avatar_url,
        status: validacao.ativo ? 'ativo' : 'suspenso',
        data_aprovacao: validacao.data_validacao || '',
        resumo_financeiro: {
          total_creditos_recebidos: totalCreditos,
          creditos_mes_atual: creditosMesAtual,
          media_mensal: mediaMensal,
        },
        historico_creditos: historicoCreditos,
        padrao_uso: {
          percentual_gasto_itens: 0,
          percentual_transferido_p2p: 0,
          saldo_atual: carteira?.saldo_atual || 0,
          categorias_favoritas: [],
        },
        documentos: Array.isArray(validacao.documentos) ? validacao.documentos as any[] : [],
        observacoes: [],
      };
    },
    enabled: !!userId && !!programaId,
  });

  // Mutation: Suspender Beneficiário
  const suspenderMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('parcerias_usuarios_validacao')
        .update({ ativo: false })
        .eq('user_id', userId)
        .eq('programa_id', programaId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['perfil-beneficiario', userId, programaId] });
      toast({
        title: "Beneficiário suspenso",
        description: "O beneficiário foi suspenso temporariamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao suspender",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation: Reativar Beneficiário
  const reativarMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('parcerias_usuarios_validacao')
        .update({ ativo: true })
        .eq('user_id', userId)
        .eq('programa_id', programaId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['perfil-beneficiario', userId, programaId] });
      toast({
        title: "Beneficiário reativado",
        description: "O beneficiário foi reativado no programa.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao reativar",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    perfil,
    loading: isLoading,
    suspender: suspenderMutation.mutate,
    reativar: reativarMutation.mutate,
  };
}
