
// Declarações globais para OneSignal
declare global {
  interface Window {
    OneSignal?: {
      User?: {
        addTag: (key: string, value: string) => Promise<void>;
        PushSubscription?: {
          id: string | null;
          addEventListener: (event: string, callback: (event: any) => void) => void;
        };
      };
      init: (config: any) => Promise<void>;
      showSlidedownPrompt: () => Promise<void>;
      registerForPushNotifications: () => Promise<void>;
    };
  }
}

export {};
