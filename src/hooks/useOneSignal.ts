
// Hook simplificado que usa o sistema unificado
import { useNotificationSystem } from './useNotificationSystem';

export const useOneSignal = () => {
  const {
    pushEnabled: isPermissionGranted,
    playerId,
    oneSignalInitialized: isInitialized,
    requestPushPermission,
    sendTestNotification
  } = useNotificationSystem();

  return {
    isInitialized,
    playerId,
    isPermissionGranted,
    requestPermission: requestPushPermission,
    sendTestNotification,
    sendNotificationToUser: async () => {
      console.warn('Use sendNotification do useNotificationSystem');
    },
    isPushSupported: typeof window !== 'undefined' && 'Notification' in window
  };
};
