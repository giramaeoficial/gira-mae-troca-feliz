
import Header from "@/components/shared/Header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Star } from "lucide-react";
import { Link } from "react-router-dom";

const Perfil = () => {
    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                    {/* Profile Sidebar */}
                    <Card className="w-full md:w-1/4 sticky top-8">
                        <CardContent className="pt-6 flex flex-col items-center text-center">
                            <Avatar className="w-24 h-24 mb-4">
                                <AvatarImage src="https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=150" alt="Foto da mãe" />
                                <AvatarFallback>M</AvatarFallback>
                            </Avatar>
                            <h2 className="text-2xl font-bold">Nome da Mãe</h2>
                            <p className="text-muted-foreground">Cidade, Bairro</p>
                            <div className="flex items-center gap-1 mt-2 text-yellow-500">
                                <Star className="w-5 h-5 fill-current" />
                                <Star className="w-5 h-5 fill-current" />
                                <Star className="w-5 h-5 fill-current" />
                                <Star className="w-5 h-5 fill-current" />
                                <Star className="w-5 h-5 fill-current opacity-30" />
                                <span className="text-muted-foreground text-sm ml-1">(4.0)</span>
                            </div>
                            <div className="mt-6 w-full text-left bg-primary/10 p-4 rounded-lg">
                                <p className="font-bold text-lg text-primary flex items-center justify-between">
                                    <span>Saldo</span>
                                    <span className="flex items-center gap-1">
                                        <Sparkles className="w-5 h-5" /> 50
                                    </span>
                                </p>
                                <p className="text-sm text-muted-foreground">Girinhas para trocar</p>
                            </div>
                             <Button className="mt-4 w-full" variant="outline">Editar Perfil</Button>
                        </CardContent>
                    </Card>

                    {/* Profile Content */}
                    <div className="w-full md:w-3/4">
                        <Tabs defaultValue="meus-itens">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="meus-itens">Meus Itens</TabsTrigger>
                                <TabsTrigger value="trocas">Minhas Trocas</TabsTrigger>
                                <TabsTrigger value="desejos">Lista de Desejos</TabsTrigger>
                            </TabsList>
                            <TabsContent value="meus-itens" className="mt-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Itens Publicados</CardTitle>
                                        <CardDescription>Gerencie os itens que você publicou.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-muted-foreground">Você ainda não publicou nenhum item.</p>
                                        <Button className="mt-4" asChild>
                                            <Link to="/publicar-item">Publicar primeiro item</Link>
                                        </Button>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                            <TabsContent value="trocas" className="mt-4">
                                 <Card>
                                    <CardHeader>
                                        <CardTitle>Histórico de Trocas</CardTitle>
                                        <CardDescription>Veja as trocas que você realizou.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-muted-foreground">Nenhuma troca realizada ainda.</p>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                             <TabsContent value="desejos" className="mt-4">
                                 <Card>
                                    <CardHeader>
                                        <CardTitle>Sua Lista de Desejos</CardTitle>
                                        <CardDescription>Itens que você marcou como desejados.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-muted-foreground">Sua lista de desejos está vazia.</p>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Perfil;
