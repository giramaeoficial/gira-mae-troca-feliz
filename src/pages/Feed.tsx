
import Header from "@/components/shared/Header";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Sparkles, MapPin, Baby, Shirt, Car, Gamepad2, BookOpen, Heart, Users, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { useReservas } from "@/hooks/useReservas";
import { useCarteira } from "@/hooks/useCarteira";
import { useItens } from "@/hooks/useItens";
import { useAuth } from "@/hooks/useAuth";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tables } from "@/integrations/supabase/types";

type ItemComPerfil = Tables<'itens'> & {
  profiles?: {
    nome: string;
    bairro: string | null;
    cidade: string | null;
  } | null;
};

const categorias = [
  { value: "todas", label: "Todas as categorias", icon: Heart },
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
    const { entrarNaFila, isItemReservado, getFilaEspera } = useReservas();
    const { saldo } = useCarteira();
    const { buscarTodosItens, loading } = useItens();
    const [searchTerm, setSearchTerm] = useState("");
    const [categoriaFiltro, setCategoriaFiltro] = useState("todas");
    const [itens, setItens] = useState<ItemComPerfil[]>([]);

    useEffect(() => {
        carregarItens();
    }, []);

    const carregarItens = async () => {
        const itensData = await buscarTodosItens();
        console.log('Itens carregados no Feed:', itensData);
        setItens(itensData as ItemComPerfil[]);
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

    // Mostrar todos os itens exceto os vendidos (vendido é diferente de reservado)
    const filteredItems = itens.filter(item => {
        // Não mostrar itens vendidos
        if (item.status === 'vendido') {
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

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 text-foreground flex flex-col pb-24 md:pb-8">
                <Header />
                <main className="flex-grow container mx-auto px-4 py-8">
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
            <main className="flex-grow container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent mb-2">
                            Itens Infantis para Troca
                        </h1>
                        <p className="text-gray-600">Descubra itens incríveis para seu pequeno, compartilhados pela nossa comunidade de mães</p>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="text-sm text-gray-500">Seu saldo:</span>
                            <div className="flex items-center gap-1 text-primary font-bold">
                                <Sparkles className="w-4 h-4" />
                                <span>{saldo} Girinhas</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input 
                                placeholder="Buscar por item, tamanho, localização..." 
                                className="pl-10 bg-white/80 backdrop-blur-sm border-primary/20 focus:border-primary" 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Select value={categoriaFiltro} onValueChange={setCategoriaFiltro}>
                            <SelectTrigger className="w-full md:w-48 bg-white/80 backdrop-blur-sm border-primary/20">
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
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredItems.map(item => {
                        const isReserved = item.status === 'reservado';
                        const filaEspera = getFilaEspera(item.id);
                        const isProprio = item.publicado_por === user?.id;
                        const semSaldo = saldo < Number(item.valor_girinhas);
                        const CategoryIcon = getCategoryIcon(item.categoria);
                        const imagemPrincipal = item.fotos?.[0] || "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=300";
                        const localizacao = item.profiles?.bairro || item.profiles?.cidade || "Localização não informada";
                        const nomeMae = item.profiles?.nome || "Usuário";
                        
                        return (
                            <Card key={item.id} className="overflow-hidden shadow-lg transform hover:-translate-y-1 transition-all duration-300 flex flex-col border-0 bg-white/80 backdrop-blur-sm">
                                <CardHeader className="p-0 relative">
                                    <img src={imagemPrincipal} alt={item.titulo} className="w-full h-48 object-cover" />
                                    <div className="absolute top-2 right-2 flex flex-col gap-1">
                                        <Badge className={`${isReserved ? 'bg-orange-500' : 'bg-green-500'} text-white`}>
                                            {isReserved ? 'Reservado' : 'Disponível'}
                                        </Badge>
                                        {filaEspera > 0 && (
                                            <Badge className="bg-blue-500 text-white text-xs flex items-center gap-1">
                                                <Users className="w-3 h-3" />
                                                {filaEspera} na fila
                                            </Badge>
                                        )}
                                        {isProprio && (
                                            <Badge className="bg-purple-500 text-white text-xs">
                                                Seu item
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                                        <Badge variant="secondary" className="bg-primary/10 text-primary">
                                            {formatarEstado(item.estado_conservacao)}
                                        </Badge>
                                        <Badge variant="outline" className="bg-white/90 text-gray-700 text-xs">
                                            <CategoryIcon className="w-3 h-3 mr-1" />
                                            {formatarCategoria(item.categoria)}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-4 flex-grow">
                                    <CardTitle className="text-lg mb-2 text-gray-800 line-clamp-2">{item.titulo}</CardTitle>
                                    <div className="space-y-1 text-sm text-gray-600">
                                        {item.tamanho && <p><strong>Tamanho:</strong> {item.tamanho}</p>}
                                        <p className="text-xs text-gray-500 line-clamp-2">{item.descricao}</p>
                                        <div className="flex items-center gap-1 pt-1">
                                            <MapPin className="w-3 h-3" />
                                            <span className="text-xs">{localizacao}</span>
                                        </div>
                                        <p className="text-primary font-medium text-sm">Por {nomeMae}</p>
                                    </div>
                                </CardContent>
                                <CardFooter className="p-4 bg-muted/20">
                                    <div className="flex justify-between items-center w-full">
                                        <p className={`font-bold flex items-center gap-1 ${semSaldo && !isProprio ? 'text-red-500' : 'text-primary'}`}>
                                            <Sparkles className="w-4 h-4" />
                                            {item.valor_girinhas}
                                        </p>
                                        <div className="flex gap-2">
                                            <Button 
                                                size="sm" 
                                                variant="outline"
                                                asChild
                                            >
                                                <Link to={`/item/${item.id}`}>Ver</Link>
                                            </Button>
                                            <Button 
                                                size="sm"
                                                onClick={() => handleReservar(item)}
                                                disabled={isProprio}
                                                className={`
                                                    ${isProprio ? "opacity-50 cursor-not-allowed" : ""}
                                                    ${semSaldo && !isProprio ? "bg-red-500 hover:bg-red-600" : "bg-gradient-to-r from-primary to-pink-500 hover:from-primary/90 hover:to-pink-500/90"}
                                                `}
                                                title={isProprio ? "Seu próprio item" : semSaldo ? "Saldo insuficiente" : ""}
                                            >
                                                {isProprio ? 'Seu item' : 
                                                 isReserved ? (filaEspera > 0 ? `Entrar na fila (${filaEspera + 1}º)` : 'Entrar na fila') : 
                                                 semSaldo ? 'Sem saldo' : 'Reservar'}
                                            </Button>
                                        </div>
                                    </div>
                                </CardFooter>
                            </Card>
                        );
                    })}
                </div>

                {!loading && filteredItems.length === 0 && (
                    <div className="text-center py-12">
                        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="w-12 h-12 text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">Nenhum item encontrado</h3>
                        <p className="text-gray-600">
                            {itens.length === 0 
                                ? "Ainda não há itens publicados. Seja a primeira a compartilhar!" 
                                : "Tente ajustar sua busca ou explorar outras categorias."
                            }
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Feed;
