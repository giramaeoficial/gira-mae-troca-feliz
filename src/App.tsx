// src/App.tsx - SUBSTITUA COMPLETAMENTE
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as SonnerToaster } from '@/components/ui/sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import CadastroV2 from '@/pages/CadastroV2'; // Usar CadastroV2
import AuthGuard from '@/components/auth/AuthGuard';
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
          {/* ROTAS PÚBLICAS (sem proteção) */}
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/login" element={<Navigate to="/auth" replace />} />
          
          {/* ROTA DE CADASTRO (parcialmente protegida) */}
          <Route path="/cadastro" element={<CadastroV2 />} />
          
          {/* TODAS AS OUTRAS ROTAS PROTEGIDAS */}
          <Route path="/feed" element={
            <AuthGuard>
              <FeedOptimized />
            </AuthGuard>
          } />
          
          <Route path="/buscar-itens" element={
            <AuthGuard>
              <BuscarItens />
            </AuthGuard>
          } />
          
          <Route path="/publicar" element={
            <AuthGuard>
              <PublicarItem />
            </AuthGuard>
          } />
          
          <Route path="/missoes" element={
            <AuthGuard>
              <Missoes />
            </AuthGuard>
          } />
          
          <Route path="/mensagens" element={
            <AuthGuard>
              <Mensagens />
            </AuthGuard>
          } />
          
          <Route path="/mensagens/:conversaId" element={
            <AuthGuard>
              <Mensagens />
            </AuthGuard>
          } />
          
          <Route path="/perfil" element={
            <AuthGuard>
              <Perfil />
            </AuthGuard>
          } />
          
          <Route path="/perfil/editar" element={
            <AuthGuard>
              <EditarPerfil />
            </AuthGuard>
          } />
          
          <Route path="/perfil/:username" element={
            <AuthGuard>
              <PerfilPublicoMae />
            </AuthGuard>
          } />
          
          <Route path="/carteira" element={
            <AuthGuard>
              <Carteira />
            </AuthGuard>
          } />
          
          <Route path="/comprar-girinhas" element={
            <AuthGuard>
              <ComprarGirinhas />
            </AuthGuard>
          } />
          
          <Route path="/indicacoes" element={
            <AuthGuard>
              <Indicacoes />
            </AuthGuard>
          } />
          
          <Route path="/item/:id" element={
            <AuthGuard>
              <DetalhesItem />
            </AuthGuard>
          } />
          
          <Route path="/minhas-reservas" element={
            <AuthGuard>
              <MinhasReservas />
            </AuthGuard>
          } />
          
          <Route path="/configuracoes" element={
            <AuthGuard>
              <Configuracoes />
            </AuthGuard>
          } />
          
          <Route path="/admin" element={
            <AuthGuard>
              <AdminDashboard />
            </AuthGuard>
          } />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
