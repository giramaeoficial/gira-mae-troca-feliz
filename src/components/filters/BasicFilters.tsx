
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Categoria {
  id: string;
  nome: string;
  icone: string;
}

interface BasicFiltersProps {
  categoria: string;
  ordem: string;
  subcategoria: string;
  categorias: Categoria[];
  subcategorias: string[];
  onCategoriaChange: (value: string) => void;
  onOrdemChange: (value: string) => void;
  onSubcategoriaChange: (value: string) => void;
}

export const BasicFilters: React.FC<BasicFiltersProps> = ({
  categoria,
  ordem,
  subcategoria,
  categorias,
  subcategorias,
  onCategoriaChange,
  onOrdemChange,
  onSubcategoriaChange
}) => {
  return (
    <div className="space-y-4">
      {/* Filtros Básicos - Layout em grid compacto */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Categoria */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-1 block">Categoria</Label>
          <Select value={categoria} onValueChange={onCategoriaChange}>
            <SelectTrigger>
              <SelectValue placeholder="Todas as categorias" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as categorias</SelectItem>
              {categorias.map((cat) => (
                <SelectItem key={cat.id} value={cat.nome}>
                  {cat.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Ordenação */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-1 block">Ordenar por</Label>
          <Select value={ordem} onValueChange={onOrdemChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recentes">Mais recentes</SelectItem>
              <SelectItem value="menor-preco">Menor preço</SelectItem>
              <SelectItem value="maior-preco">Maior preço</SelectItem>
              <SelectItem value="distancia">Mais próximos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Subcategoria (só se houver categoria selecionada) */}
      {subcategorias.length > 0 && (
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-1 block">Subcategoria</Label>
          <Select value={subcategoria || "todas_sub"} onValueChange={onSubcategoriaChange}>
            <SelectTrigger>
              <SelectValue placeholder="Todas as subcategorias" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas_sub">Todas as subcategorias</SelectItem>
              {subcategorias.map((sub) => (
                <SelectItem key={sub} value={sub}>
                  {sub}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
};
