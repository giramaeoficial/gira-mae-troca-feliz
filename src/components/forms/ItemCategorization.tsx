// src/components/forms/ItemCategorization.tsx - CORREÇÃO DEFINITIVA
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
    let tipoEncontrado = '';
    
    if (tiposTamanho) {
      Object.keys(tiposTamanho).forEach(tipoKey => {
        const tamanhosDoTipo = tiposTamanho[tipoKey] || [];
        if (tamanhosDoTipo.some(tamanho => tamanho.valor === valor)) {
          tipoEncontrado = tipoKey;
        }
      });
    }
    
    onFieldChange('tamanho_categoria', tipoEncontrado);
    onFieldChange('tamanho_valor', valor);
  };

  // ✅ FIX 1: Proteção completa no filtro de subcategorias
  const subcategoriasFiltradas = React.useMemo(() => {
    if (!Array.isArray(subcategorias) || !formData.categoria_id) return [];
    
    try {
      const filtradas = subcategorias.filter(sub => 
        sub && sub.categoria_pai === formData.categoria_id
      );
      
      if (!Array.isArray(filtradas)) return [];
      
      const subcategoriasUnicas = filtradas.reduce((acc, sub) => {
        if (sub && sub.nome && !acc.some(item => item && item.nome === sub.nome)) {
          acc.push(sub);
        }
        return acc;
      }, [] as typeof filtradas);
      
      return subcategoriasUnicas;
    } catch (error) {
      console.error('Erro ao filtrar subcategorias:', error);
      return [];
    }
  }, [subcategorias, formData.categoria_id]);

  // ✅ FIX 2: Proteção completa no processamento de tamanhos
  const tamanhosDisponiveis = React.useMemo(() => {
    if (!tiposTamanho || typeof tiposTamanho !== 'object') return [];
    
    try {
      const todosTamanhos: any[] = [];
      
      Object.keys(tiposTamanho).forEach(tipoKey => {
        const tamanhosDoTipo = tiposTamanho[tipoKey];
        if (Array.isArray(tamanhosDoTipo)) {
          todosTamanhos.push(...tamanhosDoTipo);
        }
      });
      
      if (!Array.isArray(todosTamanhos) || todosTamanhos.length === 0) return [];
      
      const tamanhosUnicos = todosTamanhos.reduce((acc, tamanho) => {
        if (tamanho && tamanho.valor && !acc.some(item => item && item.valor === tamanho.valor)) {
          acc.push(tamanho);
        }
        return acc;
      }, [] as any[]);
      
      if (!Array.isArray(tamanhosUnicos)) return [];
      
      return tamanhosUnicos.sort((a, b) => {
        const ordemA = a && typeof a.ordem === 'number' ? a.ordem : 0;
        const ordemB = b && typeof b.ordem === 'number' ? b.ordem : 0;
        return ordemA - ordemB;
      });
    } catch (error) {
      console.error('Erro ao processar tamanhos:', error);
      return [];
    }
  }, [tiposTamanho]);

  return (
    <div className="space-y-5">
      {/* Categoria Principal */}
      <div className="space-y-2">
        <Label htmlFor="categoria" className="text-sm font-medium text-gray-700">
          Categoria
          <span className="text-red-400 ml-1">*</span>
        </Label>
        <Select value={formData.categoria_id} onValueChange={handleCategoriaChange}>
          <SelectTrigger className="w-full border-gray-200 focus:border-pink-300 focus:ring-pink-200 rounded-lg text-sm">
            <SelectValue placeholder="Selecione uma categoria" />
          </SelectTrigger>
          <SelectContent className="bg-white border-gray-200 rounded-lg shadow-lg max-h-60">
            {configuracoes?.map(config => (
              <SelectItem key={config.codigo} value={config.codigo} className="text-sm hover:bg-pink-50">
                <span className="flex items-center gap-2">
                  <span className="text-sm">{config.icone}</span>
                  {config.nome}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.categoria_id && <p className="text-red-500 text-xs mt-1">{errors.categoria_id}</p>}
      </div>

      {/* Subcategoria */}
      {formData.categoria_id && (
        <div className="space-y-2">
          <Label htmlFor="subcategoria" className="text-sm font-medium text-gray-700">
            Subcategoria
          </Label>
          <Select 
            value={formData.subcategoria} 
            onValueChange={(value) => onFieldChange('subcategoria', value)}
            disabled={isLoadingSubcategorias}
          >
            <SelectTrigger className="w-full border-gray-200 focus:border-pink-300 focus:ring-pink-200 rounded-lg text-sm">
              <SelectValue placeholder={
                isLoadingSubcategorias ? "Carregando..." : 
                subcategoriasFiltradas.length === 0 ? "Nenhuma subcategoria disponível" :
                "Selecione uma subcategoria"
              } />
            </SelectTrigger>
            <SelectContent className="bg-white border-gray-200 rounded-lg shadow-lg max-h-60">
              {subcategoriasFiltradas.map(sub => (
                <SelectItem key={sub.id} value={sub.nome} className="text-sm hover:bg-pink-50">
                  <span className="flex items-center gap-2">
                    <span className="text-sm">{sub.icone}</span>
                    {sub.nome}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.subcategoria && <p className="text-red-500 text-xs mt-1">{errors.subcategoria}</p>}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {/* Tamanho/Idade */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">
            {formData.categoria_id === 'calcados' ? 'Número' : 
             formData.categoria_id === 'brinquedos' ? 'Idade' : 
             formData.categoria_id === 'livros' ? 'Faixa Etária' : 'Tamanho'}
            <span className="text-red-400 ml-1">*</span>
          </Label>
          <Select 
            value={formData.tamanho_valor} 
            onValueChange={handleTamanhoChange}
            disabled={isLoadingTamanhos}
          >
            <SelectTrigger className="border-gray-200 focus:border-pink-300 focus:ring-pink-200 rounded-lg text-sm">
              <SelectValue placeholder={
                isLoadingTamanhos ? "Carregando..." :
                tamanhosDisponiveis.length === 0 ? "Nenhum tamanho disponível" :
                "Selecione"
              } />
            </SelectTrigger>
            <SelectContent className="bg-white border-gray-200 rounded-lg shadow-lg max-h-60">
              {tamanhosDisponiveis?.map((t) => (
                <SelectItem key={t.id} value={t.valor} className="text-sm hover:bg-pink-50">
                  {t.label_display}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.tamanho && <p className="text-red-500 text-xs mt-1">{errors.tamanho}</p>}
        </div>

        {/* Gênero */}
        <div className="space-y-2">
          <Label htmlFor="genero" className="text-sm font-medium text-gray-700">
            Gênero
            <span className="text-red-400 ml-1">*</span>
          </Label>
          <Select value={formData.genero} onValueChange={(value) => onFieldChange('genero', value)}>
            <SelectTrigger className="border-gray-200 focus:border-pink-300 focus:ring-pink-200 rounded-lg text-sm">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent className="bg-white border-gray-200 rounded-lg shadow-lg">
              <SelectItem value="menino" className="text-sm hover:bg-pink-50">
                <span className="flex items-center gap-2">
                  <span className="text-sm">👦</span>
                  Menino
                </span>
              </SelectItem>
              <SelectItem value="menina" className="text-sm hover:bg-pink-50">
                <span className="flex items-center gap-2">
                  <span className="text-sm">👧</span>
                  Menina
                </span>
              </SelectItem>
              <SelectItem value="unissex" className="text-sm hover:bg-pink-50">
                <span className="flex items-center gap-2">
                  <span className="text-sm">👶</span>
                  Unissex
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
          {errors.genero && <p className="text-red-500 text-xs mt-1">{errors.genero}</p>}
        </div>
      </div>

      {/* Estado do Produto */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700">
          Estado do Produto
          <span className="text-red-400 ml-1">*</span>
        </Label>
        <Select value={formData.estado_conservacao} onValueChange={(value) => onFieldChange('estado_conservacao', value)}>
          <SelectTrigger className="w-full border-gray-200 focus:border-pink-300 focus:ring-pink-200 rounded-lg text-sm">
            <SelectValue placeholder="Selecione o estado" />
          </SelectTrigger>
          <SelectContent className="bg-white border-gray-200 rounded-lg shadow-lg">
            <SelectItem value="novo" className="text-sm hover:bg-pink-50">
              <span className="flex items-center gap-2">
                <span className="text-sm">✨</span>
                Novo
              </span>
            </SelectItem>
            <SelectItem value="seminovo" className="text-sm hover:bg-pink-50">
              <span className="flex items-center gap-2">
                <span className="text-sm">⭐</span>
                Seminovo
              </span>
            </SelectItem>
            <SelectItem value="usado" className="text-sm hover:bg-pink-50">
              <span className="flex items-center gap-2">
                <span className="text-sm">👍</span>
                Usado
              </span>
            </SelectItem>
            <SelectItem value="muito_usado" className="text-sm hover:bg-pink-50">
              <span className="flex items-center gap-2">
                <span className="text-sm">🔄</span>
                Muito Usado
              </span>
            </SelectItem>
          </SelectContent>
        </Select>
        {errors.estado_conservacao && <p className="text-red-500 text-xs mt-1">{errors.estado_conservacao}</p>}
      </div>
    </div>
  );
};
