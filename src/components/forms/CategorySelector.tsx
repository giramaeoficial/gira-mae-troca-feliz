
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useConfigCategorias } from '@/hooks/useConfigCategorias';
import { useSubcategorias } from '@/hooks/useSubcategorias';

interface CategorySelectorProps {
  categoria: string;
  subcategoria: string;
  onCategoriaChange: (categoria: string) => void;
  onSubcategoriaChange: (subcategoria: string) => void;
  categoriaError?: string;
  subcategoriaError?: string;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  categoria,
  subcategoria,
  onCategoriaChange,
  onSubcategoriaChange,
  categoriaError,
  subcategoriaError
}) => {
  const { configuracoes } = useConfigCategorias();
  const { subcategorias } = useSubcategorias();

  const subcategoriasFiltradas = subcategorias.filter(
    sub => sub.categoria_pai === categoria
  );

  const handleCategoriaChange = (novaCategoria: string) => {
    onCategoriaChange(novaCategoria);
    onSubcategoriaChange(''); // Limpar subcategoria quando categoria muda
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="categoria">Categoria</Label>
        <Select value={categoria} onValueChange={handleCategoriaChange}>
          <SelectTrigger className="w-full">
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
        {categoriaError && <p className="text-red-500 text-sm mt-1">{categoriaError}</p>}
      </div>

      {categoria && (
        <div>
          <Label htmlFor="subcategoria">Subcategoria</Label>
          <Select value={subcategoria} onValueChange={onSubcategoriaChange}>
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
          {subcategoriaError && <p className="text-red-500 text-sm mt-1">{subcategoriaError}</p>}
        </div>
      )}
    </div>
  );
};
