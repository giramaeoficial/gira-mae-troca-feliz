
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useBonificacoes = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const processarBonusAvaliacao = async (reservaId: string, rating: number) => {
    if (!user) return false;

    try {
      setLoading(true);
      
      // Dar bônus de 0.5 Girinha por avaliação
      const { error } = await supabase
        .from('transacoes')
        .insert({
          user_id: user.id,
          tipo: 'bonus',
          valor: 0.5,
          descricao: 'Bônus por avaliar troca'
        });

      if (error) throw error;

      toast({
        title: "Bônus recebido! ⭐",
        description: "Você ganhou 0,5 Girinha por avaliar a troca.",
      });

      return true;
    } catch (error) {
      console.error('Erro ao processar bônus de avaliação:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const processarBonusIndicacao = async (indicadoId: string) => {
    if (!user) return false;

    try {
      setLoading(true);

      // Verificar se já existe indicação
      const { data: indicacaoExistente } = await supabase
        .from('indicacoes')
        .select('id')
        .eq('indicador_id', user.id)
        .eq('indicado_id', indicadoId)
        .single();

      if (indicacaoExistente) {
        return false; // Já existe indicação
      }

      // Criar registro de indicação
      const { error: indicacaoError } = await supabase
        .from('indicacoes')
        .insert({
          indicador_id: user.id,
          indicado_id: indicadoId,
          bonus_pago: true
        });

      if (indicacaoError) throw indicacaoError;

      // Dar bônus de 2 Girinhas por indicação
      const { error: transacaoError } = await supabase
        .from('transacoes')
        .insert({
          user_id: user.id,
          tipo: 'bonus',
          valor: 2,
          descricao: 'Bônus por indicação de nova usuária'
        });

      if (transacaoError) throw transacaoError;

      toast({
        title: "Bônus de indicação! 🎉",
        description: "Você ganhou 2 Girinhas por indicar uma nova mãe!",
      });

      return true;
    } catch (error) {
      console.error('Erro ao processar bônus de indicação:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const verificarBonusAniversario = async () => {
    if (!user) return;

    try {
      // Buscar data de nascimento do perfil
      const { data: profile } = await supabase
        .from('profiles')
        .select('data_nascimento')
        .eq('id', user.id)
        .single();

      if (!profile?.data_nascimento) return;

      const hoje = new Date();
      const aniversario = new Date(profile.data_nascimento);
      
      // Verificar se é aniversário (mesmo dia e mês)
      if (hoje.getDate() === aniversario.getDate() && 
          hoje.getMonth() === aniversario.getMonth()) {
        
        // Verificar se já foi dado o bônus este ano
        const { data: bonusExistente } = await supabase
          .from('transacoes')
          .select('id')
          .eq('user_id', user.id)
          .eq('tipo', 'bonus')
          .eq('descricao', `Bônus de aniversário ${hoje.getFullYear()}`)
          .maybeSingle();

        if (!bonusExistente) {
          // Dar bônus de aniversário
          await supabase
            .from('transacoes')
            .insert({
              user_id: user.id,
              tipo: 'bonus',
              valor: 5,
              descricao: `Bônus de aniversário ${hoje.getFullYear()}`
            });

          toast({
            title: "Feliz Aniversário! 🎂",
            description: "Você ganhou 5 Girinhas de presente de aniversário!",
          });
        }
      }
    } catch (error) {
      console.error('Erro ao verificar bônus de aniversário:', error);
    }
  };

  useEffect(() => {
    if (user) {
      verificarBonusAniversario();
    }
  }, [user]);

  return {
    loading,
    processarBonusAvaliacao,
    processarBonusIndicacao,
    verificarBonusAniversario
  };
};
