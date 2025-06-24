
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

    // Use the atomic V2 function to process the purchase
    const { data: resultado, error: compraError } = await supabaseService.rpc('processar_compra_girinhas_v2', {
      p_dados: {
        user_id: user.id,
        quantidade: quantidade,
        payment_id: `stripe_${session_id}`
      }
    });

    if (compraError) {
      console.error('❌ [verify-stripe-payment] Erro ao processar compra V2:', compraError);
      throw compraError;
    }

    const resultadoCompra = resultado as { sucesso: boolean; erro?: string; transacao_id?: string };
    
    if (!resultadoCompra.sucesso) {
      throw new Error(resultadoCompra.erro || 'Erro ao processar compra');
    }

    console.log('✅ [verify-stripe-payment] Compra processada com sucesso:', resultadoCompra);

    // Register the purchase in compras_girinhas table
    const { error: registroError } = await supabaseService
      .from('compras_girinhas')
      .insert({
        user_id: user.id,
        valor_pago: (session.amount_total || 0) / 100, // Convert from cents
        girinhas_recebidas: quantidade,
        status: 'aprovado',
        payment_id: `stripe_${session_id}`,
        stripe_session_id: session_id
      });

    if (registroError) {
      console.error('⚠️ [verify-stripe-payment] Erro ao registrar compra (mas transação foi processada):', registroError);
    }

    return new Response(JSON.stringify({
      success: true,
      quantidade: quantidade,
      transacao_id: resultadoCompra.transacao_id,
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
