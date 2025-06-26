
import React from 'react';
import { useConfigCategorias } from '@/hooks/useConfigCategorias';
import { ItemBasicInfo } from './ItemBasicInfo';
import { ItemCategorization } from './ItemCategorization';

interface SimpleItemFormProps {
  formData: {
    titulo: string;
    descricao: string;
    categoria_id: string;
    subcategoria: string;
    genero: string;
    tamanho_categoria: string;
    tamanho_valor: string;
    estado_conservacao: string;
    preco: string;
    imagens: File[];
  };
  onFieldChange: (field: string, value: any) => void;
  errors: any;
}

export const SimpleItemForm: React.FC<SimpleItemFormProps> = ({
  formData,
  onFieldChange,
  errors
}) => {
  const { getFaixaValores } = useConfigCategorias();
  const faixaPrecos = getFaixaValores(formData.categoria_id);

  return (
    <div className="space-y-8">
      <ItemBasicInfo
        formData={{
          titulo: formData.titulo,
          descricao: formData.descricao,
          preco: formData.preco,
          imagens: formData.imagens
        }}
        onFieldChange={onFieldChange}
        errors={errors}
        faixaPrecos={faixaPrecos}
      />
      
      <ItemCategorization
        formData={{
          categoria_id: formData.categoria_id,
          subcategoria: formData.subcategoria,
          genero: formData.genero,
          tamanho_categoria: formData.tamanho_categoria,
          tamanho_valor: formData.tamanho_valor,
          estado_conservacao: formData.estado_conservacao
        }}
        onFieldChange={onFieldChange}
        errors={errors}
      />
    </div>
  );
};
