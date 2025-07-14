// src/App.tsx - VERSÃO SEM SMARTGUARD

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as SonnerToaster } from '@/components/ui/sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import Login from '@/pages/Login';
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
import PublicarPrimeiroItem from '@/pages/PublicarPrimeiroItem';
import { RecompensasProvider } from '@/components/recompensas/ProviderRecompensas';
import WhatsAppOnboarding from '@/pages/onboarding/WhatsAppOnboarding';
import CodigoOnboarding from '@/pages/onboarding/CodigoOnboarding';
import TermosOnboarding from '@/pages/onboarding/TermosOnboarding';
import TermosUso from '@/pages/TermosUso';
import PoliticaPrivacidade from '@/pages/PoliticaPrivacidade';
import EnderecoOnboarding from '@/pages/onboarding/EnderecoOnboarding';
import AguardandoLiberacao from '@/pages/onboarding/AguardandoLiberacao';
import MaesSeguidas from '@/pages/MaesSeguidas';
import ItensFavoritos from '@/pages/ItensFavoritos';

const queryClient = new QueryClient();

function App() {
 return (
   <QueryClientProvider client={queryClient}>
     <Toaster />
     <SonnerToaster />
     <BrowserRouter>
       <Routes>
          {/* ================================================ */}
          {/* ROTAS PÚBLICAS (sem proteção)                   */}
          {/* ================================================ */}
           <Route path="/" element={<Index />} />
           <Route path="/auth" element={<Auth />} />
           <Route path="/auth-callback" element={<AuthCallback />} />
           <Route path="/login" element={<Login />} />
          {/* ✅ NOVAS ROTAS PÚBLICAS - Termos e Política */}
          <Route path="/onboarding/termos" element={<TermosOnboarding />} />
          <Route path="/termos" element={<TermosUso />} />
          <Route path="/onboarding/privacidade" element={<PoliticaPrivacidade />} />
          <Route path="/privacidade" element={<PoliticaPrivacidade />} />
          
          {/* ================================================ */}
          {/* ROTAS DE ONBOARDING (apenas AuthGuard)          */}
          {/* ================================================ */}
          <Route 
            path="/onboarding/whatsapp" 
            element={
              <AuthGuard>
                <WhatsAppOnboarding />
              </AuthGuard>
            } 
          />
          <Route 
            path="/onboarding/codigo" 
            element={
              <AuthGuard>
                <CodigoOnboarding />
              </AuthGuard>
            } 
          />
          <Route 
            path="/onboarding/endereco" 
            element={
              <AuthGuard>
                <EnderecoOnboarding />
              </AuthGuard>
            } 
          />
          <Route 
            path="/aguardando-liberacao" 
            element={
              <AuthGuard>
                <AguardandoLiberacao />
              </AuthGuard>
            } 
          />

          {/* ========================================== */}
          {/* ROTAS DE MISSÃO (apenas AuthGuard)        */}
          {/* ========================================== */}
           <Route 
             path="/conceito-comunidade" 
             element={
               <AuthGuard>
                 <ConceptoComunidadeOnboarding />
               </AuthGuard>
             } 
           />
           <Route 
             path="/publicar-primeiro-item" 
             element={
               <AuthGuard>
                 <PublicarPrimeiroItem />
               </AuthGuard>
             } 
           />

          {/* ================================================ */}
          {/* ROTAS PROTEGIDAS (apenas AuthGuard)             */}
          {/* ================================================ */}
            <Route 
              path="/feed" 
              element={
                <AuthGuard>
                  <FeedOptimized />
                </AuthGuard>
              } 
            />
            <Route 
              path="/missoes" 
              element={
                <AuthGuard>
                  <Missoes />
                </AuthGuard>
              } 
            />
          <Route 
            path="/buscar-itens" 
            element={
              <AuthGuard>
                <BuscarItens />
              </AuthGuard>
            } 
          />
          <Route 
            path="/publicar" 
            element={
              <AuthGuard>
                <PublicarItem />
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
             path="/perfil/editar" 
             element={
               <AuthGuard>
                 <EditarPerfil />
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
            path="/comprar-girinhas" 
            element={
              <AuthGuard>
                <ComprarGirinhas />
              </AuthGuard>
            } 
          />
          <Route 
            path="/indicacoes" 
            element={
              <AuthGuard>
                <Indicacoes />
              </AuthGuard>
            } 
          />
          <Route 
            path="/minhas-reservas" 
            element={
              <AuthGuard>
                <RecompensasProvider>
                  <MinhasReservas />
                </RecompensasProvider>
              </AuthGuard>
            } 
          />
          <Route 
            path="/configuracoes" 
            element={
              <AuthGuard>
                <Configuracoes />
              </AuthGuard>
            } 
          />

          {/* ================================================ */}
          {/* ROTAS ADMINISTRATIVAS (apenas AuthGuard)        */}
          {/* ================================================ */}
          <Route 
            path="/admin" 
            element={
              <AuthGuard>
                <AdminDashboard />
              </AuthGuard>
            } 
          />

          {/* ================================================ */}
          {/* ROTAS ESPECÍFICAS (apenas AuthGuard)            */}
          {/* ================================================ */}
          
          <Route 
            path="/item/:id" 
            element={
              <AuthGuard>
                <DetalhesItem />
              </AuthGuard>
            } 
          />
          
          <Route 
            path="/perfil/:id" 
            element={
              <AuthGuard>
                <PerfilPublicoMae />
              </AuthGuard>
            } 
          />

          {/* ================================================ */}
          {/* NOVAS TELAS (apenas AuthGuard)                  */}
          {/* ================================================ */}
          <Route 
            path="/maes-seguidas" 
            element={
              <AuthGuard>
                <MaesSeguidas />
              </AuthGuard>
            } 
          />
          <Route 
            path="/favoritos" 
            element={
              <AuthGuard>
                <ItensFavoritos />
              </AuthGuard>
            } 
          />

          {/* 404 */}
           <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
   </QueryClientProvider>
 );
}

export default App;
