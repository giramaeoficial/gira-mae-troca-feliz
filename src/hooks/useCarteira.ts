
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

type Carteira = Tables<'carteiras'>;
type Transacao = Tables<'transacoes'>;

export const useCarteira = () => {
  const { user } = useAuth();
  const [carteira, setCarteira] = useState<Carteira | null>(null);
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCarteira = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Buscar carteira do usuário
      const { data: carteiraData, error: carteiraError } = await supabase
        .from('carteiras')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (carteiraError) {
        console.error('Erro ao buscar carteira:', carteiraError);
        // Se não existe carteira, criar uma
        if (carteiraError.code === 'PGRST116') {
          await criarCarteiraInicial();
          return;
        }
        throw carteiraError;
      }

      setCarteira(carteiraData);

      // Buscar transações do usuário
      const { data: transacoesData, error: transacoesError } = await supabase
        .from('transacoes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (transacoesError) throw transacoesError;

      setTransacoes(transacoesData || []);

      // Verificar se os valores da carteira estão corretos
      await verificarConsistenciaCarteira(carteiraData, transacoesData || []);
    } catch (err) {
      console.error('Erro ao carregar carteira:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const verificarConsistenciaCarteira = async (carteira: Carteira, transacoes: Transacao[]) => {
    // Calcular valores corretos baseados nas transações
    const totalRecebido = transacoes
      .filter(t => t.tipo === 'recebido' || t.tipo === 'bonus')
      .reduce((total, t) => total + Number(t.valor), 0);
    
    const totalGasto = transacoes
      .filter(t => t.tipo === 'gasto')
      .reduce((total, t) => total + Number(t.valor), 0);
    
    const saldoCalculado = totalRecebido - totalGasto;

    // Verificar se há discrepância significativa (maior que 0.01)
    const discrepanciaSaldo = Math.abs(Number(carteira.saldo_atual) - saldoCalculado) > 0.01;
    const discrepanciaRecebido = Math.abs(Number(carteira.total_recebido) - totalRecebido) > 0.01;
    const discrepanciaGasto = Math.abs(Number(carteira.total_gasto) - totalGasto) > 0.01;

    if (discrepanciaSaldo || discrepanciaRecebido || discrepanciaGasto) {
      console.log('Discrepância detectada na carteira, corrigindo...');
      console.log('Valores da carteira:', {
        saldo: Number(carteira.saldo_atual),
        recebido: Number(carteira.total_recebido),
        gasto: Number(carteira.total_gasto)
      });
      console.log('Valores calculados:', {
        saldo: saldoCalculado,
        recebido: totalRecebido,
        gasto: totalGasto
      });

      // Corrigir os valores na carteira
      const { error: updateError } = await supabase
        .from('carteiras')
        .update({
          saldo_atual: saldoCalculado,
          total_recebido: totalRecebido,
          total_gasto: totalGasto,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user?.id);

      if (updateError) {
        console.error('Erro ao corrigir carteira:', updateError);
      } else {
        // Atualizar estado local com valores corretos
        setCarteira(prev => prev ? {
          ...prev,
          saldo_atual: saldoCalculado,
          total_recebido: totalRecebido,
          total_gasto: totalGasto
        } : null);
      }
    }
  };

  const criarCarteiraInicial = async () => {
    if (!user) return;

    try {
      // Criar carteira inicial
      const { data: carteiraData, error: carteiraError } = await supabase
        .from('carteiras')
        .insert({
          user_id: user.id,
          saldo_atual: 150.00,
          total_recebido: 150.00,
          total_gasto: 0.00
        })
        .select()
        .single();

      if (carteiraError) throw carteiraError;

      // Criar transações iniciais
      const transacoesIniciais = [
        {
          user_id: user.id,
          tipo: 'bonus' as const,
          valor: 50.00,
          descricao: 'Bônus de boas-vindas',
          created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          user_id: user.id,
          tipo: 'bonus' as const,
          valor: 100.00,
          descricao: 'Girinhas iniciais da comunidade',
          created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];

      const { data: transacoesData, error: transacoesError } = await supabase
        .from('transacoes')
        .insert(transacoesIniciais)
        .select();

      if (transacoesError) throw transacoesError;

      setCarteira(carteiraData);
      setTransacoes(transacoesData || []);
    } catch (err) {
      console.error('Erro ao criar carteira inicial:', err);
      setError(err instanceof Error ? err.message : 'Erro ao criar carteira');
    }
  };

  const adicionarTransacao = async (
    tipo: 'recebido' | 'gasto' | 'bonus',
    valor: number,
    descricao: string,
    itemId?: string,
    usuarioOrigem?: string
  ) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('transacoes')
        .insert({
          user_id: user.id,
          tipo,
          valor,
          descricao,
          item_id: itemId || null,
          usuario_origem: usuarioOrigem || null
        });

      if (error) throw error;

      // Recarregar dados
      await fetchCarteira();
      return true;
    } catch (err) {
      console.error('Erro ao adicionar transação:', err);
      setError(err instanceof Error ? err.message : 'Erro ao adicionar transação');
      return false;
    }
  };

  const verificarSaldo = (valor: number): boolean => {
    return carteira ? Number(carteira.saldo_atual) >= valor : false;
  };

  useEffect(() => {
    fetchCarteira();
  }, [user]);

  return {
    carteira,
    transacoes,
    loading,
    error,
    refetch: fetchCarteira,
    adicionarTransacao,
    verificarSaldo,
    saldo: carteira ? Number(carteira.saldo_atual) : 0,
    totalRecebido: carteira ? Number(carteira.total_recebido) : 0,
    totalGasto: carteira ? Number(carteira.total_gasto) : 0
  };
};
