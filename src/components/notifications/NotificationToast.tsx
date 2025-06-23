
import React, { useEffect } from 'react';
import { useNotifications } from '@/contexts/NotificationContext';
import { toast } from 'sonner';

export const NotificationToast: React.FC = () => {
  const { inAppNotifications } = useNotifications();

  useEffect(() => {
    // Mostrar toast para a última notificação não lida
    const latestUnread = inAppNotifications.find(n => !n.read);
    
    if (latestUnread) {
      toast(latestUnread.title, {
        description: latestUnread.body,
        duration: 5000,
      });
    }
  }, [inAppNotifications]);

  return null;
};
