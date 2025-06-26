
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { useConfigCategorias } from '@/hooks/useConfigCategorias';
import { useSubcategorias } from '@/hooks/useSubcategorias';
import { useTiposTamanho } from '@/hooks/useTamanhosPorCategoria';

interface AdvancedFiltersProps {
  filtros: {
    busca?: string;
    categoria?: string;
    subcategoria?: string;
    tamanho?: string;
    estado_conservacao?: string;
    preco_minimo?: number;
    preco_maximo?: number;
    idade_minima?: number;
    idade_maxima?: number;
    genero?: string;
  };
  onFiltrosChange: (novosFiltros: any) => void;
}

const AdvancedFilters = ({ filtros, onFiltrosChange }: AdvancedFiltersProps) => {
  const { configuracoes: categorias = [] } = useConfigCategorias();
  const { subcategorias = [] } = useSubcategorias();
  const { data: tiposTamanho } = useTiposTamanho(filtros.categoria);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Convert price fields to numbers
    if (name === 'preco_minimo' || name === 'preco_maximo') {
      onFiltrosChange({ ...filtros, [name]: parseFloat(value) || 0 });
    } else {
      onFiltrosChange({ ...filtros, [name]: value });
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    onFiltrosChange({ ...filtros, [name]: value });
  };

  const handleTamanhoChange = (value: string) => {
    onFiltrosChange({ ...filtros, tamanho: value });
  };

  const handleSliderChange = (value: number[]) => {
    onFiltrosChange({ ...filtros, preco_minimo: value[0], preco_maximo: value[1] });
  };

  const subcategoriasFiltradas = React.useMemo(() => {
    if (!filtros.categoria || !subcategorias) return [];
    return subcategorias.filter(sub => sub.categoria_pai === filtros.categoria);
  }, [filtros.categoria, subcategorias]);

  return (
    <Accordion type="single" collapsible className="w-full mb-6">
      <AccordionItem value="filters">
        <AccordionTrigger>Filtros Avançados</AccordionTrigger>
        <AccordionContent>
          <div className="grid gap-4">
            {/* Busca */}
            <div>
              <Label htmlFor="busca">Buscar</Label>
              <Input
                type="text"
                name="busca"
                placeholder="Digite o que procura..."
                value={filtros.busca || ''}
                onChange={handleInputChange}
              />
            </div>

            {/* Categoria e Subcategoria */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="categoria">Categoria</Label>
                <Select value={filtros.categoria} onValueChange={(value) => handleSelectChange('categoria', value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione a Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas as categorias</SelectItem>
                    {categorias?.map((categoria) => (
                      <SelectItem key={categoria.codigo} value={categoria.codigo}>{categoria.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="subcategoria">Subcategoria</Label>
                <Select value={filtros.subcategoria} onValueChange={(value) => handleSelectChange('subcategoria', value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione a Subcategoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas as subcategorias</SelectItem>
                    {subcategoriasFiltradas.map((subcategoria) => (
                      <SelectItem key={subcategoria.id} value={subcategoria.nome}>{subcategoria.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Gênero */}
            <div>
              <Label htmlFor="genero">Gênero</Label>
              <Select value={filtros.genero} onValueChange={(value) => handleSelectChange('genero', value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione o Gênero" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="menina">Menina</SelectItem>
                  <SelectItem value="menino">Menino</SelectItem>
                  <SelectItem value="unissex">Unissex</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tamanho */}
            {filtros.categoria && tiposTamanho && Object.keys(tiposTamanho).length > 0 && (
              <div>
                <Label htmlFor="tamanho">Tamanho</Label>
                <Select value={filtros.tamanho} onValueChange={handleTamanhoChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione o Tamanho" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os tamanhos</SelectItem>
                    {Object.values(tiposTamanho)
                      .flat()
                      .map((tamanho) => (
                        <SelectItem key={tamanho.valor} value={tamanho.valor}>{tamanho.label_display}</SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Estado de Conservação */}
            <div>
              <Label htmlFor="estado_conservacao">Estado de Conservação</Label>
              <Select value={filtros.estado_conservacao} onValueChange={(value) => handleSelectChange('estado_conservacao', value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione o Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os estados</SelectItem>
                  <SelectItem value="novo">Novo</SelectItem>
                  <SelectItem value="seminovo">Seminovo</SelectItem>
                  <SelectItem value="usado">Usado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Faixa de Preço */}
            <div>
              <Label>Faixa de Preço (Girinhas)</Label>
              <div className="flex items-center gap-2 mb-2">
                <Input
                  type="number"
                  name="preco_minimo"
                  placeholder="Mínimo"
                  value={filtros.preco_minimo || ''}
                  onChange={handleInputChange}
                  className="w-24"
                />
                -
                <Input
                  type="number"
                  name="preco_maximo"
                  placeholder="Máximo"
                  value={filtros.preco_maximo || ''}
                  onChange={handleInputChange}
                  className="w-24"
                />
              </div>
              <Slider
                value={[filtros.preco_minimo || 0, filtros.preco_maximo || 200]}
                max={200}
                step={1}
                onValueChange={handleSliderChange}
              />
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default AdvancedFilters;
