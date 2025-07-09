// src/App.tsx - VERSÃO AJUSTADA com proteção total do PactoEntradaGuard

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
import PactoEntradaGuard from '@/components/auth/PactoEntradaGuard';
import { CadastroCompletoGuard } from '@/components/auth/CadastroCompletoGuard';
import { RecompensasProvider } from '@/components/recompensas/ProviderRecompensas';

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
          <Route path="/auth-callback" element={<AuthCallback />} />
          <Route path="/login" element={<Navigate to="/auth" replace />} />
          <Route path="/perfil/:id" element={<PerfilPublicoMae />} />

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
         <Route 
           path="/publicar-primeiro-item" 
           element={
             <AuthGuard>
               <PublicarPrimeiroItem />
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
                <CadastroCompletoGuard>
                  <PactoEntradaGuard>
                    <FeedOptimized />
                  </PactoEntradaGuard>
                </CadastroCompletoGuard>
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
                <CadastroCompletoGuard>
                  <PactoEntradaGuard>
                    <Perfil />
                  </PactoEntradaGuard>
                </CadastroCompletoGuard>
              </AuthGuard>
            } 
          />
          <Route 
            path="/perfil/editar" 
            element={
              <AuthGuard>
                <CadastroCompletoGuard>
                  <PactoEntradaGuard>
                    <EditarPerfil />
                  </PactoEntradaGuard>
                </CadastroCompletoGuard>
              </AuthGuard>
            } 
          />
          <Route 
            path="/carteira" 
            element={
              <AuthGuard>
                <CadastroCompletoGuard>
                  <PactoEntradaGuard>
                    <Carteira />
                  </PactoEntradaGuard>
                </CadastroCompletoGuard>
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
                 <RecompensasProvider>
                   <MinhasReservas />
                 </RecompensasProvider>
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

         {/* 404 */}
         <Route path="*" element={<NotFound />} />
       </Routes>
     </BrowserRouter>
   </QueryClientProvider>
 );
}

export default App;
