import { useParams, Link, useNavigate } from "react-router-dom";
import Header from "@/components/shared/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  MapPin, 
  Sparkles, 
  Star, 
  Heart, 
  Share2, 
  Flag, 
  Calendar,
  Clock,
  User,
  Truck,
  Home,
  School,
  Eye,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  MessageCircle,
  Shield,
  Package
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { useReservas } from "@/hooks/useReservas";
import { useItens } from "@/hooks/useItens";
import { useAuth } from "@/hooks/useAuth";
import { useCarteira } from "@/hooks/useCarteira";
import { useFavoritos } from "@/hooks/useFavoritos";
import { useCommonSchool } from "@/hooks/useCommonSchool";
import { Tables } from "@/integrations/supabase/types";
import LazyImage from "@/components/ui/lazy-image";
import { cn } from "@/lib/utils";
import ActionFeedback from "@/components/loading/ActionFeedback";

type ItemComPerfil = Tables<'itens'> & {
  profiles?: {
    nome: string;
    bairro: string | null;
    cidade: string | null;
    estado: string | null;
    avatar_url: string | null;
    reputacao: number | null;
  } | null;
};

const DetalhesItem = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { user } = useAuth();
    const { entrarNaFila, isItemReservado } = useReservas();
    const { saldo } = useCarteira();
    const { buscarItemPorId, loading } = useItens();
    const { verificarSeFavorito, toggleFavorito } = useFavoritos();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [item, setItem] = useState<ItemComPerfil | null>(null);
    const [actionState, setActionState] = useState<'loading' | 'success' | 'error' | 'idle'>('idle');
    const [showImageModal, setShowImageModal] = useState(false);
    
    // ✅ ADICIONADO: Hook para escola em comum
    const { hasCommonSchool } = useCommonSchool(item?.publicado_por || '');
    
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

    // ✅ MELHORADO: Função para obter ícone de gênero
    const getGeneroInfo = (genero?: string) => {
        switch (genero) {
            case 'menino': 
                return { icon: '👦', label: 'Menino', color: 'bg-blue-100 text-blue-800' };
            case 'menina': 
                return { icon: '👧', label: 'Menina', color: 'bg-pink-100 text-pink-800' };
            case 'unissex': 
                return { icon: '👶', label: 'Unissex', color: 'bg-purple-100 text-purple-800' };
            default: 
                return null;
        }
    };

    // ✅ MELHORADO: Função para obter cor do estado
    const getEstadoInfo = (estado: string) => {
        switch (estado) {
            case 'novo': 
                return { label: 'Novo', color: 'bg-green-100 text-green-800' };
            case 'seminovo': 
                return { label: 'Seminovo', color: 'bg-blue-100 text-blue-800' };
            case 'usado': 
                return { label: 'Usado', color: 'bg-yellow-100 text-yellow-800' };
            case 'muito_usado': 
                return { label: 'Muito Usado', color: 'bg-orange-100 text-orange-800' };
            default: 
                return { label: estado, color: 'bg-gray-100 text-gray-800' };
        }
    };

    // ✅ ADICIONADO: Função para formatar categoria
    const formatarCategoria = (categoria: string) => {
        const categorias = {
            'roupas': 'Roupas',
            'brinquedos': 'Brinquedos',
            'calcados': 'Calçados',
            'acessorios': 'Acessórios',
            'equipamentos': 'Equipamentos',
            'livros': 'Livros'
        };
        return categorias[categoria as keyof typeof categorias] || categoria;
    };

    // ✅ ADICIONADO: Função para calcular tempo desde publicação
    const getTempoPublicacao = (dataPublicacao: string) => {
        const agora = new Date();
        const publicacao = new Date(dataPublicacao);
        const diffMs = agora.getTime() - publicacao.getTime();
        const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        if (diffDias === 0) return 'Hoje';
        if (diffDias === 1) return 'Ontem';
        if (diffDias < 7) return `${diffDias} dias atrás`;
        if (diffDias < 30) return `${Math.floor(diffDias / 7)} semanas atrás`;
        return `${Math.floor(diffDias / 30)} meses atrás`;
    };

    const handleReservar = async () => {
        if (!item || !user) return;

        const isProprio = item.publicado_por === user.id;
        const isReserved = isItemReservado(item.id) || item.status !== 'disponivel';
        const semSaldo = saldo < Number(item.valor_girinhas);

        if (isProprio) {
            toast({
                title: "Não é possível reservar",
                description: "Você não pode reservar seu próprio item.",
                variant: "destructive",
            });
            return;
        }

        if (isReserved) {
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

        setActionState('loading');
        const sucesso = await entrarNaFila(item.id);
        
        if (sucesso) {
            setActionState('success');
            await carregarItem();
            toast({
                title: "Sucesso!",
                description: "Você entrou na fila para este item.",
            });
        } else {
            setActionState('error');
        }
        
        setTimeout(() => setActionState('idle'), 3000);
    };

    const handleToggleFavorite = async () => {
        if (!item) return;
        await toggleFavorito(item.id);
    };

    const handleShare = async () => {
        if (!item) return;
        
        const shareData = {
            title: item.titulo,
            text: `Confira este item no GiraMãe: ${item.titulo}`,
            url: window.location.href,
        };

        try {
            if (navigator.share && navigator.canShare(shareData)) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(window.location.href);
                toast({
                    title: "Link copiado!",
                    description: "O link do item foi copiado para a área de transferência.",
                });
            }
        } catch (error) {
            console.error('Erro ao compartilhar:', error);
        }
    };

    // ✅ MELHORADO: Navegação de imagens
    const nextImage = () => {
        if (!item?.fotos) return;
        setCurrentImageIndex((prev) => 
            prev === item.fotos!.length - 1 ? 0 : prev + 1
        );
    };

    const prevImage = () => {
        if (!item?.fotos) return;
        setCurrentImageIndex((prev) => 
            prev === 0 ? item.fotos!.length - 1 : prev - 1
        );
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
                    <Card className="max-w-md mx-auto text-center m-4">
                        <CardContent className="p-8">
                            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
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
    const generoInfo = getGeneroInfo(item.genero);
    const estadoInfo = getEstadoInfo(item.estado_conservacao);

    // ✅ MELHORADO: Garantir que sempre temos imagens válidas
    const imagens = item.fotos && item.fotos.length > 0 
        ? item.fotos 
        : ['/placeholder-item.jpg'];

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
            {/* ✅ MELHORADO: Header com navegação */}
            <header className="bg-white shadow-sm border-b border-pink-100 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => navigate(-1)}
                            className="p-2"
                        >
                            <ArrowLeft size={20} />
                        </Button>
                        <h1 className="text-lg font-semibold text-gray-800 text-center flex-1">
                            Detalhes do Item
                        </h1>
                        <div className="flex items-center gap-2">
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={handleShare}
                                className="p-2"
                            >
                                <Share2 size={20} className="text-gray-600" />
                            </Button>
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={handleToggleFavorite}
                                className="p-2"
                            >
                                <Heart 
                                    size={20} 
                                    className={cn(
                                        isFavorite 
                                            ? "fill-red-500 text-red-500" 
                                            : "text-gray-600"
                                    )} 
                                />
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto p-4 space-y-6">
                {/* ✅ MELHORADO: Galeria de Imagens */}
                <Card className="overflow-hidden shadow-lg">
                    <div className="relative">
                        <div className="aspect-square md:aspect-[4/3] relative">
                            <LazyImage
                                src={imagens[currentImageIndex]}
                                alt={`${item.titulo} - Imagem ${currentImageIndex + 1}`}
                                className="w-full h-full object-cover"
                            />
                            
                            {/* ✅ ADICIONADO: Controles de navegação */}
                            {imagens.length > 1 && (
                                <>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white/90"
                                        onClick={prevImage}
                                    >
                                        <ChevronLeft size={20} />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white/90"
                                        onClick={nextImage}
                                    >
                                        <ChevronRight size={20} />
                                    </Button>
                                </>
                            )}

                            {/* ✅ ADICIONADO: Indicador de imagem atual */}
                            {imagens.length > 1 && (
                                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-2 py-1 rounded-full text-xs">
                                    {currentImageIndex + 1} / {imagens.length}
                                </div>
                            )}

                            {/* ✅ ADICIONADO: Botão de zoom */}
                            <Button
                                variant="ghost"
                                size="sm"
                                className="absolute top-2 right-2 bg-white/80 hover:bg-white/90"
                                onClick={() => setShowImageModal(true)}
                            >
                                <ZoomIn size={16} />
                            </Button>
                        </div>

                        {/* ✅ MELHORADO: Miniaturas das imagens */}
                        {imagens.length > 1 && (
                            <div className="flex space-x-2 p-4 overflow-x-auto bg-gray-50">
                                {imagens.map((image, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentImageIndex(index)}
                                        className={cn(
                                            "w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all",
                                            index === currentImageIndex
                                                ? "border-primary shadow-md"
                                                : "border-gray-200 hover:border-gray-300"
                                        )}
                                    >
                                        <LazyImage
                                            src={image}
                                            alt={`${item.titulo} - Miniatura ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </Card>

                {/* ✅ MELHORADO: Informações Principais */}
                <Card className="shadow-lg">
                    <CardContent className="p-6">
                        {/* Status e badges */}
                        <div className="flex flex-wrap gap-2 mb-4">
                            {isReserved && (
                                <Badge variant="destructive">Reservado</Badge>
                            )}
                            {hasCommonSchool && (
                                <Badge className="bg-green-100 text-green-800">
                                    <School className="w-3 h-3 mr-1" />
                                    Mesma escola!
                                </Badge>
                            )}
                            <Badge className={estadoInfo.color}>
                                {estadoInfo.label}
                            </Badge>
                        </div>

                        {/* Título e preço */}
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                            <div className="flex-1">
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                                    {item.titulo}
                                </h1>
                                
                                {/* ✅ ADICIONADO: Informações detalhadas */}
                                <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                                    <span className="flex items-center gap-1">
                                        <Package className="w-4 h-4" />
                                        {formatarCategoria(item.categoria)}
                                    </span>
                                    
                                    {item.subcategoria && (
                                        <span>• {item.subcategoria}</span>
                                    )}
                                    
                                    {item.tamanho_valor && (
                                        <span>• {item.tamanho_valor}</span>
                                    )}
                                    
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-4 h-4" />
                                        {getTempoPublicacao(item.created_at)}
                                    </span>
                                </div>
                            </div>

                            <div className="text-right">
                                <div className="flex items-center justify-end gap-2 mb-2">
                                    <Sparkles className="w-6 h-6 text-yellow-500" />
                                    <span className="text-3xl font-bold text-primary">
                                        {item.valor_girinhas}
                                    </span>
                                    <span className="text-lg text-gray-600">Girinhas</span>
                                </div>
                                
                                {semSaldo && !isProprio && (
                                    <p className="text-sm text-red-600">
                                        Saldo insuficiente
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* ✅ ADICIONADO: Badges de atributos */}
                        <div className="flex flex-wrap gap-2 mb-6">
                            {generoInfo && (
                                <Badge className={generoInfo.color}>
                                    {generoInfo.icon} {generoInfo.label}
                                </Badge>
                            )}
                        </div>

                        {/* Descrição */}
                        {item.descricao && (
                            <div className="mb-6">
                                <h3 className="font-semibold text-lg mb-2">Descrição</h3>
                                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                    {item.descricao}
                                </p>
                            </div>
                        )}

                        <Separator className="my-6" />

                        {/* ✅ MELHORADO: Informações de Entrega */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                                    <Truck className="w-5 h-5" />
                                    Entrega e Retirada
                                </h3>
                                
                                {item.aceita_entrega ? (
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-green-600">
                                            <Truck className="w-4 h-4" />
                                            <span>Entrega disponível até {item.raio_entrega_km}km</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <Home className="w-4 h-4" />
                                            <span>Retirada no local também disponível</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Home className="w-4 h-4" />
                                        <span>Apenas retirada no local</span>
                                    </div>
                                )}
                            </div>

                            <div>
                                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                                    <MapPin className="w-5 h-5" />
                                    Localização
                                </h3>
                                <div className="text-gray-600 space-y-1">
                                    {item.profiles?.bairro && (
                                        <p>{item.profiles.bairro}</p>
                                    )}
                                    {item.profiles?.cidade && (
                                        <p>{item.profiles.cidade}, {item.profiles.estado}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* ✅ MELHORADO: Informações do Vendedor */}
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="w-5 h-5" />
                            Vendedor
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Avatar className="w-12 h-12">
                                    <AvatarImage src={item.profiles?.avatar_url || undefined} />
                                    <AvatarFallback>
                                        {item.profiles?.nome?.[0]?.toUpperCase() || '?'}
                                    </AvatarFallback>
                                </Avatar>
                                
                                <div>
                                    <h3 className="font-semibold text-lg">
                                        {item.profiles?.nome || 'Usuário'}
                                    </h3>
                                    {item.profiles?.reputacao && (
                                        <div className="flex items-center gap-1 text-sm text-gray-600">
                                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                            <span>{item.profiles.reputacao.toFixed(1)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button variant="outline" size="sm">
                                    <MessageCircle className="w-4 h-4 mr-2" />
                                    Conversar
                                </Button>
                                <Button variant="outline" size="sm">
                                    <Eye className="w-4 h-4 mr-2" />
                                    Ver Perfil
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* ✅ MELHORADO: Botões de Ação */}
                {!isProprio && (
                    <Card className="shadow-lg">
                        <CardContent className="p-6">
                            <div className="flex flex-col gap-4">
                                {actionState !== 'idle' && (
                                    <ActionFeedback
                                        state={actionState}
                                        successMessage="Você entrou na fila para este item!"
                                        errorMessage="Erro ao entrar na fila. Tente novamente."
                                    />
                                )}
                                
                                <Button
                                    size="lg"
                                    className="w-full text-lg font-semibold bg-gradient-to-r from-primary to-pink-500 hover:from-primary/90 hover:to-pink-500/90"
                                    onClick={handleReservar}
                                    disabled={isReserved || semSaldo || actionState === 'loading'}
                                >
                                    {actionState === 'loading' ? (
                                        <div className="flex items-center gap-2">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            Entrando na fila...
                                        </div>
                                    ) : isReserved ? (
                                        'Item Reservado'
                                    ) : semSaldo ? (
                                        'Saldo Insuficiente'
                                    ) : (
                                        'Entrar na Fila'
                                    )}
                                </Button>

                                <div className="flex gap-2">
                                    <Button 
                                        variant="outline" 
                                        className="flex-1"
                                        onClick={handleToggleFavorite}
                                    >
                                        <Heart className={cn(
                                            "w-4 h-4 mr-2",
                                            isFavorite && "fill-current text-red-500"
                                        )} />
                                        {isFavorite ? 'Remover dos Favoritos' : 'Adicionar aos Favoritos'}
                                    </Button>
                                    
                                    <Button variant="outline" size="sm">
                                        <Flag className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </main>

            {/* ✅ ADICIONADO: Modal de Zoom da Imagem */}
            {showImageModal && (
                <div 
                    className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
                    onClick={() => setShowImageModal(false)}
                >
                    <div className="relative max-w-4xl max-h-full">
                        <LazyImage
                            src={imagens[currentImageIndex]}
                            alt={`${item.titulo} - Zoom`}
                            className="max-w-full max-h-full object-contain"
                        />
                        <Button
                            variant="ghost"
                            size="sm"
                            className="absolute top-2 right-2 bg-white/10 hover:bg-white/20 text-white"
                            onClick={() => setShowImageModal(false)}
                        >
                            ×
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DetalhesItem;
