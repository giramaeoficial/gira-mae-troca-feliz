
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export const useCodigoConfirmacao = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const finalizarTrocaComCodigo = async (reservaId: string, codigo: string): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Erro de autenticação",
        description: "Você precisa estar logado.",
        variant: "destructive",
      });
      return false;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('finalizar_troca_com_codigo', {
        p_reserva_id: reservaId,
        p_codigo: codigo,
        p_usuario_vendedor: user.id
      });

      if (error) {
        throw error;
      }

      const resultado = data as any;

      if (!resultado.sucesso) {
        toast({
          title: "Erro ao finalizar troca",
          description: resultado.erro,
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "🎉 Troca finalizada!",
        description: `Você recebeu ${resultado.valor_creditado} Girinhas. Taxa do marketplace: ${resultado.taxa_queimada} Girinhas.`,
      });

      return true;
    } catch (error: any) {
      console.error('Erro ao finalizar troca:', error);
      
      let mensagem = "Erro interno. Tente novamente.";
      if (error.message?.includes('Código de confirmação inválido')) {
        mensagem = "Código de confirmação inválido. Verifique com o comprador.";
      } else if (error.message?.includes('não encontrada')) {
        mensagem = "Reserva não encontrada ou você não é o vendedor.";
      }

      toast({
        title: "Erro ao finalizar troca",
        description: mensagem,
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    finalizarTrocaComCodigo,
    loading
  };
};
