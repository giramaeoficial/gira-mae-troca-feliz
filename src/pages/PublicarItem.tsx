
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useAuth } from '@/hooks/useAuth';
import { useItens } from '@/hooks/useItens';
import { toast } from '@/components/ui/use-toast';
import Header from '@/components/shared/Header';
import QuickNav from '@/components/shared/QuickNav';

const formSchema = z.object({
  titulo: z.string().min(3, {
    message: 'Título deve ter pelo menos 3 caracteres.',
  }),
  categoria: z.string().min(1, {
    message: 'Selecione uma categoria.',
  }),
  descricao: z.string().min(10, {
    message: 'Descrição deve ter pelo menos 10 caracteres.',
  }),
  estado_conservacao: z.string().min(1, {
    message: 'Selecione o estado de conservação.',
  }),
  tamanho: z.string().optional(),
  valor_girinhas: z.number({
    invalid_type_error: 'Valor deve ser um número.',
  }).min(1, {
    message: 'Valor deve ser maior que zero.',
  }),
});

const PublicarItem = () => {
  const { user } = useAuth();
  const { publicarItem } = useItens();
  const navigate = useNavigate();
  const [fotos, setFotos] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      titulo: '',
      categoria: '',
      descricao: '',
      estado_conservacao: '',
      tamanho: '',
      valor_girinhas: 1,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para publicar um item",
        variant: "destructive"
      });
      return;
    }

    if (fotos.length === 0) {
      toast({
        title: "Erro",
        description: "Adicione pelo menos uma foto",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    const itemData = {
      titulo: values.titulo,
      categoria: values.categoria,
      descricao: values.descricao,
      estado_conservacao: values.estado_conservacao,
      tamanho: values.tamanho,
      valor_girinhas: values.valor_girinhas,
      publicado_por: user.id,
      status: 'disponivel',
    };

    const sucesso = await publicarItem(itemData, fotos);
    
    if (sucesso) {
      navigate('/');
    }
    
    setLoading(false);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setFotos(Array.from(files));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header activePage="publicar" />
      
      <div className="container max-w-4xl mx-auto py-6 px-4 pb-24">
        <h1 className="text-2xl font-bold mb-6">Publicar Item</h1>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="titulo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Livro usado em bom estado" {...field} />
                  </FormControl>
                  <FormDescription>
                    Dê um título claro e objetivo para o seu item.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="categoria"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="livros">Livros</SelectItem>
                      <SelectItem value="roupas">Roupas</SelectItem>
                      <SelectItem value="brinquedos">Brinquedos</SelectItem>
                      <SelectItem value="moveis">Móveis</SelectItem>
                      <SelectItem value="eletronicos">Eletrônicos</SelectItem>
                      <SelectItem value="outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Escolha a categoria que melhor se encaixa no seu item.
                  </FormDescription>
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
                    <Textarea
                      placeholder="Descreva o item detalhadamente, incluindo suas características, estado e outras informações relevantes."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Forneça o máximo de detalhes possível sobre o item.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="estado_conservacao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado de Conservação</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o estado de conservação" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="novo">Novo</SelectItem>
                      <SelectItem value="seminovo">Seminovo</SelectItem>
                      <SelectItem value="usado">Usado</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Selecione o estado de conservação do item.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="tamanho"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tamanho (opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: P, M, G, 36, 40, etc." {...field} />
                  </FormControl>
                  <FormDescription>
                    Informe o tamanho do item, se aplicável.
                  </FormDescription>
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
                      placeholder="Ex: 10" 
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    Defina o valor do item em Girinhas.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="mb-4">
              <Label htmlFor="fotos">Fotos do Item</Label>
              <Input
                id="fotos"
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="mt-2"
              />
              <p className="text-sm text-gray-500 mt-1">
                Selecione uma ou mais fotos do item
              </p>
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Publicando...' : 'Publicar Item'}
            </Button>
          </form>
        </Form>
      </div>

      <QuickNav />
    </div>
  );
};

export default PublicarItem;
