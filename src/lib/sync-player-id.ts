import { supabase } from '@/integrations/supabase/client';
import { getOneSignalPlayerId } from './onesignal';

export const syncPlayerIdWithDatabase = async (userId: string): Promise<boolean> => {
  try {
    console.log('[Sync Player ID] Iniciando sincronização para usuário:', userId);
    
    // Obter Player ID atual do OneSignal
    const currentPlayerId = getOneSignalPlayerId();
    
    if (!currentPlayerId) {
      console.warn('[Sync Player ID] Nenhum Player ID encontrado no OneSignal');
      return false;
    }
    
    console.log('[Sync Player ID] Player ID atual do OneSignal:', currentPlayerId);
    
    // Buscar preferências atuais do usuário
    const { data: preferences, error: fetchError } = await supabase
      .from('user_notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (fetchError) {
      console.error('[Sync Player ID] Erro ao buscar preferências:', fetchError);
      return false;
    }
    
    // Verificar se precisa atualizar
    const currentStoredPlayerId = preferences?.push_subscription?.player_id;
    
    if (currentStoredPlayerId === currentPlayerId) {
      console.log('[Sync Player ID] Player ID já está sincronizado');
      return true;
    }
    
    console.log('[Sync Player ID] Atualizando Player ID:', {
      antigo: currentStoredPlayerId,
      novo: currentPlayerId
    });
    
    // Atualizar push_subscription com novo Player ID
    const updatedPushSubscription = {
      ...preferences.push_subscription,
      player_id: currentPlayerId,
      last_sync: new Date().toISOString(),
      external_user_id: userId
    };
    
    const { error: updateError } = await supabase
      .from('user_notification_preferences')
      .update({
        push_subscription: updatedPushSubscription,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);
    
    if (updateError) {
      console.error('[Sync Player ID] Erro ao atualizar banco:', updateError);
      return false;
    }
    
    console.log('[Sync Player ID] ✅ Player ID sincronizado com sucesso!');
    
    // Chamar função de registro no backend
    try {
      const { data: registerResult } = await supabase.functions.invoke('register-onesignal-user', {
        body: {
          user_id: userId,
          player_id: currentPlayerId
        }
      });
      
      console.log('[Sync Player ID] Resultado do registro no OneSignal:', registerResult);
    } catch (registerError) {
      console.warn('[Sync Player ID] Erro no registro OneSignal (não crítico):', registerError);
    }
    
    return true;
    
  } catch (error) {
    console.error('[Sync Player ID] Erro geral na sincronização:', error);
    return false;
  }
};

// Hook para sincronização automática
export const useSyncPlayerIdOnLoad = (userId?: string) => {
  React.useEffect(() => {
    if (!userId) return;
    
    const syncWithDelay = async () => {
      // Aguardar OneSignal estar totalmente carregado
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const synced = await syncPlayerIdWithDatabase(userId);
      if (synced) {
        console.log('[Auto Sync] Player ID sincronizado automaticamente');
      }
    };
    
    syncWithDelay();
  }, [userId]);
};