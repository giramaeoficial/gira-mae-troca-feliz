
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
import { useAuth } from '@/hooks/useAuth';
import { useItens } from '@/hooks/useItens';
import { toast } from '@/hooks/use-toast';
import { useProfile } from '@/hooks/useProfile';
import Header from '@/components/shared/Header';
import QuickNav from '@/components/shared/QuickNav';
import ImageUpload from '@/components/ui/image-upload';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, User, School } from 'lucide-react';

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
  filho_id: z.string().optional(),
  estado_manual: z.string().optional(),
  cidade_manual: z.string().optional(),
});

const PublicarItem = () => {
  const { user } = useAuth();
  const { publicarItem } = useItens();
  const { filhos } = useProfile();
  const navigate = useNavigate();
  const [fotos, setFotos] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [usarFilho, setUsarFilho] = useState(true);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      titulo: '',
      categoria: '',
      descricao: '',
      estado_conservacao: '',
      tamanho: '',
      valor_girinhas: 1,
      filho_id: '',
      estado_manual: '',
      cidade_manual: '',
    },
  });

  const filhoSelecionado = form.watch('filho_id');
  const escolaDoFilho = filhos.find(f => f.id === filhoSelecionado)?.escolas_inep;

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

    if (usarFilho && !values.filho_id) {
      toast({
        title: "Erro",
        description: "Selecione um filho ou use localização manual",
        variant: "destructive"
      });
      return;
    }

    if (!usarFilho && (!values.estado_manual || !values.cidade_manual)) {
      toast({
        title: "Erro",
        description: "Informe estado e cidade",
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
      filho_id: usarFilho ? values.filho_id : null,
      estado_manual: !usarFilho ? values.estado_manual : null,
      cidade_manual: !usarFilho ? values.cidade_manual : null,
    };

    const sucesso = await publicarItem(itemData, fotos);
    
    if (sucesso) {
      navigate('/');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header activePage="publicar" />
      
      <div className="container max-w-lg mx-auto py-4 px-4 pb-24">
        {/* Cabeçalho */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Publicar Item</h1>
          <p className="text-sm text-gray-600">Compartilhe algo especial com outras mães</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Upload de Fotos */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Fotos do Item</CardTitle>
              </CardHeader>
              <CardContent>
                <ImageUpload
                  value={fotos}
                  onChange={setFotos}
                  maxFiles={3}
                  maxSizeKB={5000}
                />
              </CardContent>
            </Card>

            {/* Informações Básicas */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Informações Básicas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="titulo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Ex: Tênis Nike tamanho 32" 
                          className="h-12"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="categoria"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoria</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12">
                              <SelectValue placeholder="Categoria" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="roupas">Roupas</SelectItem>
                            <SelectItem value="calcados">Calçados</SelectItem>
                            <SelectItem value="brinquedos">Brinquedos</SelectItem>
                            <SelectItem value="livros">Livros</SelectItem>
                            <SelectItem value="acessorios">Acessórios</SelectItem>
                            <SelectItem value="utensilios">Utensílios</SelectItem>
                            <SelectItem value="outros">Outros</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tamanho"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tamanho</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="P, M, 32..." 
                            className="h-12"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="descricao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Descreva o item: cor, marca, estado, história..."
                          className="resize-none min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="estado_conservacao"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12">
                              <SelectValue placeholder="Estado" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="novo">Novo</SelectItem>
                            <SelectItem value="otimo">Ótimo</SelectItem>
                            <SelectItem value="bom">Bom</SelectItem>
                            <SelectItem value="razoavel">Razoável</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="valor_girinhas"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Girinhas</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="10" 
                            className="h-12"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Localização */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Localização
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Toggle entre Filho e Manual */}
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={usarFilho ? "default" : "outline"}
                    size="sm"
                    onClick={() => setUsarFilho(true)}
                    className="flex-1"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Meu Filho
                  </Button>
                  <Button
                    type="button"
                    variant={!usarFilho ? "default" : "outline"}
                    size="sm"
                    onClick={() => setUsarFilho(false)}
                    className="flex-1"
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    Manual
                  </Button>
                </div>

                {usarFilho ? (
                  <div className="space-y-3">
                    <FormField
                      control={form.control}
                      name="filho_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Selecione o filho</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-12">
                                <SelectValue placeholder="Escolha um filho" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {filhos.map((filho) => (
                                <SelectItem key={filho.id} value={filho.id}>
                                  {filho.nome} - {filho.idade} anos
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {escolaDoFilho && (
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <School className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-900">Escola Detectada</span>
                        </div>
                        <p className="text-sm text-blue-800">{escolaDoFilho.escola}</p>
                        <p className="text-xs text-blue-600">
                          {escolaDoFilho.municipio}, {escolaDoFilho.uf}
                        </p>
                        <Badge variant="secondary" className="mt-2 text-xs">
                          Facilita filtros para outras mães
                        </Badge>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="estado_manual"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estado</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="SP" 
                              className="h-12"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="cidade_manual"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cidade</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="São Paulo" 
                              className="h-12"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Botão de Publicar */}
            <Button 
              type="submit" 
              disabled={loading} 
              className="w-full h-14 text-lg font-semibold"
              size="lg"
            >
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
