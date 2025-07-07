// src/App.tsx - VERSÃO CORRIGIDA PARA RESOLVER ERRO 404

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as SonnerToaster } from '@/components/ui/sonner';
import { QueryClient, QueryClientProvider, QueryCache } from '@tanstack/react-query';

import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import Login from '@/pages/Login';
import Cadastro from '@/pages/Cadastro';
import AuthCallback from '@/pages/AuthCallback';
import AuthGuard from '@/components/auth/AuthGuard';
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
import PactoEntradaGuard from '@/components/auth/PactoEntradaGuard';

// Configuração otimizada do QueryClient para evitar promises rejeitadas
const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      console.error('Query failed:', error);
    },
  }),
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5, // 5 minutos
      refetchOnWindowFocus: false,
      throwOnError: false,
    },
  },
});

function App() {
  // Debug para ambiente Lovable
  if (process.env.NODE_ENV === 'development') {
    console.log('Rota atual:', window.location.pathname);
    console.log('React Router carregado:', !!React);
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <SonnerToaster />
      <BrowserRouter>
        <Routes>
          {/* ================================ */}
          {/* ROTAS PÚBLICAS (sem AuthGuard)   */}
          {/* ================================ */}
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/auth-callback" element={<AuthCallback />} />
          <Route path="/login" element={<Navigate to="/auth" replace />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/perfil/:username" element={<PerfilPublicoMae />} />
          <Route path="/item/:id" element={<DetalhesItem />} />

          {/* ========================================== */}
          {/* ROTAS DE ONBOARDING (AuthGuard apenas)     */}
          {/* ========================================== */}
          <Route 
            path="/conceito-comunidade" 
            element={
              <AuthGuard>
                <ConceptoComunidadeOnboarding />
              </AuthGuard>
            } 
          />
          
          {/* ORDEM CRÍTICA: Rota específica ANTES da geral */}
          <Route 
            path="/publicar-primeiro-item" 
            element={
              <AuthGuard>
                <PublicarItem />
              </AuthGuard>
            } 
          />

          {/* ================================================ */}
          {/* ROTAS PROTEGIDAS (AuthGuard + PactoEntradaGuard) */}
          {/* ================================================ */}
          <Route 
            path="/feed" 
            element={
              <AuthGuard>
                <PactoEntradaGuard>
                  <FeedOptimized />
                </PactoEntradaGuard>
              </AuthGuard>
            } 
          />
          
          <Route 
            path="/buscar-itens" 
            element={
              <AuthGuard>
                <PactoEntradaGuard>
                  <BuscarItens />
                </PactoEntradaGuard>
              </AuthGuard>
            } 
          />
          
          {/* ROTA GERAL: Deve vir APÓS rotas específicas */}
          <Route 
            path="/publicar" 
            element={
              <AuthGuard>
                <PactoEntradaGuard>
                  <PublicarItem />
                </PactoEntradaGuard>
              </AuthGuard>
            } 
          />
          
          <Route 
            path="/perfil" 
            element={
              <AuthGuard>
                <PactoEntradaGuard>
                  <Perfil />
                </PactoEntradaGuard>
              </AuthGuard>
            } 
          />
          
          <Route 
            path="/perfil/editar" 
            element={
              <AuthGuard>
                <PactoEntradaGuard>
                  <EditarPerfil />
                </PactoEntradaGuard>
              </AuthGuard>
            } 
          />
          
          <Route 
            path="/carteira" 
            element={
              <AuthGuard>
                <PactoEntradaGuard>
                  <Carteira />
                </PactoEntradaGuard>
              </AuthGuard>
            } 
          />
          
          <Route 
            path="/comprar-girinhas" 
            element={
              <AuthGuard>
                <PactoEntradaGuard>
                  <ComprarGirinhas />
                </PactoEntradaGuard>
              </AuthGuard>
            } 
          />
          
          <Route 
            path="/indicacoes" 
            element={
              <AuthGuard>
                <PactoEntradaGuard>
                  <Indicacoes />
                </PactoEntradaGuard>
              </AuthGuard>
            } 
          />
          
          <Route 
            path="/minhas-reservas" 
            element={
              <AuthGuard>
                <PactoEntradaGuard>
                  <MinhasReservas />
                </PactoEntradaGuard>
              </AuthGuard>
            } 
          />
          
          <Route 
            path="/configuracoes" 
            element={
              <AuthGuard>
                <PactoEntradaGuard>
                  <Configuracoes />
                </PactoEntradaGuard>
              </AuthGuard>
            } 
          />

          {/* ================================================ */}
          {/* ROTAS ESPECIAIS (lógica específica)             */}
          {/* ================================================ */}
          
          {/* Missões: AuthGuard apenas (precisa acessar para completar missão) */}
          <Route 
            path="/missoes" 
            element={
              <AuthGuard>
                <Missoes />
              </AuthGuard>
            } 
          />

          {/* Admin: AuthGuard apenas (admin pode acessar sem missão) */}
          <Route 
            path="/admin" 
            element={
              <AuthGuard>
                <AdminDashboard />
              </AuthGuard>
            } 
          />

          {/* 404 - DEVE SER A ÚLTIMA ROTA */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
