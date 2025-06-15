
import Header from "@/components/shared/Header";
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
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Sparkles, Camera, X } from "lucide-react";
import { useState } from "react";

const itemSchema = z.object({
  title: z.string().min(3, "Título deve ter pelo menos 3 caracteres"),
  description: z.string().min(10, "Descrição deve ter pelo menos 10 caracteres"),
  category: z.string().min(1, "Selecione uma categoria"),
  state: z.string().min(1, "Selecione o estado de conservação"),
  size: z.string().optional(),
  girinhas: z.number().min(1, "Valor deve ser maior que 0").max(500, "Valor máximo de 500 Girinhas"),
  pictures: z.array(z.any()).max(3, "Máximo de 3 fotos").optional()
});

type ItemFormData = z.infer<typeof itemSchema>;

const PublicarItem = () => {
    const { toast } = useToast();
    const navigate = useNavigate();
    const [selectedImages, setSelectedImages] = useState<string[]>([]);

    const form = useForm<ItemFormData>({
        resolver: zodResolver(itemSchema),
        defaultValues: {
            title: "",
            description: "",
            category: "",
            state: "",
            size: "",
            girinhas: 0,
            pictures: []
        }
    });

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files) return;

        const newImages: string[] = [];
        const remainingSlots = 3 - selectedImages.length;
        const filesToProcess = Math.min(files.length, remainingSlots);

        for (let i = 0; i < filesToProcess; i++) {
            const file = files[i];
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const imageUrl = e.target?.result as string;
                    newImages.push(imageUrl);
                    
                    if (newImages.length === filesToProcess) {
                        setSelectedImages(prev => [...prev, ...newImages]);
                    }
                };
                reader.readAsDataURL(file);
            }
        }

        // Reset input
        event.target.value = '';
    };

    const removeImage = (indexToRemove: number) => {
        setSelectedImages(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    const onSubmit = (data: ItemFormData) => {
        const itemData = {
            ...data,
            pictures: selectedImages
        };
        
        console.log("Item publicado:", itemData);
        
        toast({
            title: "Item publicado com sucesso! 🎉",
            description: `${data.title} foi adicionado à sua lista de itens.`,
        });

        setTimeout(() => {
            navigate("/perfil");
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 text-foreground flex flex-col">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8">
                <Card className="max-w-2xl mx-auto shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                    <CardHeader className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-r from-primary to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Sparkles className="w-8 h-8 text-white" />
                        </div>
                        <CardTitle className="text-2xl bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent">
                            Publicar um Novo Item
                        </CardTitle>
                        <CardDescription>Preencha os dados para que outras mães encontrem seu item na comunidade.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                {/* Fotos do Item */}
                                <div className="space-y-4">
                                    <Label>Fotos do item (até 3)</Label>
                                    
                                    {/* Preview das imagens */}
                                    {selectedImages.length > 0 && (
                                        <div className="grid grid-cols-3 gap-4">
                                            {selectedImages.map((image, index) => (
                                                <div key={index} className="relative">
                                                    <img 
                                                        src={image} 
                                                        alt={`Preview ${index + 1}`}
                                                        className="w-full h-24 object-cover rounded-lg border-2 border-gray-200"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeImage(index)}
                                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Upload de novas imagens */}
                                    {selectedImages.length < 3 && (
                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                onChange={handleImageUpload}
                                                className="hidden"
                                                id="photo-upload"
                                            />
                                            <label 
                                                htmlFor="photo-upload" 
                                                className="cursor-pointer flex flex-col items-center gap-2"
                                            >
                                                <Camera className="w-8 h-8 text-gray-400" />
                                                <span className="text-sm text-gray-600">
                                                    Clique para adicionar fotos
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {selectedImages.length}/3 fotos adicionadas
                                                </span>
                                            </label>
                                        </div>
                                    )}
                                </div>

                                <FormField
                                    control={form.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Título do item</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Ex: Kit de bodies manga curta" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Descrição</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="Detalhes sobre o item, marca, estado de conservação..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="category"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Categoria</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
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
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="state"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Estado de conservação</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
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
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="size"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Tamanho (opcional)</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Ex: 6-9M, 24, etc." {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="girinhas"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Valor em Girinhas</FormLabel>
                                                <FormControl>
                                                    <Input 
                                                        type="number" 
                                                        placeholder="Ex: 25" 
                                                        {...field}
                                                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <Button 
                                    size="lg" 
                                    className="w-full bg-gradient-to-r from-primary to-pink-500 hover:from-primary/90 hover:to-pink-500/90"
                                    type="submit"
                                    disabled={form.formState.isSubmitting}
                                >
                                    {form.formState.isSubmitting ? "Publicando..." : "Publicar Item"}
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}

export default PublicarItem;
