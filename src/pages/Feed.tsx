
import Header from "@/components/shared/Header";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Sparkles, MapPin, Baby, Shirt, Car, Gamepad2, BookOpen, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useReservas } from "@/hooks/useReservas";
import { useCarteira } from "@/contexts/CarteiraContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const placeholderItems = [
  { 
    id: 1, 
    title: "Kit Body Carter's Recém-nascido", 
    girinhas: 15, 
    image: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=300", 
    size: "RN-3M",
    categoria: "Roupas",
    idade: "0-3 meses",
    estado: "Ótimo estado",
    localizacao: "Vila Madalena",
    maeName: "Ana Maria",
    disponivel: true,
    descricao: "5 bodies de manga longa + 3 de manga curta"
  },
  { 
    id: 2, 
    title: "Tênis All Star Baby Primeiro Passo", 
    girinhas: 20, 
    image: "https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=300", 
    size: "18",
    categoria: "Calçados",
    idade: "12-18 meses",
    estado: "Bom estado",
    localizacao: "Pinheiros",
    maeName: "Carla Silva",
    disponivel: true,
    descricao: "Perfeito para primeiros passos"
  },
  { 
    id: 3, 
    title: "Kit Brinquedos Educativos Fisher Price", 
    girinhas: 30, 
    image: "https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=300", 
    size: "Variado",
    categoria: "Brinquedos",
    idade: "2-4 anos",
    estado: "Ótimo estado",
    localizacao: "Itaim Bibi",
    maeName: "Fernanda Costa",
    disponivel: true,
    descricao: "Blocos de montar + quebra-cabeças + livros"
  },
  { 
    id: 4, 
    title: "Vestido de Festa Infantil Rosa", 
    girinhas: 25, 
    image: "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=300", 
    size: "1 Ano",
    categoria: "Roupas",
    idade: "12-18 meses",
    estado: "Novo",
    localizacao: "Jardins",
    maeName: "Juliana Santos",
    disponivel: false,
    descricao: "Com laço e detalhes em renda"
  },
  { 
    id: 5, 
    title: "Cadeirinha Auto Chicco KeyFit", 
    girinhas: 100, 
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=300", 
    size: "Bebê conforto",
    categoria: "Segurança",
    idade: "0-13kg",
    estado: "Bom estado",
    localizacao: "Moema",
    maeName: "Patricia Lima",
    disponivel: true,
    descricao: "Com base para carro + manual"
  },
  { 
    id: 6, 
    title: "Macacão Inverno Gap Kids", 
    girinhas: 22, 
    image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=300", 
    size: "9M",
    categoria: "Roupas",
    idade: "6-12 meses",
    estado: "Ótimo estado",
    localizacao: "Vila Olimpia",
    maeName: "Roberta Alves",
    disponivel: true,
    descricao: "Pelúcia interna + capuz"
  },
  { 
    id: 7, 
    title: "Carrinho de Bebê Galzerano Reversível", 
    girinhas: 80, 
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=300", 
    size: "0-15kg",
    categoria: "Passeio",
    idade: "0-3 anos",
    estado: "Bom estado",
    localizacao: "Butantã",
    maeName: "Luciana Pereira",
    disponivel: true,
    descricao: "Com capa de chuva + cestinha"
  },
  { 
    id: 8, 
    title: "Lote Livros Infantis Clássicos", 
    girinhas: 35, 
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300", 
    size: "Variado",
    categoria: "Livros",
    idade: "3-6 anos",
    estado: "Ótimo estado",
    localizacao: "Santo Amaro",
    maeName: "Mariana Souza",
    disponivel: true,
    descricao: "15 livros: Turma da Mônica + contos"
  },
  { 
    id: 9, 
    title: "Boneca Baby Alive Come e Faz Caquinha", 
    girinhas: 40, 
    image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=300", 
    size: "30cm",
    categoria: "Brinquedos",
    idade: "3+ anos",
    estado: "Bom estado",
    localizacao: "Vila Mariana",
    maeName: "Camila Torres",
    disponivel: true,
    descricao: "Com acessórios + roupinha extra"
  },
  { 
    id: 10, 
    title: "Kit Alimentação Bebê Avent", 
    girinhas: 28, 
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300", 
    size: "6M+",
    categoria: "Alimentação",
    idade: "6+ meses",
    estado: "Ótimo estado",
    localizacao: "Perdizes",
    maeName: "Renata Oliveira",
    disponivel: true,
    descricao: "Mamadeiras + pratinhos + talheres"
  }
];

const categorias = [
  { value: "todas", label: "Todas as categorias", icon: Heart },
  { value: "roupas", label: "Roupas", icon: Shirt },
  { value: "brinquedos", label: "Brinquedos", icon: Gamepad2 },
  { value: "calçados", label: "Calçados", icon: Baby },
  { value: "segurança", label: "Segurança", icon: Car },
  { value: "livros", label: "Livros", icon: BookOpen },
  { value: "passeio", label: "Passeio", icon: Car },
  { value: "alimentação", label: "Alimentação", icon: Baby }
];

const Feed = () => {
    const { toast } = useToast();
    const { criarReserva, isItemReservado } = useReservas();
    const { saldo } = useCarteira();
    const [searchTerm, setSearchTerm] = useState("");
    const [categoriaFiltro, setCategoriaFiltro] = useState("todas");

    const handleReservar = (item: typeof placeholderItems[0]) => {
        const resultado = criarReserva(item.id, item, item.maeName);
        // O toast já é mostrado dentro da função criarReserva
    };

    const filteredItems = placeholderItems.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.size.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.localizacao.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.idade.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.categoria.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesCategory = categoriaFiltro === "todas" || 
                              item.categoria.toLowerCase() === categoriaFiltro;
        
        return matchesSearch && matchesCategory;
    });

    const getCategoryIcon = (categoria: string) => {
        const cat = categorias.find(c => c.value === categoria.toLowerCase());
        return cat ? cat.icon : Heart;
    };

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
                                placeholder="Buscar por item, idade, tamanho..." 
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
                        const isReserved = isItemReservado(item.id) || !item.disponivel;
                        const semSaldo = saldo < item.girinhas;
                        const CategoryIcon = getCategoryIcon(item.categoria);
                        
                        return (
                            <Card key={item.id} className="overflow-hidden shadow-lg transform hover:-translate-y-1 transition-all duration-300 flex flex-col border-0 bg-white/80 backdrop-blur-sm">
                                <CardHeader className="p-0 relative">
                                    <img src={item.image} alt={item.title} className="w-full h-48 object-cover" />
                                    <div className="absolute top-2 right-2">
                                        <Badge className={`${isReserved ? 'bg-gray-500' : 'bg-green-500'} text-white`}>
                                            {isReserved ? 'Reservado' : 'Disponível'}
                                        </Badge>
                                    </div>
                                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                                        <Badge variant="secondary" className="bg-primary/10 text-primary">
                                            {item.estado}
                                        </Badge>
                                        <Badge variant="outline" className="bg-white/90 text-gray-700 text-xs">
                                            <CategoryIcon className="w-3 h-3 mr-1" />
                                            {item.categoria}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-4 flex-grow">
                                    <CardTitle className="text-lg mb-2 text-gray-800 line-clamp-2">{item.title}</CardTitle>
                                    <div className="space-y-1 text-sm text-gray-600">
                                        <p><strong>Idade:</strong> {item.idade}</p>
                                        <p><strong>Tamanho:</strong> {item.size}</p>
                                        <p className="text-xs text-gray-500 line-clamp-2">{item.descricao}</p>
                                        <div className="flex items-center gap-1 pt-1">
                                            <MapPin className="w-3 h-3" />
                                            <span className="text-xs">{item.localizacao}</span>
                                        </div>
                                        <p className="text-primary font-medium text-sm">Por {item.maeName}</p>
                                    </div>
                                </CardContent>
                                <CardFooter className="p-4 bg-muted/20">
                                    <div className="flex justify-between items-center w-full">
                                        <p className={`font-bold flex items-center gap-1 ${semSaldo && !isReserved ? 'text-red-500' : 'text-primary'}`}>
                                            <Sparkles className="w-4 h-4" />
                                            {item.girinhas}
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
                                                disabled={isReserved || semSaldo}
                                                className={`
                                                    ${isReserved ? "opacity-50 cursor-not-allowed" : ""}
                                                    ${semSaldo && !isReserved ? "bg-red-500 hover:bg-red-600" : "bg-gradient-to-r from-primary to-pink-500 hover:from-primary/90 hover:to-pink-500/90"}
                                                `}
                                                title={semSaldo && !isReserved ? "Saldo insuficiente" : ""}
                                            >
                                                {isReserved ? 'Reservado' : semSaldo ? 'Sem saldo' : 'Reservar'}
                                            </Button>
                                        </div>
                                    </div>
                                </CardFooter>
                            </Card>
                        );
                    })}
                </div>

                {filteredItems.length === 0 && (
                    <div className="text-center py-12">
                        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="w-12 h-12 text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">Nenhum item encontrado</h3>
                        <p className="text-gray-600">Tente ajustar sua busca ou explorar outras categorias.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Feed;
