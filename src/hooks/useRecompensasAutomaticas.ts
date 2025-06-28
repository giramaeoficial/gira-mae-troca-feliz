
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useRecompensasAutomaticas = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  // Função simples para mostrar recompensa com toast
  const mostrarRecompensa = (recompensa: any) => {
    toast({
      title: `🎉 ${recompensa.tipo === 'troca' ? 'Troca concluída!' : 
                 recompensa.tipo === 'avaliacao' ? 'Avaliação realizada!' :
                 recompensa.tipo === 'indicacao' ? 'Indicação premiada!' :
                 recompensa.tipo === 'meta' ? 'Meta conquistada!' :
                 'Bônus recebido!'}`,
      description: `${recompensa.descricao} Você ganhou ${recompensa.valor} Girinha${recompensa.valor > 1 ? 's' : ''}!`,
    });
  };

  const verificarRecompensasPendentes = async () => {
    if (!user) return;

    try {
      // Verificar se há bônus de cadastro pendente
      const { data: bonusExistente } = await supabase
        .from('transacoes')
        .select('id')
        .eq('user_id', user.id)
        .eq('tipo', 'bonus')
        .eq('descricao', 'Bônus de boas-vindas');

      if (!bonusExistente || bonusExistente.length === 0) {
        // Dar bônus de cadastro
        const { error: bonusError } = await supabase
          .from('transacoes')
          .insert({
            user_id: user.id,
            tipo: 'bonus',
            valor: 50,
            descricao: 'Bônus de boas-vindas'
          });

        if (!bonusError) {
          mostrarRecompensa({
            tipo: 'cadastro',
            valor: 50,
            descricao: 'Bem-vinda à comunidade GiraMãe! Aqui você faz parte de algo especial.'
          });
        }
      }
    } catch (error) {
      console.error('Erro ao verificar recompensas:', error);
    }
  };

  useEffect(() => {
    if (user) {
      verificarRecompensasPendentes();
    }
  }, [user]);

  return {
    verificarRecompensasPendentes,
    mostrarRecompensa
  };
};
