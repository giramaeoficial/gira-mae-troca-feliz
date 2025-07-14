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
          <Route path="/auth/callback" element={<AuthCallback />} />
          
          {/* ✅ NOVAS ROTAS PÚBLICAS - Termos e Política */}
          <Route path="/onboarding/termos" element={<TermosOnboarding />} />
          <Route path="/termos" element={<TermosUso />} />
          <Route path="/onboarding/privacidade" element={<PoliticaPrivacidade />} />
          <Route path="/privacidade" element={<PoliticaPrivacidade />} />
          
          {/* ================================================ */}
          {/* ROTAS DE ONBOARDING (onboarding protection)     */}
          {/* ================================================ */}
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
                 <SmartGuard>
                   <ConceptoComunidadeOnboarding />
                 </SmartGuard>
               </AuthGuard>
             } 
           />
           <Route 
             path="/publicar-primeiro-item" 
             element={
               <AuthGuard>
                 <SmartGuard>
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
                  <SmartGuard>
                    <FeedOptimized />
                  </SmartGuard>
                </AuthGuard>
              } 
            />
            <Route 
              path="/missoes" 
              element={
                <AuthGuard>
                  <SmartGuard>
                    <Missoes />
                  </SmartGuard>
                </AuthGuard>
              } 
            />
          <Route 
            path="/buscar-itens" 
            element={
              <AuthGuard>
                <SmartGuard>
                  <BuscarItens />
                </SmartGuard>
              </AuthGuard>
            } 
          />
          <Route 
            path="/publicar" 
            element={
              <AuthGuard>
                <SmartGuard>
                  <PublicarItem />
                </SmartGuard>
              </AuthGuard>
            } 
          />
           <Route 
             path="/perfil" 
             element={
               <AuthGuard>
                 <SmartGuard>
                   <Perfil />
                 </SmartGuard>
               </AuthGuard>
             } 
           />
           <Route 
             path="/perfil/editar" 
             element={
               <AuthGuard>
                 <SmartGuard>
                   <EditarPerfil />
                 </SmartGuard>
               </AuthGuard>
             } 
           />
           <Route 
             path="/carteira" 
             element={
               <AuthGuard>
                 <SmartGuard>
                   <Carteira />
                 </SmartGuard>
               </AuthGuard>
             } 
           />
          <Route 
            path="/comprar-girinhas" 
            element={
              <AuthGuard>
                <SmartGuard>
                  <ComprarGirinhas />
                </SmartGuard>
              </AuthGuard>
            } 
          />
          <Route 
            path="/indicacoes" 
            element={
              <AuthGuard>
                <SmartGuard>
                  <Indicacoes />
                </SmartGuard>
              </AuthGuard>
            } 
          />
          <Route 
            path="/minhas-reservas" 
            element={
              <AuthGuard>
                <SmartGuard>
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
                <SmartGuard>
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
                <SmartGuard>
                  <AdminDashboard />
                </SmartGuard>
              </AuthGuard>
            } 
          />

          {/* ================================================ */}
          {/* ROTAS ESPECÍFICAS (AGORA PROTEGIDAS)            */}
          {/* ================================================ */}
          
          {/* ✅ ITEM DETAILS - AGORA PROTEGIDO COM SMARTGUARD */}
          <Route 
            path="/item/:id" 
            element={
              <AuthGuard>
                <SmartGuard>
                  <DetalhesItem />
                </SmartGuard>
              </AuthGuard>
            } 
          />
          
          {/* ✅ PERFIL PÚBLICO - AGORA PROTEGIDO COM SMARTGUARD */}
          <Route 
            path="/perfil/:id" 
            element={
              <AuthGuard>
                <SmartGuard>
                  <PerfilPublicoMae />
                </SmartGuard>
              </AuthGuard>
            } 
          />

          {/* ================================================ */}
          {/* NOVAS TELAS - AGORA COM SMARTGUARD              */}
          {/* ================================================ */}
          <Route 
            path="/maes-seguidas" 
            element={
              <AuthGuard>
                <SmartGuard>
                  <MaesSeguidas />
                </SmartGuard>
              </AuthGuard>
            } 
          />
          <Route 
            path="/favoritos" 
            element={
              <AuthGuard>
                <SmartGuard>
                  <ItensFavoritos />
                </SmartGuard>
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
