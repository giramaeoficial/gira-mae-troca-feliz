
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, ShoppingCart, TrendingUp, TrendingDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const CotacaoWidget: React.FC = () => {
  const [precoEmissao, setPrecoEmissao] = useState<number | null>(null);
  const precoReferencia = 1.00;

  useEffect(() => {
    const carregarPrecoEmissao = async () => {
      try {
        const { data: preco, error } = await supabase.rpc('obter_preco_emissao');
        if (!error && preco) {
          setPrecoEmissao(Number(preco));
        }
      } catch (error) {
        console.error('Erro ao carregar preço de emissão:', error);
        setPrecoEmissao(precoReferencia);
      }
    };

    carregarPrecoEmissao();
    
    // Atualizar a cada 5 minutos
    const interval = setInterval(carregarPrecoEmissao, 300000);
    return () => clearInterval(interval);
  }, []);

  const calcularPercentualDiferenca = () => {
    if (!precoEmissao || precoEmissao === precoReferencia) return null;
    
    const diferenca = ((precoEmissao - precoReferencia) / precoReferencia) * 100;
    return diferenca;
  };

  const percentualDiferenca = calcularPercentualDiferenca();

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-500" />
          Girinha
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Preço com percentual */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xl font-bold text-purple-600">
              R$ {precoEmissao?.toFixed(2) || '1,00'}
            </p>
            <p className="text-xs text-gray-500">
              {percentualDiferenca === null ? 'Preço padrão por Girinha' : 'Preço atual por Girinha'}
            </p>
          </div>
          <div className="text-right">
            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
              <ShoppingCart className="w-3 h-3 mr-1" />
              Disponível
            </Badge>
            {percentualDiferenca !== null && (
              <div className="mt-1">
                {percentualDiferenca > 0 ? (
                  <Badge variant="outline" className="text-xs text-orange-700 border-orange-200 bg-orange-50">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +{percentualDiferenca.toFixed(1)}%
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs text-green-700 border-green-200 bg-green-50">
                    <TrendingDown className="w-3 h-3 mr-1" />
                    {Math.abs(percentualDiferenca).toFixed(1)}% off
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white/60 rounded-lg p-3">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-700 mb-1">
              Moeda da comunidade GiraMãe
            </p>
            <p className="text-xs text-gray-500">
              Use para trocar roupas, brinquedos e muito mais!
              {percentualDiferenca !== null && (
                <span className="block mt-1">
                  {percentualDiferenca > 0 ? 'Valorizada pela alta demanda' : 'Em promoção especial'}
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="text-xs text-gray-500 text-center">
          Sistema transparente • Preço justo
        </div>
      </CardContent>
    </Card>
  );
};

export default CotacaoWidget;
