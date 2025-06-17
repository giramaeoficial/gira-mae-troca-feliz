
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/shared/Header";
import QuickNav from "@/components/shared/QuickNav";
import LocationFilter from "@/components/shared/LocationFilter";
import AdvancedFilters from "@/components/shared/AdvancedFilters";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useItens } from "@/hooks/useItens";
import { useReservas } from "@/hooks/useReservas";
import { useFilaEspera } from "@/hooks/useFilaEspera";
import { useCarteira } from "@/hooks/useCarteira";
import { useAuth } from "@/hooks/useAuth";
import { Heart, Sparkles, Users, Clock } from "lucide-react";
import { useFavoritos } from "@/hooks/useFavoritos";
import ItemCardSkeleton from "@/components/loading/ItemCardSkeleton";
import EmptyState from "@/components/loading/EmptyState";
import ActionFeedback from "@/components/loading/ActionFeedback";
import LazyImage from "@/components/ui/lazy-image";
import { Tables } from "@/integrations/supabase/types";
import { useState as useActionState } from "react";

type Escola = Tables<'escolas_inep'>;

const Feed = () => {
    const [location, setLocation] = useState<{ estado: string; cidade: string } | null>(null);
    const [filtros, setFiltros] = useState({
        busca: "",
        categoria: "todas",
        ordem: "recentes",
        escola: null as Escola | null
    });
    const [shouldSearch, setShouldSearch] = useState(false);
    
    const { user } = useAuth();
    const { itens, loading, error, refetch } = useItens();
    const { favoritos, toggleFavorito, loading: favoritosLoading } = useFavoritos();
    const { entrarNaFila, isItemReservado } = useReservas();
    const { obterFilaItem } = useFilaEspera();
    const { saldo } = useCarteira();
    const [actionStates, setActionStates] = useActionState<Record<string, 'loading' | 'success' | 'error' | 'idle'>>({});
    const [filasInfo, setFilasInfo] = useState<Record<string, { total_fila: number; posicao_usuario: number }>>({});

    // Carregar localização do localStorage na inicialização
    useEffect(() => {
        const locationSalva = localStorage.getItem('feedLocation');
        if (locationSalva) {
            try {
                const loc = JSON.parse(locationSalva);
                console.log('Localização carregada do localStorage:', loc);
                setLocation(loc);
            } catch (error) {
                console.error('Erro ao carregar localização do localStorage:', error);
                localStorage.removeItem('feedLocation');
            }
        }
    }, []);

    // Carregar itens quando localização estiver definida e busca for solicitada
    useEffect(() => {
        if (location && shouldSearch) {
            console.log('Carregando itens para:', location);
            refetch();
            setShouldSearch(false);
        }
    }, [location, shouldSearch, refetch]);

    const handleLocationChange = (newLocation: { estado: string; cidade: string } | null) => {
        setLocation(newLocation);
        // Limpar escola selecionada quando muda localização
        setFiltros(prev => ({ ...prev, escola: null }));
    };

    const handleSearch = () => {
        if (location) {
            setShouldSearch(true);
        }
    };

    const handleFavoritar = async (itemId: string) => {
        setActionStates(prev => ({ ...prev, [itemId]: 'loading' }));
        
        try {
            await toggleFavorito(itemId);
            setActionStates(prev => ({ ...prev, [itemId]: 'success' }));
            setTimeout(() => {
                setActionStates(prev => ({ ...prev, [itemId]: 'idle' }));
            }, 1000);
        } catch (error) {
            setActionStates(prev => ({ ...prev, [itemId]: 'error' }));
            setTimeout(() => {
                setActionStates(prev => ({ ...prev, [itemId]: 'idle' }));
            }, 2000);
        }
    };

    const handleReservarItem = async (itemId: string, valorGirinhas: number) => {
        setActionStates(prev => ({ ...prev, [itemId]: 'loading' }));
        
        try {
            const sucesso = await entrarNaFila(itemId, valorGirinhas);
            if (sucesso) {
                setActionStates(prev => ({ ...prev, [itemId]: 'success' }));
                const filaInfo = await obterFilaItem(itemId);
                setFilasInfo(prev => ({ ...prev, [itemId]: filaInfo }));
            } else {
                setActionStates(prev => ({ ...prev, [itemId]: 'error' }));
            }
            setTimeout(() => {
                setActionStates(prev => ({ ...prev, [itemId]: 'idle' }));
            }, 2000);
        } catch (error) {
            setActionStates(prev => ({ ...prev, [itemId]: 'error' }));
            setTimeout(() => {
                setActionStates(prev => ({ ...prev, [itemId]: 'idle' }));
            }, 2000);
        }
    };

    const filteredItens = itens.filter(item => {
        const matchBusca = !filtros.busca || 
            item.titulo.toLowerCase().includes(filtros.busca.toLowerCase()) ||
            item.descricao.toLowerCase().includes(filtros.busca.toLowerCase());
        
        const matchCategoria = filtros.categoria === "todas" || item.categoria === filtros.categoria;
        
        // Filtro por escola - por enquanto desabilitado até implementarmos corretamente
        const matchEscola = !filtros.escola || true;
        
        return matchBusca && matchCategoria && matchEscola;
    }).sort((a, b) => {
        if (filtros.ordem === "recentes") {
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        } else if (filtros.ordem === "menor-preco") {
            return a.valor_girinhas - b.valor_girinhas;
        } else if (filtros.ordem === "maior-preco") {
            return b.valor_girinhas - a.valor_girinhas;
        }
        return 0;
    });

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
            
            {/* Filtro de Localização - Discreto no topo */}
            <div className="container mx-auto px-4 py-2 border-b bg-white/80 backdrop-blur-sm">
                <LocationFilter 
                    value={location}
                    onChange={handleLocationChange}
                />
            </div>

            <main className="container mx-auto px-4 py-6">
                {/* Hero Section - só mostra se tem localização */}
                {location && (
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent mb-2">
                            Encontre Tesouros em {location.cidade}
                        </h1>
                        <p className="text-gray-600 text-lg">
                            Descubra itens incríveis compartilhados pela comunidade
                        </p>
                    </div>
                )}

                {/* Filtros Avançados */}
                <AdvancedFilters
                    filters={filtros}
                    onFilterChange={setFiltros}
                    onSearch={handleSearch}
                    location={location}
                />

                {/* Grid de Itens - só mostra se tem localização e já fez busca */}
                {!location ? null : loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        <ItemCardSkeleton count={10} />
                    </div>
                ) : !shouldSearch && filteredItens.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500">Clique em "Buscar Itens" para ver os produtos disponíveis</p>
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
                            const filaInfo = filasInfo[item.id];
                            
                            const imagemPrincipal = item.fotos && item.fotos.length > 0 && item.fotos[0]
                                ? item.fotos[0]
                                : "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=400";
                            
                            return (
                                <Card key={item.id} className="group hover:shadow-lg transition-all duration-300 overflow-hidden bg-white border-0">
                                    
                                    <div className="relative">
                                        <Link to={`/item/${item.id}`}>
                                            <div className="aspect-square bg-gray-100 overflow-hidden">
                                                <LazyImage
                                                    src={imagemPrincipal}
                                                    alt={item.titulo}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                    size="medium"
                                                    bucket="itens"
                                                />
                                            </div>
                                        </Link>
                                        
                                        {isReserved && (
                                            <Badge className="absolute top-2 left-2 bg-orange-500 text-white text-xs">
                                                {filaInfo?.total_fila > 0 ? `Fila: ${filaInfo.total_fila}` : 'Reservado'}
                                            </Badge>
                                        )}
                                        
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm hover:bg-white p-2"
                                            onClick={() => handleFavoritar(item.id)}
                                            disabled={actionState === 'loading'}
                                        >
                                            {actionState === 'loading' || actionState === 'success' || actionState === 'error' ? (
                                                <ActionFeedback state={actionState} size="sm" />
                                            ) : (
                                                <Heart className={`w-4 h-4 ${isFavorito ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                                            )}
                                        </Button>
                                    </div>
                                    
                                    <CardContent className="p-3">
                                        <Link to={`/item/${item.id}`}>
                                            <h3 className="font-semibold text-sm mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                                                {item.titulo}
                                            </h3>
                                            <div className="flex items-center gap-2 mb-2">
                                                <Badge variant="secondary" className="text-xs">
                                                    {item.categoria}
                                                </Badge>
                                                {item.tamanho && (
                                                    <Badge variant="outline" className="text-xs">
                                                        {item.tamanho}
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-1">
                                                    <Sparkles className="w-4 h-4 text-primary" />
                                                    <span className="font-bold text-primary">
                                                        {item.valor_girinhas}
                                                    </span>
                                                </div>
                                                
                                                {item.publicado_por_profile?.cidade && (
                                                    <span className="text-xs text-gray-500">
                                                        {item.publicado_por_profile.cidade}
                                                    </span>
                                                )}
                                            </div>
                                        </Link>

                                        <div className="space-y-2">
                                            {isProprio ? (
                                                <Button size="sm" variant="outline" className="w-full text-xs" disabled>
                                                    Seu item
                                                </Button>
                                            ) : (
                                                <>
                                                    {!isReserved ? (
                                                        <Button 
                                                            size="sm" 
                                                            className="w-full text-xs bg-gradient-to-r from-primary to-pink-500"
                                                            onClick={() => handleReservarItem(item.id, Number(item.valor_girinhas))}
                                                            disabled={semSaldo || actionState === 'loading'}
                                                        >
                                                            {actionState === 'loading' ? (
                                                                <ActionFeedback state="loading" size="sm" />
                                                            ) : semSaldo ? (
                                                                'Saldo insuficiente'
                                                            ) : (
                                                                <>
                                                                    <Sparkles className="w-3 h-3 mr-1" />
                                                                    Reservar
                                                                </>
                                                            )}
                                                        </Button>
                                                    ) : (
                                                        <Button 
                                                            size="sm" 
                                                            variant="outline"
                                                            className="w-full text-xs"
                                                            onClick={() => handleReservarItem(item.id, Number(item.valor_girinhas))}
                                                            disabled={semSaldo || actionState === 'loading'}
                                                        >
                                                            {actionState === 'loading' ? (
                                                                <ActionFeedback state="loading" size="sm" />
                                                            ) : filaInfo?.posicao_usuario > 0 ? (
                                                                <>
                                                                    <Clock className="w-3 h-3 mr-1" />
                                                                    Posição {filaInfo.posicao_usuario}
                                                                </>
                                                            ) : semSaldo ? (
                                                                'Saldo insuficiente'
                                                            ) : (
                                                                <>
                                                                    <Users className="w-3 h-3 mr-1" />
                                                                    Entrar na fila
                                                                </>
                                                            )}
                                                        </Button>
                                                    )}
                                                    
                                                    <Button asChild size="sm" variant="ghost" className="w-full text-xs">
                                                        <Link to={`/item/${item.id}`}>
                                                            Ver detalhes
                                                        </Link>
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </CardContent>
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
