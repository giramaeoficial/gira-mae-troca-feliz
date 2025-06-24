
import { createRoot } from 'react-dom/client'
import { AuthProvider } from '@/hooks/useAuth'
import App from './App.tsx'
import './index.css'

// Remover inicialização do OneSignal do main.tsx
// Agora será gerenciado pelo useNotificationSystem

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <App />
  </AuthProvider>
);
