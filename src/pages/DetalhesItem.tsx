
import { useParams, Link } from "react-router-dom";
import Header from "@/components/shared/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, MapPin, Sparkles, Star, Heart, Share2, Flag, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

// Dados simulados - em uma aplicação real viria de uma API
const itemsData = {
  1: {
    id: 1,
    title: "Kit Body Carter's",
    girinhas: 15,
    image: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=600",
    size: "3-6M",
    estado: "Ótimo estado",
    categoria: "Roupa",
    descricao: "Kit com 5 bodies manga curta da Carter's, todos em ótimo estado. Foram pouco usados e sempre bem cuidados. Cores variadas: azul, branco, verde e rosa. Tecido 100% algodão, muito confortável para o bebê.",
    localizacao: "Vila Madalena, São Paulo",
    maeNome: "Ana Maria",
    maeAvatar: "https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=150",
    maeReputacao: 4.8,
    maeTrocas: 23,
    publicadoEm: "há 2 dias",
    disponivel: true,
    imagens: [
      "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=600",
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600",
      "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=600"
    ]
  }
};

const DetalhesItem = () => {
    const { id } = useParams();
    const { toast } = useToast();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isFavorite, setIsFavorite] = useState(false);

    // Corrigir aqui: converter id para number antes de acessar itemsData
    const item = itemsData[Number(id)];

    if (!item) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex flex-col">
                <Header />
                <main className="flex-grow flex items-center justify-center">
                    <Card className="max-w-md mx-auto text-center">
                        <CardContent className="p-8">
                            <h2 className="text-2xl font-bold mb-4">Item não encontrado</h2>
                            <p className="text-gray-600 mb-6">O item que você está procurando não existe ou foi removido.</p>
                            <Button asChild>
                                <Link to="/feed">Voltar ao Feed</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </main>
            </div>
        );
    }

    const handleReservar = () => {
        toast({
            title: "Item reservado! 🎉",
            description: `${item.title} foi reservado. Entre em contato com ${item.maeNome} para combinar a troca.`,
        });
    };

    const handleToggleFavorite = () => {
        setIsFavorite(!isFavorite);
        toast({
            title: isFavorite ? "Removido dos favoritos" : "Adicionado aos favoritos! ❤️",
            description: isFavorite 
                ? "Item removido da sua lista de desejos." 
                : "Item adicionado à sua lista de desejos.",
        });
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: item.title,
                text: `Confira este item no GiraMãe: ${item.title}`,
                url: window.location.href,
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
            toast({
                title: "Link copiado!",
                description: "O link do item foi copiado para a área de transferência.",
            });
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex flex-col">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8">
                <div className="mb-6">
                    <Button variant="ghost" asChild className="gap-2">
                        <Link to="/feed">
                            <ArrowLeft className="w-4 h-4" />
                            Voltar ao Feed
                        </Link>
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Galeria de Imagens */}
                    <div className="space-y-4">
                        <Card className="overflow-hidden border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                            <div className="relative">
                                <img 
                                    src={item.imagens[currentImageIndex]} 
                                    alt={item.title} 
                                    className="w-full h-96 object-cover"
                                />
                                <div className="absolute top-4 right-4">
                                    <Badge className={`${item.disponivel ? 'bg-green-500' : 'bg-gray-500'} text-white`}>
                                        {item.disponivel ? 'Disponível' : 'Reservado'}
                                    </Badge>
                                </div>
                                <div className="absolute top-4 left-4">
                                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                                        {item.estado}
                                    </Badge>
                                </div>
                            </div>
                        </Card>
                        
                        {/* Miniaturas */}
                        <div className="flex gap-2">
                            {item.imagens.map((image, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentImageIndex(index)}
                                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                                        currentImageIndex === index ? 'border-primary' : 'border-gray-200'
                                    }`}
                                >
                                    <img src={image} alt={`${item.title} ${index + 1}`} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Detalhes do Item */}
                    <div className="space-y-6">
                        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-2xl text-gray-800 mb-2">{item.title}</CardTitle>
                                        <div className="flex items-center gap-4 text-sm text-gray-600">
                                            <span>Tamanho: {item.size}</span>
                                            <span>•</span>
                                            <span>{item.categoria}</span>
                                            <span>•</span>
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {item.publicadoEm}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            onClick={handleToggleFavorite}
                                            className={isFavorite ? "text-red-500 border-red-200" : ""}
                                        >
                                            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                                        </Button>
                                        <Button variant="outline" size="sm" onClick={handleShare}>
                                            <Share2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <h3 className="font-semibold text-gray-800 mb-2">Descrição</h3>
                                    <p className="text-gray-600 leading-relaxed">{item.descricao}</p>
                                </div>

                                <div>
                                    <h3 className="font-semibold text-gray-800 mb-2">Localização</h3>
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <MapPin className="w-4 h-4 text-primary" />
                                        {item.localizacao}
                                    </div>
                                </div>

                                <div className="bg-gradient-to-r from-primary/10 to-purple-100 p-4 rounded-xl">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Valor para troca</p>
                                            <p className="font-bold text-2xl text-primary flex items-center gap-2">
                                                <Sparkles className="w-6 h-6" />
                                                {item.girinhas}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-gray-500">Girinhas</p>
                                            <p className="text-xs text-green-600 font-medium">Preço justo ✓</p>
                                        </div>
                                    </div>
                                </div>

                                {item.disponivel && (
                                    <Button 
                                        className="w-full bg-gradient-to-r from-primary to-pink-500 hover:from-primary/90 hover:to-pink-500/90"
                                        size="lg"
                                        onClick={handleReservar}
                                    >
                                        Reservar com Pix da Mãe
                                    </Button>
                                )}
                            </CardContent>
                        </Card>

                        {/* Perfil da Mãe */}
                        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="text-lg">Publicado por</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-4">
                                    <Avatar className="w-16 h-16">
                                        <AvatarImage src={item.maeAvatar} alt={item.maeNome} />
                                        <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                                            {item.maeNome.split(' ').map(n => n[0]).join('')}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-grow">
                                        <h3 className="font-semibold text-gray-800">{item.maeNome}</h3>
                                        <div className="flex items-center gap-1 mt-1">
                                            {[1,2,3,4,5].map((star) => (
                                                <Star key={star} className={`w-4 h-4 ${star <= Math.floor(item.maeReputacao) ? 'fill-current text-yellow-500' : 'text-gray-300'}`} />
                                            ))}
                                            <span className="text-sm text-gray-600 ml-1">
                                                ({item.maeReputacao}) • {item.maeTrocas} trocas
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <Button asChild size="sm">
                                            <Link to={`/perfil/${item.maeNome}`}>Ver Perfil</Link>
                                        </Button>
                                        <Button variant="outline" size="sm">
                                            <Flag className="w-3 h-3 mr-1" />
                                            Reportar
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DetalhesItem;
