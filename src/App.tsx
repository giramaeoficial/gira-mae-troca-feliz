
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import QuickNav from "@/components/shared/QuickNav";
import Index from "./pages/Index";
import ComprarGirinhas from "./pages/ComprarGirinhas";
import Login from "./pages/Login";
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
      <CarteiraProvider>
        <ReservasProvider>
          <BrowserRouter>
            <div className="relative">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/comprar-girinhas" element={<ComprarGirinhas />} />
                <Route path="/login" element={<Login />} />
                <Route path="/cadastro" element={<Cadastro />} />
                <Route path="/feed" element={<Feed />} />
                <Route path="/item/:id" element={<DetalhesItem />} />
                <Route path="/publicar-item" element={<PublicarItem />} />
                <Route path="/carteira" element={<Carteira />} />
                <Route path="/perfil" element={<Perfil />} />
                <Route path="/perfil/:nome" element={<PerfilPublico />} />
                <Route path="/minhas-reservas" element={<MinhasReservas />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              <QuickNav />
            </div>
          </BrowserRouter>
        </ReservasProvider>
      </CarteiraProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
