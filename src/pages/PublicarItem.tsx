
import Header from "@/components/shared/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";

const PublicarItem = () => {
    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8">
                <Card className="max-w-2xl mx-auto">
                    <CardHeader>
                        <CardTitle>Publicar um Novo Item</CardTitle>
                        <CardDescription>Preencha os dados para que outras mães encontrem seu item.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="title">Título do item</Label>
                            <Input id="title" placeholder="Ex: Kit de bodies manga curta" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Descrição</Label>
                            <Textarea id="description" placeholder="Detalhes sobre o item, marca, etc." />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="category">Categoria</Label>
                                <Select>
                                    <SelectTrigger id="category">
                                        <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="roupa">Roupa</SelectItem>
                                        <SelectItem value="brinquedo">Brinquedo</SelectItem>
                                        <SelectItem value="calcado">Calçado</SelectItem>
                                        <SelectItem value="acessorio">Acessório</SelectItem>
                                        <SelectItem value="outro">Outro</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                             <div className="grid gap-2">
                                <Label htmlFor="state">Estado de conservação</Label>
                                <Select>
                                    <SelectTrigger id="state">
                                        <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="novo">Novo (com etiqueta)</SelectItem>
                                        <SelectItem value="otimo">Ótimo estado</SelectItem>
                                        <SelectItem value="bom">Bom estado</SelectItem>
                                        <SelectItem value="razoavel">Razoável</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="size">Tamanho</Label>
                                <Input id="size" placeholder="Ex: 6-9M, 24, etc." />
                            </div>
                             <div className="grid gap-2">
                                <Label htmlFor="girinhas">Valor em Girinhas</Label>
                                <Input id="girinhas" type="number" placeholder="Ex: 25" />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="picture">Foto do item</Label>
                            <Input id="picture" type="file" />
                        </div>

                        <Button size="lg" className="w-full">Publicar Item</Button>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}

export default PublicarItem;
