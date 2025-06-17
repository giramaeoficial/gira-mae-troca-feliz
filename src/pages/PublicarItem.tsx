
import Header from "@/components/shared/Header";
import QuickNav from "@/components/shared/QuickNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useNavigate } from "react-router-dom";
import { Sparkles, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useItens } from "@/hooks/useItens";
import { useToast } from "@/hooks/use-toast";
import ImageUpload from "@/components/ui/image-upload";
import ItemPreviewCard from "@/components/ui/item-preview-card";
import PriceSuggestions from "@/components/ui/price-suggestions";
import FormProgress from "@/components/ui/form-progress";

const itemSchema = z.object({
  titulo: z.string().min(3, "Título deve ter pelo menos 3 caracteres"),
  descricao: z.string().min(10, "Descrição deve ter pelo menos 10 caracteres"),
  categoria: z.enum(["roupa", "brinquedo", "calcado", "acessorio", "kit", "outro"], {
    required_error: "Selecione uma categoria"
  }),
  estado_conservacao: z.enum(["novo", "otimo", "bom", "razoavel"], {
    required_error: "Selecione o estado de conservação"
  }),
  tamanho: z.string().optional(),
  valor_girinhas: z.number().min(1, "Valor deve ser maior que 0").max(500, "Valor máximo de 500 Girinhas")
});

type ItemFormData = z.infer<typeof itemSchema>;

const PublicarItem = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [showPreview, setShowPreview] = useState(true);
    const { publicarItem, loading } = useItens();

    const form = useForm<ItemFormData>({
        resolver: zodResolver(itemSchema),
        defaultValues: {
            titulo: "",
            descricao: "",
            categoria: undefined,
            estado_conservacao: undefined,
            tamanho: "",
            valor_girinhas: 0
        }
    });

    const watchedValues = form.watch();

    // Calcular progresso do formulário
    const formSteps = [
        { label: "Fotos", completed: selectedFiles.length > 0, required: true },
        { label: "Título", completed: (watchedValues.titulo?.length || 0) >= 3, required: true },
        { label: "Descrição", completed: (watchedValues.descricao?.length || 0) >= 10, required: true },
        { label: "Categoria", completed: !!watchedValues.categoria, required: true },
        { label: "Estado", completed: !!watchedValues.estado_conservacao, required: true },
        { label: "Preço", completed: (watchedValues.valor_girinhas || 0) > 0, required: true },
        { label: "Tamanho", completed: !!watchedValues.tamanho, required: false }
    ];

    const handlePriceSelect = (price: number) => {
        form.setValue('valor_girinhas', price);
    };

    const onSubmit = async (data: ItemFormData) => {
        if (selectedFiles.length === 0) {
            toast({
                title: "Adicione pelo menos uma foto",
                description: "Itens com fotos têm mais chances de serem trocados.",
                variant: "destructive"
            });
            return;
        }

        try {
            const itemData = {
                titulo: data.titulo,
                descricao: data.descricao,
                categoria: data.categoria!,
                estado_conservacao: data.estado_conservacao!,
                tamanho: data.tamanho || null,
                valor_girinhas: data.valor_girinhas,
                fotos: selectedFiles.length > 0 ? ['placeholder-image-url'] : undefined
            };
            
            const sucesso = await publicarItem(itemData);
            
            if (sucesso) {
                toast({
                    title: "Item publicado com sucesso!",
                    description: "Seu item está agora disponível na comunidade.",
                });
                
                // Usar window.location.href ao invés de navigate para evitar problemas de chunk loading
                setTimeout(() => {
                    window.location.href = "/perfil";
                }, 1500);
            }
        } catch (error) {
            console.error('Erro ao publicar item:', error);
            toast({
                title: "Erro ao publicar item",
                description: "Tente novamente em alguns instantes.",
                variant: "destructive"
            });
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 text-foreground flex flex-col pb-24 md:pb-8">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Formulário */}
                        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                            <CardHeader className="text-center">
                                <div className="w-16 h-16 bg-gradient-to-r from-primary to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Sparkles className="w-8 h-8 text-white" />
                                </div>
                                <CardTitle className="text-2xl bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent">
                                    Publicar um Novo Item
                                </CardTitle>
                                <CardDescription>Preencha os dados para que outras mães encontrem seu item na comunidade.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <FormProgress steps={formSteps} />

                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                        <div className="space-y-4">
                                            <Label>Fotos do item (até 3) *</Label>
                                            <ImageUpload
                                                value={selectedFiles}
                                                onChange={setSelectedFiles}
                                                maxFiles={3}
                                                maxSizeKB={5000}
                                                disabled={loading}
                                            />
                                        </div>

                                        <FormField
                                            control={form.control}
                                            name="titulo"
                                            render={({ field, fieldState }) => (
                                                <FormItem>
                                                    <FormLabel className="flex items-center gap-2">
                                                        Título do item *
                                                        {fieldState.error && (
                                                            <span className="text-xs text-red-500">({fieldState.error.message})</span>
                                                        )}
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input 
                                                            placeholder="Ex: Kit de bodies manga curta" 
                                                            {...field}
                                                            className={fieldState.error ? "border-red-300 focus:border-red-500" : ""}
                                                        />
                                                    </FormControl>
                                                    <div className="text-xs text-gray-500">
                                                        {field.value?.length || 0}/100 caracteres
                                                    </div>
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="descricao"
                                            render={({ field, fieldState }) => (
                                                <FormItem>
                                                    <FormLabel className="flex items-center gap-2">
                                                        Descrição *
                                                        {fieldState.error && (
                                                            <span className="text-xs text-red-500">({fieldState.error.message})</span>
                                                        )}
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Textarea 
                                                            placeholder="Detalhes sobre o item, marca, estado de conservação..." 
                                                            {...field}
                                                            className={fieldState.error ? "border-red-300 focus:border-red-500" : ""}
                                                        />
                                                    </FormControl>
                                                    <div className="text-xs text-gray-500">
                                                        {field.value?.length || 0}/500 caracteres
                                                    </div>
                                                </FormItem>
                                            )}
                                        />

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <FormField
                                                control={form.control}
                                                name="categoria"
                                                render={({ field, fieldState }) => (
                                                    <FormItem>
                                                        <FormLabel className="flex items-center gap-2">
                                                            Categoria *
                                                            {fieldState.error && (
                                                                <span className="text-xs text-red-500">({fieldState.error.message})</span>
                                                            )}
                                                        </FormLabel>
                                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger className={fieldState.error ? "border-red-300 focus:border-red-500" : ""}>
                                                                    <SelectValue placeholder="Selecione" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                <SelectItem value="roupa">Roupa</SelectItem>
                                                                <SelectItem value="brinquedo">Brinquedo</SelectItem>
                                                                <SelectItem value="calcado">Calçado</SelectItem>
                                                                <SelectItem value="acessorio">Acessório</SelectItem>
                                                                <SelectItem value="kit">Kit</SelectItem>
                                                                <SelectItem value="outro">Outro</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="estado_conservacao"
                                                render={({ field, fieldState }) => (
                                                    <FormItem>
                                                        <FormLabel className="flex items-center gap-2">
                                                            Estado de conservação *
                                                            {fieldState.error && (
                                                                <span className="text-xs text-red-500">({fieldState.error.message})</span>
                                                            )}
                                                        </FormLabel>
                                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger className={fieldState.error ? "border-red-300 focus:border-red-500" : ""}>
                                                                    <SelectValue placeholder="Selecione" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                <SelectItem value="novo">Novo (com etiqueta)</SelectItem>
                                                                <SelectItem value="otimo">Ótimo estado</SelectItem>
                                                                <SelectItem value="bom">Bom estado</SelectItem>
                                                                <SelectItem value="razoavel">Razoável</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <FormField
                                                control={form.control}
                                                name="tamanho"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Tamanho (opcional)</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Ex: 6-9M, 24, etc." {...field} />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="valor_girinhas"
                                                render={({ field, fieldState }) => (
                                                    <FormItem>
                                                        <FormLabel className="flex items-center gap-2">
                                                            Valor em Girinhas *
                                                            {fieldState.error && (
                                                                <span className="text-xs text-red-500">({fieldState.error.message})</span>
                                                            )}
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input 
                                                                type="number" 
                                                                placeholder="Ex: 25" 
                                                                {...field}
                                                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                                                className={fieldState.error ? "border-red-300 focus:border-red-500" : ""}
                                                            />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        {watchedValues.categoria && (
                                            <PriceSuggestions
                                                categoria={watchedValues.categoria}
                                                onSelectPrice={handlePriceSelect}
                                                currentPrice={watchedValues.valor_girinhas || 0}
                                            />
                                        )}

                                        <Button 
                                            size="lg" 
                                            className="w-full bg-gradient-to-r from-primary to-pink-500 hover:from-primary/90 hover:to-pink-500/90"
                                            type="submit"
                                            disabled={loading || formSteps.filter(s => s.required && !s.completed).length > 0}
                                        >
                                            {loading ? "Publicando..." : "Publicar Item"}
                                        </Button>
                                    </form>
                                </Form>
                            </CardContent>
                        </Card>

                        {/* Preview em tempo real */}
                        <div className="space-y-6">
                            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg">Preview no Feed</CardTitle>
                                        <Button 
                                            variant="ghost" 
                                            size="sm"
                                            onClick={() => setShowPreview(!showPreview)}
                                        >
                                            {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </Button>
                                    </div>
                                    <CardDescription>
                                        Veja como seu item aparecerá para outras mães
                                    </CardDescription>
                                </CardHeader>
                                {showPreview && (
                                    <CardContent>
                                        <div className="max-w-sm mx-auto">
                                            <ItemPreviewCard
                                                titulo={watchedValues.titulo || ""}
                                                valorGirinhas={watchedValues.valor_girinhas || 0}
                                                categoria={watchedValues.categoria || ""}
                                                estadoConservacao={watchedValues.estado_conservacao || ""}
                                                tamanho={watchedValues.tamanho}
                                                fotos={selectedFiles}
                                            />
                                        </div>
                                    </CardContent>
                                )}
                            </Card>

                            {/* Dicas */}
                            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                                <CardHeader>
                                    <CardTitle className="text-lg">💡 Dicas para uma boa troca</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3 text-sm text-gray-600">
                                    <div className="flex items-start gap-2">
                                        <span className="text-green-500">✓</span>
                                        <span>Adicione pelo menos 2 fotos bem iluminadas</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <span className="text-green-500">✓</span>
                                        <span>Seja honesta sobre o estado de conservação</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <span className="text-green-500">✓</span>
                                        <span>Inclua marca e tamanho na descrição</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <span className="text-green-500">✓</span>
                                        <span>Use preços justos baseados nas sugestões</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </main>
            <QuickNav />
        </div>
    );
}

export default PublicarItem;
