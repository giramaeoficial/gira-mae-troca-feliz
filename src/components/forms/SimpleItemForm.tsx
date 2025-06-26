
import React from 'react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ImageUpload from "@/components/ui/image-upload";
import { useConfigCategorias } from '@/hooks/useConfigCategorias';
import { useSubcategorias } from '@/hooks/useSubcategorias';
import { useTiposTamanho } from '@/hooks/useTamanhosPorCategoria';

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
  const { configuracoes } = useConfigCategorias();
  const { subcategorias } = useSubcategorias();
  const { tiposTamanho } = useTiposTamanho(formData.categoria_id);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onFieldChange(name, value);
  };

  const handleCategoriaChange = (categoria: string) => {
    onFieldChange('categoria_id', categoria);
    onFieldChange('subcategoria', '');
    onFieldChange('tamanho_categoria', '');
    onFieldChange('tamanho_valor', '');
  };

  const handleTamanhoChange = (valor: string) => {
    const tipoUnico = Object.keys(tiposTamanho)[0];
    onFieldChange('tamanho_categoria', tipoUnico || '');
    onFieldChange('tamanho_valor', valor);
  };

  const subcategoriasFiltradas = subcategorias.filter(
    sub => sub.categoria_pai === formData.categoria_id
  );

  const tipoUnico = Object.keys(tiposTamanho)[0];
  const tamanhosDisponiveis = tipoUnico ? tiposTamanho[tipoUnico] : [];

  const categoriaSelecionada = configuracoes?.find(c => c.categoria === formData.categoria_id);

  return (
    <div className="space-y-6">
      {/* Upload de Imagens - Primeiro como na imagem */}
      <div>
        <Label>Fotos do Item</Label>
        <ImageUpload 
          value={formData.imagens} 
          onChange={(files) => onFieldChange('imagens', files)}
        />
        {errors.imagens && <p className="text-red-500 text-sm mt-1">{errors.imagens}</p>}
      </div>

      {/* Título */}
      <div>
        <Label htmlFor="titulo">Título do Item</Label>
        <Input
          type="text"
          id="titulo"
          name="titulo"
          value={formData.titulo}
          onChange={handleChange}
          placeholder="Ex: Vestido de festa, Livro usado..."
          className="mt-2"
        />
        {errors.titulo && <p className="text-red-500 text-sm mt-1">{errors.titulo}</p>}
      </div>

      {/* Categoria */}
      <div>
        <Label htmlFor="categoria">Categoria</Label>
        <Select value={formData.categoria_id} onValueChange={handleCategoriaChange}>
          <SelectTrigger className="w-full mt-2">
            <SelectValue placeholder="Selecione uma categoria" />
          </SelectTrigger>
          <SelectContent>
            {configuracoes?.map(config => (
              <SelectItem key={config.id} value={config.categoria}>
                {config.categoria === 'roupas' && '👕 '}
                {config.categoria === 'calcados' && '👟 '}
                {config.categoria === 'brinquedos' && '🧸 '}
                {config.categoria === 'livros' && '📚 '}
                {config.categoria === 'equipamentos' && '🍼 '}
                {config.categoria === 'acessorios' && '🎒 '}
                {config.categoria.charAt(0).toUpperCase() + config.categoria.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.categoria_id && <p className="text-red-500 text-sm mt-1">{errors.categoria_id}</p>}
      </div>

      {/* Subcategoria */}
      {formData.categoria_id && (
        <div>
          <Label htmlFor="subcategoria">Subcategoria</Label>
          <Select value={formData.subcategoria} onValueChange={(value) => onFieldChange('subcategoria', value)}>
            <SelectTrigger className="w-full mt-2">
              <SelectValue placeholder="Selecione uma subcategoria" />
            </SelectTrigger>
            <SelectContent>
              {subcategoriasFiltradas.map(sub => (
                <SelectItem key={sub.id} value={sub.nome}>
                  {sub.icone} {sub.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.subcategoria && <p className="text-red-500 text-sm mt-1">{errors.subcategoria}</p>}
        </div>
      )}

      {/* Idade/Tamanho e Gênero lado a lado como na imagem */}
      <div className="grid grid-cols-2 gap-4">
        {/* Tamanho/Idade */}
        <div>
          <Label className="text-base font-medium">
            {formData.categoria_id === 'calcados' ? 'Número' : 
             formData.categoria_id === 'brinquedos' ? 'Idade' : 
             formData.categoria_id === 'livros' ? 'Faixa Etária' : 'Tamanho'}
          </Label>
          <Select 
            value={formData.tamanho_valor} 
            onValueChange={handleTamanhoChange}
          >
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {tamanhosDisponiveis?.map((t) => (
                <SelectItem key={t.id} value={t.valor}>
                  {t.label_display}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.tamanho && <p className="text-red-500 text-sm mt-1">{errors.tamanho}</p>}
        </div>

        {/* Gênero */}
        <div>
          <Label htmlFor="genero">Gênero</Label>
          <Select value={formData.genero} onValueChange={(value) => onFieldChange('genero', value)}>
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="menino">👦 Menino</SelectItem>
              <SelectItem value="menina">👧 Menina</SelectItem>
              <SelectItem value="unissex">👶 Unissex</SelectItem>
            </SelectContent>
          </Select>
          {errors.genero && <p className="text-red-500 text-sm mt-1">{errors.genero}</p>}
        </div>
      </div>

      {/* Estado de Conservação */}
      <div>
        <Label htmlFor="estado_conservacao">Estado de Conservação</Label>
        <Select value={formData.estado_conservacao} onValueChange={(value) => onFieldChange('estado_conservacao', value)}>
          <SelectTrigger className="w-full mt-2">
            <SelectValue placeholder="Selecione o estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="novo">✨ Novo</SelectItem>
            <SelectItem value="seminovo">⭐ Seminovo</SelectItem>
            <SelectItem value="usado">👍 Usado</SelectItem>
            <SelectItem value="muito usado">🔄 Muito Usado</SelectItem>
          </SelectContent>
        </Select>
        {errors.estado_conservacao && <p className="text-red-500 text-sm mt-1">{errors.estado_conservacao}</p>}
      </div>

      {/* Descrição */}
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

      {/* Preço */}
      <div>
        <Label htmlFor="preco">Preço (Girinhas)</Label>
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
        {categoriaSelecionada && (
          <p className="text-sm text-gray-500 mt-1">
            Faixa sugerida: {categoriaSelecionada.valor_minimo} - {categoriaSelecionada.valor_maximo} Girinhas
          </p>
        )}
      </div>
    </div>
  );
};
