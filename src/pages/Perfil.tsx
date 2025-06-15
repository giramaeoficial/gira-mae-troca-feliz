
import Header from "@/components/shared/Header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Star, MapPin, Calendar, Baby, Heart, Gift, Trophy, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";

const Perfil = () => {
    const mockItens = [
        { id: 1, title: "Kit Body Carter's", girinhas: 15, image: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=300", size: "3-6M", status: "Disponível" },
        { id: 2, title: "Vestido Festa Lilás", girinhas: 30, image: "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=300", size: "2 anos", status: "Reservado" },
        { id: 3, title: "Tênis All Star Baby", girinhas: 25, image: "https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=300", size: "18", status: "Disponível" },
    ];

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
                                        <AvatarImage src="https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=150" alt="Foto da mãe" />
                                        <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">AM</AvatarFallback>
                                    </Avatar>
                                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                                        <Badge className="bg-green-500 text-white px-2 py-1">
                                            <div className="w-2 h-2 bg-white rounded-full mr-1"></div>
                                            Online
                                        </Badge>
                                    </div>
                                </div>
                                <h2 className="text-2xl font-bold text-gray-800">Ana Maria</h2>
                                <p className="text-primary font-medium">Mãe do Lorenzo (2 anos)</p>
                                <div className="flex items-center gap-1 mt-2 text-yellow-500">
                                    {[1,2,3,4,5].map((star) => (
                                        <Star key={star} className={`w-5 h-5 ${star <= 4 ? 'fill-current' : 'opacity-30'}`} />
                                    ))}
                                    <span className="text-gray-600 text-sm ml-2">(4.8) • 23 trocas</span>
                                </div>
                            </div>

                            {/* Quick Info */}
                            <div className="space-y-3 mb-6">
                                <div className="flex items-center gap-2 text-gray-600">
                                    <MapPin className="w-4 h-4 text-primary" />
                                    <span className="text-sm">Vila Madalena, São Paulo</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Calendar className="w-4 h-4 text-primary" />
                                    <span className="text-sm">Na comunidade desde Mar/2024</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Baby className="w-4 h-4 text-primary" />
                                    <span className="text-sm">Mãe de 1 criança</span>
                                </div>
                            </div>

                            {/* Saldo */}
                            <div className="bg-gradient-to-r from-primary/10 to-purple-100 p-4 rounded-xl mb-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Saldo atual</p>
                                        <p className="font-bold text-2xl text-primary flex items-center gap-2">
                                            <Sparkles className="w-6 h-6" /> 84
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-500">Girinhas para trocar</p>
                                        <p className="text-xs text-green-600 font-medium">+12 esta semana</p>
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
                                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                                        <Gift className="w-3 h-3 mr-1" />
                                        10+ Trocas
                                    </Badge>
                                    <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                                        <MessageCircle className="w-3 h-3 mr-1" />
                                        Sempre Responde
                                    </Badge>
                                </div>
                            </div>

                            {/* Bio */}
                            <div className="mb-6">
                                <h3 className="font-semibold text-gray-800 mb-2">Sobre mim</h3>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    "Amo participar da comunidade GiraMãe! Lorenzo cresce rápido e adoro dar uma nova vida às roupinhas dele. Sempre cuido muito bem dos itens e espero encontrar mães que façam o mesmo! 💕"
                                </p>
                            </div>

                            {/* Interesses */}
                            <div className="mb-6">
                                <h3 className="font-semibold text-gray-800 mb-2">Interesses</h3>
                                <div className="flex flex-wrap gap-2">
                                    <Badge variant="outline" className="text-xs">Roupas Orgânicas</Badge>
                                    <Badge variant="outline" className="text-xs">Brinquedos Educativos</Badge>
                                    <Badge variant="outline" className="text-xs">Livros Infantis</Badge>
                                </div>
                            </div>

                            <Button className="w-full bg-gradient-to-r from-primary to-pink-500 hover:from-primary/90 hover:to-pink-500/90" variant="default">
                                Editar Perfil
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Profile Content */}
                    <div className="w-full lg:w-2/3">
                        <Tabs defaultValue="meus-itens" className="w-full">
                            <TabsList className="grid w-full grid-cols-3 bg-white/60 backdrop-blur-sm">
                                <TabsTrigger value="meus-itens" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                                    Meus Itens ({mockItens.length})
                                </TabsTrigger>
                                <TabsTrigger value="trocas" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                                    Minhas Trocas (23)
                                </TabsTrigger>
                                <TabsTrigger value="desejos" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                                    Desejos (5)
                                </TabsTrigger>
                            </TabsList>
                            
                            <TabsContent value="meus-itens" className="mt-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {mockItens.map(item => (
                                        <Card key={item.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-0 bg-white/80 backdrop-blur-sm">
                                            <div className="relative">
                                                <img src={item.image} alt={item.title} className="w-full h-48 object-cover" />
                                                <Badge 
                                                    className={`absolute top-2 right-2 ${
                                                        item.status === 'Disponível' ? 'bg-green-500' : 'bg-yellow-500'
                                                    } text-white`}
                                                >
                                                    {item.status}
                                                </Badge>
                                            </div>
                                            <CardContent className="p-4">
                                                <h3 className="font-semibold text-gray-800 mb-1">{item.title}</h3>
                                                <p className="text-sm text-gray-600 mb-2">Tamanho: {item.size}</p>
                                                <div className="flex justify-between items-center">
                                                    <p className="font-bold text-primary flex items-center gap-1">
                                                        <Sparkles className="w-4 h-4" />
                                                        {item.girinhas}
                                                    </p>
                                                    <Button size="sm" variant="outline">
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
                            
                            <TabsContent value="desejos" className="mt-6">
                                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Heart className="w-5 h-5 text-primary" />
                                            Lista de Desejos
                                        </CardTitle>
                                        <CardDescription>Itens que você gostaria de encontrar na comunidade.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {[
                                                { item: "Jaqueta de inverno", tamanho: "2-3 anos", preco: "até 40 Girinhas" },
                                                { item: "Livros infantis", tamanho: "Qualquer", preco: "até 15 Girinhas" },
                                                { item: "Brinquedos educativos", tamanho: "2+ anos", preco: "até 30 Girinhas" }
                                            ].map((desejo, index) => (
                                                <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
                                                    <div>
                                                        <p className="font-medium text-gray-800">{desejo.item}</p>
                                                        <p className="text-sm text-gray-600">{desejo.tamanho} • {desejo.preco}</p>
                                                    </div>
                                                    <Button size="sm" variant="ghost" className="text-primary hover:bg-primary/10">
                                                        Remover
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Perfil;
