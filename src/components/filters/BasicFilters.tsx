
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
  genero: string;
  tamanho: string;
  categorias: Categoria[];
  subcategorias: string[];
  onCategoriaChange: (value: string) => void;
  onOrdemChange: (value: string) => void;
  onSubcategoriaChange: (value: string) => void;
  onGeneroChange: (value: string) => void;
  onTamanhoChange: (value: string) => void;
}

export const BasicFilters: React.FC<BasicFiltersProps> = ({
  categoria,
  ordem,
  subcategoria,
  genero,
  tamanho,
  categorias,
  subcategorias,
  onCategoriaChange,
  onOrdemChange,
  onSubcategoriaChange,
  onGeneroChange,
  onTamanhoChange
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

      {/* Gênero e Tamanho */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Gênero */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-1 block">Gênero</Label>
          <Select value={genero} onValueChange={onGeneroChange}>
            <SelectTrigger>
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="masculino">Masculino</SelectItem>
              <SelectItem value="feminino">Feminino</SelectItem>
              <SelectItem value="unissex">Unissex</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tamanho */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-1 block">Tamanho</Label>
          <Select value={tamanho} onValueChange={onTamanhoChange}>
            <SelectTrigger>
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="RN">RN</SelectItem>
              <SelectItem value="P">P</SelectItem>
              <SelectItem value="M">M</SelectItem>
              <SelectItem value="G">G</SelectItem>
              <SelectItem value="GG">GG</SelectItem>
              <SelectItem value="0-3M">0-3M</SelectItem>
              <SelectItem value="3-6M">3-6M</SelectItem>
              <SelectItem value="6-9M">6-9M</SelectItem>
              <SelectItem value="9-12M">9-12M</SelectItem>
              <SelectItem value="1-2A">1-2A</SelectItem>
              <SelectItem value="2-3A">2-3A</SelectItem>
              <SelectItem value="3-4A">3-4A</SelectItem>
              <SelectItem value="4-5A">4-5A</SelectItem>
              <SelectItem value="5-6A">5-6A</SelectItem>
              <SelectItem value="6-7A">6-7A</SelectItem>
              <SelectItem value="7-8A">7-8A</SelectItem>
              <SelectItem value="8-9A">8-9A</SelectItem>
              <SelectItem value="9-10A">9-10A</SelectItem>
              <SelectItem value="10-11A">10-11A</SelectItem>
              <SelectItem value="11-12A">11-12A</SelectItem>
              <SelectItem value="12-13A">12-13A</SelectItem>
              <SelectItem value="13-14A">13-14A</SelectItem>
              <SelectItem value="14-15A">14-15A</SelectItem>
              <SelectItem value="15-16A">15-16A</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
