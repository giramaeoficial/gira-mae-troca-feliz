import Header from "@/components/shared/Header";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Sparkles, MapPin, Baby, Shirt, Car, Gamepad2, BookOpen, Heart, Users, Clock, Filter } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { useReservas } from "@/hooks/useReservas";
import { useCarteira } from "@/hooks/useCarteira";
import { useItens } from "@/hooks/useItens";
import { useAuth } from "@/hooks/useAuth";
import { useFilaEspera } from "@/hooks/useFilaEspera";
import { useFavoritos } from "@/hooks/useFavoritos";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tables } from "@/integrations/supabase/types";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import LazyImage from "@/components/ui/lazy-image";

type ItemComPerfil = Tables<'itens'> & {
  profiles?: {
    nome: string;
    bairro: string | null;
    cidade: string | null;
  } | null;
};

const categorias = [
  { value: "todas", label: "Todas", icon: Heart },
  { value: "roupa", label: "Roupas", icon: Shirt },
  { value: "brinquedo", label: "Brinquedos", icon: Gamepad2 },
  { value: "calcado", label: "Calçados", icon: Baby },
  { value: "acessorio", label: "Acessórios", icon: Car },
  { value: "kit", label: "Kits", icon: BookOpen },
  { value: "outro", label: "Outros", icon: Heart }
];

const Feed = () => {
    const { toast } = useToast();
    const { user } = useAuth();
    const { entrarNaFila, isItemReservado } = useReservas();
    const { saldo } = useCarteira();
    const { buscarTodosItens, loading } = useItens();
    const { obterFilasMultiplos, getFilaInfo } = useFilaEspera();
    const { verificarSeFavorito, toggleFavorito } = useFavoritos();
    const isMobile = useIsMobile();
    const [searchTerm, setSearchTerm] = useState("");
    const [categoriaFiltro, setCategoriaFiltro] = useState("todas");
    const [mostrarFavoritos, setMostrarFavoritos] = useState(false);
    const [itens, setItens] = useState<ItemComPerfil[]>([]);
    const [filtersOpen, setFiltersOpen] = useState(false);

    useEffect(() => {
        carregarItens();
    }, []);

    const carregarItens = async () => {
        const itensData = await buscarTodosItens();
        console.log('Itens carregados no Feed:', itensData);
        setItens(itensData as ItemComPerfil[]);
        
        // Carregar informações de fila para todos os itens
        const itemIds = itensData.map(item => item.id);
        await obterFilasMultiplos(itemIds);
    };

    const handleReservar = async (item: ItemComPerfil) => {
        // Verificar se é o próprio item
        if (item.publicado_por === user?.id) {
            toast({
                title: "Não é possível reservar",
                description: "Você não pode reservar seu próprio item.",
                variant: "destructive",
            });
            return;
        }

        // Usar a nova função que lida com fila de espera
        const sucesso = await entrarNaFila(item.id, Number(item.valor_girinhas));
        if (sucesso) {
            // Recarregar itens para atualizar status
            await carregarItens();
        }
    };

    const handleToggleFavorito = async (itemId: string, event: React.MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();
        await toggleFavorito(itemId);
    };

    const filteredItems = itens.filter(item => {
        // Não mostrar itens vendidos
        if (item.status === 'vendido') {
            return false;
        }

        // Filtro de favoritos
        if (mostrarFavoritos && !verificarSeFavorito(item.id)) {
            return false;
        }

        const matchesSearch = item.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (item.tamanho && item.tamanho.toLowerCase().includes(searchTerm.toLowerCase())) ||
                            (item.profiles?.bairro && item.profiles.bairro.toLowerCase().includes(searchTerm.toLowerCase())) ||
                            (item.profiles?.cidade && item.profiles.cidade.toLowerCase().includes(searchTerm.toLowerCase())) ||
                            item.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.descricao.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesCategory = categoriaFiltro === "todas" || 
                              item.categoria === categoriaFiltro;
        
        return matchesSearch && matchesCategory;
    });

    const getCategoryIcon = (categoria: string) => {
        const cat = categorias.find(c => c.value === categoria.toLowerCase());
        return cat ? cat.icon : Heart;
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

    const FiltersContent = () => (
        <>
            <div className="space-y-4">
                <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Categoria</label>
                    <Select value={categoriaFiltro} onValueChange={setCategoriaFiltro}>
                        <SelectTrigger className="w-full bg-white border-primary/20">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {categorias.map((categoria) => {
                                const Icon = categoria.icon;
                                return (
                                    <SelectItem key={categoria.value} value={categoria.value}>
                                        <div className="flex items-center gap-2">
                                            <Icon className="w-4 h-4" />
                                            {categoria.label}
                                        </div>
                                    </SelectItem>
                                );
                            })}
                        </SelectContent>
                    </Select>
                </div>
                
                <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Visualização</label>
                    <Button
                        variant={mostrarFavoritos ? "default" : "outline"}
                        onClick={() => setMostrarFavoritos(!mostrarFavoritos)}
                        className="w-full justify-start"
                    >
                        <Heart className={`w-4 h-4 mr-2 ${mostrarFavoritos ? 'fill-current' : ''}`} />
                        {mostrarFavoritos ? 'Mostrando favoritos' : 'Mostrar favoritos'}
                    </Button>
                </div>
            </div>
        </>
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 text-foreground flex flex-col pb-24 md:pb-8">
                <Header />
                <main className="flex-grow container mx-auto px-4 py-4">
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                            <p className="text-gray-600">Carregando itens...</p>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 text-foreground flex flex-col pb-24 md:pb-8">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-4">
                {/* Header compacto mobile-first */}
                <div className="mb-6">
                    <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent mb-2">
                        Itens para Troca
                    </h1>
                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-sm text-gray-500">Saldo:</span>
                        <div className="flex items-center gap-1 text-primary font-bold">
                            <Sparkles className="w-4 h-4" />
                            <span>{saldo} Girinhas</span>
                        </div>
                    </div>
                </div>

                {/* Barra de busca e filtros mobile-first */}
                <div className="mb-6 space-y-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Buscar itens..." 
                            className="pl-10 bg-white/80 backdrop-blur-sm border-primary/20 focus:border-primary h-12 text-base" 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    <div className="flex gap-2">
                        {isMobile ? (
                            <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
                                <SheetTrigger asChild>
                                    <Button variant="outline" className="flex-1 bg-white/80 backdrop-blur-sm border-primary/20 h-12">
                                        <Filter className="w-4 h-4 mr-2" />
                                        Filtros
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="bottom" className="h-[400px]">
                                    <SheetHeader>
                                        <SheetTitle>Filtros</SheetTitle>
                                    </SheetHeader>
                                    <div className="mt-6">
                                        <FiltersContent />
                                    </div>
                                </SheetContent>
                            </Sheet>
                        ) : (
                            <>
                                <Select value={categoriaFiltro} onValueChange={setCategoriaFiltro}>
                                    <SelectTrigger className="w-48 bg-white/80 backdrop-blur-sm border-primary/20">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categorias.map((categoria) => {
                                            const Icon = categoria.icon;
                                            return (
                                                <SelectItem key={categoria.value} value={categoria.value}>
                                                    <div className="flex items-center gap-2">
                                                        <Icon className="w-4 h-4" />
                                                        {categoria.label}
                                                    </div>
                                                </SelectItem>
                                            );
                                        })}
                                    </SelectContent>
                                </Select>
                                <Button
                                    variant={mostrarFavoritos ? "default" : "outline"}
                                    onClick={() => setMostrarFavoritos(!mostrarFavoritos)}
                                    className="bg-white/80 backdrop-blur-sm border-primary/20"
                                >
                                    <Heart className={`w-4 h-4 mr-2 ${mostrarFavoritos ? 'fill-current' : ''}`} />
                                    {mostrarFavoritos ? 'Favoritos' : 'Todos'}
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {/* Grid otimizado para mobile */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
                    {filteredItems.map(item => {
                        const isReserved = item.status === 'reservado';
                        const filaInfo = getFilaInfo(item.id);
                        const isProprio = item.publicado_por === user?.id;
                        const semSaldo = saldo < Number(item.valor_girinhas);
                        const CategoryIcon = getCategoryIcon(item.categoria);
                        const imagemPrincipal = item.fotos?.[0] || "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=300";
                        const localizacao = item.profiles?.bairro || item.profiles?.cidade || "Localização não informada";
                        const nomeMae = item.profiles?.nome || "Usuário";
                        const ehFavorito = verificarSeFavorito(item.id);
                        
                        return (
                            <Card key={item.id} className="overflow-hidden shadow-md hover:shadow-lg transition-all duration-200 flex flex-col border-0 bg-white/90 backdrop-blur-sm">
                                <CardHeader className="p-0 relative">
                                    <div className="aspect-square relative">
                                        <LazyImage
                                            src={imagemPrincipal}
                                            alt={item.titulo}
                                            size="medium"
                                            className="w-full h-full object-cover"
                                            placeholder="Carregando..."
                                        />
                                    </div>
                                    
                                    {/* Status badges compactos */}
                                    <div className="absolute top-1 right-1 flex flex-col gap-1">
                                        {filaInfo.total_fila > 0 && (
                                            <Badge className="bg-blue-500 text-white text-xs px-1 py-0 h-5 flex items-center">
                                                <Users className="w-2.5 h-2.5 mr-1" />
                                                {filaInfo.total_fila}
                                            </Badge>
                                        )}
                                        {isProprio && (
                                            <Badge className="bg-purple-500 text-white text-xs px-1 py-0 h-5">
                                                Seu
                                            </Badge>
                                        )}
                                    </div>
                                    
                                    {/* Estado e categoria */}
                                    <div className="absolute top-1 left-1">
                                        <Badge variant="secondary" className="bg-primary/10 text-primary text-xs px-1 py-0 h-5">
                                            {item.estado_conservacao === 'novo' ? 'Novo' : 
                                             item.estado_conservacao === 'otimo' ? 'Ótimo' :
                                             item.estado_conservacao === 'bom' ? 'Bom' : 'OK'}
                                        </Badge>
                                    </div>
                                    
                                    {/* Botão favorito */}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="absolute bottom-1 right-1 h-7 w-7 p-0 bg-white/90 hover:bg-white rounded-full shadow-sm"
                                        onClick={(e) => handleToggleFavorito(item.id, e)}
                                    >
                                        <Heart className={`h-3.5 w-3.5 ${ehFavorito ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} />
                                    </Button>
                                </CardHeader>
                                
                                <CardContent className="p-3 flex-grow">
                                    <CardTitle className="text-sm font-semibold mb-2 text-gray-800 line-clamp-2 leading-tight min-h-[2.5rem]">
                                        {item.titulo}
                                    </CardTitle>
                                    
                                    <div className="space-y-1">
                                        {item.tamanho && (
                                            <p className="text-xs text-gray-600">
                                                <span className="font-medium">Tamanho:</span> {item.tamanho}
                                            </p>
                                        )}
                                        <div className="flex items-center gap-1">
                                            <MapPin className="w-3 h-3 text-gray-400" />
                                            <span className="text-xs text-gray-500 truncate">{localizacao}</span>
                                        </div>
                                        <p className="text-xs text-primary font-medium truncate">Por {nomeMae}</p>
                                    </div>
                                </CardContent>
                                
                                <CardFooter className="p-3 pt-0">
                                    <div className="w-full space-y-2">
                                        {/* Preço em destaque */}
                                        <div className="flex items-center justify-center">
                                            <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${semSaldo && !isProprio ? 'bg-red-50 text-red-600' : 'bg-primary/10 text-primary'}`}>
                                                <Sparkles className="w-4 h-4" />
                                                <span className="font-bold text-sm">{item.valor_girinhas}</span>
                                            </div>
                                        </div>
                                        
                                        {/* Botões */}
                                        <div className="flex gap-1">
                                            <Button 
                                                size="sm" 
                                                variant="outline"
                                                asChild
                                                className="flex-1 h-8 text-xs"
                                            >
                                                <Link to={`/item/${item.id}`}>Ver</Link>
                                            </Button>
                                            <Button 
                                                size="sm"
                                                onClick={() => handleReservar(item)}
                                                disabled={isProprio}
                                                className={`
                                                    flex-2 h-8 text-xs
                                                    ${isProprio ? "opacity-50 cursor-not-allowed" : ""}
                                                    ${semSaldo && !isProprio ? "bg-red-500 hover:bg-red-600" : "bg-gradient-to-r from-primary to-pink-500 hover:from-primary/90 hover:to-pink-500/90"}
                                                `}
                                                title={isProprio ? "Seu próprio item" : semSaldo ? "Saldo insuficiente" : ""}
                                            >
                                                {isProprio ? 'Seu' : 
                                                 filaInfo.posicao_usuario > 0 ? `${filaInfo.posicao_usuario}º` :
                                                 isReserved ? 'Fila' : 
                                                 semSaldo ? 'Sem $' : 'Reservar'}
                                            </Button>
                                        </div>
                                    </div>
                                </CardFooter>
                            </Card>
                        );
                    })}
                </div>

                {/* Empty state */}
                {!loading && filteredItems.length === 0 && (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            {mostrarFavoritos ? (
                                <Heart className="w-8 h-8 text-primary" />
                            ) : (
                                <Search className="w-8 h-8 text-primary" />
                            )}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                            {mostrarFavoritos ? "Nenhum favorito" : "Nenhum item encontrado"}
                        </h3>
                        <p className="text-gray-600 text-sm px-4">
                            {mostrarFavoritos 
                                ? "Você ainda não favoritou nenhum item. Clique no coração!"
                                : itens.length === 0 
                                    ? "Ainda não há itens publicados." 
                                    : "Tente ajustar sua busca ou filtros."
                            }
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Feed;
