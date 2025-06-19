
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShoppingCart, Info, AlertTriangle, CheckCircle, Shield, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useCarteira } from '@/hooks/useCarteira';
import { useGirinhasSystem } from '@/modules/girinhas/hooks/useGirinhasSystem';

interface ConfigCompra {
  min: number;
  max: number;
}

const CompraLivre: React.FC = () => {
  const [quantidade, setQuantidade] = useState('');
  const [configuracoes, setConfiguracoes] = useState<ConfigCompra>({ min: 10, max: 999000 });
  const [precoFixo] = useState(1.00); // Preço fixo de R$ 1,00 por Girinha
  
  const { 
    compraSegura, 
    isComprandoSeguro,
    refetchCotacao,
    refetchPrecoEmissao 
  } = useGirinhasSystem();
  const { refetch } = useCarteira();
  const { toast } = useToast();
  const { user } = useAuth();

  // Carregar configurações
  useEffect(() => {
    const carregarConfiguracoes = async () => {
      const { data: configs } = await supabase
        .from('config_sistema')
        .select('chave, valor')
        .in('chave', ['compra_girinhas_min', 'compra_girinhas_max']);

      if (configs) {
        configs.forEach(config => {
          switch (config.chave) {
            case 'compra_girinhas_min':
              const valorMin = config.valor as { quantidade: number };
              setConfiguracoes(prev => ({ ...prev, min: valorMin.quantidade }));
              break;
            case 'compra_girinhas_max':
              const valorMax = config.valor as { quantidade: number };
              setConfiguracoes(prev => ({ ...prev, max: valorMax.quantidade }));
              break;
          }
        });
      }
    };

    carregarConfiguracoes();
  }, []);

  const quantidadeNum = parseFloat(quantidade) || 0;
  const valorTotal = quantidadeNum * precoFixo;
  
  const isQuantidadeValida = quantidadeNum >= configuracoes.min && quantidadeNum <= configuracoes.max;
  const temImpacto = quantidadeNum >= 100;

  const realizarCompraSegura = async () => {
    if (!user || !isQuantidadeValida || quantidadeNum <= 0) return;

    try {
      compraSegura({ quantidade: quantidadeNum });
      await refetch();
      await refetchCotacao();
      await refetchPrecoEmissao();
      setQuantidade('');
    } catch (error: any) {
      console.error('Erro na compra segura:', error);
    }
  };

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
          <ShoppingCart className="w-6 h-6 text-purple-500" />
          Comprar Girinhas
        </CardTitle>
        <p className="text-sm text-gray-600 mt-1">
          1 Girinha = R$ 1,00 • Sistema seguro e confiável
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Preço fixo */}
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            <span className="text-lg font-bold text-purple-600">
              R$ 1,00 por Girinha
            </span>
          </div>
          <p className="text-xs text-gray-500 text-center mt-1">Preço fixo • Sem taxas ocultas</p>
        </div>

        {/* Alerta de segurança */}
        <Alert className="border-green-200 bg-green-50">
          <Shield className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <div className="space-y-1">
              <p className="font-medium">🔒 Compra 100% segura!</p>
              <p className="text-sm">
                Sistema protegido contra fraudes com validação server-side.
              </p>
            </div>
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="simples" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="simples">Compra Simples</TabsTrigger>
            <TabsTrigger value="info">Informações</TabsTrigger>
          </TabsList>

          <TabsContent value="simples" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="quantidade">Quantidade de Girinhas</Label>
              <Input
                id="quantidade"
                type="number"
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
                placeholder={`Entre ${configuracoes.min} e ${configuracoes.max.toLocaleString()}`}
                min={configuracoes.min}
                max={configuracoes.max}
                className="text-lg"
              />
              <p className="text-xs text-gray-500">
                Mínimo: {configuracoes.min} | Máximo: {configuracoes.max.toLocaleString()} Girinhas
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
                  <span className="font-bold">R$ 1,00</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between items-center text-lg">
                    <span className="font-bold text-gray-800">Total a pagar:</span>
                    <span className="font-bold text-primary text-xl">
                      R$ {valorTotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                {temImpacto && (
                  <Alert className="border-blue-200 bg-blue-50">
                    <Info className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800">
                      <span className="font-medium">Compra grande!</span> 
                      Quantidades acima de 100 Girinhas ajudam a sustentar a comunidade.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            <Button
              onClick={realizarCompraSegura}
              disabled={!isQuantidadeValida || isComprandoSeguro || quantidadeNum <= 0}
              className="w-full h-12 text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {isComprandoSeguro ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processando compra...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Comprar por R$ {valorTotal.toFixed(2)}
                </div>
              )}
            </Button>

            {!isQuantidadeValida && quantidadeNum > 0 && (
              <p className="text-sm text-red-600 text-center">
                Quantidade deve estar entre {configuracoes.min} e {configuracoes.max.toLocaleString()} Girinhas
              </p>
            )}
          </TabsContent>

          <TabsContent value="info" className="space-y-4">
            <div className="bg-white p-4 rounded-lg border space-y-3">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <Info className="w-4 h-4" />
                Como Funciona
              </h3>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Preço fixo de R$ 1,00 por Girinha</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Sem taxas ocultas ou surpresas</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Processamento seguro server-side</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Créditos disponíveis imediatamente</span>
                </div>
              </div>

              <div className="bg-purple-50 p-3 rounded-lg mt-4">
                <p className="text-sm text-purple-800">
                  <span className="font-medium">💡 Dica:</span> As Girinhas não expiram e podem ser usadas 
                  para trocar qualquer item na plataforma!
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default CompraLivre;
