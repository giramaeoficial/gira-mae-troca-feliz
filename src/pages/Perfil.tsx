import { useState, useEffect } from "react";
import Header from "@/components/shared/Header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Star, MapPin, Calendar, Baby, Heart, Gift, Trophy, MessageCircle, Edit } from "lucide-react";
import { Link } from "react-router-dom";
import { useProfile } from "@/hooks/useProfile";
import { useItens } from "@/hooks/useItens";
import EditarPerfil from "@/components/perfil/EditarPerfil";
import EditarItem from "@/components/perfil/EditarItem";
import { Tables } from "@/integrations/supabase/types";

type Item = Tables<'itens'>;

const Perfil = () => {
    const { profile, filhos, loading } = useProfile();
    const { buscarMeusItens } = useItens();
    const [showEditModal, setShowEditModal] = useState(false);
    const [meusItens, setMeusItens] = useState<Item[]>([]);
    const [loadingItens, setLoadingItens] = useState(true);
    const [itemParaEditar, setItemParaEditar] = useState<Item | null>(null);

    const carregarItens = async () => {
        setLoadingItens(true);
        const itens = await buscarMeusItens();
        setMeusItens(itens);
        setLoadingItens(false);
    };

    useEffect(() => {
        carregarItens();
    }, []);

    const getStatusBadgeColor = (status: string) => {
        switch (status) {
            case 'disponivel':
                return 'bg-green-500';
            case 'reservado':
                return 'bg-yellow-500';
            case 'entregue':
                return 'bg-blue-500';
            case 'cancelado':
                return 'bg-red-500';
            default:
                return 'bg-gray-500';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'disponivel':
                return 'Disponível';
            case 'reservado':
                return 'Reservado';
            case 'entregue':
                return 'Entregue';
            case 'cancelado':
                return 'Cancelado';
            default:
                return status;
        }
    };

    const handleEditarItem = (item: Item) => {
        setItemParaEditar(item);
    };

    const handleFecharEdicao = () => {
        setItemParaEditar(null);
    };

    const handleSucessoEdicao = () => {
        carregarItens(); // Recarregar itens após edição
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <Sparkles className="h-8 w-8 text-primary animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Carregando perfil...</p>
                </div>
            </div>
        );
    }

    const primeiroFilho = filhos[0];
    const nomeDisplay = profile?.nome || "Usuário";
    const filhoDisplay = primeiroFilho ? `${primeiroFilho.nome}` : "filho(a)";

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 text-foreground flex flex-col pb-24 md:pb-8">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    {/* Profile Sidebar */}
                    <Card className="w-full lg:w-1/3 sticky top-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                        <CardContent className="pt-6">
                            {/* Profile Header */}
                            <div className="flex flex-col items-center text-center mb-6">
                                <div className="relative">
                                    <Avatar className="w-28 h-28 mb-4 ring-4 ring-primary/20">
                                        <AvatarImage src={profile?.avatar_url || "https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=150"} alt="Foto da mãe" />
                                        <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                                            {nomeDisplay.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                                        <Badge className="bg-green-500 text-white px-2 py-1">
                                            <div className="w-2 h-2 bg-white rounded-full mr-1"></div>
                                            Online
                                        </Badge>
                                    </div>
                                </div>
                                <h2 className="text-2xl font-bold text-gray-800">{nomeDisplay}</h2>
                                <p className="text-primary font-medium">Mãe do {filhoDisplay}</p>
                                <div className="flex items-center gap-1 mt-2 text-yellow-500">
                                    {[1,2,3,4,5].map((star) => (
                                        <Star key={star} className={`w-5 h-5 ${star <= (profile?.reputacao || 0) ? 'fill-current' : 'opacity-30'}`} />
                                    ))}
                                    <span className="text-gray-600 text-sm ml-2">({(profile?.reputacao || 0)/20 || 0}) • 0 trocas</span>
                                </div>
                            </div>

                            {/* Quick Info */}
                            <div className="space-y-3 mb-6">
                                {profile?.bairro && profile?.cidade && (
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <MapPin className="w-4 h-4 text-primary" />
                                        <span className="text-sm">{profile.bairro}, {profile.cidade}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Calendar className="w-4 h-4 text-primary" />
                                    <span className="text-sm">Na comunidade desde {new Date(profile?.created_at || '').toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Baby className="w-4 h-4 text-primary" />
                                    <span className="text-sm">Mãe de {filhos.length} criança{filhos.length !== 1 ? 's' : ''}</span>
                                </div>
                            </div>

                            {/* Saldo */}
                            <div className="bg-gradient-to-r from-primary/10 to-purple-100 p-4 rounded-xl mb-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Saldo atual</p>
                                        <p className="font-bold text-2xl text-primary flex items-center gap-2">
                                            <Sparkles className="w-6 h-6" /> {profile?.saldo_girinhas || 0}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-500">Girinhas para trocar</p>
                                    </div>
                                </div>
                            </div>

                            {/* Badges/Conquistas */}
                            <div className="mb-6">
                                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                    <Trophy className="w-4 h-4 text-yellow-500" />
                                    Conquistas
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    <Badge variant="secondary" className="bg-pink-100 text-pink-700">
                                        <Heart className="w-3 h-3 mr-1" />
                                        Mãe Querida
                                    </Badge>
                                    <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                                        <MessageCircle className="w-3 h-3 mr-1" />
                                        Nova na Comunidade
                                    </Badge>
                                </div>
                            </div>

                            {/* Bio */}
                            {profile?.bio && (
                                <div className="mb-6">
                                    <h3 className="font-semibold text-gray-800 mb-2">Sobre mim</h3>
                                    <p className="text-sm text-gray-600 leading-relaxed">
                                        "{profile.bio}"
                                    </p>
                                </div>
                            )}

                            {/* Interesses */}
                            {profile?.interesses && profile.interesses.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="font-semibold text-gray-800 mb-2">Interesses</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {profile.interesses.map((interesse, index) => (
                                            <Badge key={index} variant="outline" className="text-xs">{interesse}</Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <Button 
                                onClick={() => setShowEditModal(true)}
                                className="w-full bg-gradient-to-r from-primary to-pink-500 hover:from-primary/90 hover:to-pink-500/90" 
                                variant="default"
                            >
                                <Edit className="w-4 h-4 mr-2" />
                                Editar Perfil
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Profile Content */}
                    <div className="w-full lg:w-2/3">
                        <Tabs defaultValue="meus-itens" className="w-full">
                            <TabsList className="grid w-full grid-cols-3 bg-white/60 backdrop-blur-sm">
                                <TabsTrigger value="meus-itens" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                                    Meus Itens ({meusItens.length})
                                </TabsTrigger>
                                <TabsTrigger value="trocas" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                                    Minhas Trocas (0)
                                </TabsTrigger>
                                <TabsTrigger value="filhos" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                                    Meus Filhos ({filhos.length})
                                </TabsTrigger>
                            </TabsList>
                            
                            <TabsContent value="meus-itens" className="mt-6">
                                {loadingItens ? (
                                    <div className="flex items-center justify-center py-12">
                                        <Sparkles className="h-8 w-8 text-primary animate-spin" />
                                        <span className="ml-2 text-gray-600">Carregando itens...</span>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                        {meusItens.map(item => (
                                            <Card key={item.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-0 bg-white/80 backdrop-blur-sm">
                                                <div className="relative">
                                                    {item.fotos && item.fotos.length > 0 ? (
                                                        <img src={item.fotos[0]} alt={item.titulo} className="w-full h-48 object-cover" />
                                                    ) : (
                                                        <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                                                            <span className="text-gray-500">Sem foto</span>
                                                        </div>
                                                    )}
                                                    <Badge 
                                                        className={`absolute top-2 right-2 ${getStatusBadgeColor(item.status)} text-white`}
                                                    >
                                                        {getStatusText(item.status)}
                                                    </Badge>
                                                </div>
                                                <CardContent className="p-4">
                                                    <h3 className="font-semibold text-gray-800 mb-1">{item.titulo}</h3>
                                                    {item.tamanho && (
                                                        <p className="text-sm text-gray-600 mb-2">Tamanho: {item.tamanho}</p>
                                                    )}
                                                    <p className="text-xs text-gray-500 mb-2 line-clamp-2">{item.descricao}</p>
                                                    <div className="flex justify-between items-center">
                                                        <p className="font-bold text-primary flex items-center gap-1">
                                                            <Sparkles className="w-4 h-4" />
                                                            {item.valor_girinhas}
                                                        </p>
                                                        <Button 
                                                            size="sm" 
                                                            variant="outline"
                                                            onClick={() => handleEditarItem(item)}
                                                        >
                                                            Editar
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                        
                                        {/* Add new item card */}
                                        <Card className="border-2 border-dashed border-primary/30 hover:border-primary/60 transition-colors duration-300 bg-white/40 backdrop-blur-sm">
                                            <CardContent className="p-6 flex flex-col items-center justify-center h-full min-h-[200px]">
                                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                                                    <Sparkles className="w-6 h-6 text-primary" />
                                                </div>
                                                <h3 className="font-semibold text-gray-800 mb-2 text-center">Publicar novo item</h3>
                                                <p className="text-sm text-gray-600 text-center mb-4">Adicione mais itens para trocar</p>
                                                <Button asChild className="bg-gradient-to-r from-primary to-pink-500">
                                                    <Link to="/publicar-item">Publicar Item</Link>
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    </div>
                                )}
                            </TabsContent>
                            
                            <TabsContent value="trocas" className="mt-6">
                                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Gift className="w-5 h-5 text-primary" />
                                            Histórico de Trocas
                                        </CardTitle>
                                        <CardDescription>Suas últimas trocas realizadas na comunidade.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {[
                                                { item: "Macacão Tip Top", maes: "com Carla M.", data: "há 2 dias", valor: 18, status: "Concluída" },
                                                { item: "Kit Bodies", maes: "com Fernanda S.", data: "há 1 semana", valor: 22, status: "Concluída" },
                                                { item: "Sapatilha Rosa", maes: "com Juliana L.", data: "há 2 semanas", valor: 15, status: "Concluída" }
                                            ].map((troca, index) => (
                                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                    <div>
                                                        <p className="font-medium text-gray-800">{troca.item}</p>
                                                        <p className="text-sm text-gray-600">{troca.maes} • {troca.data}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-semibold text-primary">+{troca.valor} Girinhas</p>
                                                        <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                                                            {troca.status}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                            
                            <TabsContent value="filhos" className="mt-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {filhos.map(filho => (
                                        <Card key={filho.id} className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                                            <CardContent className="p-6">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
                                                        <Baby className="w-6 h-6 text-primary" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-gray-800">{filho.nome}</h3>
                                                        <p className="text-sm text-gray-600">
                                                            {new Date().getFullYear() - new Date(filho.data_nascimento).getFullYear()} anos
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="space-y-2 text-sm">
                                                    {filho.sexo && (
                                                        <p><span className="font-medium">Sexo:</span> {filho.sexo}</p>
                                                    )}
                                                    {filho.tamanho_roupas && (
                                                        <p><span className="font-medium">Roupas:</span> {filho.tamanho_roupas}</p>
                                                    )}
                                                    {filho.tamanho_calcados && (
                                                        <p><span className="font-medium">Calçados:</span> {filho.tamanho_calcados}</p>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                    
                                    {filhos.length === 0 && (
                                        <Card className="border-2 border-dashed border-primary/30 hover:border-primary/60 transition-colors duration-300 bg-white/40 backdrop-blur-sm">
                                            <CardContent className="p-6 flex flex-col items-center justify-center h-full min-h-[200px]">
                                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                                                    <Baby className="w-6 h-6 text-primary" />
                                                </div>
                                                <h3 className="font-semibold text-gray-800 mb-2 text-center">Adicionar informações dos filhos</h3>
                                                <p className="text-sm text-gray-600 text-center mb-4">Para uma experiência mais personalizada</p>
                                                <Button 
                                                    onClick={() => setShowEditModal(true)}
                                                    className="bg-gradient-to-r from-primary to-pink-500"
                                                >
                                                    Adicionar Filhos
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    )}
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </main>

            {showEditModal && (
                <EditarPerfil onClose={() => setShowEditModal(false)} />
            )}

            {itemParaEditar && (
                <EditarItem 
                    item={itemParaEditar}
                    isOpen={!!itemParaEditar}
                    onClose={handleFecharEdicao}
                    onSuccess={handleSucessoEdicao}
                />
            )}
        </div>
    );
};

export default Perfil;
