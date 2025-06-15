import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient } from 'react-query';
import { Toaster } from "@/components/ui/toaster"

import Home from './pages/Home';
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
import EsqueciSenha from './pages/EsqueciSenha';
import RedefinirSenha from './pages/RedefinirSenha';
import Marketplace from './pages/Marketplace';
import ItemDetail from './pages/ItemDetail';
import Checkout from './pages/Checkout';
import Dashboard from './pages/Dashboard';
import SistemaGirinhas from './pages/SistemaGirinhas';
import Reservas from './pages/Reservas';
import Chat from './pages/Chat';
import { AuthProvider } from './hooks/useAuth';
import { CarteiraProvider } from './contexts/CarteiraContext';
import { RecompensasProvider } from "@/components/recompensas/ProviderRecompensas";

function App() {
  return (
    <QueryClient>
      <BrowserRouter>
        <AuthProvider>
          <RecompensasProvider>
            <CarteiraProvider>
              <div className="min-h-screen bg-background font-sans antialiased">
                <Toaster />
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/cadastro" element={<Cadastro />} />
                  <Route path="/esqueci-senha" element={<EsqueciSenha />} />
                  <Route path="/redefinir-senha" element={<RedefinirSenha />} />
                  <Route path="/marketplace" element={<Marketplace />} />
                  <Route path="/item/:itemId" element={<ItemDetail />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/sistema-girinhas" element={<SistemaGirinhas />} />
                  <Route path="/reservas" element={<Reservas />} />
                  <Route path="/chat/:reservaId" element={<Chat />} />
                </Routes>
              </div>
            </CarteiraProvider>
          </RecompensasProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClient>
  );
}

export default App;
