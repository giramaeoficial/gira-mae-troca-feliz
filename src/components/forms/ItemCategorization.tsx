
import React from 'react';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useConfigCategorias } from '@/hooks/useConfigCategorias';
import { useSubcategorias } from '@/hooks/useSubcategorias';
import { useTiposTamanho } from '@/hooks/useTamanhosPorCategoria';

interface ItemCategorizationProps {
  formData: {
    categoria_id: string;
    subcategoria: string;
    genero: string;
    tamanho_categoria: string;
    tamanho_valor: string;
    estado_conservacao: string;
  };
  onFieldChange: (field: string, value: any) => void;
  errors: any;
}

export const ItemCategorization: React.FC<ItemCategorizationProps> = ({
  formData,
  onFieldChange,
  errors
}) => {
  const { configuracoes } = useConfigCategorias();
  const { subcategorias, isLoading: isLoadingSubcategorias } = useSubcategorias();
  const { tiposTamanho, isLoading: isLoadingTamanhos } = useTiposTamanho(formData.categoria_id);

  const handleCategoriaChange = (categoria: string) => {
    onFieldChange('categoria_id', categoria);
    onFieldChange('subcategoria', '');
    onFieldChange('tamanho_categoria', '');
    onFieldChange('tamanho_valor', '');
  };

  const handleTamanhoChange = (valor: string) => {
    const tipoUnico = Object.keys(tiposTamanho || {})[0];
    onFieldChange('tamanho_categoria', tipoUnico || '');
    onFieldChange('tamanho_valor', valor);
  };

  // Filtrar subcategorias sem duplicação
  const subcategoriasFiltradas = React.useMemo(() => {
    if (!subcategorias || !formData.categoria_id) return [];
    
    const filtradas = subcategorias.filter(sub => sub.categoria_pai === formData.categoria_id);
    
    // Remover duplicatas baseado no nome
    const subcategoriasUnicas = filtradas.reduce((acc, sub) => {
      if (!acc.some(item => item.nome === sub.nome)) {
        acc.push(sub);
      }
      return acc;
    }, [] as typeof filtradas);
    
    return subcategoriasUnicas;
  }, [subcategorias, formData.categoria_id]);

  // Obter tamanhos do primeiro tipo disponível sem duplicação
  const tamanhosDisponiveis = React.useMemo(() => {
    const tipos = Object.keys(tiposTamanho || {});
    const tipoUnico = tipos[0];
    const tamanhos = tipoUnico ? (tiposTamanho[tipoUnico] || []) : [];
    
    // Remover duplicatas baseado no valor
    const tamanhosUnicos = tamanhos.reduce((acc, tamanho) => {
      if (!acc.some(item => item.valor === tamanho.valor)) {
        acc.push(tamanho);
      }
      return acc;
    }, [] as typeof tamanhos);
    
    return tamanhosUnicos;
  }, [tiposTamanho]);

  return (
    <div className="space-y-6">
      {/* Categoria Principal */}
      <div>
        <Label htmlFor="categoria" className="text-base font-medium">🏷️ Categoria Principal</Label>
        <Select value={formData.categoria_id} onValueChange={handleCategoriaChange}>
          <SelectTrigger className="w-full mt-2">
            <SelectValue placeholder="Selecione uma categoria" />
          </SelectTrigger>
          <SelectContent>
            {configuracoes?.map(config => (
              <SelectItem key={config.codigo} value={config.codigo}>
                {config.icone} {config.nome}
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
            onValueChange={(value) => onFieldChange('subcategoria', value)}
            disabled={isLoadingSubcategorias}
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
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {/* Tamanho/Idade */}
        <div>
          <Label className="text-base font-medium">
            📏 {formData.categoria_id === 'calcados' ? 'Número' : 
               formData.categoria_id === 'brinquedos' ? 'Idade' : 
               formData.categoria_id === 'livros' ? 'Faixa Etária' : 'Tamanho'}
          </Label>
          <Select 
            value={formData.tamanho_valor} 
            onValueChange={handleTamanhoChange}
            disabled={isLoadingTamanhos}
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
        </div>

        {/* Gênero */}
        <div>
          <Label htmlFor="genero" className="text-base font-medium">👶 Gênero</Label>
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

      {/* Estado do Produto */}
      <div>
        <Label className="text-base font-medium">⭐ Estado do Produto</Label>
        <Select value={formData.estado_conservacao} onValueChange={(value) => onFieldChange('estado_conservacao', value)}>
          <SelectTrigger className="w-full mt-2">
            <SelectValue placeholder="Selecione o estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="novo">✨ Novo</SelectItem>
            <SelectItem value="seminovo">⭐ Seminovo</SelectItem>
            <SelectItem value="usado">👍 Usado</SelectItem>
            <SelectItem value="muito_usado">🔄 Muito Usado</SelectItem>
          </SelectContent>
        </Select>
        {errors.estado_conservacao && <p className="text-red-500 text-sm mt-1">{errors.estado_conservacao}</p>}
      </div>
    </div>
  );
};
