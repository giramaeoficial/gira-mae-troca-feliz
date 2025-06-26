
import React from 'react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import ImageUpload from "@/components/ui/image-upload";

interface ItemBasicInfoProps {
  formData: {
    titulo: string;
    descricao: string;
    preco: string;
    imagens: File[];
  };
  onFieldChange: (field: string, value: any) => void;
  errors: any;
  faixaPrecos?: { minimo: number; maximo: number } | null;
}

export const ItemBasicInfo: React.FC<ItemBasicInfoProps> = ({
  formData,
  onFieldChange,
  errors,
  faixaPrecos
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onFieldChange(name, value);
  };

  return (
    <div className="space-y-6">
      {/* Fotos do Item */}
      <div className="bg-gradient-to-br from-pink-25 to-purple-25 p-4 rounded-xl border border-pink-100">
        <Label className="text-sm font-medium mb-4 block text-gray-700">
          Fotos do Item
          <span className="text-red-400 ml-1">*</span>
        </Label>
        <ImageUpload 
          value={formData.imagens} 
          onChange={(files) => onFieldChange('imagens', files)}
          maxFiles={6}
        />
        <p className="text-xs text-gray-500 mt-2">Adicione até 6 fotos. A primeira foto será a capa do anúncio.</p>
        {errors.imagens && <p className="text-red-500 text-sm mt-2">{errors.imagens}</p>}
      </div>

      {/* Título */}
      <div className="space-y-2">
        <Label htmlFor="titulo" className="text-sm font-medium text-gray-700">
          Título do Anúncio
          <span className="text-red-400 ml-1">*</span>
        </Label>
        <Input
          type="text"
          id="titulo"
          name="titulo"
          value={formData.titulo}
          onChange={handleChange}
          placeholder="Ex: Vestido de Festa Rosa - Tam 4 anos"
          className="text-sm border-gray-200 focus:border-pink-300 focus:ring-pink-200 rounded-lg"
        />
        {errors.titulo && <p className="text-red-500 text-xs mt-1">{errors.titulo}</p>}
      </div>

      {/* Descrição Detalhada */}
      <div className="space-y-2">
        <Label htmlFor="descricao" className="text-sm font-medium text-gray-700">
          Descrição Detalhada
        </Label>
        <Textarea
          id="descricao"
          name="descricao"
          value={formData.descricao}
          onChange={handleChange}
          placeholder="Descreva o item detalhadamente, incluindo características especiais, defeitos (se houver), marca, etc..."
          className="min-h-[100px] text-sm border-gray-200 focus:border-pink-300 focus:ring-pink-200 rounded-lg resize-none"
          rows={4}
        />
        {errors.descricao && <p className="text-red-500 text-xs mt-1">{errors.descricao}</p>}
      </div>

      {/* Preço */}
      <div className="space-y-2">
        <Label htmlFor="preco" className="text-sm font-medium text-gray-700 flex items-center gap-2">
          Preço
          <svg className="w-4 h-4 text-yellow-500" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"></path>
          </svg>
          <span className="text-red-400">*</span>
        </Label>
        <Input
          type="number"
          id="preco"
          name="preco"
          value={formData.preco}
          onChange={handleChange}
          placeholder="25"
          className="text-sm border-gray-200 focus:border-pink-300 focus:ring-pink-200 rounded-lg"
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
