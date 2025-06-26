
import { useState, useCallback } from 'react';
import { toast } from "sonner";
import { useAtualizarItem, Item } from '@/hooks/useItensOptimized';
import { useConfigCategorias } from '@/hooks/useConfigCategorias';

interface EditFormData {
  titulo: string;
  descricao: string;
  categoria_id: string;
  subcategoria: string;
  genero: 'menino' | 'menina' | 'unissex';
  tamanho_categoria: string;
  tamanho_valor: string;
  estado_conservacao: 'novo' | 'seminovo' | 'usado' | 'muito_usado';
  preco: string;
  imagens: File[];
}

interface ValidationErrors {
  [key: string]: string;
}

export const useEditarItemForm = (initialItem: Item) => {
  const { validarValorCategoria } = useConfigCategorias();
  const { mutate: atualizarItem, isPending: loading } = useAtualizarItem();

  const [formData, setFormData] = useState<EditFormData>({
    titulo: '',
    descricao: '',
    categoria_id: '',
    subcategoria: '',
    genero: 'unissex',
    tamanho_categoria: '',
    tamanho_valor: '',
    estado_conservacao: 'usado',
    preco: '',
    imagens: []
  });

  const [errors, setErrors] = useState<ValidationErrors>({});

  const resetForm = useCallback((item: Item) => {
    setFormData({
      titulo: item.titulo,
      descricao: item.descricao,
      categoria_id: item.categoria,
      subcategoria: item.subcategoria,
      genero: item.genero as 'menino' | 'menina' | 'unissex',
      tamanho_categoria: item.tamanho_categoria,
      tamanho_valor: item.tamanho_valor,
      estado_conservacao: item.estado_conservacao as 'novo' | 'seminovo' | 'usado' | 'muito_usado',
      preco: item.valor_girinhas.toString(),
      imagens: []
    });
    setErrors({});
  }, []);

  const updateFormData = useCallback((updates: Partial<EditFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    // Limpar erros dos campos que foram atualizados
    const updatedFields = Object.keys(updates);
    setErrors(prev => {
      const newErrors = { ...prev };
      updatedFields.forEach(field => {
        delete newErrors[field];
      });
      return newErrors;
    });
  }, []);

  const validateForm = useCallback((): boolean => {
    const validationErrors: ValidationErrors = {};

    // Campos obrigatórios básicos
    if (!formData.titulo?.trim()) {
      validationErrors.titulo = "O título do item é obrigatório.";
    } else if (formData.titulo.trim().length < 10) {
      validationErrors.titulo = "O título deve ter pelo menos 10 caracteres.";
    }

    if (!formData.categoria_id) {
      validationErrors.categoria_id = "A categoria é obrigatória.";
    }

    if (!formData.subcategoria) {
      validationErrors.subcategoria = "A subcategoria é obrigatória.";
    }

    if (!formData.genero) {
      validationErrors.genero = "O gênero é obrigatório.";
    }

    if (!formData.estado_conservacao) {
      validationErrors.estado_conservacao = "O estado de conservação é obrigatório.";
    }

    if (!formData.tamanho_valor) {
      validationErrors.tamanho = "O tamanho é obrigatório.";
    }

    // Validação de descrição
    if (!formData.descricao?.trim()) {
      validationErrors.descricao = "A descrição é obrigatória.";
    } else if (formData.descricao.trim().length < 20) {
      validationErrors.descricao = "A descrição deve ter pelo menos 20 caracteres.";
    }

    // Validação de preço
    if (!formData.preco) {
      validationErrors.preco = "O preço é obrigatório.";
    } else {
      const precoNumerico = parseFloat(formData.preco);
      if (isNaN(precoNumerico) || precoNumerico <= 0) {
        validationErrors.preco = "O preço deve ser um número maior que zero.";
      } else {
        // Validar se o preço está na faixa da categoria
        const validacao = validarValorCategoria(formData.categoria_id, precoNumerico);
        if (!validacao.valido) {
          validationErrors.preco = validacao.mensagem;
        }
      }
    }

    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  }, [formData, validarValorCategoria]);

  const handleSubmit = useCallback(async (): Promise<boolean> => {
    if (!validateForm()) {
      toast.error("Por favor, corrija os erros no formulário.");
      return false;
    }

    return new Promise((resolve) => {
      const dadosAtualizados = {
        titulo: formData.titulo,
        descricao: formData.descricao,
        categoria: formData.categoria_id,
        subcategoria: formData.subcategoria,
        genero: formData.genero,
        tamanho_categoria: formData.tamanho_categoria,
        tamanho_valor: formData.tamanho_valor,
        estado_conservacao: formData.estado_conservacao,
        valor_girinhas: parseFloat(formData.preco)
      };

      atualizarItem(
        { itemId: initialItem.id, dadosAtualizados },
        {
          onSuccess: () => {
            toast.success("Item atualizado com sucesso! 🎉");
            resolve(true);
          },
          onError: (error: any) => {
            console.error('Erro ao atualizar item:', error);
            toast.error("Erro ao atualizar o item. Tente novamente.");
            resolve(false);
          }
        }
      );
    });
  }, [formData, validateForm, atualizarItem, initialItem.id]);

  return {
    formData,
    updateFormData,
    errors,
    loading,
    handleSubmit,
    resetForm,
    isValid: Object.keys(errors).length === 0
  };
};
