
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
    </div>
  );
};
