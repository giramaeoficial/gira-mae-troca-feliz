
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useCarteira } from '@/hooks/useCarteira';

export const useStripePayment = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { refetch } = useCarteira();
  const [isProcessing, setIsProcessing] = useState(false);

  // Check for Stripe redirect parameters on mount
  useEffect(() => {
    const handleStripeRedirect = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const stripeSuccess = urlParams.get('stripe_success');
      const sessionId = urlParams.get('session_id');
      const stripeCanceled = urlParams.get('stripe_canceled');

      if (stripeCanceled) {
        toast({
          title: "Pagamento cancelado",
          description: "Você cancelou o pagamento. Tente novamente quando desejar.",
          variant: "destructive",
        });
        // Clean URL
        window.history.replaceState({}, '', '/carteira');
        return;
      }

      if (stripeSuccess && sessionId && user) {
        console.log('🔄 [useStripePayment] Verificando pagamento...');
        setIsProcessing(true);

        try {
          const { data, error } = await supabase.functions.invoke('verify-stripe-payment', {
            body: { session_id: sessionId }
          });

          if (error) throw error;

          if (data.success) {
            toast({
              title: "🎉 Pagamento confirmado!",
              description: `${data.quantidade} Girinhas adicionadas à sua carteira por R$ ${data.valor_pago.toFixed(2)}`,
            });

            // CORREÇÃO: Forçar múltiplas atualizações para garantir que o saldo seja atualizado
            await refetch();
            
            // Aguardar um pouco e fazer mais um refetch para garantir
            setTimeout(async () => {
              await refetch();
            }, 1000);
            
            // Terceiro refetch após mais tempo para garantia total
            setTimeout(async () => {
              await refetch();
            }, 2000);
          }
        } catch (error: any) {
          console.error('❌ [useStripePayment] Erro ao verificar pagamento:', error);
          toast({
            title: "Erro na verificação",
            description: "Houve um problema ao verificar seu pagamento. Entre em contato conosco se o valor foi debitado.",
            variant: "destructive",
          });
        } finally {
          setIsProcessing(false);
          // Clean URL
          window.history.replaceState({}, '', '/carteira');
        }
      }
    };

    handleStripeRedirect();
  }, [user, toast, refetch]);

  const iniciarPagamento = async (quantidade: number): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para comprar Girinhas.",
        variant: "destructive",
      });
      return false;
    }

    if (quantidade < 10) {
      toast({
        title: "Quantidade inválida",
        description: "A quantidade mínima é de 10 Girinhas.",
        variant: "destructive",
      });
      return false;
    }

    if (quantidade > 999000) {
      toast({
        title: "Quantidade inválida",
        description: "A quantidade máxima é de 999.000 Girinhas.",
        variant: "destructive",
      });
      return false;
    }

    setIsProcessing(true);

    try {
      console.log('🚀 [useStripePayment] Iniciando checkout para:', quantidade, 'Girinhas');

      const { data, error } = await supabase.functions.invoke('create-stripe-checkout', {
        body: { quantidade }
      });

      if (error) throw error;

      if (data.url) {
        // Redirect to Checkout
        window.location.href = data.url;
        return true;
      } else {
        throw new Error('URL de checkout não recebida');
      }
    } catch (error: any) {
      console.error('❌ [useStripePayment] Erro ao criar checkout:', error);
      
      toast({
        title: "Erro no pagamento",
        description: error.message || "Não foi possível iniciar o pagamento. Tente novamente.",
        variant: "destructive",
      });
      
      setIsProcessing(false);
      return false;
    }
  };

  return {
    iniciarPagamento,
    isProcessing
  };
};
