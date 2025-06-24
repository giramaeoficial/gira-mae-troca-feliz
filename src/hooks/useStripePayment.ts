
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useCarteira } from '@/hooks/useCarteira';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useStripePayment = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { refetch } = useCarteira();
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);

  // Check for Stripe redirect parameters on mount
  useEffect(() => {
    const handleStripeRedirect = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const stripeSuccess = urlParams.get('stripe_success');
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

      if (stripeSuccess && user) {
        console.log('✅ [useStripePayment] Pagamento realizado via Stripe');
        
        toast({
          title: "🎉 Pagamento processado!",
          description: "Seu pagamento foi processado com sucesso. O saldo será atualizado automaticamente pelo sistema.",
        });

        // 🔒 SEGURANÇA: Não verificamos mais no frontend
        // O webhook do Stripe já processou o pagamento automaticamente
        
        // Invalidar cache e recarregar dados frescos
        console.log('🔄 [useStripePayment] Atualizando dados...');
        queryClient.clear();
        await refetch();
        
        // Clean URL
        window.history.replaceState({}, '', '/carteira');
      }
    };

    handleStripeRedirect();
  }, [user, toast, refetch, queryClient]);

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
