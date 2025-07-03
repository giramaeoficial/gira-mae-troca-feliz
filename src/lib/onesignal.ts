// Inicialização robusta do OneSignal com persistência de Player ID
let initializationPromise: Promise<boolean> | null = null;

export const initializeOneSignal = async (userId?: string): Promise<boolean> => {
  if (typeof window === 'undefined') return false;
  
  // Retornar a promise existente se já estiver inicializando
  if (initializationPromise) {
    return initializationPromise;
  }
  
  // Verificar se já está inicializado
  if (window.OneSignal && window.OneSignal.initialized) {
    // Se temos userId, configurar external_user_id
    if (userId) {
      await setExternalUserId(userId);
    }
    return true;
  }
  
  initializationPromise = new Promise(async (resolve) => {
    try {
      // Carregar script do OneSignal
      const script = document.createElement('script');
      script.src = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js';
      script.async = true;
      document.head.appendChild(script);
      
      script.onload = async () => {
        try {
          window.OneSignalDeferred = window.OneSignalDeferred || [];
          
          window.OneSignalDeferred.push(async function(OneSignal) {
            await OneSignal.init({
              appId: "26d188ec-fdd6-41b3-86fe-b571cce6b3a5",
              allowLocalhostAsSecureOrigin: true,
              autoRegister: false, // Não registrar automaticamente
              autoResubscribe: true, // Reinscrever automaticamente se possível
              notifyButton: { enable: false },
              serviceWorkerPath: "/OneSignalSDKWorker.js",
              serviceWorkerUpdaterPath: "/OneSignalSDK.sw.js",
              serviceWorkerParam: { scope: "/" },
              persistNotification: false,
              notificationClickHandlerMatch: "origin",
              notificationClickHandlerAction: "focus",
            });
            
            // Se temos userId, configurar external_user_id imediatamente
            if (userId) {
              await setExternalUserIdInternal(userId);
            }
            
            resolve(true);
          });
        } catch (error) {
          resolve(false);
        }
      };
      
      script.onerror = () => {
        resolve(false);
      };
    } catch (error) {
      resolve(false);
    }
  });
  
  return initializationPromise;
};

// Função interna para configurar external_user_id
const setExternalUserIdInternal = async (userId: string): Promise<void> => {
  if (!window.OneSignal) return;
  
  try {
    // Configurar external_user_id usando a nova API v16
    await window.OneSignal.User.addAlias('external_id', userId);
    
    // Fallback para API legada se disponível
    if (window.OneSignal.setExternalUserId) {
      await window.OneSignal.setExternalUserId(userId);
    }
  } catch (error) {
    // Silencioso - não atrapalhar a inicialização
  }
};

// Configurar external_user_id (função pública)
export const setExternalUserId = async (userId: string): Promise<boolean> => {
  if (typeof window === 'undefined' || !window.OneSignal) return false;
  
  try {
    await setExternalUserIdInternal(userId);
    return true;
  } catch (error) {
    return false;
  }
};

// Obter Player ID do OneSignal
export const getOneSignalPlayerId = (): string | null => {
  if (typeof window === 'undefined' || !window.OneSignal) return null;
  
  try {
    return window.OneSignal.User?.PushSubscription?.id || null;
  } catch (error) {
    return null;
  }
};

// Verificar se o usuário está inscrito
export const isUserOptedIn = (): boolean => {
  if (typeof window === 'undefined' || !window.OneSignal) return false;
  
  try {
    return window.OneSignal.User?.PushSubscription?.optedIn || false;
  } catch (error) {
    return false;
  }
};

// Solicitar permissão para notificações
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (typeof window === 'undefined' || !window.OneSignal) return false;
  
  try {
    await window.OneSignal.User.PushSubscription.optIn();
    return true;
  } catch (error) {
    return false;
  }
};

// Aguardar OneSignal estar pronto
export const waitForOneSignalReady = async (maxWaitTime: number = 10000): Promise<boolean> => {
  if (typeof window === 'undefined') return false;
  
  const startTime = Date.now();
  
  while (Date.now() - startTime < maxWaitTime) {
    if (window.OneSignal && window.OneSignal.initialized) {
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return false;
};

// Obter informações completas do OneSignal
export const getOneSignalInfo = () => {
  if (typeof window === 'undefined' || !window.OneSignal) {
    return {
      initialized: false,
      playerId: null,
      optedIn: false,
      permission: 'denied'
    };
  }
  
  try {
    return {
      initialized: window.OneSignal.initialized || false,
      playerId: window.OneSignal.User?.PushSubscription?.id || null,
      optedIn: window.OneSignal.User?.PushSubscription?.optedIn || false,
      permission: Notification.permission
    };
  } catch (error) {
    return {
      initialized: false,
      playerId: null,
      optedIn: false,
      permission: 'denied'
    };
  }
};

// Resetar inicialização (para casos de erro)
export const resetOneSignalInitialization = () => {
  initializationPromise = null;
};
