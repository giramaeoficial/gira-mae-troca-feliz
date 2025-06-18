
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ShoppingCart, TrendingUp, AlertTriangle, Sparkles } from 'lucide-react';
import { useGirinhasSystem } from '../hooks/useGirinhasSystem';
import { usePacotesGirinhas } from '@/hooks/usePacotesGirinhas';

const CompraComImpacto: React.FC = () => {
  const [quantidadeCustom, setQuantidadeCustom] = useState('');
  const [cotacaoSimulada, setCotacaoSimulada] = useState<number | null>(null);
  
  const { cotacao } = useGirinhasSystem();
  const { pacotes, comprarGirinhas, isPacoteLoading } = usePacotesGirinhas();

  // Simular impacto na cotação
  useEffect(() => {
    if (quantidadeCustom && cotacao) {
      const quantidade = parseFloat(quantidadeCustom);
      if (quantidade >= 100) {
        // Impacto maior para compras acima de 100 Girinhas
        const impacto = quantidade * 0.0001;
        const novaCotacao = Math.min(cotacao.cotacao_atual + impacto, 1.30);
        setCotacaoSimulada(novaCotacao);
      } else {
        setCotacaoSimulada(null);
      }
    } else {
      setCotacaoSimulada(null);
    }
  }, [quantidadeCustom, cotacao]);

  const handleComprarPacote = (pacoteId: string) => {
    comprarGirinhas(pacoteId);
  };

  const valorTotalCustom = quantidadeCustom && cotacao 
    ? parseFloat(quantidadeCustom) * (cotacaoSimulada || cotacao.cotacao_atual)
    : 0;

  const temImpacto = cotacaoSimulada && cotacaoSimulada > (cotacao?.cotacao_atual || 0);

  return (
    <div className="space-y-6">
      {/* Pacotes pré-definidos */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-primary" />
            Pacotes de Girinhas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {pacotes?.filter(p => p.ativo).map((pacote) => (
              <div
                key={pacote.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-gradient-to-br from-purple-50 to-pink-50"
              >
                <div className="text-center space-y-2">
                  <h3 className="font-bold text-lg text-gray-800">{pacote.nome}</h3>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-primary">
                      {pacote.valor_girinhas} <Sparkles className="inline w-5 h-5" />
                    </p>
                    <p className="text-lg text-gray-600">
                      R$ {pacote.valor_real.toFixed(2)}
                    </p>
                    {pacote.desconto_percentual && pacote.desconto_percentual > 0 && (
                      <p className="text-sm text-green-600 font-medium">
                        {pacote.desconto_percentual}% de desconto
                      </p>
                    )}
                  </div>
                  <Button
                    onClick={() => handleComprarPacote(pacote.id)}
                    disabled={isPacoteLoading(pacote.id)}
                    className="w-full"
                    size="sm"
                  >
                    {isPacoteLoading(pacote.id) ? 'Processando...' : 'Comprar'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Compra customizada com simulador */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Compra Personalizada
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="quantidade-custom">Quantidade de Girinhas</Label>
            <Input
              id="quantidade-custom"
              type="number"
              value={quantidadeCustom}
              onChange={(e) => setQuantidadeCustom(e.target.value)}
              placeholder="Digite a quantidade desejada"
              min="1"
            />
          </div>

          {quantidadeCustom && cotacao && (
            <div className="space-y-3">
              {/* Simulação de preço */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Cotação atual:</span>
                  <span>R$ {cotacao.cotacao_atual.toFixed(4)}</span>
                </div>
                {cotacaoSimulada && (
                  <div className="flex justify-between items-center mb-2 text-orange-600">
                    <span className="font-medium">Cotação após compra:</span>
                    <span>R$ {cotacaoSimulada.toFixed(4)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center font-bold text-lg border-t pt-2">
                  <span>Valor total:</span>
                  <span className="text-primary">R$ {valorTotalCustom.toFixed(2)}</span>
                </div>
              </div>

              {/* Alerta de impacto */}
              {temImpacto && (
                <Alert className="border-orange-200 bg-orange-50">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-800">
                    <strong>Impacto na cotação detectado!</strong><br />
                    Esta compra pode aumentar a cotação das Girinhas em {((cotacaoSimulada! - cotacao.cotacao_atual) * 100).toFixed(2)}%.
                    Considere dividir em lotes menores para reduzir o impacto.
                  </AlertDescription>
                </Alert>
              )}

              <Button
                onClick={() => {/* Implementar compra customizada */}}
                disabled={!quantidadeCustom}
                className="w-full"
                size="lg"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Comprar {quantidadeCustom} Girinhas
              </Button>
            </div>
          )}

          <div className="text-xs text-gray-500 space-y-1">
            <p>• Compras acima de 100 Girinhas podem afetar a cotação</p>
            <p>• O impacto é calculado em tempo real</p>
            <p>• Considere compras menores para minimizar flutuações</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompraComImpacto;
