
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface TransferenciaP2P {
  destinatario_id: string;
  quantidade: number;
}

interface CompraManualResponse {
  sucesso: boolean;
  transacao_id?: string;
  quantidade?: number;
  valor_total?: number;
  erro?: string;
}

export const useGirinhasSystem = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query para transferências do usuário
  const { data: transferencias } = useQuery({
    queryKey: ['transferencias-p2p', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('transferencias_girinhas')
        .select(`
          *,
          remetente:profiles!remetente_id(nome, avatar_url),
          destinatario:profiles!destinatario_id(nome, avatar_url)
        `)
        .or(`remetente_id.eq.${user.id},destinatario_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Query para queimas do usuário
  const { data: queimas } = useQuery({
    queryKey: ['queimas-girinhas', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('queimas_girinhas')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // ✅ MIGRADO: Mutation para compra manual usando V2 atômico
  const compraManualMutation = useMutation({
    mutationFn: async ({ quantidade }: { quantidade: number }): Promise<CompraManualResponse> => {
      if (!user) throw new Error('Usuário não autenticado');
      
      console.log('🔒 [GirinhasSystem] Iniciando compra V2 atômica:', quantidade);
      
      // ✅ NOVO: Usar processar_compra_girinhas_v2 (sistema atômico)
      const { data, error } = await supabase.rpc('processar_compra_girinhas_v2', {
        p_dados: {
          user_id: user.id,
          quantidade: quantidade,
          payment_id: `system_${Date.now()}_${Math.random()}`
        }
      });

      if (error) {
        console.error('❌ Erro na compra V2:', error);
        throw error;
      }
      
      console.log('✅ [GirinhasSystem] Compra V2 processada:', data);
      
      const resultado = data as unknown as CompraManualResponse;
      return resultado;
    },
    onSuccess: (data) => {
      // Invalidar TODOS os caches relacionados
      queryClient.invalidateQueries({ queryKey: ['carteira'] });
      queryClient.invalidateQueries({ queryKey: ['girinhas-expiracao'] });
      
      if (data.sucesso) {
        toast({
          title: "🎉 Compra realizada com sucesso!",
          description: `${data.quantidade} Girinhas adicionadas por R$ ${data.valor_total?.toFixed(2)}`,
        });
      }
    },
    onError: (error: any) => {
      console.error('❌ Erro na compra V2:', error);
      
      toast({
        title: "Erro na compra",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // ✅ MANTIDO: Mutation para transferência P2P server-side (já está correto)
  const transferirP2PMutation = useMutation({
    mutationFn: async (dados: TransferenciaP2P) => {
      if (!user) throw new Error('Usuário não autenticado');
      
      console.log('🔒 [GirinhasSystem] Transferência P2P SEGURA:', dados);
      
      if (!dados.destinatario_id || !dados.quantidade) {
        throw new Error('Dados obrigatórios não informados');
      }
      
      if (dados.quantidade <= 0) {
        throw new Error('Quantidade deve ser maior que zero');
      }
      
      if (dados.quantidade > 10000) {
        throw new Error('Quantidade máxima: 10.000 Girinhas por transferência');
      }
      
      // 🔒 Usar Edge Function que calcula taxa no servidor
      const { data: authData } = await supabase.auth.getSession();
      if (!authData.session?.access_token) {
        throw new Error('Sessão expirada. Faça login novamente.');
      }
      
      const response = await fetch('https://mkuuwnqiaeguuexeeicw.supabase.co/functions/v1/transferir-p2p', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authData.session.access_token}`,
        },
        body: JSON.stringify({
          destinatario_id: dados.destinatario_id,
          quantidade: dados.quantidade
        })
      });
      
      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Erro na transferência');
      }
      
      return result;
    },
    onSuccess: (data) => {
      // Invalidar TODOS os caches relacionados
      queryClient.invalidateQueries({ queryKey: ['carteira'] });
      queryClient.invalidateQueries({ queryKey: ['transferencias-p2p'] });
      queryClient.invalidateQueries({ queryKey: ['girinhas-expiracao'] });
      
      toast({
        title: "✅ Transferência realizada!",
        description: data.mensagem || "Girinhas transferidas com sucesso.",
      });
    },
    onError: (error: any) => {
      let mensagemErro = "Erro na transferência. Tente novamente.";
      
      if (error.message?.includes('Saldo insuficiente')) {
        mensagemErro = "Saldo insuficiente para esta transferência.";
      } else if (error.message?.includes('não encontrado')) {
        mensagemErro = "Destinatário não encontrado.";
      } else if (error.message?.includes('Muitas transferências')) {
        mensagemErro = "Muitas transferências recentes. Aguarde um momento.";
      } else if (error.message?.includes('Sessão expirada')) {
        mensagemErro = "Sua sessão expirou. Faça login novamente.";
      } else if (error.message) {
        mensagemErro = error.message;
      }
      
      toast({
        title: "❌ Erro na transferência",
        description: mensagemErro,
        variant: "destructive",
      });
    },
  });

  return {
    // Dados
    transferencias,
    queimas,
    
    // Estados
    isTransferindo: transferirP2PMutation.isPending,
    isComprandoManual: compraManualMutation.isPending,
    
    // ✅ Ações SEGURAS V2
    compraManual: compraManualMutation.mutate,
    transferirP2P: transferirP2PMutation.mutate,
  };
};
