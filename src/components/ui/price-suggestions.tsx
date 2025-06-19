
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, TrendingUp, TrendingDown } from 'lucide-react';

interface PriceSuggestionsProps {
  categoria: string;
  estadoConservacao: string;
  valorMinimo: number;
  valorMaximo: number;
  valorAtual?: number;
  onSuggestionClick: (valor: number) => void;
}

const PriceSuggestions: React.FC<PriceSuggestionsProps> = ({
  categoria,
  estadoConservacao,
  valorMinimo,
  valorMaximo,
  valorAtual,
  onSuggestionClick
}) => {
  // Calcular sugestões baseadas no estado de conservação
  const calcularSugestoes = () => {
    const faixa = valorMaximo - valorMinimo;
    let multiplicador = 0.5; // Valor médio por padrão

    switch (estadoConservacao) {
      case 'novo':
        multiplicador = 0.8; // 80% da faixa
        break;
      case 'otimo':
        multiplicador = 0.65; // 65% da faixa
        break;
      case 'bom':
        multiplicador = 0.45; // 45% da faixa
        break;
      case 'razoavel':
        multiplicador = 0.25; // 25% da faixa
        break;
    }

    const valorSugerido = valorMinimo + (faixa * multiplicador);
    
    return {
      sugerido: Math.round(valorSugerido),
      minimo: valorMinimo,
      maximo: valorMaximo,
      baixo: Math.round(valorMinimo + (faixa * 0.2)),
      alto: Math.round(valorMinimo + (faixa * 0.8))
    };
  };

  const sugestoes = calcularSugestoes();

  const isValorForaDaFaixa = valorAtual && (valorAtual < valorMinimo || valorAtual > valorMaximo);
  const isValorBaixo = valorAtual && valorAtual < sugestoes.sugerido * 0.8;
  const isValorAlto = valorAtual && valorAtual > sugestoes.sugerido * 1.2;

  return (
    <div className="space-y-3">
      {/* Informação da faixa permitida */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Faixa permitida para {categoria}:</strong> {valorMinimo} - {valorMaximo} Girinhas
        </AlertDescription>
      </Alert>

      {/* Alerta se valor está fora da faixa */}
      {isValorForaDaFaixa && (
        <Alert variant="destructive">
          <AlertDescription>
            ⚠️ Valor deve estar entre {valorMinimo} e {valorMaximo} Girinhas
          </AlertDescription>
        </Alert>
      )}

      {/* Sugestões baseadas no estado */}
      {estadoConservacao && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">
            Sugestões para itens em estado <strong>{estadoConservacao}</strong>:
          </p>
          
          <div className="flex flex-wrap gap-2">
            <Badge
              variant="outline"
              className="cursor-pointer hover:bg-primary hover:text-white transition-colors"
              onClick={() => onSuggestionClick(sugestoes.sugerido)}
            >
              Recomendado: {sugestoes.sugerido}
            </Badge>
            
            <Badge
              variant="outline"
              className="cursor-pointer hover:bg-blue-500 hover:text-white transition-colors"
              onClick={() => onSuggestionClick(sugestoes.baixo)}
            >
              <TrendingDown className="w-3 h-3 mr-1" />
              Econômico: {sugestoes.baixo}
            </Badge>
            
            <Badge
              variant="outline"
              className="cursor-pointer hover:bg-orange-500 hover:text-white transition-colors"
              onClick={() => onSuggestionClick(sugestoes.alto)}
            >
              <TrendingUp className="w-3 h-3 mr-1" />
              Premium: {sugestoes.alto}
            </Badge>
          </div>
        </div>
      )}

      {/* Feedback sobre o valor atual */}
      {valorAtual && !isValorForaDaFaixa && (
        <div className="text-xs text-gray-500">
          {isValorBaixo && "💰 Preço competitivo - pode atrair mais interessados"}
          {isValorAlto && "⭐ Preço premium - certifique-se que justifica a qualidade"}
          {!isValorBaixo && !isValorAlto && "✅ Preço equilibrado para esta categoria"}
        </div>
      )}
    </div>
  );
};

export default PriceSuggestions;
