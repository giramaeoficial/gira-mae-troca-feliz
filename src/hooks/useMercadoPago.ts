
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useCarteira } from '@/hooks/useCarteira';
import { supabase } from '@/integrations/supabase/client';

interface MercadoPagoPreference {
  preference_id: string;
  init_point: string;
  external_reference: string;
  sandbox_init_point?: string;
}

export const useMercadoPago = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { refetch } = useCarteira();
  const [isProcessing, setIsProcessing] = useState(false);

  const criarPreferencia = async (quantidade: number): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Erro de Autenticação",
        description: "Você precisa estar logado para comprar Girinhas.",
        variant: "destructive",
      });
      return false;
    }

    // 🔒 SEGURANÇA: Validações client-side
    if (!Number.isInteger(quantidade) || quantidade < 10 || quantidade > 999000) {
      toast({
        title: "Quantidade Inválida",
        description: "A quantidade deve ser entre 10 e 999.000 Girinhas.",
        variant: "destructive",
      });
      return false;
    }

    setIsProcessing(true);

    try {
      console.log('🚀 [useMercadoPago] Criando preferência para:', quantidade, 'Girinhas');

      const { data, error } = await supabase.functions.invoke('create-mercadopago-preference', {
        body: { quantidade }
      });

      if (error) {
        console.error('❌ [useMercadoPago] Erro na Edge Function:', error);
        throw new Error(error.message || 'Erro ao criar preferência de pagamento');
      }

      if (!data.preference_id) {
        throw new Error('Preferência inválida retornada');
      }

      const preference = data as MercadoPagoPreference;
      
      console.log('✅ [useMercadoPago] Preferência criada:', preference.preference_id);

      // 🔒 SEGURANÇA: Redirecionar para checkout oficial do Mercado Pago
      const checkoutUrl = preference.init_point || preference.sandbox_init_point;
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
        return true;
      } else {
        throw new Error('URL de checkout não recebida');
      }
    } catch (error: any) {
      console.error('❌ [useMercadoPago] Erro ao criar preferência:', error);
      
      toast({
        title: "Erro no Pagamento",
        description: error.message || "Não foi possível iniciar o pagamento. Tente novamente.",
        variant: "destructive",
      });
      
      setIsProcessing(false);
      return false;
    }
  };

  // Verificar status do pagamento baseado nos parâmetros da URL
  const verificarStatusPagamento = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    const externalRef = urlParams.get('ref');

    if (paymentStatus && externalRef) {
      switch (paymentStatus) {
        case 'success':
          toast({
            title: "🎉 Pagamento Aprovado!",
            description: "Suas Girinhas foram creditadas automaticamente. O saldo será atualizado em alguns instantes.",
          });
          // Limpar URL e recarregar dados
          window.history.replaceState({}, '', '/carteira');
          refetch();
          break;
        
        case 'failure':
          toast({
            title: "❌ Pagamento Recusado",
            description: "Seu pagamento foi recusado. Tente novamente com outro método de pagamento.",
            variant: "destructive",
          });
          window.history.replaceState({}, '', '/carteira');
          break;
        
        case 'pending':
          toast({
            title: "⏳ Pagamento Pendente",
            description: "Seu pagamento está sendo processado. Suas Girinhas serão creditadas assim que aprovado.",
          });
          window.history.replaceState({}, '', '/carteira');
          break;
      }
    }
  };

  return {
    criarPreferencia,
    verificarStatusPagamento,
    isProcessing
  };
};
