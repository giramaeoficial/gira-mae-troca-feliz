
import { createRoot } from 'react-dom/client'
import { AuthProvider } from '@/hooks/useAuth'
import OneSignal from 'react-onesignal'
import App from './App.tsx'
import './index.css'

// Inicializar OneSignal apenas em ambiente seguro
const initOneSignal = async () => {
  try {
    // Verificar se está em ambiente seguro
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      console.warn('OneSignal requer HTTPS ou localhost');
      return;
    }

    const appId = import.meta.env.VITE_ONESIGNAL_APP_ID || '26d188ec-fdd6-41b3-86fe-b571cce6b3a5';
    
    await OneSignal.init({
      appId: appId,
      safari_web_id: 'web.onesignal.auto.18140e24-f6e8-4f9a-8237-b699d54c3b4c',
      notifyButton: {
        enable: false,
        prenotify: true,
        showCredit: false,
        text: {
          'tip.state.unsubscribed': 'Ativar notificações',
          'tip.state.subscribed': 'Notificações ativadas',
          'tip.state.blocked': 'Notificações bloqueadas',
          'message.prenotify': 'Clique para permitir notificações',
          'message.action.subscribed': 'Obrigado! Você receberá notificações.',
          'message.action.subscribing': 'Ativando notificações...',
          'message.action.resubscribed': 'Notificações reativadas.',
          'message.action.unsubscribed': 'Notificações desativadas.',
          'dialog.main.title': 'Gerenciar notificações do site',
          'dialog.main.button.subscribe': 'PERMITIR',
          'dialog.main.button.unsubscribe': 'NÃO PERMITIR',
          'dialog.blocked.title': 'Desbloquear notificações',
          'dialog.blocked.message': 'Siga estas instruções para permitir notificações:'
        }
      },
      allowLocalhostAsSecureOrigin: true, // Para desenvolvimento
      serviceWorkerParam: { scope: '/' },
      serviceWorkerPath: 'OneSignalSDKWorker.js'
    });
    
    console.log('OneSignal inicializado com sucesso');
  } catch (error) {
    console.error('Erro ao inicializar OneSignal:', error);
  }
};

// Inicializar OneSignal quando a página carregar
if (typeof window !== 'undefined') {
  initOneSignal();
}

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <App />
  </AuthProvider>
);
