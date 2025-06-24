
import { createRoot } from 'react-dom/client'
import { AuthProvider } from '@/hooks/useAuth'
import App from './App.tsx'
import './index.css'

// OneSignal temporariamente desabilitado para resolver problemas de Service Worker
// Será reativado após correções no sistema de notificações

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <App />
  </AuthProvider>
);
