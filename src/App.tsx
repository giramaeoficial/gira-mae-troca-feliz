
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "@/components/ui/toaster";
import { Suspense, lazy } from 'react';

import Index from './pages/Index';
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
import Auth from './pages/Auth';
import { AuthProvider } from './hooks/useAuth';
import { CarteiraProvider } from './contexts/CarteiraContext';
import { RecompensasProvider } from "@/components/recompensas/ProviderRecompensas";
import { useRecompensasAutomaticas } from './hooks/useRecompensasAutomaticas';
import ErrorBoundary from './components/error/ErrorBoundary';
import PageSkeleton from './components/loading/PageSkeleton';

// Lazy loading das páginas principais
const Feed = lazy(() => import('./pages/Feed'));
const SistemaGirinhas = lazy(() => import('./pages/SistemaGirinhas'));
const Perfil = lazy(() => import('./pages/Perfil'));
const PerfilPublico = lazy(() => import('./pages/PerfilPublicoMae'));
const PublicarItem = lazy(() => import('./pages/PublicarItem'));
const DetalhesItem = lazy(() => import('./pages/DetalhesItem'));
const Carteira = lazy(() => import('./pages/Carteira'));
const MinhasReservas = lazy(() => import('./pages/MinhasReservas'));
const Indicacoes = lazy(() => import('./pages/Indicacoes'));

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
  // ✅ Instância única e centralizada de recompensas
  useRecompensasAutomaticas();
  
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
            <Suspense fallback={<PageSkeleton type="feed" />}>
              <Feed />
            </Suspense>
          </ErrorBoundary>
        } />
        <Route path="/perfil" element={
          <ErrorBoundary fallbackType="page">
            <Suspense fallback={<PageSkeleton type="perfil" />}>
              <Perfil />
            </Suspense>
          </ErrorBoundary>
        } />
        <Route path="/perfil/:id" element={
          <ErrorBoundary fallbackType="page">
            <Suspense fallback={<PageSkeleton type="perfil" />}>
              <PerfilPublico />
            </Suspense>
          </ErrorBoundary>
        } />
        <Route path="/publicar" element={
          <ErrorBoundary fallbackType="page">
            <Suspense fallback={<PageSkeleton type="default" />}>
              <PublicarItem />
            </Suspense>
          </ErrorBoundary>
        } />
        <Route path="/item/:id" element={
          <ErrorBoundary fallbackType="page">
            <Suspense fallback={<PageSkeleton type="default" />}>
              <DetalhesItem />
            </Suspense>
          </ErrorBoundary>
        } />
        <Route path="/carteira" element={
          <ErrorBoundary fallbackType="page">
            <Suspense fallback={<PageSkeleton type="default" />}>
              <Carteira />
            </Suspense>
          </ErrorBoundary>
        } />
        <Route path="/sistema-girinhas" element={
          <ErrorBoundary fallbackType="page">
            <Suspense fallback={<PageSkeleton type="sistema-girinhas" />}>
              <SistemaGirinhas />
            </Suspense>
          </ErrorBoundary>
        } />
        <Route path="/reservas" element={
          <ErrorBoundary fallbackType="page">
            <Suspense fallback={<PageSkeleton type="default" />}>
              <MinhasReservas />
            </Suspense>
          </ErrorBoundary>
        } />
        <Route path="/indicacoes" element={
          <ErrorBoundary fallbackType="page">
            <Suspense fallback={<PageSkeleton type="default" />}>
              <Indicacoes />
            </Suspense>
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
