import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { UserDataProvider } from "@/contexts/UserDataContext";

import Index from "./pages/Index";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import CadastroV2 from "./pages/CadastroV2";
import FeedOptimized from "./pages/FeedOptimized";
import DetalhesItem from "./pages/DetalhesItem";
import PublicarItem from "./pages/PublicarItem";
import MinhasReservas from "./pages/MinhasReservas";
import Perfil from "./pages/Perfil";
import PerfilPublicoMae from "./pages/PerfilPublicoMae";
import EditarPerfil from "./pages/EditarPerfil";
import Carteira from "./pages/Carteira";
import ComprarGirinhas from "./pages/ComprarGirinhas";
import Configuracoes from "./pages/Configuracoes";
import Indicacoes from "./pages/Indicacoes";
import Missoes from "./pages/Missoes";
import BuscarItens from "./pages/BuscarItens";
import AuthCallback from "./pages/AuthCallback";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <UserDataProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/cadastro" element={<Cadastro />} />
              <Route path="/cadastro-v2" element={<CadastroV2 />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              
              <Route path="/feed" element={
                <ProtectedRoute>
                  <FeedOptimized />
                </ProtectedRoute>
              } />
              
              <Route path="/item/:id" element={
                <ProtectedRoute>
                  <DetalhesItem />
                </ProtectedRoute>
              } />
              
              <Route path="/publicar" element={
                <ProtectedRoute>
                  <PublicarItem />
                </ProtectedRoute>
              } />
              
              <Route path="/reservas" element={
                <ProtectedRoute>
                  <MinhasReservas />
                </ProtectedRoute>
              } />
              
              <Route path="/perfil" element={
                <ProtectedRoute>
                  <Perfil />
                </ProtectedRoute>
              } />
              
              <Route path="/perfil/:id" element={
                <ProtectedRoute>
                  <PerfilPublicoMae />
                </ProtectedRoute>
              } />
              
              <Route path="/editar-perfil" element={
                <ProtectedRoute>
                  <EditarPerfil />
                </ProtectedRoute>
              } />
              
              <Route path="/carteira" element={
                <ProtectedRoute>
                  <Carteira />
                </ProtectedRoute>
              } />
              
              <Route path="/comprar-girinhas" element={
                <ProtectedRoute>
                  <ComprarGirinhas />
                </ProtectedRoute>
              } />
              
              <Route path="/configuracoes" element={
                <ProtectedRoute>
                  <Configuracoes />
                </ProtectedRoute>
              } />
              
              <Route path="/indicacoes" element={
                <ProtectedRoute>
                  <Indicacoes />
                </ProtectedRoute>
              } />
              
              <Route path="/missoes" element={
                <ProtectedRoute>
                  <Missoes />
                </ProtectedRoute>
              } />
              
              <Route path="/buscar" element={
                <ProtectedRoute>
                  <BuscarItens />
                </ProtectedRoute>
              } />
              
              <Route path="/admin" element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </UserDataProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
