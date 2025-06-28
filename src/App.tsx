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
import AuthCallback from '@/pages/AuthCallback'; // ✅ ADICIONAR IMPORT
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
          <Route path="/auth-callback" element={<AuthCallback />} /> {/* ✅ ADICIONAR ROTA */}
          <Route path="/login" element={<Navigate to="/auth" replace />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/feed" element={<FeedOptimized />} />
          <Route path="/buscar-itens" element={<BuscarItens />} />
          <Route path="/publicar" element={<PublicarItem />} />
          <Route path="/missoes" element={<Missoes />} />
          <Route path="/mensagens" element={<Mensagens />} />
          <Route path="/mensagens/:conversaId" element={<Mensagens />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/perfil/editar" element={<EditarPerfil />} />
          <Route path="/perfil/:username" element={<PerfilPublicoMae />} />
          <Route path="/carteira" element={<Carteira />} />
          <Route path="/comprar-girinhas" element={<ComprarGirinhas />} />
          <Route path="/indicacoes" element={<Indicacoes />} />
          <Route path="/item/:id" element={<DetalhesItem />} />
          <Route path="/minhas-reservas" element={<MinhasReservas />} />
          <Route path="/configuracoes" element={<Configuracoes />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
