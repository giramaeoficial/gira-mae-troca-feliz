// Inicialização limpa do OneSignal - SEM LOGS
export const initializeOneSignal = async (): Promise<boolean> => {
  if (typeof window === 'undefined') return false;
  
  return new Promise((resolve) => {
    // Verificar se já está inicializado
    if (window.OneSignal && window.OneSignal.initialized) {
      resolve(true);
      return;
    }
    
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
            autoRegister: false,
            autoResubscribe: false,
            notifyButton: { enable: false },
            serviceWorkerPath: "/OneSignalSDKWorker.js",
            serviceWorkerUpdaterPath: "/OneSignalSDK.sw.js",
            serviceWorkerParam: { scope: "/" },
            persistNotification: false,
            notificationClickHandlerMatch: "origin",
            notificationClickHandlerAction: "focus",
          });
          
          resolve(true);
        });
      } catch (error) {
        resolve(false);
      }
    };
    
    script.onerror = () => {
      resolve(false);
    };
  });
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