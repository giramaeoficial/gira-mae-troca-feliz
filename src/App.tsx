
// src/App.tsx - ADICIONAR a rota AuthCallback

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as SonnerToaster } from '@/components/ui/sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import Login from '@/pages/Login';
import Cadastro from '@/pages/Cadastro';
import AuthCallback from '@/pages/AuthCallback';
import AuthGuard from '@/components/auth/AuthGuard'; // ✅ ADICIONAR IMPORT
import FeedOptimized from '@/pages/FeedOptimized';
import BuscarItens from '@/pages/BuscarItens';
import PublicarItem from '@/pages/PublicarItem';
import Mensagens from '@/pages/Mensagens';
import Perfil from '@/pages/Perfil';
import EditarPerfil from '@/pages/EditarPerfil';
import PerfilPublicoMae from '@/pages/PerfilPublicoMae';
import Carteira from '@/pages/Carteira';
import ComprarGirinhas from '@/pages/ComprarGirinhas';
import Indicacoes from '@/pages/Indicacoes';
import DetalhesItem from '@/pages/DetalhesItem';
import MinhasReservas from '@/pages/MinhasReservas';
import AdminDashboard from '@/pages/AdminDashboard';
import NotFound from '@/pages/NotFound';
import Missoes from '@/pages/Missoes';
import Configuracoes from '@/pages/Configuracoes';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <SonnerToaster />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/auth-callback" element={<AuthCallback />} />
          <Route path="/login" element={<Navigate to="/auth" replace />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/feed" element={<AuthGuard><FeedOptimized /></AuthGuard>} /> {/* ✅ PROTEGER COM AUTHGUARD */}
          <Route path="/buscar-itens" element={<AuthGuard><BuscarItens /></AuthGuard>} /> {/* ✅ PROTEGER */}
          <Route path="/publicar" element={<AuthGuard><PublicarItem /></AuthGuard>} /> {/* ✅ PROTEGER */}
          <Route path="/missoes" element={<AuthGuard><Missoes /></AuthGuard>} /> {/* ✅ PROTEGER */}
          <Route path="/mensagens" element={<AuthGuard><Mensagens /></AuthGuard>} /> {/* ✅ PROTEGER */}
          <Route path="/mensagens/:conversaId" element={<AuthGuard><Mensagens /></AuthGuard>} /> {/* ✅ PROTEGER */}
          <Route path="/perfil" element={<AuthGuard><Perfil /></AuthGuard>} /> {/* ✅ PROTEGER */}
          <Route path="/perfil/editar" element={<AuthGuard><EditarPerfil /></AuthGuard>} /> {/* ✅ PROTEGER */}
          <Route path="/perfil/:username" element={<PerfilPublicoMae />} />
          <Route path="/carteira" element={<AuthGuard><Carteira /></AuthGuard>} /> {/* ✅ PROTEGER */}
          <Route path="/comprar-girinhas" element={<AuthGuard><ComprarGirinhas /></AuthGuard>} /> {/* ✅ PROTEGER */}
          <Route path="/indicacoes" element={<AuthGuard><Indicacoes /></AuthGuard>} /> {/* ✅ PROTEGER */}
          <Route path="/item/:id" element={<DetalhesItem />} />
          <Route path="/minhas-reservas" element={<AuthGuard><MinhasReservas /></AuthGuard>} /> {/* ✅ PROTEGER */}
          <Route path="/configuracoes" element={<AuthGuard><Configuracoes /></AuthGuard>} /> {/* ✅ PROTEGER */}
          <Route path="/admin" element={<AuthGuard><AdminDashboard /></AuthGuard>} /> {/* ✅ PROTEGER */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
