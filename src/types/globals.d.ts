
// Declarações globais para OneSignal v16
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
      setExternalUserId: (userId: string) => Promise<void>;
    };
  }
}

export {};
