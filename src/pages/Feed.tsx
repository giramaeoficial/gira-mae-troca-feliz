
import Header from "@/components/shared/Header";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Link } from "react-router-dom";

const placeholderItems = [
  { id: 1, title: "Kit Body Carter's", girinhas: 15, image: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=300", size: "3-6M" },
  { id: 2, title: "Tênis All Star", girinhas: 20, image: "https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=300", size: "18" },
  { id: 3, title: "Lote de brinquedos", girinhas: 30, image: "/placeholder.svg", size: "N/A" },
  { id: 4, title: "Vestido de festa", girinhas: 25, image: "/placeholder.svg", size: "1 Ano" },
  { id: 5, title: "Cadeirinha de carro", girinhas: 100, image: "/placeholder.svg", size: "Até 13kg" },
  { id: 6, title: "Macacão de inverno", girinhas: 22, image: "/placeholder.svg", size: "9M" },
];

const Feed = () => {
    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <h1 className="text-3xl font-bold">Itens Disponíveis para Troca</h1>
                    <div className="relative w-full md:w-1/3">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input placeholder="Buscar por item, tamanho..." className="pl-10" />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {placeholderItems.map(item => (
                        <Card key={item.id} className="overflow-hidden shadow-lg transform hover:-translate-y-1 transition-transform duration-300 flex flex-col">
                            <CardHeader className="p-0">
                                <img src={item.image} alt={item.title} className="w-full h-48 object-cover" />
                            </CardHeader>
                            <CardContent className="p-4 flex-grow">
                                <CardTitle className="text-lg mb-2">{item.title}</CardTitle>
                                <p className="text-sm text-muted-foreground">Tamanho: {item.size}</p>
                            </CardContent>
                            <CardFooter className="p-4 bg-muted/50">
                                <div className="flex justify-between items-center w-full">
                                    <p className="font-bold text-primary">{item.girinhas} Girinhas</p>
                                    <Button size="sm">Reservar</Button>
                                </div>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default Feed;
