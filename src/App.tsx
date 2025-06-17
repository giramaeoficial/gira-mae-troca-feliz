
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "@/components/ui/toaster"

import Index from './pages/Index';
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
import Auth from './pages/Auth';
import Feed from './pages/Feed';
import Perfil from './pages/Perfil';
import PerfilPublicoMae from './pages/PerfilPublicoMae';
import PublicarItem from './pages/PublicarItem';
import DetalhesItem from './pages/DetalhesItem';
import Carteira from './pages/Carteira';
import SistemaGirinhas from './pages/SistemaGirinhas';
import MinhasReservas from './pages/MinhasReservas';
import Indicacoes from './pages/Indicacoes';
import { AuthProvider } from './hooks/useAuth';
import { CarteiraProvider } from './contexts/CarteiraContext';
import { RecompensasProvider } from "@/components/recompensas/ProviderRecompensas";
import { useRecompensasAutomaticas } from './hooks/useRecompensasAutomaticas';
import { useMonitorMetas } from './hooks/useMonitorMetas';
import ErrorBoundary from './components/error/ErrorBoundary';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutos
      gcTime: 10 * 60 * 1000, // 10 minutos
    },
  },
});

function AppContent() {
  useRecompensasAutomaticas();
  useMonitorMetas();
  
  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      <Toaster />
      <Routes>
        <Route path="/" element={
          <ErrorBoundary fallbackType="page">
            <Index />
          </ErrorBoundary>
        } />
        <Route path="/auth" element={
          <ErrorBoundary fallbackType="page">
            <Auth />
          </ErrorBoundary>
        } />
        <Route path="/login" element={
          <ErrorBoundary fallbackType="page">
            <Login />
          </ErrorBoundary>
        } />
        <Route path="/cadastro" element={
          <ErrorBoundary fallbackType="page">
            <Cadastro />
          </ErrorBoundary>
        } />
        <Route path="/feed" element={
          <ErrorBoundary fallbackType="feed">
            <Feed />
          </ErrorBoundary>
        } />
        <Route path="/perfil" element={
          <ErrorBoundary fallbackType="page">
            <Perfil />
          </ErrorBoundary>
        } />
        <Route path="/perfil/:nome" element={
          <ErrorBoundary fallbackType="page">
            <PerfilPublicoMae />
          </ErrorBoundary>
        } />
        <Route path="/publicar" element={
          <ErrorBoundary fallbackType="page">
            <PublicarItem />
          </ErrorBoundary>
        } />
        <Route path="/item/:id" element={
          <ErrorBoundary fallbackType="page">
            <DetalhesItem />
          </ErrorBoundary>
        } />
        <Route path="/carteira" element={
          <ErrorBoundary fallbackType="page">
            <Carteira />
          </ErrorBoundary>
        } />
        <Route path="/sistema-girinhas" element={
          <ErrorBoundary fallbackType="page">
            <SistemaGirinhas />
          </ErrorBoundary>
        } />
        <Route path="/reservas" element={
          <ErrorBoundary fallbackType="page">
            <MinhasReservas />
          </ErrorBoundary>
        } />
        <Route path="/indicacoes" element={
          <ErrorBoundary fallbackType="page">
            <Indicacoes />
          </ErrorBoundary>
        } />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary 
      fallbackType="page"
      onError={(error, errorInfo) => {
        console.error('Global error caught:', error, errorInfo);
        // Aqui você pode integrar com serviços de monitoramento como Sentry
      }}
    >
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
    </ErrorBoundary>
  );
}

export default App;
