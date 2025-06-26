
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
      <div>
        <Label className="text-base font-medium mb-3 block">📸 Fotos do Item</Label>
        <ImageUpload 
          value={formData.imagens} 
          onChange={(files) => onFieldChange('imagens', files)}
        />
        {errors.imagens && <p className="text-red-500 text-sm mt-2">{errors.imagens}</p>}
      </div>

      {/* Título */}
      <div>
        <Label htmlFor="titulo" className="text-base font-medium">✏️ Título</Label>
        <Input
          type="text"
          id="titulo"
          name="titulo"
          value={formData.titulo}
          onChange={handleChange}
          placeholder="Ex: Vestido de festa rosa, Tênis infantil..."
          className="text-base mt-2"
        />
        {errors.titulo && <p className="text-red-500 text-sm mt-2">{errors.titulo}</p>}
      </div>

      {/* Descrição Detalhada */}
      <div>
        <Label htmlFor="descricao" className="text-base font-medium">📝 Descrição Detalhada</Label>
        <Textarea
          id="descricao"
          name="descricao"
          value={formData.descricao}
          onChange={handleChange}
          placeholder="Descreva o item detalhadamente, incluindo características especiais, defeitos (se houver), marca, etc..."
          className="min-h-[120px] mt-2"
          rows={6}
        />
        {errors.descricao && <p className="text-red-500 text-sm mt-1">{errors.descricao}</p>}
      </div>

      {/* Preço */}
      <div>
        <Label htmlFor="preco" className="text-base font-medium">💰 Preço (Girinhas)</Label>
        <Input
          type="number"
          id="preco"
          name="preco"
          value={formData.preco}
          onChange={handleChange}
          placeholder="Ex: 25"
          className="mt-2"
        />
        {errors.preco && <p className="text-red-500 text-sm mt-1">{errors.preco}</p>}
        
        {/* Mostrar faixa de preços da categoria */}
        {faixaPrecos && (
          <p className="text-sm text-gray-500 mt-2">
            💡 Faixa sugerida: {faixaPrecos.minimo} - {faixaPrecos.maximo} Girinhas
          </p>
        )}
      </div>
    </div>
  );
};
