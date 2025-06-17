
import React from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, TrendingUp, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PriceSuggestionsProps {
  categoria: string;
  onSelectPrice: (price: number) => void;
  currentPrice: number;
  className?: string;
}

const PriceSuggestions: React.FC<PriceSuggestionsProps> = ({
  categoria,
  onSelectPrice,
  currentPrice,
  className
}) => {
  const getSuggestions = (cat: string) => {
    const suggestions: Record<string, { min: number; mid: number; max: number; popular: number[] }> = {
      roupa: { min: 5, mid: 15, max: 35, popular: [10, 15, 20, 25] },
      brinquedo: { min: 8, mid: 25, max: 60, popular: [15, 25, 35, 45] },
      calcado: { min: 10, mid: 20, max: 50, popular: [15, 20, 30, 40] },
      acessorio: { min: 3, mid: 12, max: 25, popular: [5, 10, 15, 20] },
      kit: { min: 15, mid: 35, max: 80, popular: [20, 30, 40, 50] },
      outro: { min: 5, mid: 20, max: 40, popular: [10, 15, 25, 30] }
    };
    return suggestions[cat] || suggestions.outro;
  };

  if (!categoria) return null;

  const { min, mid, max, popular } = getSuggestions(categoria);

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <TrendingUp className="w-4 h-4" />
        <span>Sugestões de preço para {categoria}</span>
      </div>

      {/* Faixas de preço */}
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="text-center p-2 bg-green-50 rounded border">
          <div className="text-green-600 font-medium">{min} Girinhas</div>
          <div className="text-gray-500">Econômico</div>
        </div>
        <div className="text-center p-2 bg-blue-50 rounded border">
          <div className="text-blue-600 font-medium">{mid} Girinhas</div>
          <div className="text-gray-500">Equilibrado</div>
        </div>
        <div className="text-center p-2 bg-purple-50 rounded border">
          <div className="text-purple-600 font-medium">{max} Girinhas</div>
          <div className="text-gray-500">Premium</div>
        </div>
      </div>

      {/* Preços populares */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Target className="w-4 h-4" />
          <span>Preços mais usados</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {popular.map(price => (
            <Button
              key={price}
              variant={currentPrice === price ? "default" : "outline"}
              size="sm"
              onClick={() => onSelectPrice(price)}
              className={cn(
                "text-xs h-8",
                currentPrice === price && "bg-primary text-white"
              )}
            >
              <Sparkles className="w-3 h-3 mr-1" />
              {price}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PriceSuggestions;
