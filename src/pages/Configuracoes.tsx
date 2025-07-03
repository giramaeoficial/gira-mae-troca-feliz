import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Settings, Bell, User, Shield, Smartphone, TestTube } from 'lucide-react';
import { NotificationPreferences } from '@/components/notifications/NotificationPreferences';
import { OneSignalSettings } from '@/components/notifications/OneSignalSettings';
import { useNotificationSystem } from '@/hooks/useNotificationSystem';
import { toast } from 'sonner';
import Header from '@/components/shared/Header';
import QuickNav from '@/components/shared/QuickNav';

const Configuracoes: React.FC = () => {
  const { user } = useAuth();
  const { profile, loading } = useProfile();
  const { sendTestNotification } = useNotificationSystem();
  const [activeTab, setActiveTab] = useState(() => {
    const hash = window.location.hash.replace('#', '');
    return hash || 'perfil';
  });

  const handleTestNotification = async () => {
    try {
      await sendTestNotification();
      toast.success('Notificação de teste enviada!');
    } catch (error) {
      toast.error('Erro ao enviar notificação de teste');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Acesso Restrito</h2>
          <p className="text-gray-600">Você precisa estar logado para acessar as configurações.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
          <div className="max-w-4xl mx-auto p-4">
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-gray-600">Carregando configurações...</p>
              </div>
            </div>
          </div>
        </div>
        <QuickNav />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
        <div className="max-w-4xl mx-auto p-4">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Settings className="w-7 h-7 text-primary" />
              Configurações
            </h1>
            <p className="text-gray-600 mt-1">Gerencie suas preferências e configurações da conta</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-4">
              <TabsTrigger value="perfil" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Perfil</span>
              </TabsTrigger>
              <TabsTrigger value="notificacoes" className="flex items-center gap-2">
                <Bell className="w-4 h-4" />
                <span className="hidden sm:inline">Notificações</span>
              </TabsTrigger>
              <TabsTrigger value="push" className="flex items-center gap-2">
                <Smartphone className="w-4 h-4" />
                <span className="hidden sm:inline">Push</span>
              </TabsTrigger>
              <TabsTrigger value="privacidade" className="flex items-center gap-2 hidden lg:flex">
                <Shield className="w-4 h-4" />
                Privacidade
              </TabsTrigger>
            </TabsList>

            <TabsContent value="perfil" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Informações do Perfil
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    {profile?.avatar_url ? (
                      <img 
                        src={profile.avatar_url} 
                        alt={profile.nome || 'Avatar'} 
                        className="w-16 h-16 rounded-full"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-lg">{profile?.nome || 'Nome não informado'}</h3>
                      <p className="text-gray-600">{user.email}</p>
                      <Badge variant="secondary" className="mt-1">
                        {profile?.username ? `@${profile.username}` : 'Username não definido'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <Button onClick={() => window.location.href = '/perfil/editar'}>
                      Editar Perfil
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notificacoes" className="space-y-6">
              <NotificationPreferences />
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TestTube className="w-5 h-5" />
                    Teste do Sistema
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Teste se o sistema de notificações in-app está funcionando corretamente.
                  </p>
                  <Button onClick={handleTestNotification} variant="outline">
                    <TestTube className="w-4 h-4 mr-2" />
                    Enviar Notificação de Teste
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="push" className="space-y-6">
              <OneSignalSettings />
            </TabsContent>

            <TabsContent value="privacidade" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Privacidade e Segurança
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-gray-600">
                    <p className="mb-2">
                      <strong>Seus dados estão protegidos:</strong>
                    </p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Usamos criptografia para proteger suas informações</li>
                      <li>Seus dados pessoais não são compartilhados com terceiros</li>
                      <li>Você pode excluir sua conta a qualquer momento</li>
                      <li>Todas as transações são seguras e monitoradas</li>
                    </ul>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <Button variant="destructive" size="sm">
                      Excluir Conta
                    </Button>
                    <p className="text-xs text-gray-500 mt-2">
                      Esta ação não pode ser desfeita
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <QuickNav />
    </>
  );
};

export default Configuracoes;
