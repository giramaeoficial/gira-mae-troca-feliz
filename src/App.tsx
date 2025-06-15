
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { CarteiraProvider } from "@/contexts/CarteiraContext";
import AuthGuard from "@/components/auth/AuthGuard";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import Feed from "./pages/Feed";
import PublicarItem from "./pages/PublicarItem";
import DetalhesItem from "./pages/DetalhesItem";
import Perfil from "./pages/Perfil";
import PerfilPublico from "./pages/PerfilPublico";
import MinhasReservas from "./pages/MinhasReservas";
import Carteira from "./pages/Carteira";
import ComprarGirinhas from "./pages/ComprarGirinhas";
import SistemaGirinhas from "./pages/SistemaGirinhas";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <CarteiraProvider>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/login" element={<Login />} />
                <Route path="/cadastro" element={<Cadastro />} />
                
                {/* Rotas protegidas */}
                <Route path="/feed" element={<AuthGuard><Feed /></AuthGuard>} />
                <Route path="/publicar-item" element={<AuthGuard><PublicarItem /></AuthGuard>} />
                <Route path="/item/:id" element={<AuthGuard><DetalhesItem /></AuthGuard>} />
                <Route path="/perfil" element={<AuthGuard><Perfil /></AuthGuard>} />
                <Route path="/perfil/:nome" element={<AuthGuard><PerfilPublico /></AuthGuard>} />
                <Route path="/minhas-reservas" element={<AuthGuard><MinhasReservas /></AuthGuard>} />
                <Route path="/carteira" element={<AuthGuard><Carteira /></AuthGuard>} />
                <Route path="/comprar-girinhas" element={<AuthGuard><ComprarGirinhas /></AuthGuard>} />
                <Route path="/sistema-girinhas" element={<AuthGuard><SistemaGirinhas /></AuthGuard>} />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </CarteiraProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
