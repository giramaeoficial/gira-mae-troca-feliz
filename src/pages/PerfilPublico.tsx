import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import Header from "@/components/shared/Header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Star, MapPin, Calendar, Baby, Heart, Trophy, MessageCircle, Users } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useItens, Item } from "@/hooks/useItens";
import { useSeguidores } from "@/hooks/useSeguidores";
import BotaoSeguir from "@/components/perfil/BotaoSeguir";
import { Link } from "react-router-dom";

const PerfilPublico = () => {
    const { nome } = useParams<{ nome: string }>();
    const { profile, filhos, loading, fetchProfileByName } = useProfile();
    const { buscarItensDoUsuario } = useItens();
    const { buscarEstatisticas } = useSeguidores();
    const [itensUsuario, setItensUsuario] = useState<Item[]>([]);
    const [loadingItens, setLoadingItens] = useState(true);
    const [estatisticas, setEstatisticas] = useState({ total_seguindo: 0, total_seguidores: 0 });

    const carregarDadosCompletos = useCallback(async (nomeUsuario: string) => {
        console.log('Carregando dados para:', nomeUsuario);
        setLoadingItens(true);
        
        const perfilCarregado = await fetchProfileByName(nomeUsuario);
        
        if (perfilCarregado) {
            console.log('Perfil carregado, buscando itens e estatísticas...');
            
            // Carregar itens e estatísticas em paralelo
            const [itens, stats] = await Promise.all([
                buscarItensDoUsuario(perfilCarregado.id),
                buscarEstatisticas(perfilCarregado.id)
            ]);
            
            setItensUsuario(itens);
            setEstatisticas(stats);
        }
        
        setLoadingItens(false);
    }, [fetchProfileByName, buscarItensDoUsuario, buscarEstatisticas]);

    useEffect(() => {
        if (nome) {
            console.log('Nome do parâmetro mudou:', nome);
            carregarDadosCompletos(nome);
        }
    }, [nome, carregarDadosCompletos]);

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

    if (!profile) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600">Perfil não encontrado</p>
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
                                    <span className="text-gray-600 text-sm ml-2">({(profile?.reputacao || 0)/20 || 0})</span>
                                </div>
                            </div>

                            {/* Estatísticas de Seguidores */}
                            <div className="grid grid-cols-2 gap-3 mb-6">
                                <div className="text-center p-3 bg-gray-50 rounded-lg">
                                    <p className="text-lg font-bold text-gray-800">{estatisticas.total_seguindo}</p>
                                    <p className="text-xs text-gray-600">Seguindo</p>
                                </div>
                                <div className="text-center p-3 bg-gray-50 rounded-lg">
                                    <p className="text-lg font-bold text-gray-800">{estatisticas.total_seguidores}</p>
                                    <p className="text-xs text-gray-600">Seguidoras</p>
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
                                        Ativa na Comunidade
                                    </Badge>
                                </div>
                            </div>

                            {/* Bio */}
                            {profile?.bio && (
                                <div className="mb-6">
                                    <h3 className="font-semibold text-gray-800 mb-2">Sobre</h3>
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

                            {/* Botão Seguir */}
                            <BotaoSeguir 
                                usuarioId={profile.id}
                                className="w-full bg-gradient-to-r from-primary to-pink-500 hover:from-primary/90 hover:to-pink-500/90"
                            />
                        </CardContent>
                    </Card>

                    {/* Profile Content */}
                    <div className="w-full lg:w-2/3">
                        <Tabs defaultValue="itens" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 bg-white/60 backdrop-blur-sm">
                                <TabsTrigger value="itens" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                                    Itens ({itensUsuario.length})
                                </TabsTrigger>
                                <TabsTrigger value="filhos" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                                    Filhos ({filhos.length})
                                </TabsTrigger>
                            </TabsList>
                            
                            <TabsContent value="itens" className="mt-6">
                                {loadingItens ? (
                                    <div className="flex items-center justify-center py-12">
                                        <Sparkles className="h-8 w-8 text-primary animate-spin" />
                                        <span className="ml-2 text-gray-600">Carregando itens...</span>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                        {itensUsuario.map(item => (
                                            <Card key={item.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-0 bg-white/80 backdrop-blur-sm">
                                                <div className="relative">
                                                    {item.fotos && item.fotos.length > 0 ? (
                                                        <img src={item.fotos[0]} alt={item.titulo} className="w-full h-48 object-cover" />
                                                    ) : (
                                                        <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                                                            <span className="text-gray-500">Sem foto</span>
                                                        </div>
                                                    )}
                                                    {item.status === 'disponivel' && (
                                                        <Badge className="absolute top-2 right-2 bg-green-500 text-white">
                                                            Disponível
                                                        </Badge>
                                                    )}
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
                                                        {item.status === 'disponivel' && (
                                                            <Button asChild size="sm">
                                                                <Link to={`/item/${item.id}`}>
                                                                    Ver Item
                                                                </Link>
                                                            </Button>
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                        
                                        {itensUsuario.length === 0 && (
                                            <Card className="col-span-full border-2 border-dashed border-gray-300 bg-white/40 backdrop-blur-sm">
                                                <CardContent className="p-8 text-center">
                                                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                                                        <Sparkles className="w-8 h-8 text-gray-400" />
                                                    </div>
                                                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Nenhum item disponível</h3>
                                                    <p className="text-gray-600">
                                                        Esta mãe ainda não publicou nenhum item para troca.
                                                    </p>
                                                </CardContent>
                                            </Card>
                                        )}
                                    </div>
                                )}
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
                                        <Card className="col-span-full border-2 border-dashed border-gray-300 bg-white/40 backdrop-blur-sm">
                                            <CardContent className="p-8 text-center">
                                                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                                                    <Baby className="w-8 h-8 text-gray-400" />
                                                </div>
                                                <h3 className="text-lg font-semibold text-gray-800 mb-2">Informações dos filhos não compartilhadas</h3>
                                                <p className="text-gray-600">
                                                    Esta mãe optou por não compartilhar informações sobre os filhos.
                                                </p>
                                            </CardContent>
                                        </Card>
                                    )}
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default PerfilPublico;
