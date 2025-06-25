
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShoppingCart, Info, CheckCircle, Shield, Sparkles, CreditCard, AlertTriangle } from 'lucide-react';
import { useMercadoPago } from '@/hooks/useMercadoPago';
import { usePrecoManual } from '@/hooks/usePrecoManual';

const CheckoutMercadoPago = () => {
  const [quantidade, setQuantidade] = useState('');
  const { criarPreferencia, verificarStatusPagamento, isProcessing } = useMercadoPago();
  const { precoManual } = usePrecoManual();

  // Verificar status do pagamento ao carregar o componente
  useEffect(() => {
    verificarStatusPagamento();
  }, []);

  const quantidadeNum = parseInt(quantidade) || 0;
  const valorTotal = quantidadeNum * precoManual;
  const isQuantidadeValida = quantidadeNum >= 10 && quantidadeNum <= 999000;

  const handleCheckout = async () => {
    if (!isQuantidadeValida || quantidadeNum <= 0) return;
    
    await criarPreferencia(quantidadeNum);
  };

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
          <ShoppingCart className="w-6 h-6 text-purple-500" />
          Comprar Girinhas
        </CardTitle>
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            Sistema seguro de pagamento online via Mercado Pago
          </p>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Preço atual */}
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            <span className="text-lg font-bold text-purple-600">
              R$ {precoManual.toFixed(2)} por Girinha
            </span>
          </div>
          <p className="text-xs text-gray-500 text-center mt-1">
            Preço fixo • Sem variações • Transparente
          </p>
        </div>

        {/* Alerta de pagamento processando */}
        {isProcessing && (
          <Alert className="border-blue-200 bg-blue-50">
            <CreditCard className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <span className="font-medium">Redirecionando para pagamento...</span>
              </div>
              <p className="text-sm mt-1">
                Você será redirecionado para o checkout seguro do Mercado Pago.
              </p>
            </AlertDescription>
          </Alert>
        )}

        {/* Alerta de segurança */}
        <Alert className="border-green-200 bg-green-50">
          <Shield className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <div className="space-y-1">
              <p className="font-medium">🔒 Pagamento 100% seguro!</p>
              <p className="text-sm">
                Processado pelo Mercado Pago com certificação bancária e criptografia avançada.
              </p>
            </div>
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="comprar" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="comprar">Comprar</TabsTrigger>
            <TabsTrigger value="info">Informações</TabsTrigger>
          </TabsList>

          <TabsContent value="comprar" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="quantidade">Quantidade de Girinhas</Label>
              <Input
                id="quantidade"
                type="number"
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
                placeholder="Digite a quantidade (mín: 10)"
                min={10}
                max={999000}
                className="text-lg"
                disabled={isProcessing}
              />
              <p className="text-xs text-gray-500">
                Mínimo: 10 | Máximo: 999.000 Girinhas
              </p>
            </div>

            {quantidadeNum > 0 && (
              <div className="bg-white p-4 rounded-lg border space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Quantidade:</span>
                  <span className="font-bold">{quantidadeNum.toLocaleString()} Girinhas</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Preço unitário:</span>
                  <span className="font-bold">R$ {precoManual.toFixed(2)}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between items-center text-lg">
                    <span className="font-bold text-gray-800">Total a pagar:</span>
                    <span className="font-bold text-primary text-xl">
                      R$ {valorTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <Button
              onClick={handleCheckout}
              disabled={!isQuantidadeValida || isProcessing || quantidadeNum <= 0}
              className="w-full h-12 text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Redirecionando...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Pagar com Mercado Pago
                </div>
              )}
            </Button>

            {!isQuantidadeValida && quantidadeNum > 0 && (
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  Quantidade deve estar entre 10 e 999.000 Girinhas
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          <TabsContent value="info" className="space-y-4">
            <div className="bg-white p-4 rounded-lg border space-y-3">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <Info className="w-4 h-4" />
                Como Funciona o Pagamento
              </h3>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Pagamento processado pelo Mercado Pago (certificação bancária)</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Preço fixo de R$ {precoManual.toFixed(2)} por Girinha</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Girinhas creditadas automaticamente após aprovação</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Suporte a cartão, PIX, boleto e conta Mercado Pago</span>
                </div>
              </div>

              <div className="bg-blue-50 p-3 rounded-lg mt-4">
                <p className="text-sm text-blue-800">
                  <span className="font-medium">💳 Métodos aceitos:</span> Cartões de crédito/débito, 
                  PIX, boleto bancário e saldo Mercado Pago.
                </p>
              </div>

              <div className="bg-purple-50 p-3 rounded-lg">
                <p className="text-sm text-purple-800">
                  <span className="font-medium">💡 Dica:</span> As Girinhas têm validade de 12 meses e podem ser usadas 
                  para qualquer item na plataforma!
                </p>
              </div>

              <div className="grid grid-cols-4 gap-2 text-xs text-center text-gray-600 mt-4">
                <div className="flex flex-col items-center">
                  <span className="text-lg">💳</span>
                  <span>Cartão</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-lg">⚡</span>
                  <span>PIX</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-lg">🧾</span>
                  <span>Boleto</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-lg">💰</span>
                  <span>MP</span>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default CheckoutMercadoPago;
