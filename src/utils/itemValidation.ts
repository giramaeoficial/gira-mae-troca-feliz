
import { type Address } from '@/hooks/useAddress';

export interface NovoFormData {
  // Básico
  nome: string;
  descricao: string;
  
  // Categorização
  categoria_id: string;
  subcategoria: string;
  genero: 'menino' | 'menina' | 'unissex';
  
  // Tamanho inteligente
  tamanho_categoria: string;
  tamanho_valor: string;
  
  // Estado e preço
  estado_conservacao: 'novo' | 'seminovo' | 'usado' | 'muito usado';
  preco: string;
  
  // Mídia
  imagens: File[];
  
  // Entrega
  aceita_entrega: boolean;
  raio_entrega_km: number;
  instrucoes_retirada: string;
  
  // Endereço simplificado
  endereco_tipo: 'meu' | 'escola' | 'outro';
  escola_selecionada: any;
  endereco_personalizado: Partial<Address>;
}

export interface ValidationErrors {
  [key: string]: string;
}

export const validateItemForm = (data: NovoFormData, userAddress?: any): ValidationErrors => {
  const errors: ValidationErrors = {};

  // Campos obrigatórios básicos
  if (!data.nome?.trim()) {
    errors.nome = "O nome do item é obrigatório.";
  } else if (data.nome.trim().length < 10) {
    errors.nome = "O nome deve ter pelo menos 10 caracteres.";
  } else if (data.nome.trim().length > 100) {
    errors.nome = "O nome deve ter no máximo 100 caracteres.";
  }

  if (!data.categoria_id) {
    errors.categoria_id = "A categoria é obrigatória.";
  }

  if (!data.subcategoria) {
    errors.subcategoria = "A subcategoria é obrigatória.";
  }

  if (!data.genero) {
    errors.genero = "O gênero é obrigatório.";
  }

  if (!data.estado_conservacao) {
    errors.estado_conservacao = "O estado de conservação é obrigatório.";
  }

  if (!data.tamanho_valor) {
    errors.tamanho = "O tamanho é obrigatório.";
  }

  // Validação de descrição
  if (!data.descricao?.trim()) {
    errors.descricao = "A descrição é obrigatória.";
  } else if (data.descricao.trim().length < 20) {
    errors.descricao = "A descrição deve ter pelo menos 20 caracteres.";
  }

  // Validação de preço
  if (!data.preco) {
    errors.preco = "O preço é obrigatório.";
  } else {
    const precoNumerico = parseFloat(data.preco);
    if (isNaN(precoNumerico) || precoNumerico <= 0) {
      errors.preco = "O preço deve ser um número maior que zero.";
    } else if (precoNumerico > 500) {
      errors.preco = "O preço não pode exceder 500 Girinhas.";
    }
  }

  // Validação de imagens
  if (!data.imagens || data.imagens.length === 0) {
    errors.imagens = "Pelo menos uma foto é obrigatória.";
  } else if (data.imagens.length > 5) {
    errors.imagens = "Máximo de 5 fotos permitidas.";
  }

  // Validação de endereço
  if (data.endereco_tipo === 'meu') {
    if (!userAddress) {
      errors.endereco = "Você precisa cadastrar seu endereço principal no perfil para usar esta opção.";
    } else if (!userAddress.cep || !userAddress.endereco || !userAddress.cidade || !userAddress.estado) {
      errors.endereco = "Seu endereço principal está incompleto. Complete seu perfil primeiro.";
    }
  } else if (data.endereco_tipo === 'escola') {
    if (!data.escola_selecionada) {
      errors.endereco = "Selecione uma escola.";
    }
  } else if (data.endereco_tipo === 'outro') {
    const endereco = data.endereco_personalizado;
    if (!endereco.cep || !endereco.endereco || !endereco.cidade || !endereco.estado) {
      errors.endereco = "Preencha todos os campos obrigatórios do endereço.";
    }
  }

  // Validação de entrega
  if (data.aceita_entrega && (!data.raio_entrega_km || data.raio_entrega_km <= 0)) {
    errors.raio_entrega = "Defina o raio de entrega.";
  }

  return errors;
};

export const validatePriceByCategory = (
  categoria: string, 
  preco: number,
  configCategorias: any[]
): string | null => {
  const config = configCategorias.find(c => c.categoria === categoria);
  
  if (!config) return null;

  if (preco < config.valor_minimo) {
    return `Preço mínimo para ${categoria}: ${config.valor_minimo} Girinhas`;
  }

  if (preco > config.valor_maximo) {
    return `Preço máximo para ${categoria}: ${config.valor_maximo} Girinhas`;
  }

  return null;
};

export const getProgressSteps = (data: NovoFormData, userAddress?: any) => {
  return [
    { 
      label: "Nome", 
      completed: !!data.nome && data.nome.length >= 10, 
      required: true 
    },
    { 
      label: "Categoria", 
      completed: !!data.categoria_id && !!data.subcategoria, 
      required: true 
    },
    { 
      label: "Gênero", 
      completed: !!data.genero, 
      required: true 
    },
    { 
      label: "Tamanho", 
      completed: !!data.tamanho_valor, 
      required: true 
    },
    { 
      label: "Estado", 
      completed: !!data.estado_conservacao, 
      required: true 
    },
    { 
      label: "Preço", 
      completed: !!data.preco && parseFloat(data.preco) > 0, 
      required: true 
    },
    { 
      label: "Descrição", 
      completed: !!data.descricao && data.descricao.length >= 20, 
      required: true 
    },
    { 
      label: "Localização", 
      completed: data.endereco_tipo === 'meu' ? !!userAddress : 
        data.endereco_tipo === 'escola' ? !!data.escola_selecionada :
        !!(data.endereco_personalizado.cep && data.endereco_personalizado.cidade), 
      required: true 
    },
    { 
      label: "Imagens", 
      completed: data.imagens.length > 0, 
      required: true 
    }
  ];
};
