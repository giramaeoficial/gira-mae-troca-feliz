
import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/shared/Header";
import QuickNav from "@/components/shared/QuickNav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useItens } from "@/hooks/useItens";
import { Heart, Search, Filter, Sparkles } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFavoritos } from "@/hooks/useFavoritos";
import ItemCardSkeleton from "@/components/loading/ItemCardSkeleton";
import EmptyState from "@/components/loading/EmptyState";
import ActionFeedback from "@/components/loading/ActionFeedback";
import { useState as useActionState } from "react";

const Feed = () => {
    const [filtros, setFiltros] = useState({
        busca: "",
        categoria: "todas",
        ordem: "recentes"
    });
    
    const { itens, loading, error } = useItens();
    const { favoritos, toggleFavorito, loading: favoritosLoading } = useFavoritos();
    const [actionStates, setActionStates] = useActionState<Record<string, 'loading' | 'success' | 'error' | 'idle'>>({});

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

    const filteredItens = itens.filter(item => {
        const matchBusca = !filtros.busca || 
            item.titulo.toLowerCase().includes(filtros.busca.toLowerCase()) ||
            item.descricao.toLowerCase().includes(filtros.busca.toLowerCase());
        
        const matchCategoria = filtros.categoria === "todas" || item.categoria === filtros.categoria;
        
        return matchBusca && matchCategoria;
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
                    onAction={() => window.location.reload()}
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
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                    placeholder="Buscar por título ou descrição..."
                                    value={filtros.busca}
                                    onChange={(e) => setFiltros({...filtros, busca: e.target.value})}
                                    className="pl-10 h-12"
                                />
                            </div>
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
                            <Select value={filtros.ordem} onValueChange={(value) => setFiltros({...filtros, ordem: value})}>
                                <SelectTrigger className="w-full md:w-48 h-12">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="recentes">Mais Recentes</SelectItem>
                                    <SelectItem value="menor-preco">Menor Preço</SelectItem>
                                    <SelectItem value="maior-preco">Maior Preço</SelectItem>
                                </SelectContent>
                            </Select>
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
                        type={filtros.busca || filtros.categoria !== "todas" ? "search" : "items"}
                        onAction={() => {
                            if (filtros.busca || filtros.categoria !== "todas") {
                                setFiltros({ busca: "", categoria: "todas", ordem: "recentes" });
                            }
                        }}
                    />
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {filteredItens.map((item) => {
                            const isFavorito = favoritos.some(fav => fav.item_id === item.id);
                            const actionState = actionStates[item.id] || 'idle';
                            
                            return (
                                <Card key={item.id} className="group hover:shadow-lg transition-all duration-300 overflow-hidden bg-white border-0">
                                    <div className="relative">
                                        <Link to={`/item/${item.id}`}>
                                            <div className="aspect-square bg-gray-100 overflow-hidden">
                                                {item.fotos && item.fotos.length > 0 ? (
                                                    <img 
                                                        src={item.fotos[0]} 
                                                        alt={item.titulo}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                        <span className="text-4xl">📷</span>
                                                    </div>
                                                )}
                                            </div>
                                        </Link>
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
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-1">
                                                    <Sparkles className="w-4 h-4 text-primary" />
                                                    <span className="font-bold text-primary">
                                                        {item.valor_girinhas}
                                                    </span>
                                                </div>
                                                <Button size="sm" className="h-7 px-3 text-xs">
                                                    Ver
                                                </Button>
                                            </div>
                                        </Link>
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
