
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

  console.log('🔍 Debug SimpleItemForm:', {
    categoria_id: formData.categoria_id,
    subcategorias: subcategorias,
    subcategoriasFiltradas: subcategorias.filter(sub => sub.categoria_pai === formData.categoria_id),
    tiposTamanho: tiposTamanho
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onFieldChange(name, value);
  };

  const handleCategoriaChange = (categoria: string) => {
    console.log('📝 Categoria selecionada:', categoria);
    onFieldChange('categoria_id', categoria);
    onFieldChange('subcategoria', '');
    onFieldChange('tamanho_categoria', '');
    onFieldChange('tamanho_valor', '');
  };

  const handleSubcategoriaChange = (subcategoria: string) => {
    console.log('📝 Subcategoria selecionada:', subcategoria);
    onFieldChange('subcategoria', subcategoria);
  };

  const handleTamanhoChange = (valor: string) => {
    console.log('📝 Tamanho selecionado:', valor);
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

  console.log('🎯 Dados finais:', {
    subcategoriasFiltradas,
    tamanhosDisponiveis,
    formData_categoria: formData.categoria_id,
    formData_subcategoria: formData.subcategoria,
    formData_tamanho: formData.tamanho_valor
  });

  return (
    <div className="space-y-8">
      {/* SEÇÃO 1: FOTOS DO ITEM */}
      <div className="bg-white rounded-lg border p-6">
        <Label className="text-base font-semibold text-gray-900 mb-4 block">
          Fotos do Item *
        </Label>
        <ImageUpload 
          value={formData.imagens} 
          onChange={(files) => onFieldChange('imagens', files)}
        />
        <p className="text-sm text-gray-500 mt-2">
          Adicione até 5 fotos. Primeira foto será a capa do anúncio.
        </p>
        {errors.imagens && <p className="text-red-500 text-sm mt-1">{errors.imagens}</p>}
      </div>

      {/* SEÇÃO 2: TÍTULO DO ANÚNCIO */}
      <div className="bg-white rounded-lg border p-6">
        <Label htmlFor="titulo" className="text-base font-semibold text-gray-900 mb-4 block">
          Título do Anúncio *
        </Label>
        <Input
          type="text"
          id="titulo"
          name="titulo"
          value={formData.titulo}
          onChange={handleChange}
          placeholder="Ex: Vestido de Festa Rosa - Tam 4 anos"
          className="w-full"
        />
        {errors.titulo && <p className="text-red-500 text-sm mt-1">{errors.titulo}</p>}
      </div>

      {/* SEÇÃO 3: CATEGORIA */}
      <div className="bg-white rounded-lg border p-6">
        <Label className="text-base font-semibold text-gray-900 mb-4 block">
          Categoria *
        </Label>
        <Select value={formData.categoria_id} onValueChange={handleCategoriaChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecione" />
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

        {/* Subcategoria (aparece quando categoria é selecionada) */}
        {formData.categoria_id && subcategoriasFiltradas.length > 0 && (
          <div className="mt-4">
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
              Subcategoria *
            </Label>
            <Select value={formData.subcategoria} onValueChange={handleSubcategoriaChange}>
              <SelectTrigger className="w-full">
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
      </div>

      {/* SEÇÃO 4: IDADE/TAMANHO E GÊNERO */}
      <div className="bg-white rounded-lg border p-6">
        <div className="grid grid-cols-2 gap-4">
          {/* Tamanho/Idade */}
          <div>
            <Label className="text-base font-semibold text-gray-900 mb-4 block">
              {formData.categoria_id === 'calcados' ? 'Número *' : 
               formData.categoria_id === 'brinquedos' ? 'Idade *' : 
               formData.categoria_id === 'livros' ? 'Faixa Etária *' : 'Tamanho *'}
            </Label>
            <Select 
              value={formData.tamanho_valor} 
              onValueChange={handleTamanhoChange}
            >
              <SelectTrigger>
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
            <Label className="text-base font-semibold text-gray-900 mb-4 block">
              Gênero *
            </Label>
            <Select value={formData.genero} onValueChange={(value) => onFieldChange('genero', value)}>
              <SelectTrigger>
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

      {/* SEÇÃO 5: ESTADO DO PRODUTO */}
      <div className="bg-white rounded-lg border p-6">
        <Label className="text-base font-semibold text-gray-900 mb-4 block">
          Estado do Produto *
        </Label>
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

      {/* SEÇÃO 6: DESCRIÇÃO DETALHADA */}
      <div className="bg-white rounded-lg border p-6">
        <Label htmlFor="descricao" className="text-base font-semibold text-gray-900 mb-4 block">
          Descrição Detalhada
        </Label>
        <Textarea
          id="descricao"
          name="descricao"
          value={formData.descricao}
          onChange={handleChange}
          placeholder="Descreva o item: marca, material, características especiais, pequenos defeitos..."
          className="w-full"
          rows={4}
        />
        {errors.descricao && <p className="text-red-500 text-sm mt-1">{errors.descricao}</p>}
      </div>

      {/* SEÇÃO 7: PREÇO E LOCALIZAÇÃO */}
      <div className="bg-white rounded-lg border p-6">
        <div className="grid grid-cols-2 gap-4">
          {/* Preço */}
          <div>
            <Label htmlFor="preco" className="text-base font-semibold text-gray-900 mb-4 block">
              Preço em Girinhas *
            </Label>
            <Input
              type="number"
              id="preco"
              name="preco"
              value={formData.preco}
              onChange={handleChange}
              placeholder="Ex: 50"
              className="w-full"
            />
            {errors.preco && <p className="text-red-500 text-sm mt-1">{errors.preco}</p>}
            
            {/* Mostrar faixa de preços da categoria */}
            {categoriaSelecionada && (
              <p className="text-sm text-gray-500 mt-1">
                Faixa sugerida: {categoriaSelecionada.valor_minimo} - {categoriaSelecionada.valor_maximo} Girinhas
              </p>
            )}
          </div>

          {/* Localização */}
          <div>
            <Label className="text-base font-semibold text-gray-900 mb-4 block">
              Localização *
            </Label>
            <Input
              type="text"
              placeholder="Bairro, Cidade"
              className="w-full"
              disabled
              value="Baseado no seu perfil"
            />
            <p className="text-sm text-gray-500 mt-1">
              A localização será baseada no endereço do seu perfil
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
