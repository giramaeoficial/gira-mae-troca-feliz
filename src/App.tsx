
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "@/components/ui/toaster"

import Index from './pages/Index';
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
import Auth from './pages/Auth';
import Feed from './pages/Feed';
import Perfil from './pages/Perfil';
import PerfilPublico from './pages/PerfilPublico';
import PublicarItem from './pages/PublicarItem';
import DetalhesItem from './pages/DetalhesItem';
import Carteira from './pages/Carteira';
import SistemaGirinhas from './pages/SistemaGirinhas';
import MinhasReservas from './pages/MinhasReservas';
import Indicacoes from './pages/Indicacoes';
import { AuthProvider } from './hooks/useAuth';
import { CarteiraProvider } from './contexts/CarteiraContext';
import { RecompensasProvider } from "@/components/recompensas/ProviderRecompensas";
import { memo } from 'react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      gcTime: 10 * 60 * 1000, // 10 minutos
      refetchOnWindowFocus: false,
      retry: 1
    },
  },
});

const AppContent = memo(() => {
  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      <Toaster />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/perfil/:nome" element={<PerfilPublico />} />
        <Route path="/publicar" element={<PublicarItem />} />
        <Route path="/item/:id" element={<DetalhesItem />} />
        <Route path="/carteira" element={<Carteira />} />
        <Route path="/sistema-girinhas" element={<SistemaGirinhas />} />
        <Route path="/reservas" element={<MinhasReservas />} />
        <Route path="/indicacoes" element={<Indicacoes />} />
      </Routes>
    </div>
  );
});

AppContent.displayName = 'AppContent';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <RecompensasProvider>
            <CarteiraProvider>
              <AppContent />
            </CarteiraProvider>
          </RecompensasProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
