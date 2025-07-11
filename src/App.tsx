// src/App.tsx - VERSÃO ATUALIZADA com SmartGuard

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
import SmartGuard from '@/components/auth/SmartGuard';
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
import EnderecoOnboarding from '@/pages/onboarding/EnderecoOnboarding';
import AguardandoLiberacao from '@/pages/onboarding/AguardandoLiberacao';

const queryClient = new QueryClient();

function App() {
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
          <Route path="/cadastro" element={<Navigate to="/auth" replace />} />
          <Route path="/auth-callback" element={<AuthCallback />} />
          <Route path="/login" element={<Navigate to="/auth" replace />} />
          <Route path="/perfil/:id" element={<PerfilPublicoMae />} />
          
          {/* ========================================== */}
          {/* ROTAS DE ONBOARDING (protegidas)          */}
          {/* ========================================== */}
          <Route 
            path="/onboarding/whatsapp" 
            element={
              <AuthGuard>
                <SmartGuard>
                  <WhatsAppOnboarding />
                </SmartGuard>
              </AuthGuard>
            } 
          />
          <Route 
            path="/onboarding/codigo" 
            element={
              <AuthGuard>
                <SmartGuard>
                  <CodigoOnboarding />
                </SmartGuard>
              </AuthGuard>
            } 
          />
          <Route 
            path="/onboarding/termos" 
            element={
              <AuthGuard>
                <SmartGuard>
                  <TermosOnboarding />
                </SmartGuard>
              </AuthGuard>
            } 
          />
          <Route 
            path="/onboarding/endereco" 
            element={
              <AuthGuard>
                <SmartGuard>
                  <EnderecoOnboarding />
                </SmartGuard>
              </AuthGuard>
            } 
          />
          <Route 
            path="/aguardando-liberacao" 
            element={
              <AuthGuard>
                <SmartGuard>
                  <AguardandoLiberacao />
                </SmartGuard>
              </AuthGuard>
            } 
          />

         {/* ========================================== */}
         {/* ROTAS DE MISSÃO (mission_only protection)  */}
         {/* ========================================== */}
          <Route 
            path="/conceito-comunidade" 
            element={
              <AuthGuard>
                <SmartGuard protectionLevel="mission_only">
                  <ConceptoComunidadeOnboarding />
                </SmartGuard>
              </AuthGuard>
            } 
          />
          <Route 
            path="/publicar-primeiro-item" 
            element={
              <AuthGuard>
                <SmartGuard protectionLevel="mission_only">
                  <PublicarPrimeiroItem />
                </SmartGuard>
              </AuthGuard>
            } 
          />

         {/* ================================================ */}
         {/* ROTAS PROTEGIDAS (proteção completa)            */}
         {/* ================================================ */}
           <Route 
             path="/feed" 
             element={
               <AuthGuard>
                 <SmartGuard protectionLevel="full">
                   <FeedOptimized />
                 </SmartGuard>
               </AuthGuard>
             } 
           />
           <Route 
             path="/missoes" 
             element={
               <AuthGuard>
                 <SmartGuard protectionLevel="full">
                   <Missoes />
                 </SmartGuard>
               </AuthGuard>
             } 
           />
         <Route 
           path="/buscar-itens" 
           element={
             <AuthGuard>
               <SmartGuard protectionLevel="full">
                 <BuscarItens />
               </SmartGuard>
             </AuthGuard>
           } 
         />
         <Route 
           path="/publicar" 
           element={
             <AuthGuard>
               <SmartGuard protectionLevel="full">
                 <PublicarItem />
               </SmartGuard>
             </AuthGuard>
           } 
         />
          <Route 
            path="/perfil" 
            element={
              <AuthGuard>
                <SmartGuard protectionLevel="full">
                  <Perfil />
                </SmartGuard>
              </AuthGuard>
            } 
          />
          <Route 
            path="/perfil/editar" 
            element={
              <AuthGuard>
                <SmartGuard protectionLevel="full">
                  <EditarPerfil />
                </SmartGuard>
              </AuthGuard>
            } 
          />
          <Route 
            path="/carteira" 
            element={
              <AuthGuard>
                <SmartGuard protectionLevel="full">
                  <Carteira />
                </SmartGuard>
              </AuthGuard>
            } 
          />
         <Route 
           path="/comprar-girinhas" 
           element={
             <AuthGuard>
               <SmartGuard protectionLevel="full">
                 <ComprarGirinhas />
               </SmartGuard>
             </AuthGuard>
           } 
         />
         <Route 
           path="/indicacoes" 
           element={
             <AuthGuard>
               <SmartGuard protectionLevel="full">
                 <Indicacoes />
               </SmartGuard>
             </AuthGuard>
           } 
         />
         <Route 
           path="/minhas-reservas" 
           element={
             <AuthGuard>
               <SmartGuard protectionLevel="full">
                 <RecompensasProvider>
                   <MinhasReservas />
                 </RecompensasProvider>
               </SmartGuard>
             </AuthGuard>
           } 
         />
         <Route 
           path="/configuracoes" 
           element={
             <AuthGuard>
               <SmartGuard protectionLevel="full">
                 <Configuracoes />
               </SmartGuard>
             </AuthGuard>
           } 
         />

         {/* ================================================ */}
         {/* ROTAS ADMINISTRATIVAS (admin_bypass)            */}
         {/* ================================================ */}
         <Route 
           path="/admin" 
           element={
             <AuthGuard>
               <SmartGuard protectionLevel="admin_bypass">
                 <AdminDashboard />
               </SmartGuard>
             </AuthGuard>
           } 
         />

         {/* ================================================ */}
         {/* ROTAS ESPECÍFICAS (sem proteção extra)          */}
         {/* ================================================ */}
         <Route path="/item/:id" element={<DetalhesItem />} />

         {/* 404 */}
         <Route path="*" element={<NotFound />} />
       </Routes>
     </BrowserRouter>
   </QueryClientProvider>
 );
}

export default App;
