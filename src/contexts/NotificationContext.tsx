
import React, { createContext, useContext, ReactNode } from 'react';
import { useWebNotifications } from '@/hooks/useWebNotifications';
import { InAppNotification } from '@/types/notifications';

interface NotificationContextType {
  inAppNotifications: InAppNotification[];
  permissionGranted: boolean;
  requestPermission: () => Promise<boolean>;
  notificarBoasVindas: (nomeUsuario: string) => Promise<void>;
  notificarReserva: (itemTitulo: string, valor: number, vendedorNome: string, nomeComprador: string) => Promise<void>;
  notificarNovaMensagem: (destinatarioId: string, remetenteNome: string, itemTitulo: string, previewMensagem: string) => Promise<void>;
  notificarItemDisponivel: (usuarioId: string, itemTitulo: string, valor: number) => Promise<void>;
  markAsRead: (notificationId: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const notifications = useWebNotifications();

  return (
    <NotificationContext.Provider value={notifications}>
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
