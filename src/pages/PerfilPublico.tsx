
import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import Header from "@/components/shared/Header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Star, MapPin, Calendar, Baby, Heart, Gift, Trophy, MessageCircle, ArrowLeft } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useItens } from "@/hooks/useItens";
import { Tables } from "@/integrations/supabase/types";

type Profile = Tables<'profiles'>;
type Item = Tables<'itens'>;

const PerfilPublico = () => {
    const { nome } = useParams();
    const { fetchProfileByName, profile, filhos, loading: profileLoading } = useProfile();
    const { buscarTodosItens, loading: itensLoading } = useItens();
    const [itensDoUsuario, setItensDoUsuario] = useState<Item[]>([]);

    useEffect(() => {
        if (nome) {
            carregarPerfilEItens();
        }
    }, [nome]);

    const carregarPerfilEItens = async () => {
        if (!nome) return;

        console.log('Carregando perfil para:', nome);
        const perfilEncontrado = await fetchProfileByName(nome);
        
        if (perfilEncontrado) {
            // Buscar itens do usuário diretamente pelo ID
            const todosItens = await buscarTodosItens();
            const itensFiltrados = todosItens.filter(item => 
                item.publicado_por === perfilEncontrado.id
            );
            setItensDoUsuario(itensFiltrados);
        }
    };

    if (profileLoading || itensLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex flex-col">
                <Header />
                <main className="flex-grow flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-gray-600">Carregando perfil...</p>
                    </div>
                </main>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex flex-col">
                <Header />
                <main className="flex-grow flex items-center justify-center">
                    <Card className="max-w-md mx-auto text-center">
                        <CardContent className="p-8">
                            <h2 className="text-2xl font-bold mb-4">Perfil não encontrado</h2>
                            <p className="text-gray-600 mb-6">O perfil que você está procurando não existe.</p>
                            <Button asChild>
                                <Link to="/feed">Voltar ao Feed</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </main>
            </div>
        );
    }

    const formatarEstado = (estado: string) => {
        const estados = {
            'novo': 'Novo',
            'otimo': 'Ótimo estado',
            'bom': 'Bom estado',
            'razoavel': 'Estado razoável'
        };
        return estados[estado as keyof typeof estados] || estado;
    };

    const formatarCategoria = (categoria: string) => {
        const categorias = {
            'roupa': 'Roupas',
            'brinquedo': 'Brinquedos',
            'calcado': 'Calçados',
            'acessorio': 'Acessórios',
            'kit': 'Kits',
            'outro': 'Outros'
        };
        return categorias[categoria as keyof typeof categorias] || categoria;
    };

    const reputacao = profile.reputacao || 0;
    const localizacao = profile.bairro || profile.cidade || "Localização não informada";
    const dataMembroDesde = new Date(profile.created_at || '').toLocaleDateString('pt-BR', { 
        month: 'short', 
        year: 'numeric' 
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 text-foreground flex flex-col">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8 pb-24 md:pb-8">
                <div className="mb-6">
                    <Button variant="ghost" asChild className="gap-2">
                        <Link to="/feed">
                            <ArrowLeft className="w-4 h-4" />
                            Voltar ao Feed
                        </Link>
                    </Button>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    {/* Profile Sidebar */}
                    <Card className="w-full lg:w-1/3 sticky top-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                        <CardContent className="pt-6">
                            {/* Profile Header */}
                            <div className="flex flex-col items-center text-center mb-6">
                                <div className="relative">
                                    <Avatar className="w-28 h-28 mb-4 ring-4 ring-primary/20">
                                        <AvatarImage src={profile.avatar_url || undefined} alt={`Foto de ${profile.nome}`} />
                                        <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                                            {profile.nome?.split(' ').map(n => n[0]).join('') || 'U'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                                        <Badge className="bg-green-500 text-white px-2 py-1">
                                            <div className="w-2 h-2 bg-white rounded-full mr-1"></div>
                                            Online
                                        </Badge>
                                    </div>
                                </div>
                                <h2 className="text-2xl font-bold text-gray-800">{profile.nome}</h2>
                                {filhos.length > 0 && (
                                    <p className="text-primary font-medium">
                                        Mãe {filhos.length > 1 ? `de ${filhos.length} crianças` : `do(a) ${filhos[0].nome}`}
                                    </p>
                                )}
                                <div className="flex items-center gap-1 mt-2 text-yellow-500">
                                    {[1,2,3,4,5].map((star) => (
                                        <Star key={star} className={`w-5 h-5 ${star <= Math.floor(reputacao) ? 'fill-current' : 'opacity-30'}`} />
                                    ))}
                                    <span className="text-gray-600 text-sm ml-2">({reputacao.toFixed(1)}) • {itensDoUsuario.length} itens</span>
                                </div>
                            </div>

                            {/* Quick Info */}
                            <div className="space-y-3 mb-6">
                                <div className="flex items-center gap-2 text-gray-600">
                                    <MapPin className="w-4 h-4 text-primary" />
                                    <span className="text-sm">{localizacao}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Calendar className="w-4 h-4 text-primary" />
                                    <span className="text-sm">Na comunidade desde {dataMembroDesde}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Baby className="w-4 h-4 text-primary" />
                                    <span className="text-sm">Mãe de {filhos.length} criança{filhos.length !== 1 ? 's' : ''}</span>
                                </div>
                            </div>

                            {/* Badges/Conquistas */}
                            <div className="mb-6">
                                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                    <Trophy className="w-4 h-4 text-yellow-500" />
                                    Conquistas
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {reputacao >= 10 && (
                                        <Badge variant="secondary" className="bg-pink-100 text-pink-700">
                                            <Heart className="w-3 h-3 mr-1" />
                                            Mãe Querida
                                        </Badge>
                                    )}
                                    {itensDoUsuario.length >= 10 && (
                                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                                            <Gift className="w-3 h-3 mr-1" />
                                            10+ Itens
                                        </Badge>
                                    )}
                                    {reputacao >= 20 && (
                                        <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                                            <MessageCircle className="w-3 h-3 mr-1" />
                                            Sempre Responde
                                        </Badge>
                                    )}
                                </div>
                            </div>

                            {/* Bio */}
                            {profile.bio && (
                                <div className="mb-6">
                                    <h3 className="font-semibold text-gray-800 mb-2">Sobre</h3>
                                    <p className="text-sm text-gray-600 leading-relaxed">
                                        {profile.bio}
                                    </p>
                                </div>
                            )}

                            <Button className="w-full bg-gradient-to-r from-primary to-pink-500 hover:from-primary/90 hover:to-pink-500/90" variant="default">
                                Enviar Mensagem
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Profile Content */}
                    <div className="w-full lg:w-2/3">
                        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-primary" />
                                    Itens Publicados ({itensDoUsuario.length})
                                </CardTitle>
                                <CardDescription>Todos os itens disponibilizados por {profile.nome}.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {itensDoUsuario.map(item => (
                                        <Card key={item.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-0 bg-white/80 backdrop-blur-sm">
                                            <div className="relative">
                                                <img 
                                                    src={item.fotos?.[0] || "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=300"} 
                                                    alt={item.titulo} 
                                                    className="w-full h-48 object-cover" 
                                                />
                                                <Badge 
                                                    className={`absolute top-2 right-2 ${
                                                        item.status === 'disponivel' ? 'bg-green-500' : 'bg-yellow-500'
                                                    } text-white`}
                                                >
                                                    {item.status === 'disponivel' ? 'Disponível' : 'Reservado'}
                                                </Badge>
                                                <Badge variant="secondary" className="absolute top-2 left-2 bg-primary/10 text-primary">
                                                    {formatarEstado(item.estado_conservacao)}
                                                </Badge>
                                            </div>
                                            <CardContent className="p-4">
                                                <h3 className="font-semibold text-gray-800 mb-1">{item.titulo}</h3>
                                                <p className="text-sm text-gray-600 mb-1">{formatarCategoria(item.categoria)}</p>
                                                {item.tamanho && (
                                                    <p className="text-sm text-gray-600 mb-2">Tamanho: {item.tamanho}</p>
                                                )}
                                                <div className="flex justify-between items-center">
                                                    <p className="font-bold text-primary flex items-center gap-1">
                                                        <Sparkles className="w-4 h-4" />
                                                        {item.valor_girinhas}
                                                    </p>
                                                    <Button size="sm" variant="outline" asChild>
                                                        <Link to={`/item/${item.id}`}>Ver Item</Link>
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>

                                {itensDoUsuario.length === 0 && (
                                    <div className="text-center py-12">
                                        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Sparkles className="w-12 h-12 text-primary" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-gray-800 mb-2">Nenhum item publicado</h3>
                                        <p className="text-gray-600">{profile.nome} ainda não publicou nenhum item.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default PerfilPublico;
