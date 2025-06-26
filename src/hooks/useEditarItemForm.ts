
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useTiposTamanho } from '@/hooks/useTamanhosPorCategoria';

const formSchema = z.object({
  titulo: z.string().min(3, {
    message: "Título precisa ter pelo menos 3 caracteres.",
  }),
  descricao: z.string().min(10, {
    message: "Descrição precisa ter pelo menos 10 caracteres.",
  }),
  categoria: z.string().min(1, {
    message: "Categoria é obrigatória.",
  }),
  subcategoria: z.string().optional(),
  genero: z.string().optional(),
  estado_conservacao: z.string().min(1, {
    message: "Estado de conservação é obrigatório.",
  }),
  valor_girinhas: z.string().refine((value) => {
    const num = Number(value);
    return !isNaN(num) && num > 0;
  }, {
    message: "Valor deve ser um número maior que zero.",
  }),
  tamanho: z.object({
    valor: z.string(),
    label_display: z.string(),
  }).optional(),
});

interface FormValues extends z.infer<typeof formSchema> {}

export const useEditarItemForm = (item: any) => {
  const { data: tiposTamanho } = useTiposTamanho();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    titulo: item?.titulo || '',
    descricao: item?.descricao || '',
    categoria_id: item?.categoria || '',
    subcategoria: item?.subcategoria || '',
    genero: item?.genero || '',
    estado_conservacao: item?.estado_conservacao || '',
    preco: item?.valor_girinhas?.toString() || '0',
    imagens: [] as File[],
    imagensExistentes: item?.imagens || [],
    tamanho_categoria: '',
    tamanho_valor: item?.tamanho_valor || '',
  });
  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [isFormInitialized, setIsFormInitialized] = useState(true);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      titulo: item?.titulo || "",
      descricao: item?.descricao || "",
      categoria: item?.categoria || "",
      subcategoria: item?.subcategoria || "",
      genero: item?.genero || "",
      estado_conservacao: item?.estado_conservacao || "",
      valor_girinhas: item?.valor_girinhas?.toString() || "0",
    },
  });

  const updateFormData = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const removerImagemExistente = (url: string) => {
    setFormData(prev => ({
      ...prev,
      imagensExistentes: prev.imagensExistentes?.filter(img => img !== url) || []
    }));
  };

  const handleSubmit = async (): Promise<boolean> => {
    try {
      setLoading(true);
      setIsSubmitting(true);

      const updateData: any = {
        titulo: formData.titulo,
        descricao: formData.descricao,
        categoria: formData.categoria_id,
        subcategoria: formData.subcategoria || null,
        genero: formData.genero || null,
        estado_conservacao: formData.estado_conservacao,
        valor_girinhas: Number(formData.preco),
        updated_at: new Date().toISOString()
      };

      if (formData.tamanho_valor) {
        updateData.tamanho_valor = formData.tamanho_valor;
      }

      const { error } = await supabase
        .from('itens')
        .update(updateData)
        .eq('id', item.id);

      if (error) {
        console.error("Erro ao atualizar item:", error);
        toast({
          title: "Erro",
          description: "Não foi possível atualizar o item. Tente novamente.",
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Sucesso",
        description: "Item atualizado com sucesso!",
      });

      await queryClient.invalidateQueries({ queryKey: ['item', item.id] });
      navigate(`/item/${item.id}`);
      return true;

    } catch (error) {
      console.error("Erro ao atualizar item:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao atualizar o item.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  const resetForm = (itemData: any) => {
    setFormData({
      titulo: itemData?.titulo || '',
      descricao: itemData?.descricao || '',
      categoria_id: itemData?.categoria || '',
      subcategoria: itemData?.subcategoria || '',
      genero: itemData?.genero || '',
      estado_conservacao: itemData?.estado_conservacao || '',
      preco: itemData?.valor_girinhas?.toString() || '0',
      imagens: [] as File[],
      imagensExistentes: itemData?.imagens || [],
      tamanho_categoria: '',
      tamanho_valor: itemData?.tamanho_valor || '',
    });
  };

  const onSubmit = async (values: FormValues) => {
    return await handleSubmit();
  };

  return { 
    form, 
    onSubmit, 
    isSubmitting, 
    tiposTamanho,
    formData,
    updateFormData,
    removerImagemExistente,
    errors,
    loading,
    handleSubmit,
    resetForm,
    isFormInitialized,
    isLoadingOptions
  };
};
