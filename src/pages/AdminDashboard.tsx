import { useState } from 'react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Header from '@/components/shared/Header';
import QuickNav from '@/components/shared/QuickNav';
import MetricsOverview from '@/components/admin/MetricsOverview';
import UserManagement from '@/components/admin/UserManagement';
import CotacaoChart from '@/components/admin/CotacaoChart';
import EmissionChart from '@/components/admin/EmissionChart';
import SystemConfig from '@/components/admin/SystemConfig';
import ConfigCompraGirinhas from '@/components/admin/ConfigCompraGirinhas';
import ConfigCategorias from '@/components/admin/ConfigCategorias';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen bg-gray-50">
      <Header activePage="admin" />
      
      <div className="container max-w-6xl mx-auto py-6 px-4 pb-24">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Painel Administrativo</h1>
          <p className="text-gray-600">Gerencie o sistema GiraMãe</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="users">Usuários</TabsTrigger>
            <TabsTrigger value="girinhas">Girinhas</TabsTrigger>
            <TabsTrigger value="categorias">Categorias</TabsTrigger>
            <TabsTrigger value="system">Sistema</TabsTrigger>
            <TabsTrigger value="emission">Emissão</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <MetricsOverview />
          </TabsContent>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          <TabsContent value="girinhas">
            <div className="space-y-6">
              <CotacaoChart />
              <EmissionChart />
            </div>
          </TabsContent>

          <TabsContent value="categorias">
            <ConfigCategorias />
          </TabsContent>

          <TabsContent value="system">
            <SystemConfig />
          </TabsContent>

          <TabsContent value="emission">
            <ConfigCompraGirinhas />
          </TabsContent>
        </Tabs>
      </div>

      <QuickNav />
    </div>
  );
};

export default AdminDashboard;
