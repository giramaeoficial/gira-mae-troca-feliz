import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import { useAuth } from '@/hooks/useAuth';
import { useItens } from '@/hooks/useItens';
import { useConfigCategorias } from '@/hooks/useConfigCategorias';
import { useUserAddress } from '@/hooks/useUserAddress';
import { type Address } from '@/hooks/useAddress';

export interface FormData {
  nome: string;
  categoria_id: string;
  estado_conservacao: string;
  tamanho: string;
  preco: string;
  descricao: string;
  imagens: File[];
  endereco_tipo: 'meu' | 'escola' | 'outro';
  escola_selecionada: any;
  endereco_personalizado: Partial<Address>;
  aceita_entrega: boolean;
  raio_entrega_km: number;
  instrucoes_retirada: string;
}

interface ValidationErrors {
  [key: string]: string;
}

export const usePublicarItemForm = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { configuracoes } = useConfigCategorias();
  const { publicarItem, loading } = useItens();
  const { userAddress } = useUserAddress();

  const [formData, setFormData] = useState<FormData>({
    nome: '',
    categoria_id: '',
    estado_conservacao: '',
    tamanho: '',
    preco: '',
    descricao: '',
    imagens: [],
    endereco_tipo: 'meu',
    escola_selecionada: null,
    endereco_personalizado: {},
    aceita_entrega: false,
    raio_entrega_km: 5,
    instrucoes_retirada: ''
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [progress, setProgress] = useState(0);

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const validateForm = (data: FormData): ValidationErrors => {
    const errors: ValidationErrors = {};

    if (!data.nome) {
      errors.nome = "O nome do item é obrigatório.";
    }

    if (!data.categoria_id) {
      errors.categoria_id = "A categoria é obrigatória.";
    }

    if (!data.estado_conservacao) {
      errors.estado_conservacao = "O estado de conservação é obrigatório.";
    }

    if (!data.preco) {
      errors.preco = "O preço é obrigatório.";
    } else if (isNaN(Number(data.preco))) {
      errors.preco = "O preço deve ser um número.";
    }

    if (!data.descricao) {
      errors.descricao = "A descrição é obrigatória.";
    }

    if (!data.imagens || data.imagens.length === 0) {
      errors.imagens = "Pelo menos uma imagem é obrigatória.";
    }

    return errors;
  };

  const validateAddress = (data: FormData): ValidationErrors => {
    const errors: ValidationErrors = {};

    if (data.endereco_tipo === 'meu') {
      if (!userAddress) {
        errors.endereco = "Você precisa cadastrar seu endereço principal no perfil para usar esta opção.";
      } else if (!userAddress.cep || !userAddress.endereco || !userAddress.cidade || !userAddress.estado) {
        errors.endereco = "Seu endereço principal está incompleto. Complete seu perfil primeiro.";
      }
    } else if (data.endereco_tipo === 'escola') {
      if (!data.escola_selecionada) {
        errors.endereco = "Selecione uma escola.";
      } else if (!data.escola_selecionada.municipio || !data.escola_selecionada.uf) {
        errors.endereco = "A escola selecionada não possui dados de localização completos.";
      }
    } else if (data.endereco_tipo === 'outro') {
      const endereco = data.endereco_personalizado;
      if (!endereco.cep || !endereco.endereco || !endereco.cidade || !endereco.estado) {
        errors.endereco = "Preencha todos os campos obrigatórios do endereço.";
      }
    }

    if (data.aceita_entrega && !data.raio_entrega_km) {
      errors.raio_entrega = "Defina o raio de entrega.";
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const basicErrors = validateForm(formData);
    const addressErrors = validateAddress(formData);
    const allErrors = { ...basicErrors, ...addressErrors };
    
    setErrors(allErrors);

    if (Object.keys(allErrors).length === 0) {
      try {
        const categoriaSelecionada = configuracoes?.find(c => c.codigo === formData.categoria_id);
        
        if (!categoriaSelecionada) {
          toast.error("Categoria não encontrada.");
          return;
        }

        // Preparar dados de endereço
        let enderecoData: any = {};

        if (formData.endereco_tipo === 'meu' && userAddress) {
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
          const bairro = extrairBairroEscola(escola);
          
          enderecoData = {
            escola_id: escola.codigo_inep,
            endereco_rua: escola.endereco || '',
            endereco_bairro: bairro,
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
          categoria: categoriaSelecionada.codigo,
          estado_conservacao: formData.estado_conservacao,
          tamanho: formData.tamanho || null,
          valor_girinhas: parseFloat(formData.preco),
          publicado_por: user?.id,
          status: 'disponivel',
          aceita_entrega: formData.aceita_entrega,
          raio_entrega_km: formData.aceita_entrega ? formData.raio_entrega_km : null,
          instrucoes_retirada: formData.instrucoes_retirada || null,
          ...enderecoData
        };

        setProgress(30);

        const success = await publicarItem(itemData, formData.imagens);
        
        if (success) {
          setProgress(100);
          toast.success("Item publicado com sucesso!");
          navigate('/feed');
        } else {
          toast.error("Erro ao publicar o item. Tente novamente.");
          setProgress(0);
        }
      } catch (error: any) {
        console.error("Erro ao criar item:", error);
        toast.error("Erro ao publicar o item. Tente novamente.");
        setProgress(0);
      }
    } else {
      toast.error("Por favor, corrija os erros no formulário.");
    }
  };

  const calculateProgress = () => {
    const steps = [
      { label: "Nome", completed: !!formData.nome, required: true },
      { label: "Categoria", completed: !!formData.categoria_id, required: true },
      { label: "Estado", completed: !!formData.estado_conservacao, required: true },
      { label: "Preço", completed: !!formData.preco, required: true },
      { label: "Descrição", completed: !!formData.descricao, required: true },
      { label: "Localização", completed: formData.endereco_tipo === 'meu' ? !!userAddress : 
        formData.endereco_tipo === 'escola' ? !!formData.escola_selecionada :
        !!(formData.endereco_personalizado.cep && formData.endereco_personalizado.cidade), required: true },
      { label: "Imagens", completed: formData.imagens.length > 0, required: true },
      { label: "Tamanho", completed: !!formData.tamanho, required: false }
    ];
    return steps;
  };

  return {
    formData,
    updateFormData,
    errors,
    progress,
    loading,
    handleSubmit,
    calculateProgress,
    userAddress
  };
};

// Função utilitária movida para o hook
const extrairBairroEscola = (escola: any): string => {
  if (escola.bairro) {
    return escola.bairro.trim();
  }

  if (!escola.endereco) {
    return '';
  }

  const endereco = escola.endereco.trim();
  
  const padroes = [
    /^[^,]+,\s*[^,]*,\s*([^,]+),/,
    /^[^,]+,\s*([^,]+)$/,
    /^[^-]+-\s*([^-]+)$/,
    /(?:bairro|distrito|vila|jardim|centro)\s+([^,\-]+)/i,
  ];

  for (const padrao of padroes) {
    const match = endereco.match(padrao);
    if (match && match[1]) {
      let bairro = match[1].trim();
      bairro = bairro.replace(/^\d+\s*/, '');
      
      const palavrasExcluir = ['rua', 'avenida', 'av', 'r', 'número', 'nº', 'n'];
      const palavrasBairro = bairro.split(/\s+/).filter(palavra => 
        !palavrasExcluir.includes(palavra.toLowerCase()) && palavra.length > 1
      );
      
      if (palavrasBairro.length > 0) {
        return palavrasBairro.join(' ');
      }
    }
  }

  const enderecoPartes = endereco.split(',').map(parte => parte.trim());
  if (enderecoPartes.length > 1) {
    let bairro = enderecoPartes[1];
    bairro = bairro.replace(/^\d+\s*/, '');
    
    if (bairro && bairro.length > 2) {
      return bairro;
    }
  }

  return '';
};
