
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Only accept POST requests
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    console.log('🔔 [mercadopago-webhook] Webhook recebido do Mercado Pago');

    const body = await req.text();
    const webhookData = JSON.parse(body);
    
    console.log('📥 [mercadopago-webhook] Dados recebidos:', {
      type: webhookData.type,
      action: webhookData.action,
      dataId: webhookData.data?.id
    });

    // 🔒 SEGURANÇA: Processar apenas eventos de pagamento
    if (webhookData.type !== 'payment') {
      console.log('⏭️ [mercadopago-webhook] Evento ignorado:', webhookData.type);
      return new Response("Event ignored", { status: 200 });
    }

    const paymentId = webhookData.data?.id;
    if (!paymentId) {
      throw new Error('Payment ID não encontrado no webhook');
    }

    // 🔒 SEGURANÇA: Buscar dados do pagamento diretamente da API do Mercado Pago
    const mpAccessToken = Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN');
    if (!mpAccessToken) {
      throw new Error('MERCADO_PAGO_ACCESS_TOKEN não configurado');
    }

    console.log('🔍 [mercadopago-webhook] Buscando dados do pagamento:', paymentId);

    const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        'Authorization': `Bearer ${mpAccessToken}`
      }
    });
    
    if (!paymentResponse.ok) {
      throw new Error(`Erro ao buscar pagamento: ${paymentResponse.status}`);
    }
    
    const payment = await paymentResponse.json();
    
    console.log('💳 [mercadopago-webhook] Dados do pagamento:', {
      id: payment.id,
      status: payment.status,
      amount: payment.transaction_amount,
      external_reference: payment.external_reference
    });

    // 🔒 SEGURANÇA: Processar apenas pagamentos aprovados
    if (payment.status !== 'approved') {
      console.log(`⏳ [mercadopago-webhook] Pagamento não aprovado: ${payment.status}`);
      return new Response("Payment not approved", { status: 200 });
    }

    // 🔒 SEGURANÇA: Validar referência externa
    const externalRef = payment.external_reference;
    if (!externalRef || !externalRef.startsWith('girinha_')) {
      console.error('❌ [mercadopago-webhook] Referência externa inválida:', externalRef);
      throw new Error('Referência externa inválida');
    }

    // Extrair user_id da referência externa
    const refParts = externalRef.split('_');
    if (refParts.length < 4) {
      throw new Error('Formato de referência externa inválido');
    }

    const userId = refParts[1];
    const quantidade = Math.floor(payment.transaction_amount); // Quantidade = valor pago em reais
    
    console.log('💰 [mercadopago-webhook] Processando compra:', {
      userId,
      quantidade,
      paymentId: payment.id,
      externalRef
    });

    // 🔒 SEGURANÇA: Validar dados antes de processar
    if (!userId || !quantidade || quantidade < 10 || quantidade > 999000) {
      throw new Error(`Dados inválidos: userId=${userId}, quantidade=${quantidade}`);
    }

    // Create Supabase client with service role for database operations
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // 🔒 SEGURANÇA: Processar compra usando função RPC segura
    const { data: result, error } = await supabaseService.rpc('processar_compra_webhook_segura', {
      p_user_id: userId,
      p_quantidade: quantidade,
      p_payment_id: payment.id,
      p_external_reference: externalRef,
      p_payment_method: payment.payment_method_id || 'mercadopago',
      p_payment_status: payment.status
    });
    
    if (error) {
      console.error('❌ [mercadopago-webhook] Erro ao processar compra:', error);
      throw error;
    }
    
    console.log('🎉 [mercadopago-webhook] Compra processada com sucesso!', {
      userId,
      quantidade,
      paymentId: payment.id,
      resultado: result
    });

    return new Response(JSON.stringify({
      success: true,
      message: "Webhook processed successfully",
      payment_id: payment.id,
      user_id: userId,
      quantidade: quantidade
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error('❌ [mercadopago-webhook] Erro crítico:', error);
    
    // Return 500 for real internal errors so Mercado Pago retries
    return new Response(JSON.stringify({ 
      error: "Internal server error",
      message: error.message,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
