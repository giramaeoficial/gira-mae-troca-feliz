
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { CarteiraProvider } from "@/contexts/CarteiraContext";
import { RecompensasProvider } from "@/components/recompensas/ProviderRecompensas";
import AuthGuard from "@/components/auth/AuthGuard";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import Feed from "./pages/Feed";
import PublicarItem from "./pages/PublicarItem";
import DetalhesItem from "./pages/DetalhesItem";
import MinhasReservas from "./pages/MinhasReservas";
import Perfil from "./pages/Perfil";
import PerfilPublicoMae from "./pages/PerfilPublicoMae";
import Carteira from "./pages/Carteira";
import ComprarGirinhas from "./pages/ComprarGirinhas";
import Indicacoes from "./pages/Indicacoes";
import Mensagens from "./pages/Mensagens";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import ErrorBoundary from "./components/error/ErrorBoundary";

// Criar uma única instância do QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <RecompensasProvider>
              <CarteiraProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/cadastro" element={<Cadastro />} />
                    <Route
                      path="/feed"
                      element={
                        <AuthGuard>
                          <Feed />
                        </AuthGuard>
                      }
                    />
                    <Route
                      path="/publicar"
                      element={
                        <AuthGuard>
                          <PublicarItem />
                        </AuthGuard>
                      }
                    />
                    <Route
                      path="/item/:id"
                      element={
                        <AuthGuard>
                          <DetalhesItem />
                        </AuthGuard>
                      }
                    />
                    <Route
                      path="/reservas"
                      element={
                        <AuthGuard>
                          <MinhasReservas />
                        </AuthGuard>
                      }
                    />
                    <Route
                      path="/mensagens"
                      element={
                        <AuthGuard>
                          <Mensagens />
                        </AuthGuard>
                      }
                    />
                    <Route
                      path="/perfil"
                      element={
                        <AuthGuard>
                          <Perfil />
                        </AuthGuard>
                      }
                    />
                    <Route
                      path="/mae/:id"
                      element={
                        <AuthGuard>
                          <PerfilPublicoMae />
                        </AuthGuard>
                      }
                    />
                    <Route
                      path="/carteira"
                      element={
                        <AuthGuard>
                          <Carteira />
                        </AuthGuard>
                      }
                    />
                    <Route
                      path="/comprar-girinhas"
                      element={
                        <AuthGuard>
                          <ComprarGirinhas />
                        </AuthGuard>
                      }
                    />
                    <Route
                      path="/indicacoes"
                      element={
                        <AuthGuard>
                          <Indicacoes />
                        </AuthGuard>
                      }
                    />
                    <Route
                      path="/admin"
                      element={
                        <AuthGuard>
                          <AdminDashboard />
                        </AuthGuard>
                      }
                    />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </BrowserRouter>
              </CarteiraProvider>
            </RecompensasProvider>
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
