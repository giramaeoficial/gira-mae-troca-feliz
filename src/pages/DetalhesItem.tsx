
import Header from "@/components/shared/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sparkles, MapPin, Star, Heart, Shield, Clock, Users } from "lucide-react";
import { Link, useParams } from "react-router-dom";

const DetalhesItem = () => {
    const { id } = useParams();
    
    // Mock data - seria substituído por dados reais do Supabase
    const item = {
        id: 1,
        title: "Kit Body Carter's 3 peças",
        description: "Kit com 3 bodies manga curta da Carter's, tamanho 3-6M. Muito bem conservados, usados poucas vezes. Cores: branco, azul claro e listrado. 100% algodão, super macios e confortáveis.",
        girinhas: 15,
        image: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=600",
        size: "3-6M",
        category: "Roupa",
        condition: "Ótimo estado",
        pieces: 3,
        brand: "Carter's",
        publicadoPor: {
            nome: "Carla Martinez",
            foto: "https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=150",
            reputacao: 4.8,
            totalTrocas: 23,
            bairro: "Vila Madalena",
            cidade: "São Paulo"
        },
        dataPublicacao: "há 2 dias",
        visualizacoes: 45,
        interessados: 3
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
            <Header />
            <main className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
                    {/* Imagem do Item */}
                    <div className="space-y-4">
                        <div className="relative">
                            <img 
                                src={item.image} 
                                alt={item.title}
                                className="w-full h-96 lg:h-[500px] object-cover rounded-xl shadow-lg"
                            />
                            <Badge className="absolute top-4 left-4 bg-green-500 text-white">
                                Disponível
                            </Badge>
                            <Button 
                                variant="outline" 
                                size="icon"
                                className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm"
                            >
                                <Heart className="w-4 h-4" />
                            </Button>
                        </div>
                        
                        {/* Stats do Item */}
                        <div className="grid grid-cols-3 gap-4">
                            <Card className="text-center p-3">
                                <div className="flex items-center justify-center gap-1 text-sm text-gray-600">
                                    <Users className="w-4 h-4" />
                                    {item.visualizacoes} visualizações
                                </div>
                            </Card>
                            <Card className="text-center p-3">
                                <div className="flex items-center justify-center gap-1 text-sm text-gray-600">
                                    <Heart className="w-4 h-4" />
                                    {item.interessados} interessados
                                </div>
                            </Card>
                            <Card className="text-center p-3">
                                <div className="flex items-center justify-center gap-1 text-sm text-gray-600">
                                    <Clock className="w-4 h-4" />
                                    {item.dataPublicacao}
                                </div>
                            </Card>
                        </div>
                    </div>

                    {/* Detalhes do Item */}
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800 mb-2">{item.title}</h1>
                            <div className="flex items-center gap-4 mb-4">
                                <div className="flex items-center gap-1">
                                    <Sparkles className="w-6 h-6 text-primary" />
                                    <span className="text-2xl font-bold text-primary">{item.girinhas}</span>
                                    <span className="text-gray-600">Girinhas</span>
                                </div>
                                <Badge variant="secondary">{item.category}</Badge>
                                <Badge variant="outline">{item.condition}</Badge>
                            </div>
                        </div>

                        {/* Informações do Item */}
                        <Card>
                            <CardHeader>
                                <h3 className="font-semibold">Detalhes do Item</h3>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-sm text-gray-600">Tamanho:</span>
                                        <p className="font-medium">{item.size}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-600">Peças:</span>
                                        <p className="font-medium">{item.pieces} unidades</p>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-600">Marca:</span>
                                        <p className="font-medium">{item.brand}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-600">Estado:</span>
                                        <p className="font-medium">{item.condition}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Descrição */}
                        <Card>
                            <CardHeader>
                                <h3 className="font-semibold">Descrição</h3>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-700 leading-relaxed">{item.description}</p>
                            </CardContent>
                        </Card>

                        {/* Perfil da Mãe */}
                        <Card>
                            <CardHeader>
                                <h3 className="font-semibold">Publicado por</h3>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-4">
                                    <Avatar className="w-16 h-16">
                                        <AvatarImage src={item.publicadoPor.foto} />
                                        <AvatarFallback>CM</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-lg">{item.publicadoPor.nome}</h4>
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <div className="flex items-center gap-1">
                                                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                                <span>{item.publicadoPor.reputacao}</span>
                                            </div>
                                            <span>•</span>
                                            <span>{item.publicadoPor.totalTrocas} trocas</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-sm text-gray-600">
                                            <MapPin className="w-4 h-4" />
                                            <span>{item.publicadoPor.bairro}, {item.publicadoPor.cidade}</span>
                                        </div>
                                    </div>
                                    <Button variant="outline" size="sm">
                                        Ver Perfil
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Ações */}
                        <div className="space-y-3">
                            <Button size="lg" className="w-full bg-gradient-to-r from-primary to-pink-500">
                                <Sparkles className="w-5 h-5 mr-2" />
                                Reservar com Pix da Mãe
                            </Button>
                            <div className="grid grid-cols-2 gap-3">
                                <Button variant="outline" size="lg">
                                    <Heart className="w-4 h-4 mr-2" />
                                    Favoritar
                                </Button>
                                <Button variant="outline" size="lg">
                                    Conversar
                                </Button>
                            </div>
                        </div>

                        {/* Segurança */}
                        <Card className="bg-green-50 border-green-200">
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-2 text-green-700">
                                    <Shield className="w-5 h-5" />
                                    <span className="font-medium">Transação Segura</span>
                                </div>
                                <p className="text-sm text-green-600 mt-1">
                                    Suas Girinhas ficam protegidas até a confirmação da entrega.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DetalhesItem;
