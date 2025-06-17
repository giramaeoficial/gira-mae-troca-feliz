
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useItens } from "@/hooks/useItens";
import { Tables } from "@/integrations/supabase/types";
import ImageUpload from "@/components/ui/image-upload";
import LazyImage from "@/components/ui/lazy-image";

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
type Item = Tables<'itens'>;

interface EditarItemProps {
  item: Item;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const EditarItem = ({ item, isOpen, onClose, onSuccess }: EditarItemProps) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const { atualizarItem, loading } = useItens();

  const form = useForm<ItemFormData>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      titulo: item.titulo,
      descricao: item.descricao,
      categoria: item.categoria as any,
      estado_conservacao: item.estado_conservacao as any,
      tamanho: item.tamanho || "",
      valor_girinhas: Number(item.valor_girinhas)
    }
  });

  // Reset form quando o item mudar
  useEffect(() => {
    if (item) {
      form.reset({
        titulo: item.titulo,
        descricao: item.descricao,
        categoria: item.categoria as any,
        estado_conservacao: item.estado_conservacao as any,
        tamanho: item.tamanho || "",
        valor_girinhas: Number(item.valor_girinhas)
      });
      setSelectedFiles([]);
    }
  }, [item, form]);

  const onSubmit = async (data: ItemFormData) => {
    const itemUpdates = {
      titulo: data.titulo,
      descricao: data.descricao,
      categoria: data.categoria,
      estado_conservacao: data.estado_conservacao,
      tamanho: data.tamanho || null,
      valor_girinhas: data.valor_girinhas
    };
    
    const sucesso = await atualizarItem(item.id, itemUpdates);
    
    if (sucesso) {
      onSuccess();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Item</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Fotos existentes com LazyImage */}
            {item.fotos && item.fotos.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Fotos atuais</label>
                <div className="grid grid-cols-3 gap-4">
                  {item.fotos.map((foto, index) => (
                    <LazyImage
                      key={index}
                      src={foto}
                      alt={`Foto ${index + 1} do item ${item.titulo}`}
                      bucket="itens"
                      size="thumbnail"
                      className="w-full h-24 object-cover rounded-lg border-2 border-gray-200"
                      placeholder="📷"
                      onError={() => console.error('Erro ao carregar foto:', foto)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Upload de novas fotos */}
            <div className="space-y-4">
              <label className="text-sm font-medium">Adicionar novas fotos (opcional)</label>
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
              name="descricao"
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
                name="categoria"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
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
                name="estado_conservacao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado de conservação</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
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
                name="tamanho"
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
                name="valor_girinhas"
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

            <div className="flex gap-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-primary to-pink-500 hover:from-primary/90 hover:to-pink-500/90"
              >
                {loading ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditarItem;
