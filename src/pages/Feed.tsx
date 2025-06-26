
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/shared/Header";
import QuickNav from "@/components/shared/QuickNav";
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
import { useFeedFilters } from "@/contexts/FeedFiltersContext";
import { ItemCard } from '@/components/shared/ItemCard';

type Escola = Tables<'escolas_inep'>;

const Feed = () => {
    const [location, setLocation] = useState<{ estado: string; cidade: string } | null>(null);
    const [shouldSearch, setShouldSearch] = useState(false);
    
    const { user } = useAuth();
    const { itens, loading, error, refetch } = useItens();
    const { favoritos, toggleFavorito, loading: favoritosLoading } = useFavoritos();
    const { entrarNaFila, isItemReservado } = useReservas();
    const { obterFilaItem } = useFilaEspera();
    const { saldo } = useCarteira();
    const { filters, updateFilters } = useFeedFilters();
    const [actionStates, setActionStates] = useActionState<Record<string, 'loading' | 'success' | 'error' | 'idle'>>({});
    const [filasInfo, setFilasInfo] = useActionState<Record<string, any>>({});

    const handleEntrarFila = async (itemId: string) => {
        setActionStates(prev => ({ ...prev, [itemId]: 'loading' }));
        
        try {
            const sucesso = await entrarNaFila(itemId);
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

    const handleFiltrosChange = (novosFiltros: any) => {
        updateFilters(novosFiltros);
    };

    // Apply filters to items - convert tamanho string to object for compatibility
    const filteredItens = itens.filter(item => {
        const matchBusca = !filters.busca || 
            item.titulo.toLowerCase().includes(filters.busca.toLowerCase()) ||
            item.descricao.toLowerCase().includes(filters.busca.toLowerCase());
        
        const matchCategoria = filters.categoria === 'todas' || item.categoria === filters.categoria;
        
        const matchSubcategoria = !filters.subcategoria || 
            ((item as any).subcategoria && (item as any).subcategoria === filters.subcategoria);
        
        const matchPreco = item.valor_girinhas >= filters.precoMin && item.valor_girinhas <= filters.precoMax;
        
        const matchGenero = filters.genero === 'todos' || 
            ((item as any).genero && (item as any).genero === filters.genero);
        
        const matchTamanho = filters.tamanho === 'todos' || 
            ((item as any).tamanho_valor && (item as any).tamanho_valor === filters.tamanho);
        
        return matchBusca && matchCategoria && matchSubcategoria && matchPreco && matchGenero && matchTamanho;
    }).sort((a, b) => {
        if (filters.ordem === "recentes") {
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        } else if (filters.ordem === "menor-preco") {
            return a.valor_girinhas - b.valor_girinhas;
        } else if (filters.ordem === "maior-preco") {
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
        <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex flex-col">
            <Header />

            <main className="flex-grow pb-32 md:pb-8">
                <div className="container mx-auto px-4 py-6">
                    {/* Hero Section */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent mb-2">
                            {location ? `Encontre Tesouros em ${location.cidade}` : 'Descubra Tesouros Incríveis'}
                        </h1>
                        <p className="text-gray-600 text-lg">
                            {location ? 'Itens compartilhados pela comunidade local' : 'Itens compartilhados pela comunidade'}
                        </p>
                    </div>

                    {/* Filtros Avançados */}
                    <AdvancedFilters 
                        filtros={{
                            busca: filters.busca,
                            categoria: filters.categoria,
                            subcategoria: filters.subcategoria,
                            genero: filters.genero,
                            tamanho: filters.tamanho,
                            preco_minimo: filters.precoMin,
                            preco_maximo: filters.precoMax
                        }} 
                        onFiltrosChange={handleFiltrosChange} 
                    />

                    {/* Grid de Itens */}
                    {loading ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            <ItemCardSkeleton count={10} />
                        </div>
                    ) : filteredItens.length === 0 ? (
                        <EmptyState 
                            type={filters.busca || filters.categoria !== "todas" || filters.genero !== "todos" || filters.tamanho !== "todos" ? "search" : "items"}
                            title={filters.busca || filters.categoria !== "todas" || filters.genero !== "todos" || filters.tamanho !== "todos" ? "Nenhum item encontrado" : "Nenhum item disponível"}
                            description={filters.busca || filters.categoria !== "todas" || filters.genero !== "todos" || filters.tamanho !== "todos" ? "Tente ajustar os filtros para encontrar mais itens." : "Seja o primeiro a compartilhar um item!"}
                            actionLabel={filters.busca || filters.categoria !== "todas" || filters.genero !== "todos" || filters.tamanho !== "todos" ? "Limpar Filtros" : "Publicar Item"}
                            onAction={() => {
                                if (filters.busca || filters.categoria !== "todas" || filters.genero !== "todos" || filters.tamanho !== "todos") {
                                    // Reset filters
                                    updateFilters({
                                        busca: '',
                                        categoria: 'todas',
                                        subcategoria: '',
                                        genero: 'todos',
                                        tamanho: 'todos',
                                        precoMin: 0,
                                        precoMax: 200
                                    });
                                }
                            }}
                            className="mx-4"
                        />
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredItens.map((item) => (
                                <ItemCard
                                    key={item.id}
                                    item={item}
                                    onItemClick={(itemId) => window.location.href = `/item/${itemId}`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <QuickNav />
        </div>
    );
};

export default Feed;
