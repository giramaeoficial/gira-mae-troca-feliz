import { useParams, Link, useNavigate } from "react-router-dom";
import Header from "@/components/shared/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  ArrowLeft, 
  MapPin, 
  Sparkles, 
  Star, 
  Heart, 
  Share2, 
  Flag, 
  Clock,
  User,
  Truck,
  Home,
  School,
  Eye,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  Shield,
  Package,
  Users
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useFeedItem } from "@/hooks/useFeedItem";
import { useUserData } from "@/contexts/UserDataContext";
import { Tables } from "@/integrations/supabase/types";
import LazyImage from "@/components/ui/lazy-image";
import { cn } from "@/lib/utils";
import ActionFeedback from "@/components/loading/ActionFeedback";
import ItensRelacionados from "@/components/item/ItensRelacionados";
import { supabase } from "@/integrations/supabase/client";

type ItemComPerfil = Tables<'itens'> & {
  profiles?: {
    nome: string;
    bairro: string | null;
    cidade: string | null;
    estado: string | null;
    avatar_url: string | null;
    reputacao: number | null;
  } | null;
  publicado_por_profile?: {
    nome: string;
    avatar_url?: string;
    reputacao?: number;
  };
  endereco_bairro?: string;
  endereco_cidade?: string;
  endereco_estado?: string;
};

const DetalhesItem = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { user } = useAuth();
    
    // ✅ DADOS CENTRALIZADOS - Uma única fonte via contexto e hook otimizado
    const { userData } = useUserData();
    const { data, isLoading: loading, error } = useFeedItem(user?.id || '', id || '');

    // Estados locais (apenas para UI)
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [actionState, setActionState] = useState<'loading' | 'success' | 'error' | 'idle'>('idle');
    const [showImageModal, setShowImageModal] = useState(false);

    // ✅ DADOS CONSOLIDADOS - Tudo vem de uma única fonte
    const item = data?.item;
    const feedData = data?.feedData;
    const saldo = userData?.carteira?.saldo_atual || 0;
    const userSchoolIds = userData?.escolasIds || [];

    // Retorno de loading/erro seguro
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
    
    if (!item || !feedData) {
        if (error) {
            console.error('Erro ao carregar item:', error);
        }
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

    // Adaptar para formato esperado de compatibilidade com outros componentes
    const itemAdaptado: ItemComPerfil | null = item ? {
        ...item,
        profiles: item.publicado_por_profile ? {
            nome: item.publicado_por_profile.nome,
            bairro: item.endereco_bairro || null,
            cidade: item.endereco_cidade || null,
            estado: item.endereco_estado || null,
            avatar_url: item.publicado_por_profile.avatar_url || null,
            reputacao: item.publicado_por_profile.reputacao || null,
        } : null
    } : null;

    // ✅ VERIFICAR ESCOLA EM COMUM - usando dados consolidados
    const hasCommonSchool = item?.escola_comum || false;

    // ✅ STATUS CALCULADOS - usando dados consolidados do feedData
    const isFavorite = feedData.favoritos.includes(item.id) || false;
    const filaInfo = item.id && feedData.filas_espera[item.id] 
        ? {
            total_fila: feedData.filas_espera[item.id].total_fila || 0,
            posicao_usuario: feedData.filas_espera[item.id].posicao_usuario || 0
          }
        : { total_fila: 0, posicao_usuario: 0 };

    const isItemReservado = (itemId: string) => {
        if (!feedData.reservas_usuario) return false;
        return feedData.reservas_usuario.some(r => 
            r.item_id === itemId && 
            ['pendente', 'confirmada'].includes(r.status)
        );
    };

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

    // AÇÕES (mantendo funcionalidade exata)
    const isReserved = isItemReservado(item.id) || item.status !== 'disponivel';
    const semSaldo = saldo < Number(item.valor_girinhas);
    const isProprio = item.publicado_por === user?.id;
    const generoInfo = getGeneroInfo(item.genero);
    const estadoInfo = getEstadoInfo(item.estado_conservacao);

    const imagens = item.fotos && item.fotos.length > 0 
        ? item.fotos 
        : ['/placeholder-item.jpg'];

    const handleReservar = async () => {
        if (!item || !user) return;

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
        try {
            const { data: result, error } = await supabase.rpc('entrar_fila_espera', {
                p_item_id: item.id,
                p_usuario_id: user.id,
                p_valor_girinhas: item.valor_girinhas
            });
            if (error) throw error;
            setActionState('success');
            const isDirectReservation = result?.tipo === 'reserva_direta';
            toast({
                title: "Sucesso!",
                description: isDirectReservation ? "Item reservado!" : "Você entrou na fila para este item.",
            });
        } catch (error) {
            setActionState('error');
            toast({
                title: "Erro",
                description: "Não foi possível processar sua solicitação.",
                variant: "destructive",
            });
        }
        setTimeout(() => setActionState('idle'), 3000);
    };

    const handleToggleFavorite = async () => {
        if (!item || !user) return;
        try {
            if (isFavorite) {
                const { error } = await supabase
                    .from('favoritos')
                    .delete()
                    .eq('user_id', user.id)
                    .eq('item_id', item.id);
                if (error) throw error;
                toast({ title: "Removido dos favoritos", description: "Item removido dos seus favoritos." });
            } else {
                const { error } = await supabase
                    .from('favoritos')
                    .insert({ user_id: user.id, item_id: item.id });
                if (error) throw error;
                toast({ title: "Adicionado aos favoritos", description: "Item adicionado aos seus favoritos." });
            }
        } catch (error) {
            toast({
                title: "Erro",
                description: "Não foi possível atualizar os favoritos.",
                variant: "destructive",
            });
        }
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
        } catch (error) {}
    };

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

    const getButtonText = () => {
        if (isReserved) {
            return (filaInfo?.posicao_usuario && filaInfo.posicao_usuario > 0) 
                ? `Na fila (posição ${filaInfo.posicao_usuario})` 
                : 'Item Reservado';
        }
        return (filaInfo?.total_fila && filaInfo.total_fila > 0) ? 'Entrar na Fila' : 'Reservar Item';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
            {/* Header mobile-first */}
            <header className="bg-white shadow-sm border-b border-pink-100 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="p-2">
                            <ArrowLeft size={20} />
                        </Button>
                        <h1 className="text-base font-semibold text-gray-800 text-center flex-1 px-4 truncate">
                            {item.titulo}
                        </h1>
                        <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm" onClick={handleShare} className="p-2">
                                <Share2 size={18} className="text-gray-600" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={handleToggleFavorite} className="p-2">
                                <Heart 
                                    size={18} 
                                    className={cn(
                                        isFavorite ? "fill-red-500 text-red-500" : "text-gray-600"
                                    )} 
                                />
                            </Button>
                        </div>
                    </div>
                </div>
            </header>
            <main className="max-w-4xl mx-auto p-3 space-y-4">
                {/* Galeria de Imagens - Mobile first */}
                <Card className="overflow-hidden shadow-lg">
                    <div className="relative">
                        <div className="aspect-square md:aspect-[4/3] relative">
                            <LazyImage
                                src={imagens[currentImageIndex]}
                                alt={`${item.titulo} - Imagem ${currentImageIndex + 1}`}
                                className="w-full h-full object-cover"
                            />
                            {imagens.length > 1 && (
                                <>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white/90 p-2"
                                        onClick={prevImage}
                                    >
                                        <ChevronLeft size={20} />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white/90 p-2"
                                        onClick={nextImage}
                                    >
                                        <ChevronRight size={20} />
                                    </Button>
                                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-2 py-1 rounded-full text-xs">
                                        {currentImageIndex + 1} / {imagens.length}
                                    </div>
                                </>
                            )}
                            <Button
                                variant="ghost"
                                size="sm"
                                className="absolute top-2 right-2 bg-white/80 hover:bg-white/90 p-2"
                                onClick={() => setShowImageModal(true)}
                            >
                                <ZoomIn size={16} />
                            </Button>
                        </div>
                        {imagens.length > 1 && (
                            <div className="flex space-x-2 p-3 overflow-x-auto bg-gray-50">
                                {imagens.map((image, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentImageIndex(index)}
                                        className={cn(
                                            "w-12 h-12 md:w-16 md:h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all",
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
                {/* Informações Principais */}
                <Card className="shadow-lg">
                    <CardContent className="p-4">
                        <div className="flex flex-wrap gap-2 mb-4">
                            {isReserved && (
                                <Badge variant="destructive" className="text-xs">
                                    {(filaInfo?.posicao_usuario && filaInfo.posicao_usuario > 0) 
                                        ? `Fila - Posição ${filaInfo.posicao_usuario}` 
                                        : 'Reservado'}
                                </Badge>
                            )}
                            {(filaInfo?.total_fila && filaInfo.total_fila > 0) && !isReserved && (
                                <Badge className="bg-blue-100 text-blue-800 text-xs">
                                    <Users className="w-3 h-3 mr-1" />
                                    {filaInfo.total_fila} na fila
                                </Badge>
                            )}
                            {hasCommonSchool && (
                                <Badge className="bg-green-100 text-green-800 text-xs">
                                    <School className="w-3 h-3 mr-1" />
                                    Mesma escola!
                                </Badge>
                            )}
                            <Badge className={cn("text-xs", estadoInfo.color)}>
                                {estadoInfo.label}
                            </Badge>
                        </div>
                        <div className="flex flex-col gap-3 mb-4">
                            <h1 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight">
                                {item.titulo}
                            </h1>
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
                            <div className="flex items-center gap-2 py-2">
                                <Sparkles className="w-6 h-6 text-yellow-500" />
                                <span className="text-2xl md:text-3xl font-bold text-primary">
                                    {item.valor_girinhas}
                                </span>
                                <span className="text-lg text-gray-600">Girinhas</span>
                                {semSaldo && !isProprio && (
                                    <Badge variant="destructive" className="ml-auto text-xs">
                                        Saldo insuficiente
                                    </Badge>
                                )}
                            </div>
                        </div>
                        {generoInfo && (
                            <div className="flex flex-wrap gap-2 mb-4">
                                <Badge className={cn("text-xs", generoInfo.color)}>
                                    {generoInfo.icon} {generoInfo.label}
                                </Badge>
                            </div>
                        )}
                        {item.descricao && (
                            <div className="mb-4">
                                <h3 className="font-semibold text-base mb-2">Descrição</h3>
                                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm">
                                    {item.descricao}
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
                {/* Informações de Entrega e Vendedor */}
                <div className="grid grid-cols-1 gap-4">
                    <Card className="shadow-lg">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Truck className="w-5 h-5" />
                                Entrega e Retirada
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Home className="w-4 h-4" />
                                    <span>Retirada no local</span>
                                </div>
                                {item.endereco_bairro && (
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <MapPin className="w-4 h-4" />
                                        <span>{item.endereco_bairro}, {item.endereco_cidade}</span>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="shadow-lg">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <User className="w-5 h-5" />
                                Vendedor
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Avatar className="w-10 h-10">
                                        <AvatarImage src={item.publicado_por_profile?.avatar_url || undefined} />
                                        <AvatarFallback className="text-sm">
                                            {item.publicado_por_profile?.nome?.[0]?.toUpperCase() || '?'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h3 className="font-semibold text-sm">
                                            {item.publicado_por_profile?.nome || 'Usuário'}
                                        </h3>
                                        {item.publicado_por_profile?.reputacao && (
                                            <div className="flex items-center gap-1 text-xs text-gray-600">
                                                <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                                <span>{item.publicado_por_profile.reputacao.toFixed(1)}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <Button variant="outline" size="sm" className="text-xs">
                                    <Eye className="w-3 h-3 mr-1" />
                                    Ver Perfil
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                {!isProprio && (
                    <Card className="shadow-lg">
                        <CardContent className="p-4">
                            <div className="space-y-3">
                                {actionState !== 'idle' && (
                                    <ActionFeedback
                                        state={actionState}
                                        successMessage={(!filaInfo?.total_fila || filaInfo.total_fila === 0) ? "Item reservado!" : "Você entrou na fila!"}
                                        errorMessage="Erro ao reservar. Tente novamente."
                                    />
                                )}
                                <Button
                                    size="lg"
                                    className="w-full text-base font-semibold bg-gradient-to-r from-primary to-pink-500 hover:from-primary/90 hover:to-pink-500/90"
                                    onClick={handleReservar}
                                    disabled={isReserved || semSaldo || actionState === 'loading'}
                                >
                                    {actionState === 'loading' ? (
                                        <div className="flex items-center gap-2">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            {(!filaInfo?.total_fila || filaInfo.total_fila === 0) ? 'Reservando...' : 'Entrando na fila...'}
                                        </div>
                                    ) : (
                                        getButtonText()
                                    )}
                                </Button>
                                <div className="flex gap-2">
                                    <Button 
                                        variant="outline" 
                                        className="flex-1 text-sm"
                                        onClick={handleToggleFavorite}
                                    >
                                        <Heart className={cn(
                                            "w-4 h-4 mr-2",
                                            isFavorite && "fill-current text-red-500"
                                        )} />
                                        {isFavorite ? 'Favorito' : 'Favoritar'}
                                    </Button>
                                    <Button variant="outline" size="sm" className="px-3">
                                        <Flag className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
                {itemAdaptado && (
                    <ItensRelacionados 
                        itemAtual={{
                            ...itemAdaptado,
                            publicado_por_profile: item.publicado_por_profile
                        }}
                        location={item.endereco_cidade ? {
                            cidade: item.endereco_cidade,
                            estado: item.endereco_estado || '',
                            bairro: item.endereco_bairro || undefined
                        } : null}
                        feedData={feedData}
                        currentUserId={user?.id || ''}
                        userSchoolIds={userSchoolIds}
                    />
                )}
            </main>
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
                            className="absolute top-2 right-2 bg-white/10 hover:bg-white/20 text-white text-xl"
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
