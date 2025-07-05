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
import ConceptoComunidadeOnboarding from '@/pages/ConceptoComunidadeOnboarding';
import PublicarPrimeiroItem from '@/pages/PublicarPrimeiroItem';
import PactoEntradaGuard from '@/components/auth/PactoEntradaGuard';

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
          <Route path="/conceito-comunidade" element={<ConceptoComunidadeOnboarding />} />
          <Route path="/publicar-primeiro-item" element={<PublicarPrimeiroItem />} />
          <Route path="/feed" element={<AuthGuard><PactoEntradaGuard><FeedOptimized /></PactoEntradaGuard></AuthGuard>} />
          <Route path="/buscar-itens" element={<AuthGuard><PactoEntradaGuard><BuscarItens /></PactoEntradaGuard></AuthGuard>} />
          <Route path="/publicar" element={<AuthGuard><PactoEntradaGuard><PublicarItem /></PactoEntradaGuard></AuthGuard>} />
          <Route path="/missoes" element={<AuthGuard><Missoes /></AuthGuard>} />
          <Route path="/perfil" element={<AuthGuard><PactoEntradaGuard><Perfil /></PactoEntradaGuard></AuthGuard>} />
          <Route path="/perfil/editar" element={<AuthGuard><PactoEntradaGuard><EditarPerfil /></PactoEntradaGuard></AuthGuard>} />
          <Route path="/perfil/:username" element={<PerfilPublicoMae />} />
          <Route path="/carteira" element={<AuthGuard><PactoEntradaGuard><Carteira /></PactoEntradaGuard></AuthGuard>} />
          <Route path="/comprar-girinhas" element={<AuthGuard><PactoEntradaGuard><ComprarGirinhas /></PactoEntradaGuard></AuthGuard>} />
          <Route path="/indicacoes" element={<AuthGuard><PactoEntradaGuard><Indicacoes /></PactoEntradaGuard></AuthGuard>} />
          <Route path="/item/:id" element={<DetalhesItem />} />
          <Route path="/minhas-reservas" element={<AuthGuard><PactoEntradaGuard><MinhasReservas /></PactoEntradaGuard></AuthGuard>} />
          <Route path="/configuracoes" element={<AuthGuard><PactoEntradaGuard><Configuracoes /></PactoEntradaGuard></AuthGuard>} />
          <Route path="/admin" element={<AuthGuard><AdminDashboard /></AuthGuard>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
