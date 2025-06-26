
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface ItemPricingProps {
  preco: string;
  onFieldChange: (field: string, value: any) => void;
  errors: any;
  faixaPrecos?: { minimo: number; maximo: number } | null;
}

export const ItemPricing: React.FC<ItemPricingProps> = ({
  preco,
  onFieldChange,
  errors,
  faixaPrecos
}) => {
  // Gerar sugestões de preços baseadas na faixa
  const gerarSugestoesPreco = () => {
    if (!faixaPrecos) return [];
    
    const { minimo, maximo } = faixaPrecos;
    const sugestoes = [];
    
    // Adicionar o preço mínimo
    sugestoes.push(minimo);
    
    // Adicionar alguns valores intermediários
    const diferenca = maximo - minimo;
    if (diferenca > 10) {
      const meio = Math.round((minimo + maximo) / 2);
      const quartil1 = Math.round(minimo + diferenca * 0.25);
      const quartil3 = Math.round(minimo + diferenca * 0.75);
      
      if (quartil1 > minimo && quartil1 < maximo) sugestoes.push(quartil1);
      if (meio > minimo && meio < maximo) sugestoes.push(meio);
      if (quartil3 > minimo && quartil3 < maximo) sugestoes.push(quartil3);
    }
    
    // Adicionar o preço máximo se diferente do mínimo
    if (maximo > minimo) {
      sugestoes.push(maximo);
    }
    
    // Remover duplicatas e ordenar
    return [...new Set(sugestoes)].sort((a, b) => a - b);
  };

  const sugestoes = gerarSugestoesPreco();

  const handleSugestaoClick = (valor: number) => {
    onFieldChange('preco', valor.toString());
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
          Quantidade de Girinhas
          <svg className="w-4 h-4 text-pink-500" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"></path>
          </svg>
          <span className="text-red-400">*</span>
        </Label>
        
        <div className="flex items-center gap-2">
          <Input
            type="number"
            name="preco"
            value={preco}
            onChange={(e) => onFieldChange('preco', e.target.value)}
            placeholder="25"
            className="text-sm border-gray-200 focus:border-pink-300 focus:ring-pink-200 rounded-lg"
          />
          <svg className="w-5 h-5 text-pink-500 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"></path>
          </svg>
        </div>
        
        <p className="text-xs text-gray-500">1 Girinha = R$ 1,00</p>
        {errors.preco && <p className="text-red-500 text-xs mt-1">{errors.preco}</p>}
      </div>

      {/* Sugestões de Preços */}
      {faixaPrecos && sugestoes.length > 0 && (
        <div className="bg-gradient-to-br from-blue-25 to-purple-25 p-4 rounded-xl border border-blue-100">
          <p className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            💡 Preços sugeridos para esta categoria:
          </p>
          <div className="flex flex-wrap gap-2">
            {sugestoes.map((valor) => (
              <button
                key={valor}
                type="button"
                onClick={() => handleSugestaoClick(valor)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 border flex items-center gap-1 ${
                  preco === valor.toString()
                    ? 'bg-pink-500 text-white border-pink-500 shadow-md'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-pink-300 hover:shadow-sm'
                }`}
              >
                {valor}
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"></path>
                </svg>
              </button>
            ))}
          </div>
          <p className="text-xs text-blue-600 mt-2">
            Faixa recomendada: {faixaPrecos.minimo} - {faixaPrecos.maximo} Girinhas
          </p>
        </div>
      )}
    </div>
  );
};
