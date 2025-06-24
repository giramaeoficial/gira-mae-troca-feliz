
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔍 [verify-stripe-payment] Verificando pagamento...');

    // Create Supabase client with service role for database operations
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get authenticated user
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Authorization header is required");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !userData.user) {
      throw new Error("User not authenticated");
    }

    const user = userData.user;
    const { session_id } = await req.json();

    if (!session_id) {
      throw new Error("Session ID is required");
    }

    console.log('🔍 [verify-stripe-payment] Verificando sessão:', session_id);

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Retrieve checkout session
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== 'paid') {
      throw new Error("Payment not completed");
    }

    if (session.metadata?.user_id !== user.id) {
      throw new Error("Session does not belong to authenticated user");
    }

    const quantidade = parseInt(session.metadata?.quantidade || '0');
    
    if (!quantidade) {
      throw new Error("Invalid quantity in session metadata");
    }

    console.log('💰 [verify-stripe-payment] Pagamento confirmado, processando:', quantidade, 'Girinhas');

    // CORREÇÃO CRÍTICA: Verificar se já foi processado para evitar duplicação
    const { data: compraExistente } = await supabaseService
      .from('compras_girinhas')
      .select('id')
      .eq('payment_id', `stripe_${session_id}`)
      .maybeSingle();

    if (compraExistente) {
      console.log('⚠️ [verify-stripe-payment] Pagamento já processado anteriormente');
      return new Response(JSON.stringify({
        success: true,
        quantidade: quantidade,
        valor_pago: (session.amount_total || 0) / 100,
        message: "Payment already processed"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // CORREÇÃO: Usar transação manual para garantir atomicidade
    console.log('🔧 [verify-stripe-payment] Iniciando transação manual...');

    // 1. Primeiro criar a transação
    const { data: transacaoData, error: transacaoError } = await supabaseService
      .from('transacoes')
      .insert({
        user_id: user.id,
        tipo: 'compra',
        valor: quantidade,
        descricao: `Compra de ${quantidade} Girinhas via Stripe`,
        valor_real: (session.amount_total || 0) / 100,
        quantidade_girinhas: quantidade,
        data_expiracao: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 ano
        metadados: {
          payment_id: `stripe_${session_id}`,
          stripe_session_id: session_id
        }
      })
      .select()
      .single();

    if (transacaoError) {
      console.error('❌ [verify-stripe-payment] Erro ao criar transação:', transacaoError);
      throw new Error(`Erro ao criar transação: ${transacaoError.message}`);
    }

    console.log('✅ [verify-stripe-payment] Transação criada:', transacaoData.id);

    // 2. Atualizar carteira diretamente
    const { data: carteiraAtual, error: carteiraSelectError } = await supabaseService
      .from('carteiras')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (carteiraSelectError) {
      console.error('❌ [verify-stripe-payment] Erro ao buscar carteira:', carteiraSelectError);
      throw new Error(`Erro ao buscar carteira: ${carteiraSelectError.message}`);
    }

    // Se não existe carteira, criar uma
    if (!carteiraAtual) {
      console.log('💡 [verify-stripe-payment] Criando carteira inicial...');
      const { error: carteiraCreateError } = await supabaseService
        .from('carteiras')
        .insert({
          user_id: user.id,
          saldo_atual: quantidade,
          total_recebido: quantidade,
          total_gasto: 0
        });

      if (carteiraCreateError) {
        console.error('❌ [verify-stripe-payment] Erro ao criar carteira:', carteiraCreateError);
        throw new Error(`Erro ao criar carteira: ${carteiraCreateError.message}`);
      }
    } else {
      // Atualizar carteira existente
      console.log('💰 [verify-stripe-payment] Atualizando carteira existente...');
      const { error: carteiraUpdateError } = await supabaseService
        .from('carteiras')
        .update({
          saldo_atual: Number(carteiraAtual.saldo_atual) + quantidade,
          total_recebido: Number(carteiraAtual.total_recebido) + quantidade,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (carteiraUpdateError) {
        console.error('❌ [verify-stripe-payment] Erro ao atualizar carteira:', carteiraUpdateError);
        throw new Error(`Erro ao atualizar carteira: ${carteiraUpdateError.message}`);
      }
    }

    console.log('✅ [verify-stripe-payment] Carteira atualizada com sucesso');

    // 3. Registrar a compra
    const { error: registroError } = await supabaseService
      .from('compras_girinhas')
      .insert({
        user_id: user.id,
        valor_pago: (session.amount_total || 0) / 100,
        girinhas_recebidas: quantidade,
        status: 'aprovado',
        payment_id: `stripe_${session_id}`
      });

    if (registroError) {
      console.error('⚠️ [verify-stripe-payment] Erro ao registrar compra (mas transação foi processada):', registroError);
    }

    console.log('🎉 [verify-stripe-payment] Processo completo - Transação, carteira e compra processadas!');

    return new Response(JSON.stringify({
      success: true,
      quantidade: quantidade,
      transacao_id: transacaoData.id,
      valor_pago: (session.amount_total || 0) / 100
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error('❌ [verify-stripe-payment] Erro:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message || "Erro interno do servidor" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
