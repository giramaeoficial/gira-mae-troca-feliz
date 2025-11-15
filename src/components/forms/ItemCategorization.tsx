// src/components/forms/ItemCategorization.tsx - VERSÃO COMPLETA CORRIGIDA

import React from 'react';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useConfigCategorias } from '@/hooks/useConfigCategorias';
import { useSubcategorias } from '@/hooks/useSubcategorias';
import { useTiposTamanho } from '@/hooks/useTamanhosPorCategoria';

// Interface para os dados de tamanho (para tipagem)
interface Tamanho {
  id: string;
  valor: string;
  label_display: string;
  ordem: number;
  [key: string]: any; // Outras propriedades
}

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

  // ✅ CORREÇÃO 1: Handler de tamanho reescrito
  // Recebe o 'label_display' (único) e encontra o 'valor' e 'tipo' corretos
  const handleTamanhoChange = (label: string) => {
    let tipoEncontrado = '';
    let valorEncontrado = '';
    
    if (tiposTamanho) {
      // Usamos 'for...of' e 'break' para performance, parando assim que acha
      for (const tipoKey of Object.keys(tiposTamanho)) {
        const tamanhosDoTipo = tiposTamanho[tipoKey] || [];
        const tamanho = tamanhosDoTipo.find((t: Tamanho) => t.label_display === label);
        
        if (tamanho) {
          tipoEncontrado = tipoKey;
          valorEncontrado = tamanho.valor;
          break; // Para o loop, achamos o item correto!
        }
      }
    }
    
    onFieldChange('tamanho_categoria', tipoEncontrado);
    onFieldChange('tamanho_valor', valorEncontrado);
  };

  // Lógica de subcategorias (estava OK, apenas com checagens extras)
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

  // ✅ CORREÇÃO 2: 'reduce' de tamanhos agora usa 'label_display'
  const tamanhosDisponiveis = React.useMemo(() => {
    if (!tiposTamanho || typeof tiposTamanho !== 'object') return [];
    
    try {
      const todosTamanhos: Tamanho[] = [];
      
      Object.keys(tiposTamanho).forEach(tipoKey => {
        const tamanhosDoTipo = tiposTamanho[tipoKey];
        if (Array.isArray(tamanhosDoTipo)) {
          todosTamanhos.push(...tamanhosDoTipo);
        }
      });
      
      if (todosTamanhos.length === 0) return [];
      
      const tamanhosUnicos = todosTamanhos.reduce((acc, tamanho) => {
        if (tamanho && tamanho.label_display && !acc.some(item => item && item.label_display === tamanho.label_display)) {
          acc.push(tamanho);
        }
        return acc;
      }, [] as Tamanho[]);
      
      // Ordena pela 'ordem' definida na API
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

  // ✅ CORREÇÃO 3: Nova função para encontrar o 'label' salvo no formulário
  // Necessário para o 'value' do <Select> de tamanho
  const getSelectedLabel = () => {
    // Se não houver dados, o 'value' é 'undefined' (mostra o placeholder)
    if (!formData.tamanho_valor || !formData.tamanho_categoria || !tiposTamanho) {
      return undefined;
    }
    
    // Procura o tipo (ex: 'roupa_bebe')
    const tamanhosDoTipo = tiposTamanho[formData.tamanho_categoria];
    if (!Array.isArray(tamanhosDoTipo)) {
      return undefined;
    }
    
    // Procura o valor (ex: 'P') dentro daquele tipo
    const tamanho = tamanhosDoTipo.find((t: Tamanho) => t.valor === formData.tamanho_valor);
    
    // Retorna o 'label_display' (ex: 'P (3,5-5kg)')
    return tamanho ? tamanho.label_display : undefined;
  };
  
  const selectedLabel = getSelectedLabel();

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
            _} />
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
            // ✅ CORREÇÃO 4a: Usar o label único como 'value'
            value={selectedLabel} 
            onValueChange={handleTamanhoChange}
            disabled={isLoadingTamanhos || !formData.categoria_id}
          >
            <SelectTrigger className="border-gray-200 focus:border-pink-300 focus:ring-pink-200 rounded-lg text-sm">
              <SelectValue placeholder={
                isLoadingTamanhos ? "Carregando..." :
                !formData.categoria_id ? "Escolha uma categoria" :
                tamanhosDisponiveis.length === 0 ? "Nenhum tamanho disponível" :
                "Selecione"
              } />
            </SelectTrigger>
            <SelectContent className="bg-white border-gray-200 rounded-lg shadow-lg max-h-60">
              {tamanhosDisponiveis?.map((t) => (
                // ✅ CORREÇÃO 4b: Usar 'label_display' como o valor
                <SelectItem key={t.id} value={t.label_display} className="text-sm hover:bg-pink-50">
        T           {t.label_display}
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
        _</SelectTrigger>
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
        _   </SelectItem>
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
