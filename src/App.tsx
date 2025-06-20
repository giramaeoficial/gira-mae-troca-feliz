
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import Index from '@/pages/Index';
import Login from '@/pages/Login';
import Cadastro from '@/pages/Cadastro';
import FeedOptimized from '@/pages/FeedOptimized';
import PublicarItem from '@/pages/PublicarItem';
import Mensagens from '@/pages/Mensagens';
import Perfil from '@/pages/Perfil';
import PerfilPublicoMae from '@/pages/PerfilPublicoMae';
import Carteira from '@/pages/Carteira';
import ComprarGirinhas from '@/pages/ComprarGirinhas';
import Indicacoes from '@/pages/Indicacoes';
import DetalhesItem from '@/pages/DetalhesItem';
import MinhasReservas from '@/pages/MinhasReservas';
import AdminDashboard from '@/pages/AdminDashboard';
import NotFound from '@/pages/NotFound';
import Missoes from '@/pages/Missoes';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/feed" element={<FeedOptimized />} />
          <Route path="/publicar" element={<PublicarItem />} />
          <Route path="/missoes" element={<Missoes />} />
          <Route path="/mensagens" element={<Mensagens />} />
          <Route path="/mensagens/:conversaId" element={<Mensagens />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/perfil/:username" element={<PerfilPublicoMae />} />
          <Route path="/carteira" element={<Carteira />} />
          <Route path="/comprar-girinhas" element={<ComprarGirinhas />} />
          <Route path="/indicacoes" element={<Indicacoes />} />
          <Route path="/item/:id" element={<DetalhesItem />} />
          <Route path="/minhas-reservas" element={<MinhasReservas />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
