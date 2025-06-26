
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import { useAuth } from '@/hooks/useAuth';
import { usePublicarItem } from '@/hooks/useItensOptimized';
import { useConfigCategorias } from '@/hooks/useConfigCategorias';
import { useUserAddress } from '@/hooks/useUserAddress';
import { validateItemForm, getProgressSteps, type NovoFormData, type ValidationErrors } from '@/utils/itemValidation';

export const usePublicarItemFormV2 = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { configuracoes } = useConfigCategorias();
  const { mutate: publicarItem, isPending: loading } = usePublicarItem();
  const { userAddress } = useUserAddress();

  const [formData, setFormData] = useState<NovoFormData>({
    nome: '',
    descricao: '',
    categoria_id: '',
    subcategoria: '',
    genero: 'unissex',
    tamanho_categoria: '',
    tamanho_valor: '',
    estado_conservacao: 'usado',
    preco: '',
    imagens: [],
    aceita_entrega: false,
    raio_entrega_km: 5,
    instrucoes_retirada: '',
    endereco_tipo: 'meu',
    escola_selecionada: null,
    endereco_personalizado: {}
  });

  const [errors, setErrors] = useState<ValidationErrors>({});

  const updateFormData = (updates: Partial<NovoFormData>) => {
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
  };

  const validateForm = (): boolean => {
    const validationErrors = validateItemForm(formData, userAddress);
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Por favor, corrija os erros no formulário.");
      return;
    }

    try {
      const categoriaSelecionada = configuracoes?.find(c => c.categoria === formData.categoria_id);
      
      if (!categoriaSelecionada) {
        toast.error("Categoria não encontrada.");
        return;
      }

      // Preparar dados de endereço baseado no tipo selecionado
      let enderecoData: any = {};

      if (formData.endereco_tipo === 'meu' && userAddress) {
        // Usar endereço principal do usuário
        enderecoData = {
          endereco_cep: userAddress.cep,
          endereco_rua: userAddress.endereco,
          endereco_bairro: userAddress.bairro,
          endereco_cidade: userAddress.cidade,
          endereco_estado: userAddress.estado,
          endereco_complemento: userAddress.complemento,
          ponto_referencia: userAddress.ponto_referencia
        };
      } else if (formData.endereco_tipo === 'escola' && formData.escola_selecionada) {
        const escola = formData.escola_selecionada;
        enderecoData = {
          escola_id: escola.codigo_inep,
          endereco_rua: escola.endereco || '',
          endereco_bairro: escola.bairro || '',
          endereco_cidade: escola.municipio,
          endereco_estado: escola.uf,
          ponto_referencia: `Escola: ${escola.escola}`
        };
      } else if (formData.endereco_tipo === 'outro') {
        const endereco = formData.endereco_personalizado;
        enderecoData = {
          endereco_cep: endereco.cep,
          endereco_rua: endereco.endereco,
          endereco_bairro: endereco.bairro,
          endereco_cidade: endereco.cidade,
          endereco_estado: endereco.estado,
          endereco_complemento: endereco.complemento,
          ponto_referencia: endereco.ponto_referencia
        };
      }

      const itemData = {
        titulo: formData.nome,
        descricao: formData.descricao,
        categoria: formData.categoria_id,
        subcategoria: formData.subcategoria,
        genero: formData.genero,
        tamanho_categoria: formData.tamanho_categoria,
        tamanho_valor: formData.tamanho_valor,
        estado_conservacao: formData.estado_conservacao,
        valor_girinhas: parseFloat(formData.preco),
        aceita_entrega: formData.aceita_entrega,
        raio_entrega_km: formData.aceita_entrega ? formData.raio_entrega_km : null,
        instrucoes_retirada: formData.instrucoes_retirada || null,
        publicado_por: user?.id,
        status: 'disponivel',
        ...enderecoData
      };

      publicarItem(
        { itemData, fotos: formData.imagens },
        {
          onSuccess: () => {
            toast.success("Item publicado com sucesso! 🎉");
            navigate('/feed');
          },
          onError: (error: any) => {
            console.error('Erro ao publicar item:', error);
            toast.error("Erro ao publicar o item. Tente novamente.");
          }
        }
      );
    } catch (error: any) {
      console.error("Erro ao criar item:", error);
      toast.error("Erro inesperado. Tente novamente.");
    }
  };

  const calculateProgress = () => {
    return getProgressSteps(formData, userAddress);
  };

  const progress = (() => {
    const steps = calculateProgress();
    const completedSteps = steps.filter(step => step.completed).length;
    return Math.round((completedSteps / steps.length) * 100);
  })();

  return {
    formData,
    updateFormData,
    errors,
    progress,
    loading,
    handleSubmit,
    calculateProgress,
    userAddress,
    isValid: Object.keys(errors).length === 0 && progress === 100
  };
};
