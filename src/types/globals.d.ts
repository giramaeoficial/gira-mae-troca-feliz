
// Declarações globais para OneSignal
declare global {
  interface Window {
    OneSignal?: {
      setExternalUserId: (userId: string) => Promise<void>;
      init: (config: any) => Promise<void>;
      showSlidedownPrompt: () => Promise<void>;
      registerForPushNotifications: () => Promise<void>;
    };
  }
}

export {};
