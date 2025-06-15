
import { useParams, Link } from "react-router-dom";
import Header from "@/components/shared/Header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Star, MapPin, Calendar, Baby, Heart, Gift, Trophy, MessageCircle, ArrowLeft } from "lucide-react";

// Dados simulados - em uma aplicação real viria de uma API
const perfisData = {
  "Ana Maria": {
    nome: "Ana Maria",
    avatar: "https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=150",
    reputacao: 4.8,
    totalTrocas: 23,
    filho: "Lorenzo (2 anos)",
    localizacao: "Vila Madalena, São Paulo",
    membroDesde: "Mar/2024",
    bio: "Amo participar da comunidade GiraMãe! Lorenzo cresce rápido e adoro dar uma nova vida às roupinhas dele. Sempre cuido muito bem dos itens e espero encontrar mães que façam o mesmo! 💕",
    conquistas: [
      { nome: "Mãe Querida", cor: "bg-pink-100 text-pink-700", icone: Heart },
      { nome: "10+ Trocas", cor: "bg-green-100 text-green-700", icone: Gift },
      { nome: "Sempre Responde", cor: "bg-purple-100 text-purple-700", icone: MessageCircle }
    ],
    itens: [
      { id: 1, title: "Kit Body Carter's", girinhas: 15, image: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=300", size: "3-6M", status: "Disponível" },
      { id: 2, title: "Vestido Festa Lilás", girinhas: 30, image: "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=300", size: "2 anos", status: "Reservado" },
      { id: 3, title: "Tênis All Star Baby", girinhas: 25, image: "https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=300", size: "18", status: "Disponível" }
    ]
  },
  "Carla Silva": {
    nome: "Carla Silva",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150",
    reputacao: 4.5,
    totalTrocas: 18,
    filho: "Sofia (3 anos)",
    localizacao: "Pinheiros, São Paulo",
    membroDesde: "Fev/2024",
    bio: "Mãe da Sofia, sempre em busca de itens de qualidade para minha pequena. Acredito na economia circular e no compartilhamento entre mães! 🌟",
    conquistas: [
      { nome: "Mãe Querida", cor: "bg-pink-100 text-pink-700", icone: Heart },
      { nome: "10+ Trocas", cor: "bg-green-100 text-green-700", icone: Gift }
    ],
    itens: [
      { id: 7, title: "Tênis All Star Baby", girinhas: 20, image: "https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=300", size: "18", status: "Disponível" },
      { id: 8, title: "Conjunto Verão", girinhas: 18, image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=300", size: "3 anos", status: "Disponível" }
    ]
  }
};

const PerfilPublico = () => {
    const { nome } = useParams();
    const perfil = perfisData[nome as keyof typeof perfisData];

    if (!perfil) {
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
                                        <AvatarImage src={perfil.avatar} alt={`Foto de ${perfil.nome}`} />
                                        <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                                            {perfil.nome.split(' ').map(n => n[0]).join('')}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                                        <Badge className="bg-green-500 text-white px-2 py-1">
                                            <div className="w-2 h-2 bg-white rounded-full mr-1"></div>
                                            Online
                                        </Badge>
                                    </div>
                                </div>
                                <h2 className="text-2xl font-bold text-gray-800">{perfil.nome}</h2>
                                <p className="text-primary font-medium">Mãe do {perfil.filho}</p>
                                <div className="flex items-center gap-1 mt-2 text-yellow-500">
                                    {[1,2,3,4,5].map((star) => (
                                        <Star key={star} className={`w-5 h-5 ${star <= Math.floor(perfil.reputacao) ? 'fill-current' : 'opacity-30'}`} />
                                    ))}
                                    <span className="text-gray-600 text-sm ml-2">({perfil.reputacao}) • {perfil.totalTrocas} trocas</span>
                                </div>
                            </div>

                            {/* Quick Info */}
                            <div className="space-y-3 mb-6">
                                <div className="flex items-center gap-2 text-gray-600">
                                    <MapPin className="w-4 h-4 text-primary" />
                                    <span className="text-sm">{perfil.localizacao}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Calendar className="w-4 h-4 text-primary" />
                                    <span className="text-sm">Na comunidade desde {perfil.membroDesde}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Baby className="w-4 h-4 text-primary" />
                                    <span className="text-sm">Mãe de 1 criança</span>
                                </div>
                            </div>

                            {/* Badges/Conquistas */}
                            <div className="mb-6">
                                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                    <Trophy className="w-4 h-4 text-yellow-500" />
                                    Conquistas
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {perfil.conquistas.map((conquista, index) => {
                                        const IconeConquista = conquista.icone;
                                        return (
                                            <Badge key={index} variant="secondary" className={conquista.cor}>
                                                <IconeConquista className="w-3 h-3 mr-1" />
                                                {conquista.nome}
                                            </Badge>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Bio */}
                            <div className="mb-6">
                                <h3 className="font-semibold text-gray-800 mb-2">Sobre</h3>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    {perfil.bio}
                                </p>
                            </div>

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
                                    Itens Publicados ({perfil.itens.length})
                                </CardTitle>
                                <CardDescription>Todos os itens disponibilizados por {perfil.nome}.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {perfil.itens.map(item => (
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
                                                    <Button size="sm" variant="outline" asChild>
                                                        <Link to={`/item/${item.id}`}>Ver Item</Link>
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>

                                {perfil.itens.length === 0 && (
                                    <div className="text-center py-12">
                                        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Sparkles className="w-12 h-12 text-primary" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-gray-800 mb-2">Nenhum item publicado</h3>
                                        <p className="text-gray-600">{perfil.nome} ainda não publicou nenhum item.</p>
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
