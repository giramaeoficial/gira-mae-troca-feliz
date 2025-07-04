
// Configurações centralizadas do OneSignal
export const ONESIGNAL_CONFIG = {
  appId: "26d188ec-fdd6-41b3-86fe-b571cce6b3a5",
  serviceWorkerPath: "/OneSignalSDK.sw.js",
  serviceWorkerUpdaterPath: "/OneSignalSDK.sw.js",
  
  // Timeouts e delays
  initTimeout: 10000, // 10 segundos para inicialização
  registrationDelay: 1000, // 1 segundo antes de registrar
  permissionGrantDelay: 5000, // 5 segundos após permissão concedida
  
  // Retry configuration
  maxRetries: 3,
  retryDelays: [1000, 2000, 4000], // Backoff exponencial
  
  // Debug
  debug: true
};
