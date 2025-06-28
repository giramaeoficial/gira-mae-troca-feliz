import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useMeusItens } from '@/hooks/useItensOptimized';
import Header from '@/components/shared/Header';
import QuickNav from '@/components/shared/QuickNav';
import ItemCardWithActions from '@/components/shared/ItemCardWithActions';
import AuthGuard from '@/components/auth/AuthGuard';
import LoadingSpinner from '@/components/loading/LoadingSpinner';
import FriendlyError from '@/components/error/FriendlyError';
import { Edit, Package, Star, Users, MapPin, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Perfil = () => {
  const { user, signOut } = useAuth();
  const { profile, loading: profileLoading, error: profileError } = useProfile();
  const { data: meusItens, isLoading: itensLoading, error: itensError } = useMeusItens(user?.id || '');
  const navigate = useNavigate();

  const itensArray = Array.isArray(meusItens) ? meusItens : [];
  const itensAtivos = itensArray.filter((item: any) => item.status === 'disponivel');
  const itensReservados = itensArray.filter((item: any) => item.status === 'reservado');
  const itensInativos = itensArray.filter((item: any) => item.status === 'inativo');

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner text="Carregando perfil..." />
        </div>
        <QuickNav />
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <FriendlyError 
            title="Erro ao carregar perfil"
            message={profileError}
            onRetry={() => window.location.reload()}
          />
        </div>
        <QuickNav />
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 pb-24">
        <Header />
        
        <main className="container mx-auto px-4 py-6 max-w-4xl">
          {/* Profile Header */}
          <Card className="bg-white/80 backdrop-blur-sm shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16">
                    {profile?.avatar_url ? (
                      <AvatarImage src={profile.avatar_url} alt={profile.nome} />
                    ) : (
                      <AvatarFallback className="bg-gray-300 text-gray-600">
                        {getInitials(profile?.nome || 'Usuário')}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <CardTitle className="text-xl font-semibold">{profile?.nome}</CardTitle>
                    <div className="flex items-center text-gray-500 gap-2">
                      <MapPin className="w-4 h-4" />
                      {profile?.cidade}, {profile?.estado}
                    </div>
                    <div className="text-xs text-gray-400">
                      Membro há {profile?.created_at ? formatDistanceToNow(new Date(profile.created_at), { addSuffix: true, locale: ptBR }) : 'pouco tempo'}
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="icon" onClick={() => navigate('/perfil/editar')}>
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary" />
                  <span className="font-medium">
                    {itensArray.length} Itens
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-primary" />
                  <span className="font-medium">
                    {profile?.reputacao || 0} Avaliações
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  <span className="font-medium">
                    <a href="/indicacoes">Indique e ganhe!</a>
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Tabs defaultValue="ativos" className="mt-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="ativos">Ativos ({itensAtivos.length})</TabsTrigger>
              <TabsTrigger value="reservados">Reservados ({itensReservados.length})</TabsTrigger>
              <TabsTrigger value="inativos">Inativos ({itensInativos.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="ativos" className="mt-6">
              {itensLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : itensAtivos.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {itensAtivos.map((item: any) => (
                    <ItemCardWithActions key={item.id} item={item} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Nenhum item ativo
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Você ainda não publicou nenhum item.
                  </p>
                  <Button onClick={() => navigate('/publicar')}>
                    Publicar Item
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="reservados" className="mt-6">
              {itensLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : itensReservados.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {itensReservados.map((item: any) => (
                    <ItemCardWithActions key={item.id} item={item} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Nenhum item reservado
                  </h3>
                  <p className="text-gray-600">
                    Seus itens reservados aparecerão aqui.
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="inativos" className="mt-6">
              {itensLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : itensInativos.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {itensInativos.map((item: any) => (
                    <ItemCardWithActions key={item.id} item={item} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Nenhum item inativo
                  </h3>
                  <p className="text-gray-600">
                    Itens removidos ou expirados aparecerão aqui.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </main>

        <QuickNav />
      </div>
    </AuthGuard>
  );
};

export default Perfil;
