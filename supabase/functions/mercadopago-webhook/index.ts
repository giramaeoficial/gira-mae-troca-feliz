
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
    console.log('📥 [mercadopago-webhook] Raw body:', body);

    // 🔄 SUPORTE: Diferentes formatos de webhook do MP
    let webhookData;
    try {
      webhookData = JSON.parse(body);
    } catch (parseError) {
      console.error('❌ [mercadopago-webhook] Erro ao parsear JSON:', parseError);
      return new Response("Invalid JSON", { status: 400 });
    }

    // 🔄 ADAPTAÇÃO: Normalizar diferentes formatos de webhook
    let paymentId, webhookType, action;
    
    if (webhookData.data?.id) {
      // Formato novo: { type: "payment", data: { id: "123" } }
      paymentId = webhookData.data.id;
      webhookType = webhookData.type;
      action = webhookData.action;
    } else if (webhookData.topic === 'payment' && webhookData.resource) {
      // Formato alternativo: { topic: "payment", resource: "https://..." }
      const resourceUrl = webhookData.resource;
      const matches = resourceUrl.match(/\/payments\/(\d+)/);
      paymentId = matches ? matches[1] : null;
      webhookType = webhookData.topic;
    } else if (webhookData.topic === 'merchant_order') {
      // Ignorar merchant_order por enquanto
      console.log('⏭️ [mercadopago-webhook] Evento merchant_order ignorado');
      return new Response("Merchant order ignored", { status: 200 });
    }

    console.log('📥 [mercadopago-webhook] Dados recebidos:', {
      type: webhookType,
      action: action,
      dataId: paymentId,
      rawData: webhookData
    });

    // 🔒 SEGURANÇA: Processar apenas eventos de pagamento
    if (webhookType !== 'payment') {
      console.log('⏭️ [mercadopago-webhook] Evento ignorado:', webhookType);
      return new Response("Event ignored", { status: 200 });
    }

    if (!paymentId) {
      console.error('❌ [mercadopago-webhook] Payment ID não encontrado no webhook');
      return new Response("Payment ID not found", { status: 400 });
    }

    // 🔒 SEGURANÇA: Buscar dados do pagamento com retry para timing issues
    const mpAccessToken = Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN');
    if (!mpAccessToken) {
      throw new Error('MERCADO_PAGO_ACCESS_TOKEN não configurado');
    }

    console.log('🔑 [mercadopago-webhook] Token info:', {
      length: mpAccessToken.length,
      prefix: mpAccessToken.substring(0, 15) + '...',
      isAppToken: mpAccessToken.startsWith('APP_USR-')
    });

    let payment = null;
    let attempts = 0;
    const maxAttempts = 5; // Aumentar para 5 tentativas
    const baseDelay = 1000; // 1 segundo base

    while (attempts < maxAttempts && !payment) {
      attempts++;
      
      // Delay exponencial: 1s, 2s, 4s, 8s, 16s
      const delay = attempts > 1 ? baseDelay * Math.pow(2, attempts - 2) : 0;
      
      if (delay > 0) {
        console.log(`🔄 [mercadopago-webhook] Tentativa ${attempts}/${maxAttempts} - Aguardando ${delay / 1000}s...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        console.log(`🔍 [mercadopago-webhook] Tentativa ${attempts}/${maxAttempts} - Buscando pagamento: ${paymentId}`);
      }

      const paymentUrl = `https://api.mercadopago.com/v1/payments/${paymentId}`;
      console.log('🌐 [mercadopago-webhook] URL da requisição:', paymentUrl);

      const paymentResponse = await fetch(paymentUrl, {
        headers: {
          'Authorization': `Bearer ${mpAccessToken}`
        }
      });

      console.log('📡 [mercadopago-webhook] Response status:', {
        status: paymentResponse.status,
        statusText: paymentResponse.statusText,
        tentativa: attempts
      });

      if (paymentResponse.ok) {
        payment = await paymentResponse.json();
        console.log('✅ [mercadopago-webhook] Pagamento encontrado na tentativa', attempts);
        break;
      } else if (paymentResponse.status === 404) {
        // 🔄 RETRY: Comum no sandbox - timing issue
        const errorText = await paymentResponse.text();
        console.log(`⚠️ [mercadopago-webhook] Payment não encontrado (tentativa ${attempts}/${maxAttempts}):`, errorText);
        
        if (attempts >= maxAttempts) {
          // 🎯 ESTRATÉGIA: Não retornar 500 para evitar retry infinito
          console.log('❌ [mercadopago-webhook] Payment não encontrado após todas as tentativas');
          console.log('📋 [mercadopago-webhook] Possível timing issue no sandbox - retornando 200 para evitar loops');
          
          return new Response(JSON.stringify({
            warning: "Payment not found after retries",
            recommendation: "This is common in sandbox environment due to timing issues",
            payment_id: paymentId,
            attempts: maxAttempts,
            environment: "sandbox_timing_issue"
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200, // 🎯 IMPORTANTE: 200 para evitar retry do MP
          });
        }
      } else {
        // Outros erros HTTP
        const errorText = await paymentResponse.text();
        console.error('❌ [mercadopago-webhook] Erro HTTP na API do MP:', {
          status: paymentResponse.status,
          body: errorText,
          tentativa: attempts
        });
        
        // Para erros que não sejam 404, falhar imediatamente
        throw new Error(`Erro na API do MP: ${paymentResponse.status} - ${errorText}`);
      }
    }

    if (!payment) {
      console.log('❌ [mercadopago-webhook] Payment ainda não encontrado após todas as tentativas');
      return new Response(JSON.stringify({
        error: "Payment not found after retries",
        payment_id: paymentId,
        attempts: maxAttempts
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200, // 200 para evitar retry infinito
      });
    }
    
    console.log('💳 [mercadopago-webhook] Dados do pagamento obtidos:', {
      id: payment.id,
      status: payment.status,
      amount: payment.transaction_amount,
      external_reference: payment.external_reference,
      payment_method: payment.payment_method_id,
      live_mode: payment.live_mode
    });

    // 🔒 SEGURANÇA: Processar apenas pagamentos aprovados
    if (payment.status !== 'approved') {
      console.log(`⏳ [mercadopago-webhook] Pagamento não aprovado (status: ${payment.status}) - Aguardando aprovação`);
      return new Response(JSON.stringify({
        message: "Payment not approved yet",
        status: payment.status,
        payment_id: payment.id
      }), { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      });
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
    
    console.log('💰 [mercadopago-webhook] Processando compra aprovada:', {
      userId,
      quantidade,
      paymentId: payment.id,
      externalRef,
      ambiente: payment.live_mode ? 'PRODUÇÃO' : 'SANDBOX'
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
      
      // Se for erro de duplicação, não é crítico
      if (error.message?.includes('já processado')) {
        console.log('ℹ️ [mercadopago-webhook] Pagamento já foi processado anteriormente');
        return new Response(JSON.stringify({
          success: true,
          message: "Payment already processed",
          payment_id: payment.id
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
      
      throw error;
    }
    
    console.log('🎉 [mercadopago-webhook] Compra processada com sucesso!', {
      userId,
      quantidade,
      paymentId: payment.id,
      resultado: result,
      ambiente: payment.live_mode ? 'PRODUÇÃO' : 'SANDBOX'
    });

    return new Response(JSON.stringify({
      success: true,
      message: "Webhook processed successfully",
      payment_id: payment.id,
      user_id: userId,
      quantidade: quantidade,
      ambiente: payment.live_mode ? 'producao' : 'sandbox'
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error('❌ [mercadopago-webhook] Erro crítico não relacionado ao timing:', error);
    
    // Return 500 apenas para erros reais (não timing issues)
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
