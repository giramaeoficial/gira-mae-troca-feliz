import Header from "@/components/shared/Header";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Sparkles, Heart, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useReservas } from "@/hooks/useReservas";

const placeholderItems = [
  { 
    id: 1, 
    title: "Kit Body Carter's", 
    girinhas: 15, 
    image: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=300", 
    size: "3-6M",
    estado: "Ótimo estado",
    localizacao: "Vila Madalena",
    maeName: "Ana Maria",
    disponivel: true
  },
  { 
    id: 2, 
    title: "Tênis All Star Baby", 
    girinhas: 20, 
    image: "https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=300", 
    size: "18",
    estado: "Bom estado",
    localizacao: "Pinheiros",
    maeName: "Carla Silva",
    disponivel: true
  },
  { 
    id: 3, 
    title: "Lote de brinquedos educativos", 
    girinhas: 30, 
    image: "https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=300", 
    size: "2+ anos",
    estado: "Ótimo estado",
    localizacao: "Itaim Bibi",
    maeName: "Fernanda Costa",
    disponivel: true
  },
  { 
    id: 4, 
    title: "Vestido de festa rosa", 
    girinhas: 25, 
    image: "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=300", 
    size: "1 Ano",
    estado: "Novo",
    localizacao: "Jardins",
    maeName: "Juliana Santos",
    disponivel: false
  },
  { 
    id: 5, 
    title: "Cadeirinha de carro Chicco", 
    girinhas: 100, 
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=300", 
    size: "Até 13kg",
    estado: "Bom estado",
    localizacao: "Moema",
    maeName: "Patricia Lima",
    disponivel: true
  },
  { 
    id: 6, 
    title: "Macacão de inverno Gap", 
    girinhas: 22, 
    image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=300", 
    size: "9M",
    estado: "Ótimo estado",
    localizacao: "Vila Olimpia",
    maeName: "Roberta Alves",
    disponivel: true
  },
];

const Feed = () => {
    const { toast } = useToast();
    const { criarReserva } = useReservas();
    const [reservedItems, setReservedItems] = useState<number[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

    const handleReservar = (item: typeof placeholderItems[0]) => {
        if (!item.disponivel) {
            toast({
                title: "Item não disponível",
                description: "Este item já foi reservado por outra mãe.",
                variant: "destructive"
            });
            return;
        }

        // Criar reserva usando o hook
        criarReserva(item.id, item, item.maeName);
        setReservedItems(prev => [...prev, item.id]);
    };

    const filteredItems = placeholderItems.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.size.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.localizacao.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 text-foreground flex flex-col">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent mb-2">
                            Itens Disponíveis para Troca
                        </h1>
                        <p className="text-gray-600">Descubra itens incríveis compartilhados pela nossa comunidade de mães</p>
                    </div>
                    <div className="relative w-full md:w-1/3">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input 
                            placeholder="Buscar por item, tamanho, localização..." 
                            className="pl-10 bg-white/80 backdrop-blur-sm border-primary/20 focus:border-primary" 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredItems.map(item => {
                        const isReserved = reservedItems.includes(item.id) || !item.disponivel;
                        
                        return (
                            <Card key={item.id} className="overflow-hidden shadow-lg transform hover:-translate-y-1 transition-all duration-300 flex flex-col border-0 bg-white/80 backdrop-blur-sm">
                                <CardHeader className="p-0 relative">
                                    <img src={item.image} alt={item.title} className="w-full h-48 object-cover" />
                                    <div className="absolute top-2 right-2">
                                        <Badge className={`${isReserved ? 'bg-gray-500' : 'bg-green-500'} text-white`}>
                                            {isReserved ? 'Reservado' : 'Disponível'}
                                        </Badge>
                                    </div>
                                    <div className="absolute top-2 left-2">
                                        <Badge variant="secondary" className="bg-primary/10 text-primary">
                                            {item.estado}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-4 flex-grow">
                                    <CardTitle className="text-lg mb-2 text-gray-800">{item.title}</CardTitle>
                                    <div className="space-y-1 text-sm text-gray-600">
                                        <p>Tamanho: {item.size}</p>
                                        <div className="flex items-center gap-1">
                                            <MapPin className="w-3 h-3" />
                                            <span>{item.localizacao}</span>
                                        </div>
                                        <p className="text-primary font-medium">Por {item.maeName}</p>
                                    </div>
                                </CardContent>
                                <CardFooter className="p-4 bg-muted/20">
                                    <div className="flex justify-between items-center w-full">
                                        <p className="font-bold text-primary flex items-center gap-1">
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
                                                disabled={isReserved}
                                                className={isReserved ? "opacity-50 cursor-not-allowed" : "bg-gradient-to-r from-primary to-pink-500 hover:from-primary/90 hover:to-pink-500/90"}
                                            >
                                                {isReserved ? 'Reservado' : 'Reservar'}
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
