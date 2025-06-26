import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
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

export const useEditarItemForm = (itemId: string) => {
  const { data: tiposTamanho } = useTiposTamanho();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      titulo: "",
      descricao: "",
      categoria: "",
      subcategoria: "",
      genero: "",
      estado_conservacao: "",
      valor_girinhas: "0",
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);

      const updateData: any = {
        titulo: values.titulo,
        descricao: values.descricao,
        categoria: values.categoria,
        subcategoria: values.subcategoria || null,
        genero: values.genero || null,
        estado_conservacao: values.estado_conservacao,
        valor_girinhas: Number(values.valor_girinhas),
        updated_at: new Date().toISOString()
      };

      // Adicionar tamanho se especificado
      if (values.tamanho && typeof values.tamanho === 'object' && 'valor' in values.tamanho) {
        updateData.tamanho_valor = values.tamanho.valor;
      }

      const { error } = await supabase
        .from('itens')
        .update(updateData)
        .eq('id', itemId);

      if (error) {
        console.error("Erro ao atualizar item:", error);
        toast({
          title: "Erro",
          description: "Não foi possível atualizar o item. Tente novamente.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Sucesso",
        description: "Item atualizado com sucesso!",
      });

      // Invalida o cache para refetch dos dados
      await queryClient.invalidateQueries({ queryKey: ['item', itemId] });
      router.push(`/item/${itemId}`);

    } catch (error) {
      console.error("Erro ao atualizar item:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao atualizar o item.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return { form, onSubmit, isSubmitting, tiposTamanho };
};
