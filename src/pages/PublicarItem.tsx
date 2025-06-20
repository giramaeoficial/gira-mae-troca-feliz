import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "@/components/ui/image-upload";
import { PriceSuggestions } from "@/components/ui/price-suggestions";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Upload, MapPin, Tag, Calendar, Info } from "lucide-react";
import { useAuth } from '@/hooks/useAuth';
import { useItens } from '@/hooks/useItens';
import { useConfigCategorias } from '@/hooks/useConfigCategorias';
import { FormProgress } from '@/components/ui/form-progress';
import { toast } from "sonner";
import AuthGuard from '@/components/auth/AuthGuard';
import Header from '@/components/shared/Header';
import QuickNav from '@/components/shared/QuickNav';

interface FormData {
  nome: string;
  categoria_id: string;
  preco: string;
  descricao: string;
  localizacao: string;
  tags: string;
  data_disponivel: string;
  imagens: File[];
}

const validateForm = (formData: FormData): { [key: string]: string } => {
  const errors: { [key: string]: string } = {};

  if (!formData.nome) {
    errors.nome = "O nome do item é obrigatório.";
  }

  if (!formData.categoria_id) {
    errors.categoria_id = "A categoria é obrigatória.";
  }

  if (!formData.preco) {
    errors.preco = "O preço é obrigatório.";
  } else if (isNaN(Number(formData.preco))) {
    errors.preco = "O preço deve ser um número.";
  }

  if (!formData.descricao) {
    errors.descricao = "A descrição é obrigatória.";
  }

  if (!formData.localizacao) {
    errors.localizacao = "A localização é obrigatória.";
  }

  if (!formData.data_disponivel) {
    errors.data_disponivel = "A data de disponibilidade é obrigatória.";
  }

  if (!formData.imagens || formData.imagens.length === 0) {
    errors.imagens = "Pelo menos uma imagem é obrigatória.";
  }

  return errors;
};

const PublicarItem = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { categorias } = useConfigCategorias();
  const { criarItem, isLoading } = useItens();
  const [formData, setFormData] = useState<FormData>({
    nome: '',
    categoria_id: '',
    preco: '',
    descricao: '',
    localizacao: '',
    tags: '',
    data_disponivel: '',
    imagens: []
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [progress, setProgress] = useState(0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, categoria_id: value }));
  };

  const handleImageUpload = (files: File[]) => {
    setFormData(prev => ({ ...prev, imagens: files }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      try {
        const itemData = {
          ...formData,
          preco: parseFloat(formData.preco),
          usuario_id: user?.id,
        };

        setProgress(30);

        await criarItem(itemData, {
          onSuccess: () => {
            setProgress(100);
            toast.success("Item publicado com sucesso!");
            navigate('/feed');
          },
          onError: (error: any) => {
            console.error("Erro ao criar item:", error);
            toast.error("Erro ao publicar o item. Tente novamente.");
            setProgress(0);
          },
        });
      } catch (error: any) {
        console.error("Erro ao criar item:", error);
        toast.error("Erro ao publicar o item. Tente novamente.");
        setProgress(0);
      }
    } else {
      toast.error("Por favor, corrija os erros no formulário.");
    }
  };

  const handlePriceSuggestion = (price: number) => {
    setFormData(prev => ({ ...prev, preco: String(price) }));
  };

  const formatDateForInput = (dateString: string): string => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8 pb-32 md:pb-8">
          <Card className="max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Publicar Novo Item</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                {progress > 0 && (
                  <FormProgress value={progress} />
                )}

                <div>
                  <Label htmlFor="nome">Nome do Item</Label>
                  <Input
                    type="text"
                    id="nome"
                    name="nome"
                    value={formData.nome}
                    onChange={handleChange}
                    placeholder="Ex: Vestido de festa, Livro usado..."
                  />
                  {errors.nome && <p className="text-red-500 text-sm">{errors.nome}</p>}
                </div>

                <div>
                  <Label htmlFor="categoria_id">Categoria</Label>
                  <Select onValueChange={handleSelectChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias?.map(categoria => (
                        <SelectItem key={categoria.id} value={categoria.id}>
                          {categoria.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.categoria_id && <p className="text-red-500 text-sm">{errors.categoria_id}</p>}
                </div>

                <div>
                  <Label htmlFor="preco">Preço (Girinhas)</Label>
                  <Input
                    type="number"
                    id="preco"
                    name="preco"
                    value={formData.preco}
                    onChange={handleChange}
                    placeholder="Ex: 25"
                  />
                  {errors.preco && <p className="text-red-500 text-sm">{errors.preco}</p>}
                  <PriceSuggestions onSuggest={handlePriceSuggestion} />
                </div>

                <div>
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    name="descricao"
                    value={formData.descricao}
                    onChange={handleChange}
                    placeholder="Descreva o item detalhadamente..."
                  />
                  {errors.descricao && <p className="text-red-500 text-sm">{errors.descricao}</p>}
                </div>

                <div>
                  <Label htmlFor="localizacao">Localização</Label>
                  <Input
                    type="text"
                    id="localizacao"
                    name="localizacao"
                    value={formData.localizacao}
                    onChange={handleChange}
                    placeholder="Ex: São Paulo, SP"
                  />
                  {errors.localizacao && <p className="text-red-500 text-sm">{errors.localizacao}</p>}
                </div>

                <div>
                  <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
                  <Input
                    type="text"
                    id="tags"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    placeholder="Ex: usado, livro, infantil"
                  />
                </div>

                <div>
                  <Label htmlFor="data_disponivel">Data de Disponibilidade</Label>
                  <Input
                    type="date"
                    id="data_disponivel"
                    name="data_disponivel"
                    value={formData.data_disponivel}
                    onChange={handleChange}
                  />
                  {errors.data_disponivel && <p className="text-red-500 text-sm">{errors.data_disponivel}</p>}
                </div>

                <div>
                  <Label>Imagens</Label>
                  <ImageUpload onUpload={handleImageUpload} />
                  {errors.imagens && <p className="text-red-500 text-sm">{errors.imagens}</p>}
                </div>

                <Button disabled={isLoading} className="w-full">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Publicando...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Publicar Item
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </main>
        <QuickNav />
      </div>
    </AuthGuard>
  );
};

export default PublicarItem;
