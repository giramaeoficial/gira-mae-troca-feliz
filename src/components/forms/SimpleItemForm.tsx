
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
  const { subcategorias, isLoading: isLoadingSubcategorias } = useSubcategorias();
  const { tiposTamanho, isLoading: isLoadingTamanhos } = useTiposTamanho(formData.categoria_id);

  console.log('🔍 Debug SimpleItemForm:', {
    categoria_selecionada: formData.categoria_id,
    subcategorias_total: subcategorias?.length || 0,
    subcategorias_filtradas: subcategorias?.filter(sub => sub.categoria_pai === formData.categoria_id)?.length || 0,
    tipos_tamanho: Object.keys(tiposTamanho || {}),
    tamanhos_primeiro_tipo: Object.values(tiposTamanho || {})[0]?.length || 0
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onFieldChange(name, value);
  };

  const handleCategoriaChange = (categoria: string) => {
    console.log('📝 Categoria alterada para:', categoria);
    onFieldChange('categoria_id', categoria);
    onFieldChange('subcategoria', '');
    onFieldChange('tamanho_categoria', '');
    onFieldChange('tamanho_valor', '');
  };

  const handleSubcategoriaChange = (subcategoria: string) => {
    console.log('📝 Subcategoria alterada para:', subcategoria);
    onFieldChange('subcategoria', subcategoria);
  };

  const handleTamanhoChange = (valor: string) => {
    console.log('📝 Tamanho alterado para:', valor);
    const tipoUnico = Object.keys(tiposTamanho)[0];
    onFieldChange('tamanho_categoria', tipoUnico || '');
    onFieldChange('tamanho_valor', valor);
  };

  // Filtrar subcategorias baseado na categoria selecionada
  const subcategoriasFiltradas = subcategorias?.filter(
    sub => sub.categoria_pai === formData.categoria_id
  ) || [];

  // Obter tamanhos do primeiro tipo disponível
  const tipoUnico = Object.keys(tiposTamanho || {})[0];
  const tamanhosDisponiveis = tipoUnico ? (tiposTamanho[tipoUnico] || []) : [];

  const categoriaSelecionada = configuracoes?.find(c => c.categoria === formData.categoria_id);

  return (
    <div className="space-y-8">
      {/* === SEÇÃO: FOTOS === */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">📸 Fotos do Item</h3>
        <ImageUpload 
          value={formData.imagens} 
          onChange={(files) => onFieldChange('imagens', files)}
        />
        {errors.imagens && <p className="text-red-500 text-sm mt-2">{errors.imagens}</p>}
      </div>

      {/* === SEÇÃO: TÍTULO === */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">✏️ Título</h3>
        <Input
          type="text"
          id="titulo"
          name="titulo"
          value={formData.titulo}
          onChange={handleChange}
          placeholder="Ex: Vestido de festa rosa, Tênis infantil..."
          className="text-base"
        />
        {errors.titulo && <p className="text-red-500 text-sm mt-2">{errors.titulo}</p>}
      </div>

      {/* === SEÇÃO: CATEGORIA === */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">🏷️ Categoria</h3>
        
        {/* Categoria Principal */}
        <div className="mb-4">
          <Label htmlFor="categoria" className="text-base font-medium">Categoria Principal</Label>
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
            <Label htmlFor="subcategoria" className="text-base font-medium">Subcategoria</Label>
            <Select 
              value={formData.subcategoria} 
              onValueChange={handleSubcategoriaChange}
              disabled={isLoadingSubcategorias || subcategoriasFiltradas.length === 0}
            >
              <SelectTrigger className="w-full mt-2">
                <SelectValue placeholder={
                  isLoadingSubcategorias ? "Carregando..." : 
                  subcategoriasFiltradas.length === 0 ? "Nenhuma subcategoria disponível" :
                  "Selecione uma subcategoria"
                } />
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
            
            {/* Debug info */}
            <p className="text-xs text-gray-500 mt-1">
              {subcategoriasFiltradas.length} subcategorias encontradas para "{formData.categoria_id}"
            </p>
          </div>
        )}
      </div>

      {/* === SEÇÃO: IDADE/TAMANHO & GÊNERO === */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">📏 Tamanho & Gênero</h3>
        
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
              disabled={isLoadingTamanhos || tamanhosDisponiveis.length === 0}
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder={
                  isLoadingTamanhos ? "Carregando..." :
                  tamanhosDisponiveis.length === 0 ? "Nenhum tamanho disponível" :
                  "Selecione"
                } />
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
            
            {/* Debug info */}
            <p className="text-xs text-gray-500 mt-1">
              {tamanhosDisponiveis.length} tamanhos encontrados
            </p>
          </div>

          {/* Gênero */}
          <div>
            <Label htmlFor="genero" className="text-base font-medium">Gênero</Label>
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
      </div>

      {/* === SEÇÃO: ESTADO DO PRODUTO === */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">⭐ Estado do Produto</h3>
        <Select value={formData.estado_conservacao} onValueChange={(value) => onFieldChange('estado_conservacao', value)}>
          <SelectTrigger className="w-full">
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

      {/* === SEÇÃO: DESCRIÇÃO DETALHADA === */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">📝 Descrição Detalhada</h3>
        <Textarea
          id="descricao"
          name="descricao"
          value={formData.descricao}
          onChange={handleChange}
          placeholder="Descreva o item detalhadamente, incluindo características especiais, defeitos (se houver), marca, etc..."
          className="min-h-[120px]"
          rows={6}
        />
        {errors.descricao && <p className="text-red-500 text-sm mt-1">{errors.descricao}</p>}
      </div>

      {/* === SEÇÃO: PREÇO & LOCALIZAÇÃO === */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">💰 Preço & Localização</h3>
        
        <div className="space-y-4">
          {/* Preço */}
          <div>
            <Label htmlFor="preco" className="text-base font-medium">Preço (Girinhas)</Label>
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
              <p className="text-sm text-gray-500 mt-2">
                💡 Faixa sugerida: {categoriaSelecionada.valor_minimo} - {categoriaSelecionada.valor_maximo} Girinhas
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
