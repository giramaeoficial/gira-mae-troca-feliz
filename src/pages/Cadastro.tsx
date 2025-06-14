
import Header from "@/components/shared/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";
import { Heart, Sparkles, Baby } from "lucide-react";

const Cadastro = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
            <Header />
            <main className="flex-grow flex items-center justify-center py-12 px-4">
                <Card className="w-full max-w-2xl mx-auto shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                    <CardHeader className="text-center">
                        <div className="flex justify-center mb-4">
                            <div className="w-16 h-16 bg-gradient-to-r from-primary to-pink-500 rounded-full flex items-center justify-center">
                                <Baby className="w-8 h-8 text-white" />
                            </div>
                        </div>
                        <CardTitle className="text-2xl">Junte-se à Comunidade GiraMãe</CardTitle>
                        <CardDescription>
                            Crie sua conta e comece a trocar itens infantis de forma segura e solidária.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="nome">Nome completo</Label>
                                <Input id="nome" placeholder="Seu nome completo" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" placeholder="seu@email.com" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="telefone">Telefone/WhatsApp</Label>
                                <Input id="telefone" placeholder="(11) 99999-9999" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="senha">Senha</Label>
                                <Input id="senha" type="password" placeholder="Mínimo 6 caracteres" />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="endereco">Endereço</Label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Input placeholder="Bairro" />
                                <Input placeholder="Cidade" />
                                <Select>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Estado" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="sp">São Paulo</SelectItem>
                                        <SelectItem value="rj">Rio de Janeiro</SelectItem>
                                        <SelectItem value="mg">Minas Gerais</SelectItem>
                                        <SelectItem value="pr">Paraná</SelectItem>
                                        <SelectItem value="rs">Rio Grande do Sul</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="criancas">Sobre seus filhos</Label>
                            <Textarea 
                                id="criancas" 
                                placeholder="Ex: Tenho 1 filho de 2 anos, Lorenzo, que adora brincar no parque..."
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="numCriancas">Número de filhos</Label>
                                <Select>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">1 filho(a)</SelectItem>
                                        <SelectItem value="2">2 filhos</SelectItem>
                                        <SelectItem value="3">3 filhos</SelectItem>
                                        <SelectItem value="4+">4 ou mais</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="idadeCriancas">Faixa etária dos filhos</Label>
                                <Select>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="0-1">0-1 ano</SelectItem>
                                        <SelectItem value="1-3">1-3 anos</SelectItem>
                                        <SelectItem value="3-6">3-6 anos</SelectItem>
                                        <SelectItem value="6-10">6-10 anos</SelectItem>
                                        <SelectItem value="variada">Idades variadas</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="bg-gradient-to-r from-primary/10 to-purple-100 p-4 rounded-xl">
                            <div className="flex items-center gap-2 mb-2">
                                <Sparkles className="w-5 h-5 text-primary" />
                                <span className="font-semibold text-gray-800">Bônus de Boas-vindas</span>
                            </div>
                            <p className="text-sm text-gray-700">
                                Você começará com <span className="font-bold text-primary">50 Girinhas</span> de presente 
                                para fazer suas primeiras trocas na comunidade!
                            </p>
                        </div>

                        <Button type="submit" className="w-full bg-gradient-to-r from-primary to-pink-500 hover:from-primary/90 hover:to-pink-500/90" size="lg">
                            Criar Minha Conta
                        </Button>

                        <div className="text-center text-sm">
                            Já tem uma conta?{" "}
                            <Link to="/login" className="underline text-primary font-medium">
                                Faça login aqui
                            </Link>
                        </div>

                        <div className="text-xs text-gray-500 text-center">
                            Ao se cadastrar, você concorda com nossos{" "}
                            <Link to="#" className="underline">Termos de Uso</Link> e{" "}
                            <Link to="#" className="underline">Política de Privacidade</Link>.
                        </div>
                    </CardContent>
                </Card>
            </main>
            
            <footer className="bg-muted py-8">
                <div className="container mx-auto px-4 text-center text-muted-foreground">
                    <div className="text-2xl font-bold text-primary flex items-center justify-center mb-4">
                        <Link to="/" className="flex items-center text-primary">
                            <Sparkles className="h-6 w-6 mr-2" />
                            GiraMãe
                        </Link>
                    </div>
                    <p>&copy; {new Date().getFullYear()} GiraMãe. Feito com <Heart className="inline h-4 w-4 text-primary" /> por e para mães.</p>
                </div>
            </footer>
        </div>
    );
};

export default Cadastro;
