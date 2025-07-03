
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RegisterRequest {
  user_id: string;
  player_id?: string;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 Registrando usuário OneSignal...');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const oneSignalAppId = Deno.env.get('ONESIGNAL_APP_ID');
    const oneSignalApiKey = Deno.env.get('ONESIGNAL_REST_API_KEY');

    if (!oneSignalAppId || !oneSignalApiKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'OneSignal não configurado' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body: RegisterRequest = await req.json();
    console.log('📋 Dados recebidos:', { user_id: body.user_id, has_player_id: !!body.player_id });

    // Verificar se usuário existe
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('id, nome')
      .eq('id', body.user_id)
      .single();

    if (userError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Usuário não encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('👤 Usuário encontrado:', user.nome);

    // Registrar no OneSignal
    let registrationResult = null;
    if (body.player_id) {
      try {
        // Método 1: Atualizar player existente com external_user_id
        const updateResponse = await fetch(`https://onesignal.com/api/v1/players/${body.player_id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${oneSignalApiKey}`,
          },
          body: JSON.stringify({
            app_id: oneSignalAppId,
            external_user_id: body.user_id,
          }),
        });

        if (updateResponse.ok) {
          registrationResult = await updateResponse.json();
          console.log('✅ Player atualizado:', registrationResult);
        }
      } catch (error) {
        console.warn('⚠️ Falha ao atualizar player:', error);
      }
    }

    // Atualizar preferências do usuário
    const { error: prefsError } = await supabase
      .from('user_notification_preferences')
      .upsert({
        user_id: body.user_id,
        push_enabled: true,
        push_subscription: {
          player_id: body.player_id,
          external_user_id: body.user_id,
          registered_at: new Date().toISOString()
        },
        updated_at: new Date().toISOString()
      });

    if (prefsError) {
      console.warn('⚠️ Erro ao atualizar preferências:', prefsError);
    }

    console.log('✅ Registro concluído com sucesso');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Usuário registrado com sucesso no OneSignal',
        player_id: body.player_id,
        external_user_id: body.user_id
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('❌ Erro no registro:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Erro interno do servidor'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
