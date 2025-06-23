
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/shared/Header";
import QuickNav from "@/components/shared/QuickNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useItens } from "@/hooks/useItens";
import { Star, MapPin, Calendar, Plus, Edit3, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import ItemCardSkeleton from "@/components/loading/ItemCardSkeleton";
import EmptyState from "@/components/loading/EmptyState";
import LoadingSpinner from "@/components/loading/LoadingSpinner";
import FriendlyError from "@/components/error/FriendlyError";
import LazyImage from "@/components/ui/lazy-image";

const Perfil = () => {
    const { user } = useAuth();
    const { profile, loading: profileLoading, error: profileError, refetch: refetchProfile } = useProfile();
    const { buscarMeusItens, loading: itensLoading, error: itensError, itens: meusItens } = useItens();
    const [activeTab, setActiveTab] = useState("ativos");

    // Carregar meus itens quando o usuário estiver disponível
    useEffect(() => {
        if (user) {
            buscarMeusItens(user.id);
        }
    }, [user, buscarMeusItens]);

    if (!user) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 pb-24">
                <Header />
                <FriendlyError 
                    type="permission"
                    title="Acesso Restrito"
                    message="Você precisa estar logado para acessar seu perfil."
                    showHomeButton={true}
                />
                <QuickNav />
            </div>
        );
    }

    if (profileLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 pb-24">
                <Header />
                <LoadingSpinner 
                    size="lg" 
                    text="Carregando seu perfil..." 
                    className="mt-20"
                />
                <QuickNav />
            </div>
        );
    }

    if (profileError) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 pb-24">
                <Header />
                <FriendlyError 
                    title="Erro ao carregar perfil"
                    message={profileError}
                    onRetry={() => window.location.reload()}
                />
                <QuickNav />
            </div>
        );
    }

    const itensAtivos = meusItens?.filter(item => item.status === 'disponivel') || [];
    const itensReservados = meusItens?.filter(item => item.status === 'reservado') || [];
    const itensTrocados = meusItens?.filter(item => item.status === 'entregue') || [];

    const getInitials = (name: string) => {
        return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
    };

    const formatarData = (data: string) => {
        try {
            return format(new Date(data), "MMM yyyy", { locale: ptBR });
        } catch {
            return 'Data inválida';
        }
    };

    const renderItemCard = (item: any) => (
        <Card key={item.id} className="group hover:shadow-lg transition-all duration-300 overflow-hidden bg-white/90 backdrop-blur-sm border-0">
            <div className="aspect-square bg-gray-100 overflow-hidden relative">
                {item.fotos && item.fotos.length > 0 ? (
                    <LazyImage
                        src={item.fotos[0]}
                        alt={item.titulo}
                        bucket="itens"
                        size="medium"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        placeholder="📷"
                        onError={() => console.error('Erro ao carregar item do perfil:', item.id)}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <span className="text-4xl">📷</span>
                    </div>
                )}
                <div className="absolute top-2 right-2">
                    <Badge className={`${
                        item.status === 'disponivel' ? 'bg-green-500' : 
                        item.status === 'reservado' ? 'bg-orange-500' : 
                        'bg-gray-500'
                    } text-white`}>
                        {item.status === 'disponivel' ? 'Ativo' : 
                         item.status === 'reservado' ? 'Reservado' : 
                         'Trocado'}
                    </Badge>
                </div>
            </div>
            <CardContent className="p-4">
                <h3 className="font-semibold mb-2 line-clamp-2">
                    {item.titulo}
                </h3>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                        <Sparkles className="w-4 h-4 text-primary" />
                        <span className="font-bold text-primary">
                            {item.valor_girinhas}
                        </span>
                    </div>
                    <Button size="sm" variant="outline" asChild>
                        <Link to={item.status === 'reservado' ? `/minhas-reservas` : `/item/${item.id}`}>
                            {item.status === 'reservado' ? 'Ver Reserva' : 'Ver Detalhes'}
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 pb-24">
            <Header />
            <main className="container mx-auto px-4 py-6 max-w-6xl">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar do Perfil */}
                    <div className="w-full lg:w-1/3">
                        <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                            <CardContent className="p-6">
                                <div className="flex flex-col items-center text-center">
                                    <Avatar className="w-28 h-28 mb-4 ring-4 ring-primary/20">
                                        <AvatarImage src={profile?.avatar_url} alt={profile?.nome} />
                                        <AvatarFallback className="text-xl bg-gradient-to-r from-primary to-pink-500 text-white">
                                            {getInitials(profile?.nome || 'Usuário')}
                                        </AvatarFallback>
                                    </Avatar>
                                    
                                    <h1 className="text-2xl font-bold text-gray-800 mb-1">
                                        {profile?.nome || 'Nome não informado'}
                                    </h1>
                                    
                                    <div className="flex items-center gap-1 mb-4">
                                        {[...Array(5)].map((_, i) => (
                                            <Star 
                                                key={i} 
                                                className={`w-5 h-5 ${
                                                    i < Math.floor(profile?.reputacao || 0) 
                                                        ? 'fill-yellow-400 text-yellow-400' 
                                                        : 'text-gray-300'
                                                }`} 
                                            />
                                        ))}
                                        <span className="ml-2 text-sm text-gray-600">
                                            ({(profile?.reputacao || 0).toFixed(1)})
                                        </span>
                                    </div>

                                    <Button 
                                        asChild
                                        className="w-full mb-4 bg-gradient-to-r from-primary to-pink-500"
                                    >
                                        <Link to="/perfil/editar">
                                            <Edit3 className="w-4 h-4 mr-2" />
                                            Editar Perfil
                                        </Link>
                                    </Button>
                                </div>

                                <div className="space-y-3 text-sm text-gray-600">
                                    {profile?.cidade && (
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-gray-400" />
                                            <span>{profile.cidade}</span>
                                        </div>
                                    )}
                                    
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        <span>Membro desde {formatarData(profile?.created_at || '')}</span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 text-primary" />
                                        <span className="font-medium text-primary">
                                            {profile?.saldo_girinhas || 0} Girinhas
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Conteúdo Principal */}
                    <div className="w-full lg:w-2/3">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <Card className="shadow-lg border-0 bg-white/60 backdrop-blur-sm mb-6">
                                <CardContent className="p-2">
                                    <TabsList className="grid w-full grid-cols-4 bg-transparent gap-2">
                                        <TabsTrigger 
                                            value="ativos" 
                                            className="data-[state=active]:bg-primary data-[state=active]:text-white text-sm"
                                        >
                                            Ativos ({itensAtivos.length})
                                        </TabsTrigger>
                                        <TabsTrigger 
                                            value="reservados"
                                            className="data-[state=active]:bg-primary data-[state=active]:text-white text-sm"
                                        >
                                            Reservados ({itensReservados.length})
                                        </TabsTrigger>
                                        <TabsTrigger 
                                            value="trocados"
                                            className="data-[state=active]:bg-primary data-[state=active]:text-white text-sm"
                                        >
                                            Trocados ({itensTrocados.length})
                                        </TabsTrigger>
                                        <TabsTrigger 
                                            value="estatisticas"
                                            className="data-[state=active]:bg-primary data-[state=active]:text-white text-sm"
                                        >
                                            Stats
                                        </TabsTrigger>
                                    </TabsList>
                                </CardContent>
                            </Card>

                            <TabsContent value="ativos">
                                {itensLoading ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                        <ItemCardSkeleton count={6} />
                                    </div>
                                ) : itensError ? (
                                    <FriendlyError 
                                        title="Erro ao carregar itens"
                                        message={itensError}
                                        onRetry={() => window.location.reload()}
                                    />
                                ) : itensAtivos.length === 0 ? (
                                    <EmptyState 
                                        type="items"
                                        onAction={() => window.location.href = '/publicar-item'}
                                    />
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                        {itensAtivos.map(renderItemCard)}
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="reservados">
                                {itensLoading ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                        <ItemCardSkeleton count={6} />
                                    </div>
                                ) : itensReservados.length === 0 ? (
                                    <EmptyState 
                                        type="reservas"
                                        title="Nenhum item reservado"
                                        description="Você não tem itens com reservas no momento."
                                    />
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                        {itensReservados.map(renderItemCard)}
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="trocados">
                                {itensTrocados.length === 0 ? (
                                    <EmptyState 
                                        type="items"
                                        title="Nenhuma troca realizada"
                                        description="Você ainda não completou nenhuma troca."
                                    />
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                        {itensTrocados.map(renderItemCard)}
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="estatisticas">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                                        <CardHeader>
                                            <CardTitle>Resumo de Atividade</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="flex justify-between">
                                                <span>Itens Publicados</span>
                                                <Badge variant="secondary">{meusItens?.length || 0}</Badge>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Trocas Realizadas</span>
                                                <Badge variant="secondary">{itensTrocados.length}</Badge>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Avaliação Média</span>
                                                <Badge variant="secondary">{(profile?.reputacao || 0).toFixed(1)} ⭐</Badge>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </TabsContent>
                        </Tabs>

                        {/* Botão de Ação Flutuante */}
                        <Button 
                            size="lg"
                            className="fixed bottom-20 right-4 rounded-full w-14 h-14 shadow-lg bg-gradient-to-r from-primary to-pink-500 hover:from-primary/90 hover:to-pink-500/90 z-40"
                            asChild
                        >
                            <Link to="/publicar-item">
                                <Plus className="w-6 h-6" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </main>

            <QuickNav />
        </div>
    );
};

export default Perfil;
