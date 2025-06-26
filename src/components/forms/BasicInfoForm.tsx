
import React from 'react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CategorySelector } from './CategorySelector';
import { GenderSelector } from './GenderSelector';
import { TamanhoInteligente } from './TamanhoInteligente';
import { EstadoConservacaoSelect } from './EstadoConservacaoSelect';
import { PrecoInput } from './PrecoInput';

interface BasicInfoFormProps {
  formData: any;
  onFieldChange: (field: string, value: any) => void;
  errors: any;
  configuracoes?: any[];
}

export const BasicInfoForm: React.FC<BasicInfoFormProps> = ({
  formData,
  onFieldChange,
  errors,
  configuracoes
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onFieldChange(name, value);
  };

  const handleCategoriaChange = (categoria: string) => {
    onFieldChange('categoria_id', categoria);
  };

  const handleSubcategoriaChange = (subcategoria: string) => {
    onFieldChange('subcategoria', subcategoria);
  };

  const handleGeneroChange = (genero: string) => {
    onFieldChange('genero', genero);
  };

  const handleTamanhoChange = (tipo: string, valor: string) => {
    onFieldChange('tamanho_categoria', tipo);
    onFieldChange('tamanho_valor', valor);
  };

  const handleEstadoChange = (estado: string) => {
    onFieldChange('estado_conservacao', estado);
  };

  const handlePrecoChange = (preco: string) => {
    onFieldChange('preco', preco);
  };

  const categoriaSelecionada = configuracoes?.find(c => c.categoria === formData.categoria_id);

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="nome">Nome do Item</Label>
        <Input
          type="text"
          id="nome"
          name="nome"
          value={formData.nome}
          onChange={handleChange}
          placeholder="Ex: Vestido de festa, Livro usado..."
          className="mt-2"
        />
        {errors.nome && <p className="text-red-500 text-sm mt-1">{errors.nome}</p>}
      </div>

      <CategorySelector
        categoria={formData.categoria_id}
        subcategoria={formData.subcategoria}
        onCategoriaChange={handleCategoriaChange}
        onSubcategoriaChange={handleSubcategoriaChange}
        categoriaError={errors.categoria_id}
        subcategoriaError={errors.subcategoria}
      />

      <GenderSelector
        value={formData.genero}
        onChange={handleGeneroChange}
        error={errors.genero}
      />

      {formData.categoria_id && (
        <TamanhoInteligente
          categoria={formData.categoria_id}
          subcategoria={formData.subcategoria}
          value={formData.tamanho_valor}
          tipoTamanho={formData.tamanho_categoria}
          onChange={handleTamanhoChange}
          error={errors.tamanho}
        />
      )}

      <EstadoConservacaoSelect
        value={formData.estado_conservacao}
        onChange={handleEstadoChange}
        error={errors.estado_conservacao}
      />

      <PrecoInput
        value={formData.preco}
        onChange={handlePrecoChange}
        categoria={categoriaSelecionada}
        estadoConservacao={formData.estado_conservacao}
        error={errors.preco}
      />

      <div>
        <Label htmlFor="descricao">Descrição</Label>
        <Textarea
          id="descricao"
          name="descricao"
          value={formData.descricao}
          onChange={handleChange}
          placeholder="Descreva o item detalhadamente..."
          className="mt-2"
          rows={4}
        />
        {errors.descricao && <p className="text-red-500 text-sm mt-1">{errors.descricao}</p>}
      </div>
    </div>
  );
};
