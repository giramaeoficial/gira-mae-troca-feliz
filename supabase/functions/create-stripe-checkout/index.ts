
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

  try {
    console.log('🔒 [create-stripe-checkout] Iniciando processamento...');

    // Create Supabase client for user authentication
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Get authenticated user
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
    console.log('✅ [create-stripe-checkout] Usuário autenticado:', user.id);

    // Parse request body
    const { quantidade } = await req.json();
    
    if (!quantidade || quantidade < 10) {
      throw new Error("Quantidade mínima é 10 Girinhas");
    }

    if (quantidade > 999000) {
      throw new Error("Quantidade máxima é 999.000 Girinhas");
    }

    console.log('📦 [create-stripe-checkout] Quantidade solicitada:', quantidade);

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Check if customer exists
    let customerId;
    const customers = await stripe.customers.list({ 
      email: user.email || '',
      limit: 1 
    });

    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      console.log('👤 [create-stripe-checkout] Cliente existente encontrado:', customerId);
    } else {
      console.log('👤 [create-stripe-checkout] Criando novo cliente...');
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price: "price_1RdcVDRtMzVAgCqGrL8dMI7T", // ID do produto no Stripe
          quantity: quantidade,
        },
      ],
      mode: "payment", // Pagamento único, não recorrente
      success_url: `${req.headers.get("origin")}/carteira?stripe_success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/carteira?stripe_canceled=true`,
      metadata: {
        user_id: user.id,
        quantidade: quantidade.toString(),
        tipo: "compra_girinhas"
      }
    });

    console.log('✅ [create-stripe-checkout] Sessão criada:', session.id);

    return new Response(JSON.stringify({ 
      url: session.url,
      session_id: session.id 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error('❌ [create-stripe-checkout] Erro:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message || "Erro interno do servidor" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
