
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import QuickNav from "@/components/shared/QuickNav";
import { AuthProvider } from "@/hooks/useAuth";
import AuthGuard from "@/components/auth/AuthGuard";
import Index from "./pages/Index";
import ComprarGirinhas from "./pages/ComprarGirinhas";
import Login from "./pages/Login";
import Auth from "./pages/Auth";
import Feed from "./pages/Feed";
import PublicarItem from "./pages/PublicarItem";
import Perfil from "./pages/Perfil";
import PerfilPublico from "./pages/PerfilPublico";
import NotFound from "./pages/NotFound";
import DetalhesItem from "./pages/DetalhesItem";
import Cadastro from "./pages/Cadastro";
import Carteira from "./pages/Carteira";
import MinhasReservas from "./pages/MinhasReservas";
import { ReservasProvider } from "./contexts/ReservasContext";
import { CarteiraProvider } from "./contexts/CarteiraContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <CarteiraProvider>
          <ReservasProvider>
            <BrowserRouter>
              <div className="relative">
                <Routes>
                  {/* Rotas públicas - acessíveis sem login */}
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/cadastro" element={<Cadastro />} />
                  <Route path="*" element={<NotFound />} />
                  
                  {/* Rotas privadas - protegidas por AuthGuard */}
                  <Route 
                    path="/comprar-girinhas" 
                    element={
                      <AuthGuard>
                        <ComprarGirinhas />
                      </AuthGuard>
                    } 
                  />
                  <Route 
                    path="/feed" 
                    element={
                      <AuthGuard>
                        <Feed />
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
                    path="/publicar-item" 
                    element={
                      <AuthGuard>
                        <PublicarItem />
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
                    path="/perfil" 
                    element={
                      <AuthGuard>
                        <Perfil />
                      </AuthGuard>
                    } 
                  />
                  <Route 
                    path="/perfil/:nome" 
                    element={
                      <AuthGuard>
                        <PerfilPublico />
                      </AuthGuard>
                    } 
                  />
                  <Route 
                    path="/minhas-reservas" 
                    element={
                      <AuthGuard>
                        <MinhasReservas />
                      </AuthGuard>
                    } 
                  />
                </Routes>
                <AuthGuard>
                  <QuickNav />
                </AuthGuard>
              </div>
            </BrowserRouter>
          </ReservasProvider>
        </CarteiraProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
