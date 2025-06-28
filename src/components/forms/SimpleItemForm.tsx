
import React from 'react';
import { useConfigCategorias } from '@/hooks/useConfigCategorias';
import { ItemBasicInfo } from './ItemBasicInfo';
import { ItemCategorization } from './ItemCategorization';
import { ItemPricing } from './ItemPricing';
import ImageUpload from '@/components/ui/image-upload';

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
    imagensExistentes?: string[];
  };
  onFieldChange: (field: string, value: any) => void;
  onRemoverImagemExistente?: (url: string) => void;
  errors: any;
  isEditing?: boolean;
}

export const SimpleItemForm: React.FC<SimpleItemFormProps> = ({
  formData,
  onFieldChange,
  onRemoverImagemExistente,
  errors,
  isEditing = false
}) => {
  const { getFaixaValores } = useConfigCategorias();
  const faixaPrecos = getFaixaValores(formData.categoria_id);

  return (
    <div className="space-y-6">
      {/* Fotos do Item */}
      <div className="bg-gradient-to-br from-pink-25 to-purple-25 p-4 rounded-xl border border-pink-100">
        <label className="text-sm font-medium mb-4 block text-gray-700">
          Fotos do Item
          <span className="text-red-400 ml-1">*</span>
        </label>
        
        <ImageUpload
          value={formData.imagens}
          onChange={(files) => onFieldChange('imagens', files)}
          maxFiles={6}
        />
        
        {/* Mostrar imagens existentes se estiver editando */}
        {isEditing && formData.imagensExistentes && formData.imagensExistentes.length > 0 && (
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-2">Imagens atuais:</p>
            <div className="grid grid-cols-3 gap-2">
              {formData.imagensExistentes.map((url, index) => (
                <div key={index} className="relative">
                  <img 
                    src={url} 
                    alt={`Imagem ${index + 1}`}
                    className="w-full h-20 object-cover rounded"
                  />
                  {onRemoverImagemExistente && (
                    <button
                      type="button"
                      onClick={() => onRemoverImagemExistente(url)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        <p className="text-xs text-gray-500 mt-2">Adicione até 6 fotos. A primeira foto será a capa do anúncio.</p>
        {errors.imagens && <p className="text-red-500 text-sm mt-2">{errors.imagens}</p>}
      </div>

      {/* Dados Básicos (sem imagens, já tratadas acima) */}
      <ItemBasicInfo
        formData={{
          titulo: formData.titulo,
          descricao: formData.descricao,
          preco: '',
          imagens: []
        }}
        onFieldChange={onFieldChange}
        errors={errors}
        faixaPrecos={null}
        hideImageUpload={true}
      />
      
      {/* Categorização */}
      <div className="bg-gradient-to-br from-purple-25 to-pink-25 p-5 rounded-xl border border-purple-100">
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

      {/* Preço no final com sugestões */}
      <ItemPricing
        preco={formData.preco}
        onFieldChange={onFieldChange}
        errors={errors}
        faixaPrecos={faixaPrecos}
      />
    </div>
  );
};
