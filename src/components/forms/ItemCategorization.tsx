
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useTiposTamanho } from '@/hooks/useTamanhosPorCategoria';
import { useConfigCategorias } from '@/hooks/useConfigCategorias';
import { useSubcategorias } from '@/hooks/useSubcategorias';

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

const ItemCategorization = ({ formData, onFieldChange, errors }: ItemCategorizationProps) => {
  const { configuracoes: categorias = [] } = useConfigCategorias();
  const { subcategorias = [] } = useSubcategorias();
  const { data: tiposTamanho } = useTiposTamanho(formData.categoria_id);

  // Filtrar subcategorias baseado na categoria selecionada
  const subcategoriasFiltradas = formData.categoria_id 
    ? subcategorias.filter(sub => sub.categoria_pai === formData.categoria_id)
    : [];

  return (
    <div className="space-y-4">
      {/* Categoria */}
      <div>
        <Label className="text-sm font-medium text-gray-700 mb-2 block">
          Categoria <span className="text-red-400">*</span>
        </Label>
        <Select value={formData.categoria_id} onValueChange={(value) => {
          onFieldChange('categoria_id', value);
          onFieldChange('subcategoria', ''); // Reset subcategoria quando categoria muda
        }}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione a categoria" />
          </SelectTrigger>
          <SelectContent>
            {categorias.map((cat) => (
              <SelectItem key={cat.codigo} value={cat.codigo}>
                {cat.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.categoria_id && <p className="text-red-500 text-sm mt-1">{errors.categoria_id}</p>}
      </div>

      {/* Subcategoria */}
      {subcategoriasFiltradas.length > 0 && (
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">Subcategoria</Label>
          <Select value={formData.subcategoria} onValueChange={(value) => onFieldChange('subcategoria', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione a subcategoria" />
            </SelectTrigger>
            <SelectContent>
              {subcategoriasFiltradas.map((subcat) => (
                <SelectItem key={subcat.id} value={subcat.nome}>
                  {subcat.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.subcategoria && <p className="text-red-500 text-sm mt-1">{errors.subcategoria}</p>}
        </div>
      )}

      {/* Gênero */}
      <div>
        <Label className="text-sm font-medium text-gray-700 mb-2 block">Gênero</Label>
        <Select value={formData.genero} onValueChange={(value) => onFieldChange('genero', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o gênero" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="menina">Menina</SelectItem>
            <SelectItem value="menino">Menino</SelectItem>
            <SelectItem value="unissex">Unissex</SelectItem>
          </SelectContent>
        </Select>
        {errors.genero && <p className="text-red-500 text-sm mt-1">{errors.genero}</p>}
      </div>

      {/* Tamanho */}
      {tiposTamanho && Object.keys(tiposTamanho).length > 0 && (
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">Tamanho</Label>
          <Select value={formData.tamanho_valor} onValueChange={(value) => {
            const selectedTamanho = Object.values(tiposTamanho)
              .flat()
              .find(tamanho => tamanho.valor === value);
            onFieldChange('tamanho_valor', value);
            onFieldChange('tamanho_categoria', selectedTamanho?.valor || '');
          }}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tamanho" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(tiposTamanho)
                .flat()
                .sort((a, b) => {
                  const aNum = a.valor.match(/\d+/);
                  const bNum = b.valor.match(/\d+/);

                  if (aNum && bNum) {
                    return parseInt(aNum[0]) - parseInt(bNum[0]);
                  }

                  return a.valor.localeCompare(b.valor);
                })
                .map((tamanho) => (
                  <SelectItem key={tamanho.valor} value={tamanho.valor}>
                    {tamanho.label_display}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          {errors.tamanho_valor && <p className="text-red-500 text-sm mt-1">{errors.tamanho_valor}</p>}
        </div>
      )}

      {/* Estado de Conservação */}
      <div>
        <Label className="text-sm font-medium text-gray-700 mb-2 block">
          Estado de Conservação <span className="text-red-400">*</span>
        </Label>
        <Select value={formData.estado_conservacao} onValueChange={(value) => onFieldChange('estado_conservacao', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="novo">Novo</SelectItem>
            <SelectItem value="seminovo">Seminovo</SelectItem>
            <SelectItem value="usado">Usado</SelectItem>
          </SelectContent>
        </Select>
        {errors.estado_conservacao && <p className="text-red-500 text-sm mt-1">{errors.estado_conservacao}</p>}
      </div>
    </div>
  );
};

export default ItemCategorization;
