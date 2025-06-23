
import React, { createContext, useContext, ReactNode } from 'react';
import { useNotifications as useNotificationsHook } from '@/hooks/useNotifications';
import { Notification, NotificationPreferences } from '@/types/notifications';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  preferences: NotificationPreferences;
  loading: boolean;
  updatePreferences: (prefs: Partial<NotificationPreferences>) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  handleNotificationClick: (notification: Notification) => void;
  // Métodos legados mantidos para compatibilidade
  inAppNotifications: any[];
  permissionGranted: boolean;
  requestPermission: () => Promise<boolean>;
  notificarBoasVindas: (nomeUsuario: string) => Promise<void>;
  notificarReserva: (itemTitulo: string, valor: number, vendedorNome: string, nomeComprador: string) => Promise<void>;
  notificarNovaMensagem: (destinatarioId: string, remetenteNome: string, itemTitulo: string, previewMensagem: string) => Promise<void>;
  notificarItemDisponivel: (usuarioId: string, itemTitulo: string, valor: number) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const notificationHook = useNotificationsHook();

  // Métodos legados para compatibilidade
  const legacyMethods = {
    inAppNotifications: [],
    permissionGranted: false,
    requestPermission: async () => false,
    notificarBoasVindas: async () => {},
    notificarReserva: async () => {},
    notificarNovaMensagem: async () => {},
    notificarItemDisponivel: async () => {}
  };

  const contextValue = {
    ...notificationHook,
    ...legacyMethods
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications deve ser usado dentro de um NotificationProvider');
  }
  return context;
};
