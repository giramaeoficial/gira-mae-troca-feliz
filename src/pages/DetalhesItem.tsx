import { useParams, Link } from "react-router-dom";
import Header from "@/components/shared/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, MapPin, Sparkles, Star, Heart, Share2, Flag, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { useReservas } from "@/hooks/useReservas";
import { useItens } from "@/hooks/useItens";
import { useAuth } from "@/hooks/useAuth";
import { useCarteira } from "@/hooks/useCarteira";
import { useFavoritos } from "@/hooks/useFavoritos";
import { Tables } from "@/integrations/supabase/types";
import LazyImage from "@/components/ui/lazy-image";

type ItemComPerfil = Tables<'itens'> & {
  profiles?: {
    nome: string;
    bairro: string | null;
    cidade: string | null;
    avatar_url: string | null;
    reputacao: number | null;
  } | null;
};

const DetalhesItem = () => {
    const { id } = useParams();
    const { toast } = useToast();
    const { user } = useAuth();
    const { criarReserva, isItemReservado } = useReservas();
    const { saldo } = useCarteira();
    const { buscarItemPorId, loading } = useItens();
    const { verificarSeFavorito, toggleFavorito } = useFavoritos();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [item, setItem] = useState<ItemComPerfil | null>(null);
    
    useEffect(() => {
        if (id) {
            carregarItem();
        }
    }, [id]);

    const carregarItem = async () => {
        if (!id) return;
        
        try {
            const itemData = await buscarItemPorId(id);
            console.log('Item carregado:', itemData);
            console.log('Fotos do item:', itemData?.fotos);
            setItem(itemData as ItemComPerfil);
        } catch (error) {
            console.error('Erro ao carregar item:', error);
            toast({
                title: "Erro",
                description: "Não foi possível carregar os detalhes do item.",
                variant: "destructive",
            });
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex flex-col">
                <Header />
                <main className="flex-grow flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-gray-600">Carregando detalhes do item...</p>
                    </div>
                </main>
            </div>
        );
    }

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

    const isReserved = isItemReservado(item.id) || item.status !== 'disponivel';
    const semSaldo = saldo < Number(item.valor_girinhas);
    const isProprio = item.publicado_por === user?.id;
    const isFavorite = verificarSeFavorito(item.id);

    const handleReservar = async () => {
        if (isProprio) {
            toast({
                title: "Não é possível reservar",
                description: "Você não pode reservar seu próprio item.",
                variant: "destructive",
            });
            return;
        }

        if (isReserved || item.status !== 'disponivel') {
            toast({
                title: "Item indisponível",
                description: "Este item já foi reservado ou não está mais disponível.",
                variant: "destructive",
            });
            return;
        }

        if (semSaldo) {
            toast({
                title: "Saldo insuficiente",
                description: "Você não tem Girinhas suficientes para esta reserva.",
                variant: "destructive",
            });
            return;
        }

        const sucesso = await criarReserva(item.id, Number(item.valor_girinhas));
        if (sucesso) {
            // Recarregar item para atualizar status
            await carregarItem();
        }
    };

    const handleToggleFavorite = async () => {
        await toggleFavorito(item.id);
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: item.titulo,
                text: `Confira este item no GiraMãe: ${item.titulo}`,
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

    // Garantir que sempre temos uma imagem válida
    const imagens = item.fotos && item.fotos.length > 0 
        ? item.fotos.filter(foto => foto && foto.trim() !== '')
        : ["https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=600"];
    
    console.log('Imagens processadas para exibição:', imagens);

    const localizacao = item.profiles?.bairro || item.profiles?.cidade || "Localização não informada";
    const nomeMae = item.profiles?.nome || "Usuário";
    const reputacao = item.profiles?.reputacao || 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex flex-col">
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

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Galeria de Imagens */}
                    <div className="space-y-4">
                        <Card className="overflow-hidden border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                            <div className="relative">
                                <div className="w-full h-96 bg-gray-100">
                                    <LazyImage
                                        src={imagens[currentImageIndex]}
                                        alt={item.titulo}
                                        className="w-full h-full"
                                        size="full"
                                        placeholder="Carregando imagem..."
                                        bucket="itens"
                                        onError={() => console.error('Erro ao carregar imagem principal:', imagens[currentImageIndex])}
                                    />
                                </div>
                                <div className="absolute top-4 right-4">
                                    <Badge className={`${(isReserved || item.status !== 'disponivel') ? 'bg-gray-500' : 'bg-green-500'} text-white`}>
                                        {(isReserved || item.status !== 'disponivel') ? 'Reservado' : 'Disponível'}
                                    </Badge>
                                </div>
                                <div className="absolute top-4 left-4">
                                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                                        {formatarEstado(item.estado_conservacao)}
                                    </Badge>
                                </div>
                            </div>
                        </Card>
                        
                        {/* Miniaturas */}
                        {imagens.length > 1 && (
                            <div className="flex gap-2 overflow-x-auto">
                                {imagens.map((image, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentImageIndex(index)}
                                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                                            currentImageIndex === index ? 'border-primary' : 'border-gray-200'
                                        }`}
                                    >
                                        <LazyImage
                                            src={image}
                                            alt={`${item.titulo} ${index + 1}`}
                                            className="w-full h-full"
                                            size="thumbnail"
                                            bucket="itens"
                                            placeholder="📷"
                                            onError={() => console.error('Erro ao carregar miniatura:', image)}
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Detalhes do Item */}
                    <div className="space-y-6">
                        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-2xl text-gray-800 mb-2">{item.titulo}</CardTitle>
                                        <div className="flex items-center gap-4 text-sm text-gray-600">
                                            {item.tamanho && <span>Tamanho: {item.tamanho}</span>}
                                            {item.tamanho && <span>•</span>}
                                            <span>{formatarCategoria(item.categoria)}</span>
                                            <span>•</span>
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(item.created_at).toLocaleDateString('pt-BR')}
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
                                        {localizacao}
                                    </div>
                                </div>

                                <div className="bg-gradient-to-r from-primary/10 to-purple-100 p-4 rounded-xl">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Valor para troca</p>
                                            <p className="font-bold text-2xl text-primary flex items-center gap-2">
                                                <Sparkles className="w-6 h-6" />
                                                {item.valor_girinhas}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-gray-500">Girinhas</p>
                                            <p className="text-xs text-green-600 font-medium">Preço justo ✓</p>
                                        </div>
                                    </div>
                                </div>

                                <Button 
                                    className="w-full bg-gradient-to-r from-primary to-pink-500 hover:from-primary/90 hover:to-pink-500/90 disabled:opacity-50"
                                    size="lg"
                                    onClick={handleReservar}
                                    disabled={isReserved || item.status !== 'disponivel' || semSaldo || isProprio}
                                >
                                    {isProprio ? 'Seu próprio item' : 
                                     (isReserved || item.status !== 'disponivel') ? 'Item Reservado' : 
                                     semSaldo ? 'Saldo insuficiente' : 'Reservar com Pix da Mãe'}
                                </Button>
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
                                        <AvatarImage src={item.profiles?.avatar_url || undefined} alt={nomeMae} />
                                        <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                                            {nomeMae.split(' ').map(n => n[0]).join('')}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-grow">
                                        <h3 className="font-semibold text-gray-800">{nomeMae}</h3>
                                        <div className="flex items-center gap-1 mt-1">
                                            {[1,2,3,4,5].map((star) => (
                                                <Star key={star} className={`w-4 h-4 ${star <= Math.floor(reputacao) ? 'fill-current text-yellow-500' : 'text-gray-300'}`} />
                                            ))}
                                            <span className="text-sm text-gray-600 ml-1">
                                                ({reputacao.toFixed(1)})
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <Button asChild size="sm">
                                            <Link to={`/mae/${item.publicado_por}`}>Ver Perfil</Link>
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
