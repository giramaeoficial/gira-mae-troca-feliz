// Inicialização robusta do OneSignal com persistência de Player ID
let initializationPromise: Promise<boolean> | null = null;

export const initializeOneSignal = async (userId?: string): Promise<boolean> => {
  if (typeof window === 'undefined') {
    console.log('[OneSignal - Inicialização] Ambiente não é de navegador. Abortando.');
    return false;
  }
  
  // Retornar a promise existente se já estiver inicializando
  if (initializationPromise) {
    console.log('[OneSignal - Inicialização] Já existe uma inicialização em andamento. Retornando promise existente.');
    return initializationPromise;
  }
  
  // Verificar se já está inicializado
  if (window.OneSignal && window.OneSignal.initialized) {
    console.log('[OneSignal - Inicialização] SDK do OneSignal já inicializado.');
    // Se temos userId, configurar external_user_id
    if (userId) {
      console.log(`[OneSignal - Inicialização] OneSignal já inicializado. Tentando definir external_user_id: ${userId}`);
      await setExternalUserId(userId);
    }
    return true;
  }
  
  console.log('[OneSignal - Inicialização] Iniciando processo de inicialização do SDK OneSignal...');
  initializationPromise = new Promise(async (resolve) => {
    try {
      // Carregar script do OneSignal
      const script = document.createElement('script');
      script.src = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js';
      script.async = true;
      document.head.appendChild(script);
      
      script.onload = async () => {
        console.log('[OneSignal - Inicialização] Script do OneSignal SDK carregado com sucesso.');
        try {
          window.OneSignalDeferred = window.OneSignalDeferred || [];
          
          window.OneSignalDeferred.push(async function(OneSignal) {
            console.log('[OneSignal - Inicialização] OneSignalDeferred.push executado. Chamando OneSignal.init()...');
            await OneSignal.init({
              appId: "26d188ec-fdd6-41b3-86fe-b571cce6b3a5",
              allowLocalhostAsSecureOrigin: true,
              autoRegister: false, // Não registrar automaticamente
              autoResubscribe: true, // Reinscrever automaticamente se possível
              notifyButton: { enable: false },
              // 🔥 CORREÇÃO: Usar apenas UM service worker
              serviceWorkerPath: "/OneSignalSDKWorker.js",
              // ❌ Remover serviceWorkerUpdaterPath para evitar conflito
              // serviceWorkerUpdaterPath: "/OneSignalSDK.sw.js", 
              serviceWorkerParam: { scope: "/" },
              persistNotification: false,
              notificationClickHandlerMatch: "origin",
              notificationClickHandlerAction: "focus",
            });
            console.log('[OneSignal - Inicialização] OneSignal.init() concluído. SDK inicializado.');
            
            // Se temos userId, configurar external_user_id imediatamente
            if (userId) {
              console.log(`[OneSignal - Inicialização] Tentando definir external_user_id imediatamente após init: ${userId}`);
              await setExternalUserIdInternal(userId);
            }
            
            resolve(true);
          });
        } catch (error) {
          console.error('[OneSignal - Inicialização] Erro durante a configuração do OneSignal no callback OneSignalDeferred:', error);
          resolve(false);
        }
      };
      
      script.onerror = () => {
        console.error('[OneSignal - Inicialização] Erro fatal ao carregar o script SDK do OneSignal.');
        resolve(false);
      };
    } catch (error) {
      console.error('[OneSignal - Inicialização] Erro geral na promise de inicialização do OneSignal:', error);
      resolve(false);
    }
  });
  
  return initializationPromise;
};

// Função interna para configurar external_user_id
const setExternalUserIdInternal = async (userId: string): Promise<void> => {
  if (!window.OneSignal) {
    console.warn('[OneSignal - setExternalUserIdInternal] OneSignal não está disponível ao tentar definir external_user_id.');
    return;
  }
  
  try {
    console.log(`[OneSignal - setExternalUserIdInternal] Tentando adicionar alias 'external_id' para userId: ${userId}`);
    await window.OneSignal.User.addAlias('external_id', userId);
    console.log(`[OneSignal - setExternalUserIdInternal] Alias 'external_id' (${userId}) adicionado com sucesso.`);
    
    // Fallback para API legada se disponível
    if (window.OneSignal.setExternalUserId) {
      console.log(`[OneSignal - setExternalUserIdInternal] Tentando fallback setExternalUserId (legado) para userId: ${userId}`);
      await window.OneSignal.setExternalUserId(userId);
      console.log(`[OneSignal - setExternalUserIdInternal] Fallback setExternalUserId (legado) para userId ${userId} bem-sucedido.`);
    }
  } catch (error) {
    console.error(`[OneSignal - setExternalUserIdInternal] Erro ao definir external_user_id para ${userId}:`, error);
  }
};

// Configurar external_user_id (função pública)
export const setExternalUserId = async (userId: string): Promise<boolean> => {
  if (typeof window === 'undefined' || !window.OneSignal) {
    console.log('[OneSignal - setExternalUserId] Ambiente não é de navegador ou OneSignal não está pronto.');
    return false;
  }
  
  try {
    console.log(`[OneSignal - setExternalUserId] Chamando setExternalUserIdInternal para userId: ${userId}`);
    await setExternalUserIdInternal(userId);
    console.log(`[OneSignal - setExternalUserId] setExternalUserId concluído para userId: ${userId}.`);
    return true;
  } catch (error) {
    console.error(`[OneSignal - setExternalUserId] Erro na função pública setExternalUserId para userId ${userId}:`, error);
    return false;
  }
};

// Obter Player ID do OneSignal
export const getOneSignalPlayerId = (): string | null => {
  if (typeof window === 'undefined' || !window.OneSignal) {
    console.log('[OneSignal - getOneSignalPlayerId] Ambiente não é de navegador ou OneSignal não está pronto.');
    return null;
  }
  
  try {
    const playerId = window.OneSignal.User?.PushSubscription?.id || null;
    console.log(`[OneSignal - getOneSignalPlayerId] Player ID obtido: ${playerId}`);
    return playerId;
  } catch (error) {
    console.error('[OneSignal - getOneSignalPlayerId] Erro ao obter Player ID:', error);
    return null;
  }
};

// Verificar se o usuário está inscrito
export const isUserOptedIn = (): boolean => {
  if (typeof window === 'undefined' || !window.OneSignal) {
    console.log('[OneSignal - isUserOptedIn] Ambiente não é de navegador ou OneSignal não está pronto.');
    return false;
  }
  
  try {
    const optedIn = window.OneSignal.User?.PushSubscription?.optedIn || false;
    console.log(`[OneSignal - isUserOptedIn] Usuário Opted In para notificações: ${optedIn}`);
    return optedIn;
  } catch (error) {
    console.error('[OneSignal - isUserOptedIn] Erro ao verificar se o usuário está inscrito:', error);
    return false;
  }
};

// Solicitar permissão para notificações
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (typeof window === 'undefined' || !window.OneSignal) {
    console.log('[OneSignal - requestNotificationPermission] Ambiente não é de navegador ou OneSignal não está pronto.');
    return false;
  }
  
  try {
    console.log('[OneSignal - requestNotificationPermission] Tentando solicitar permissão de notificação (optIn)...');
    await window.OneSignal.User.PushSubscription.optIn();
    console.log('[OneSignal - requestNotificationPermission] Chamada optIn concluída.');
    
    const info = getOneSignalInfo();
    console.log('[OneSignal - requestNotificationPermission] Status atual após optIn:', info);
    if (info.optedIn && info.playerId) {
      console.log('[OneSignal - requestNotificationPermission] ✅ Permissão concedida e Player ID obtido com sucesso!');
    } else {
      console.warn('[OneSignal - requestNotificationPermission] ⚠️ Permissão não concedida ou Player ID não obtido após optIn.');
    }
    return true;
  } catch (error) {
    console.error('[OneSignal - requestNotificationPermission] Erro ao solicitar permissão de notificação (optIn):', error);
    if (error instanceof Error && error.message.includes('permission denied')) {
        console.error('[OneSignal - requestNotificationPermission] Causa provável: Usuário negou a permissão explicitamente.');
    }
    return false;
  }
};

// Aguardar OneSignal estar pronto
export const waitForOneSignalReady = async (maxWaitTime: number = 10000): Promise<boolean> => {
  if (typeof window === 'undefined') {
    console.log('[OneSignal - waitForOneSignalReady] Ambiente não é de navegador.');
    return false;
  }
  
  const startTime = Date.now();
  console.log('[OneSignal - waitForOneSignalReady] Aguardando OneSignal estar pronto...');
  while (Date.now() - startTime < maxWaitTime) {
    if (window.OneSignal && window.OneSignal.initialized) {
      console.log('[OneSignal - waitForOneSignalReady] OneSignal está pronto!');
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  console.warn('[OneSignal - waitForOneSignalReady] Tempo limite excedido. OneSignal não ficou pronto.');
  return false;
};

// Obter informações completas do OneSignal
export const getOneSignalInfo = () => {
  if (typeof window === 'undefined' || !window.OneSignal) {
    const info = {
      initialized: false,
      playerId: null,
      optedIn: false,
      permission: 'default' as NotificationPermission
    };
    console.log('[OneSignal - getOneSignalInfo] OneSignal não está disponível. Retornando estado padrão:', info);
    return info;
  }
  
  try {
    const info = {
      initialized: window.OneSignal.initialized || false,
      playerId: window.OneSignal.User?.PushSubscription?.id || null,
      optedIn: window.OneSignal.User?.PushSubscription?.optedIn || false,
      permission: Notification.permission
    };
    console.log('[OneSignal - getOneSignalInfo] Informações do OneSignal obtidas:', info);
    return info;
  } catch (error) {
    console.error('[OneSignal - getOneSignalInfo] Erro ao obter informações completas do OneSignal:', error);
    return {
      initialized: false,
      playerId: null,
      optedIn: false,
      permission: 'denied' as NotificationPermission
    };
  }
};

// Resetar inicialização (para casos de erro)
export const resetOneSignalInitialization = () => {
  console.log('[OneSignal - resetOneSignalInitialization] Resetando promise de inicialização do OneSignal.');
  initializationPromise = null;
};
