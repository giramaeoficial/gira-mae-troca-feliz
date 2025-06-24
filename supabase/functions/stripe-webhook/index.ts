
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
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
    console.log('🔔 [stripe-webhook] Evento recebido do Stripe');

    // Get the raw body for signature verification
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      console.error('❌ [stripe-webhook] Assinatura Stripe ausente');
      return new Response("Missing Stripe signature", { status: 400 });
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Verify webhook signature
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    if (!webhookSecret) {
      console.error('❌ [stripe-webhook] STRIPE_WEBHOOK_SECRET não configurado');
      return new Response("Webhook secret not configured", { status: 500 });
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      console.log('✅ [stripe-webhook] Assinatura verificada com sucesso');
    } catch (err) {
      console.error('❌ [stripe-webhook] Falha na verificação da assinatura:', err.message);
      return new Response("Invalid signature", { status: 400 });
    }

    // Process only relevant events
    if (event.type !== "checkout.session.completed") {
      console.log('⏭️ [stripe-webhook] Evento ignorado:', event.type);
      return new Response("Event ignored", { status: 200 });
    }

    const session = event.data.object as Stripe.Checkout.Session;
    console.log('🔍 [stripe-webhook] Processando checkout.session.completed:', session.id);

    // Verify payment status
    if (session.payment_status !== 'paid') {
      console.log('⚠️ [stripe-webhook] Pagamento não confirmado:', session.payment_status);
      return new Response("Payment not confirmed", { status: 200 });
    }

    // Extract user ID and quantity from metadata
    const userId = session.metadata?.user_id;
    const quantidade = parseInt(session.metadata?.quantidade || '0');

    if (!userId || !quantidade) {
      console.error('❌ [stripe-webhook] Metadados inválidos:', { userId, quantidade });
      return new Response("Invalid metadata", { status: 400 });
    }

    console.log('💰 [stripe-webhook] Processando pagamento:', { userId, quantidade, sessionId: session.id });

    // Create Supabase client with service role for database operations
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Check for idempotency - ensure we don't process the same event twice
    const { data: existingTransaction } = await supabaseService
      .from('transacoes')
      .select('id')
      .eq('metadados->stripe_session_id', session.id)
      .maybeSingle();

    if (existingTransaction) {
      console.log('⚠️ [stripe-webhook] Evento já processado anteriormente:', session.id);
      return new Response("Event already processed", { status: 200 });
    }

    // Start atomic transaction processing
    console.log('🔧 [stripe-webhook] Iniciando processamento atômico...');

    // 1. Create transaction record
    const { data: transacaoData, error: transacaoError } = await supabaseService
      .from('transacoes')
      .insert({
        user_id: userId,
        tipo: 'compra',
        valor: quantidade,
        descricao: `Compra de ${quantidade} Girinhas via Stripe (Webhook)`,
        valor_real: (session.amount_total || 0) / 100,
        quantidade_girinhas: quantidade,
        data_expiracao: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        metadados: {
          stripe_session_id: session.id,
          payment_id: `stripe_${session.id}`,
          processed_via_webhook: true,
          webhook_event_id: event.id
        }
      })
      .select()
      .single();

    if (transacaoError) {
      console.error('❌ [stripe-webhook] Erro ao criar transação:', transacaoError);
      throw new Error(`Erro ao criar transação: ${transacaoError.message}`);
    }

    console.log('✅ [stripe-webhook] Transação criada:', transacaoData.id);

    // 2. Update or create wallet
    const { data: carteiraAtual, error: carteiraSelectError } = await supabaseService
      .from('carteiras')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (carteiraSelectError) {
      console.error('❌ [stripe-webhook] Erro ao buscar carteira:', carteiraSelectError);
      throw new Error(`Erro ao buscar carteira: ${carteiraSelectError.message}`);
    }

    if (!carteiraAtual) {
      // Create new wallet
      console.log('💡 [stripe-webhook] Criando carteira inicial...');
      const { error: carteiraCreateError } = await supabaseService
        .from('carteiras')
        .insert({
          user_id: userId,
          saldo_atual: quantidade,
          total_recebido: quantidade,
          total_gasto: 0
        });

      if (carteiraCreateError) {
        console.error('❌ [stripe-webhook] Erro ao criar carteira:', carteiraCreateError);
        throw new Error(`Erro ao criar carteira: ${carteiraCreateError.message}`);
      }
    } else {
      // Update existing wallet
      console.log('💰 [stripe-webhook] Atualizando carteira existente...');
      const { error: carteiraUpdateError } = await supabaseService
        .from('carteiras')
        .update({
          saldo_atual: Number(carteiraAtual.saldo_atual) + quantidade,
          total_recebido: Number(carteiraAtual.total_recebido) + quantidade,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (carteiraUpdateError) {
        console.error('❌ [stripe-webhook] Erro ao atualizar carteira:', carteiraUpdateError);
        throw new Error(`Erro ao atualizar carteira: ${carteiraUpdateError.message}`);
      }
    }

    console.log('✅ [stripe-webhook] Carteira atualizada com sucesso');

    // 3. Record purchase
    const { error: registroError } = await supabaseService
      .from('compras_girinhas')
      .insert({
        user_id: userId,
        valor_pago: (session.amount_total || 0) / 100,
        girinhas_recebidas: quantidade,
        status: 'aprovado',
        payment_id: `stripe_${session.id}`
      });

    if (registroError) {
      console.error('⚠️ [stripe-webhook] Erro ao registrar compra (transação já processada):', registroError);
    }

    console.log('🎉 [stripe-webhook] Webhook processado com sucesso!', {
      userId,
      quantidade,
      transacaoId: transacaoData.id,
      sessionId: session.id,
      eventId: event.id
    });

    return new Response(JSON.stringify({
      success: true,
      message: "Webhook processed successfully",
      transaction_id: transacaoData.id
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error('❌ [stripe-webhook] Erro crítico:', error);
    
    // Return 500 for real internal errors so Stripe retries
    return new Response(JSON.stringify({ 
      error: "Internal server error",
      message: error.message 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
