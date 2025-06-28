
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/shared/Header";
import QuickNav from "@/components/shared/QuickNav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useMeusItens } from "@/hooks/useItensOptimized";
import { Star, MapPin, Calendar, Plus, Edit3, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import ItemCardSkeleton from "@/components/loading/ItemCardSkeleton";
import LoadingSpinner from "@/components/loading/LoadingSpinner";
import FriendlyError from "@/components/error/FriendlyError";
import ItemCardWithActions from "@/components/shared/ItemCardWithActions";

const Perfil = () => {
    const { user } = useAuth();
    const { profile, loading: profileLoading, error: profileError } = useProfile();
    const { data: meusItens, isLoading: itensLoading, error: itensError } = useMeusItens(user?.id || '');

    // Filtrar apenas itens com status permitidos
    const itensFiltrados = meusItens?.filter(item => 
        ['disponivel', 'reservado', 'inativo', 'cancelado'].includes(item.status)
    ) || [];

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

                    {/* Conteúdo Principal - Meus Itens */}
                    <div className="w-full lg:w-2/3">
                        <Card className="shadow-lg border-0 bg-white/60 backdrop-blur-sm mb-6">
                            <CardContent className="p-6">
                                <h2 className="text-xl font-bold text-gray-800 mb-4">
                                    Meus Itens ({itensFiltrados.length})
                                </h2>
                                
                                {itensLoading ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                        <ItemCardSkeleton count={6} />
                                    </div>
                                ) : itensError ? (
                                    <FriendlyError 
                                        title="Erro ao carregar itens"
                                        message={itensError.message}
                                        onRetry={() => window.location.reload()}
                                    />
                                ) : !itensFiltrados || itensFiltrados.length === 0 ? (
                                    <div className="text-center py-12">
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Plus className="w-8 h-8 text-gray-400" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                            Nenhum item publicado
                                        </h3>
                                        <p className="text-gray-600 mb-4">
                                            Você ainda não publicou nenhum item. Comece agora!
                                        </p>
                                        <Button 
                                            onClick={() => window.location.href = '/publicar'}
                                            className="bg-gradient-to-r from-primary to-pink-500"
                                        >
                                            <Plus className="w-4 h-4 mr-2" />
                                            Publicar Item
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                        {itensFiltrados.map((item) => (
                                            <ItemCardWithActions key={item.id} item={item} />
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Botão de Ação Flutuante */}
                        <Button 
                            size="lg"
                            className="fixed bottom-20 right-4 rounded-full w-14 h-14 shadow-lg bg-gradient-to-r from-primary to-pink-500 hover:from-primary/90 hover:to-pink-500/90 z-40"
                            asChild
                        >
                            <Link to="/publicar">
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
