import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/shared/Header";
import QuickNav from "@/components/shared/QuickNav";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useItens } from "@/hooks/useItens";
import { useReservas } from "@/hooks/useReservas";
import { useFilaEspera } from "@/hooks/useFilaEspera";
import { useCarteira } from "@/hooks/useCarteira";
import { useAuth } from "@/hooks/useAuth";
import { Heart, Search, Sparkles, Users, Clock, MapPin } from "lucide-react";
import { useFavoritos } from "@/hooks/useFavoritos";
import ItemCardSkeleton from "@/components/loading/ItemCardSkeleton";
import EmptyState from "@/components/loading/EmptyState";
import ActionFeedback from "@/components/loading/ActionFeedback";
import LazyImage from "@/components/ui/lazy-image";
import EscolaFilter from "@/components/escolas/EscolaFilter";
import { useFilhosPorEscola } from "@/hooks/useFilhosPorEscola";
import { Tables } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";

type Escola = Tables<'escolas_inep'>;

type ItemComPerfil = Tables<'itens'> & {
  profiles?: {
    nome: string;
    bairro: string | null;
    cidade: string | null;
  } | null;
};

const Feed = () => {
    const { toast } = useToast();
    const [filtros, setFiltros] = useState({
        busca: "",
        categoria: "todas",
        ordem: "recentes",
        escola: null as Escola | null
    });
    
    const [actionStates, setActionStates] = useState<Record<string, 'idle' | 'loading' | 'success' | 'error'>>({});
    const [filasInfo, setFilasInfo] = useState<Record<string, { posicao_usuario: number; total_fila: number }>>({});
    
    const { user } = useAuth();
    const { itens, loading, error, refetch } = useItens();
    const { favoritos, toggleFavorito, loading: favoritosLoading } = useFavoritos();
    const { entrarNaFila, isItemReservado } = useReservas();
    const { obterFilaItem } = useFilaEspera();
    const { saldo } = useCarteira();
    const { temFilhoNaEscola } = useFilhosPorEscola();

    // Carregar informações das filas quando os itens mudarem
    useEffect(() => {
        if (itens.length > 0) {
            carregarFilasInfo();
        }
    }, [itens]);

    const carregarFilasInfo = async () => {
        const novasFilas: Record<string, { posicao_usuario: number; total_fila: number }> = {};
        
        for (const item of itens) {
            try {
                const filaInfo = await obterFilaItem(item.id);
                novasFilas[item.id] = {
                    posicao_usuario: filaInfo.posicao_usuario || 0,
                    total_fila: filaInfo.total_fila || 0
                };
            } catch (error) {
                console.error(`Erro ao obter fila do item ${item.id}:`, error);
                novasFilas[item.id] = { posicao_usuario: 0, total_fila: 0 };
            }
        }
        
        setFilasInfo(novasFilas);
    };

    const handleReservar = async (item: ItemComPerfil) => {
        if (!user) {
            toast({
                title: "Login necessário",
                description: "Faça login para reservar itens",
                variant: "destructive",
            });
            return;
        }

        if (item.publicado_por === user.id) {
            toast({
                title: "Não é possível reservar",
                description: "Você não pode reservar seu próprio item.",
                variant: "destructive",
            });
            return;
        }

        if (saldo < Number(item.valor_girinhas)) {
            toast({
                title: "Saldo insuficiente",
                description: `Você precisa de ${item.valor_girinhas} Girinhas para reservar este item.`,
                variant: "destructive",
            });
            return;
        }

        setActionStates(prev => ({ ...prev, [item.id]: 'loading' }));

        try {
            const sucesso = await entrarNaFila(item.id, Number(item.valor_girinhas));
            if (sucesso) {
                setActionStates(prev => ({ ...prev, [item.id]: 'success' }));
                await carregarFilasInfo(); // Recarregar informações das filas
                await refetch(); // Recarregar itens
            } else {
                setActionStates(prev => ({ ...prev, [item.id]: 'error' }));
            }
        } catch (error) {
            console.error('Erro ao reservar item:', error);
            setActionStates(prev => ({ ...prev, [item.id]: 'error' }));
        }

        // Reset do estado após 2 segundos
        setTimeout(() => {
            setActionStates(prev => ({ ...prev, [item.id]: 'idle' }));
        }, 2000);
    };

    const handleToggleFavorito = async (itemId: string, event: React.MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();
        await toggleFavorito(itemId);
    };

    // Aplicar filtros
    const filteredItens = itens.filter(item => {
        // Não mostrar itens vendidos
        if (item.status === 'vendido') {
            return false;
        }

        // Filtro de busca - incluindo cidade/bairro do perfil
        const matchBusca = !filtros.busca || 
            item.titulo.toLowerCase().includes(filtros.busca.toLowerCase()) ||
            item.descricao.toLowerCase().includes(filtros.busca.toLowerCase()) ||
            (item.tamanho && item.tamanho.toLowerCase().includes(filtros.busca.toLowerCase())) ||
            (item.profiles?.bairro && item.profiles.bairro.toLowerCase().includes(filtros.busca.toLowerCase())) ||
            (item.profiles?.cidade && item.profiles.cidade.toLowerCase().includes(filtros.busca.toLowerCase())) ||
            item.categoria.toLowerCase().includes(filtros.busca.toLowerCase());
        
        // Filtro de categoria
        const matchCategoria = filtros.categoria === "todas" || item.categoria === filtros.categoria;
        
        // Filtro por escola (implementação básica - pode ser expandida)
        const matchEscola = !filtros.escola || temFilhoNaEscola(filtros.escola.codigo_inep);
        
        return matchBusca && matchCategoria && matchEscola;
    }).sort((a, b) => {
        // Aplicar ordenação
        if (filtros.ordem === "recentes") {
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        } else if (filtros.ordem === "menor-preco") {
            return a.valor_girinhas - b.valor_girinhas;
        } else if (filtros.ordem === "maior-preco") {
            return b.valor_girinhas - a.valor_girinhas;
        }
        return 0;
    });

    const getCategoryIcon = (categoria: string) => {
        const icons: Record<string, string> = {
            roupa: "👗",
            brinquedo: "🧸",
            calcado: "👟",
            acessorio: "🎀",
            kit: "📦",
            outro: "🔖"
        };
        return icons[categoria] || "🔖";
    };

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 pb-24">
                <Header />
                <EmptyState 
                    type="generic" 
                    title="Erro ao carregar itens"
                    description={error}
                    actionLabel="Tentar Novamente"
                    onAction={() => refetch()}
                    className="mx-4 mt-8"
                />
                <QuickNav />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 pb-24">
            <Header />
            <main className="container mx-auto px-4 py-6">
                {/* Hero Section */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent mb-2">
                        Encontre Tesouros 
                    </h1>
                    <p className="text-gray-600 text-lg">
                        Descubra itens incríveis compartilhados pela comunidade
                    </p>
                </div>

                {/* Filtros */}
                <Card className="mb-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                    <CardContent className="p-4">
                        <div className="space-y-4">
                            {/* Campo de busca */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                    placeholder="Buscar por título, descrição, categoria, cidade..."
                                    value={filtros.busca}
                                    onChange={(e) => setFiltros({...filtros, busca: e.target.value})}
                                    className="pl-10 h-12"
                                />
                            </div>
                            
                            {/* Filtros de categoria, escola e ordenação */}
                            <div className="flex flex-col md:flex-row gap-4">
                                <Select value={filtros.categoria} onValueChange={(value) => setFiltros({...filtros, categoria: value})}>
                                    <SelectTrigger className="w-full md:w-48 h-12">
                                        <SelectValue placeholder="Categoria" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="todas">Todas</SelectItem>
                                        <SelectItem value="roupa">👗 Roupa</SelectItem>
                                        <SelectItem value="brinquedo">🧸 Brinquedo</SelectItem>
                                        <SelectItem value="calcado">👟 Calçado</SelectItem>
                                        <SelectItem value="acessorio">🎀 Acessório</SelectItem>
                                        <SelectItem value="kit">📦 Kit</SelectItem>
                                        <SelectItem value="outro">🔖 Outro</SelectItem>
                                    </SelectContent>
                                </Select>
                                
                                <EscolaFilter 
                                    value={filtros.escola}
                                    onChange={(escola) => setFiltros({...filtros, escola})}
                                />
                                
                                <Select value={filtros.ordem} onValueChange={(value) => setFiltros({...filtros, ordem: value})}>
                                    <SelectTrigger className="w-full md:w-48 h-12">
                                        <SelectValue placeholder="Ordenar por" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="recentes">Mais Recentes</SelectItem>
                                        <SelectItem value="menor-preco">Menor Preço</SelectItem>
                                        <SelectItem value="maior-preco">Maior Preço</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Grid de Itens */}
                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        <ItemCardSkeleton count={10} />
                    </div>
                ) : filteredItens.length === 0 ? (
                    <EmptyState 
                        type={filtros.busca || filtros.categoria !== "todas" || filtros.escola ? "search" : "items"}
                        onAction={() => {
                            if (filtros.busca || filtros.categoria !== "todas" || filtros.escola) {
                                setFiltros({ busca: "", categoria: "todas", ordem: "recentes", escola: null });
                            }
                        }}
                    />
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {filteredItens.map((item) => {
                            const isFavorito = favoritos.some(fav => fav.item_id === item.id);
                            const actionState = actionStates[item.id] || 'idle';
                            const isReserved = isItemReservado(item.id) || item.status === 'reservado';
                            const isProprio = item.publicado_por === user?.id;
                            const semSaldo = saldo < Number(item.valor_girinhas);
                            const filaInfo = filasInfo[item.id] || { posicao_usuario: 0, total_fila: 0 };
                            
                            // Garantir que sempre temos uma imagem válida
                            const imagemPrincipal = item.fotos && item.fotos.length > 0 && item.fotos[0]
                                ? item.fotos[0]
                                : 'https://via.placeholder.com/300x300?text=Sem+Imagem';
                            
                            return (
                                <Card key={item.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white border-gray-200">
                                    <div className="relative overflow-hidden rounded-t-lg">
                                        <Link to={`/item/${item.id}`}>
                                            <LazyImage
                                                src={imagemPrincipal}
                                                alt={item.titulo}
                                                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        </Link>
                                        
                                        {/* Badge de categoria */}
                                        <Badge 
                                            variant="secondary" 
                                            className="absolute top-2 left-2 bg-white/90 text-gray-700"
                                        >
                                            {getCategoryIcon(item.categoria)} {item.categoria}
                                        </Badge>
                                        
                                        {/* Botão de favorito */}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="absolute top-2 right-2 h-8 w-8 p-0 bg-white/90 hover:bg-white"
                                            onClick={(e) => handleToggleFavorito(item.id, e)}
                                            disabled={favoritosLoading}
                                        >
                                            <Heart 
                                                className={`w-4 h-4 ${isFavorito ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} 
                                            />
                                        </Button>
                                        
                                        {/* Status badges */}
                                        {isReserved && (
                                            <Badge className="absolute bottom-2 left-2 bg-yellow-500 text-white">
                                                <Clock className="w-3 h-3 mr-1" />
                                                Reservado
                                            </Badge>
                                        )}
                                    </div>
                                    
                                    <CardContent className="p-3">
                                        <Link to={`/item/${item.id}`}>
                                            <h3 className="font-semibold text-gray-800 mb-1 line-clamp-2 min-h-[2.5rem] group-hover:text-primary transition-colors">
                                                {item.titulo}
                                            </h3>
                                        </Link>
                                        
                                        {/* Localização */}
                                        {item.profiles && (
                                            <div className="flex items-center text-xs text-gray-500 mb-2">
                                                <MapPin className="w-3 h-3 mr-1" />
                                                <span>
                                                    {[item.profiles.bairro, item.profiles.cidade]
                                                        .filter(Boolean)
                                                        .join(', ') || 'Localização não informada'}
                                                </span>
                                            </div>
                                        )}

                                        {/* Tamanho se existir */}
                                        {item.tamanho && (
                                            <Badge variant="outline" className="text-xs mb-2">
                                                Tamanho: {item.tamanho}
                                            </Badge>
                                        )}

                                        {/* Preço */}
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-1">
                                                <Sparkles className="w-4 h-4 text-yellow-500" />
                                                <span className="font-bold text-lg text-primary">
                                                    {item.valor_girinhas}
                                                </span>
                                            </div>
                                            
                                            {/* Info da fila */}
                                            {filaInfo.total_fila > 0 && (
                                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                                    <Users className="w-3 h-3" />
                                                    <span>{filaInfo.total_fila}</span>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                    
                                    <CardFooter className="p-3 pt-0">
                                        <div className="w-full">
                                            <ActionFeedback state={actionState} />
                                            <Button
                                                className={`w-full transition-all duration-200 ${
                                                    isProprio || semSaldo ? "opacity-50 cursor-not-allowed" : ""
                                                } ${
                                                    semSaldo && !isProprio 
                                                        ? "bg-red-500 hover:bg-red-600" 
                                                        : "bg-gradient-to-r from-primary to-pink-500 hover:from-primary/90 hover:to-pink-500/90"
                                                }`}
                                                onClick={() => handleReservar(item)}
                                                disabled={isProprio || actionState === 'loading'}
                                                title={isProprio ? "Seu próprio item" : semSaldo ? "Saldo insuficiente" : ""}
                                            >
                                                {isProprio ? 'Seu item' : 
                                                 filaInfo.posicao_usuario > 0 ? `Na fila (${filaInfo.posicao_usuario}º)` :
                                                 isReserved ? (filaInfo.total_fila > 0 ? `Entrar na fila (${filaInfo.total_fila + 1}º)` : 'Entrar na fila') : 
                                                 semSaldo ? 'Sem saldo' : 'Reservar'}
                                            </Button>
                                        </div>
                                    </CardFooter>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </main>
            <QuickNav />
        </div>
    );
};

export default Feed;