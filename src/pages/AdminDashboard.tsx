
import React, { useState } from 'react';
import AuthGuard from '@/components/auth/AuthGuard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Shield,
} from "lucide-react";
import UserManagement from '@/components/admin/UserManagement';
import MetricsOverview from '@/components/admin/MetricsOverview';
import ConfigCategorias from '@/components/admin/ConfigCategorias';
import ConfigCompraGirinhas from '@/components/admin/ConfigCompraGirinhas';
import ConfigMercadoPago from '@/components/admin/ConfigMercadoPago';
import EmissionChart from '@/components/admin/EmissionChart';
import PainelSaudeGirinha from '@/components/admin/PainelSaudeGirinha';
import SystemConfig from '@/components/admin/SystemConfig';
import MissoesAdmin from '@/components/admin/MissoesAdmin';
import ConfigBonusDiario from '@/components/admin/ConfigBonusDiario';
import ConfigIndicacoes from '@/components/admin/ConfigIndicacoes';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <Shield className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                  <p className="text-sm text-gray-500">Painel de administração da plataforma</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-10">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="users">Usuários</TabsTrigger>
              <TabsTrigger value="categories">Categorias</TabsTrigger>
              <TabsTrigger value="girinhas">Girinhas</TabsTrigger>
              <TabsTrigger value="mercadopago">Mercado Pago</TabsTrigger>
              <TabsTrigger value="saude">Painel Saúde</TabsTrigger>
              <TabsTrigger value="system">Sistema</TabsTrigger>
              <TabsTrigger value="bonus">Bônus</TabsTrigger>
              <TabsTrigger value="missoes">Missões</TabsTrigger>
              <TabsTrigger value="indicacoes">Indicações</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <MetricsOverview />
            </TabsContent>

            <TabsContent value="users">
              <UserManagement />
            </TabsContent>

            <TabsContent value="categories">
              <ConfigCategorias />
            </TabsContent>

            <TabsContent value="girinhas">
              <div className="grid gap-6">
                <ConfigCompraGirinhas />
                <EmissionChart />
              </div>
            </TabsContent>

            <TabsContent value="mercadopago">
              <ConfigMercadoPago />
            </TabsContent>

            <TabsContent value="saude">
              <PainelSaudeGirinha />
            </TabsContent>

            <TabsContent value="system">
              <SystemConfig />
            </TabsContent>

            <TabsContent value="bonus">
              <ConfigBonusDiario />
            </TabsContent>

            <TabsContent value="missoes">
              <MissoesAdmin />
            </TabsContent>

            <TabsContent value="indicacoes">
              <ConfigIndicacoes />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AuthGuard>
  );
};

export default AdminDashboard;
