
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
    <div className="space-y-6">
      {/* Dados Básicos (sem preço) */}
      <ItemBasicInfo
        formData={{
          titulo: formData.titulo,
          descricao: formData.descricao,
          preco: '', // Não mostrar preço aqui
          imagens: formData.imagens
        }}
        onFieldChange={onFieldChange}
        errors={errors}
        faixaPrecos={null} // Não mostrar faixa aqui
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

      {/* Preço no final */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
          Preço
          <svg className="w-4 h-4 text-yellow-500" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"></path>
          </svg>
          <span className="text-red-400">*</span>
        </label>
        <input
          type="number"
          name="preco"
          value={formData.preco}
          onChange={(e) => onFieldChange('preco', e.target.value)}
          placeholder="25"
          className="flex h-10 w-full rounded-lg border border-gray-200 bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-300 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
        {errors.preco && <p className="text-red-500 text-xs mt-1">{errors.preco}</p>}
        
        {/* Mostrar faixa de preços da categoria */}
        {faixaPrecos && (
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
            <p className="text-xs text-blue-600 flex items-center gap-2">
              <span className="text-sm">💡</span>
              Faixa sugerida: {faixaPrecos.minimo} - {faixaPrecos.maximo} Girinhas
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
