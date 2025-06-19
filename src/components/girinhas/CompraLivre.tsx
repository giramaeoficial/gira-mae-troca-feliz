
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, TrendingUp, Calculator, Info, AlertTriangle, CheckCircle, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useCarteira } from '@/hooks/useCarteira';
import { useGirinhasSystem } from '@/modules/girinhas/hooks/useGirinhasSystem';

interface ConfigCompra {
  min: number;
  max: number;
}

interface MarkupInfo {
  markup_atual: number;
  preco_com_markup_atual: number;
  precisa_ajuste: boolean;
  markup_necessario: number;
  preco_final: number;
}

const CompraLivre: React.FC = () => {
  const [quantidade, setQuantidade] = useState('');
  const [configuracoes, setConfiguracoes] = useState<ConfigCompra>({ min: 10, max: 999000 });
  const [isLoading, setIsLoading] = useState(false);
  const [precoEmissaoReal, setPrecoEmissaoReal] = useState(0);
  const [markupInfo, setMarkupInfo] = useState<MarkupInfo | null>(null);
  const [sistemaAjustou, setSistemaAjustou] = useState(false);
  
  const { cotacao } = useGirinhasSystem();
  const { adicionarTransacao, refetch } = useCarteira();
  const { toast } = useToast();
  const { user } = useAuth();

  // Buscar preço de emissão real e informações de markup
  useEffect(() => {
    const buscarPrecoEmissao = async () => {
      try {
        // Buscar preço de emissão atual
        const { data: precoData, error: precoError } = await supabase.rpc('obter_preco_emissao');
        
        if (!precoError && precoData) {
          setPrecoEmissaoReal(Number(precoData));
        }
        
        // Simular o cálculo para obter informações detalhadas
        const { data: simulacaoData, error: simulacaoError } = await supabase.rpc('simular_preco_emissao');
        
        if (!simulacaoError && simulacaoData && simulacaoData.length > 0) {
          const info = simulacaoData[0];
          setMarkupInfo({
            markup_atual: Number(info.markup_atual),
            preco_com_markup_atual: Number(info.preco_com_markup_atual),
            precisa_ajuste: info.precisa_ajuste,
            markup_necessario: Number(info.markup_necessario),
            preco_final: Number(info.preco_final)
          });
          
          setSistemaAjustou(info.precisa_ajuste);
        }
      } catch (err) {
        console.error('Erro ao buscar preço de emissão:', err);
      }
    };

    buscarPrecoEmissao();
    
    // Atualizar a cada 30 segundos
    const interval = setInterval(buscarPrecoEmissao, 30000);
    return () => clearInterval(interval);
  }, [cotacao]);

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
  const cotacaoMercado = cotacao?.cotacao_atual || 1.0;
  const precoEmissao = precoEmissaoReal || cotacaoMercado;
  const valorTotal = quantidadeNum * precoEmissao;
  const markupReal = markupInfo ? markupInfo.markup_necessario : 0;
  
  const isQuantidadeValida = quantidadeNum >= configuracoes.min && quantidadeNum <= configuracoes.max;
  const temImpacto = quantidadeNum >= 100;
  
  // Verificar se é promoção ou preço acima do mercado
  const isPromocao = precoEmissao < cotacaoMercado;
  const isPrecoAlto = precoEmissao > cotacaoMercado;

  const realizarCompra = async () => {
    if (!user || !isQuantidadeValida || quantidadeNum <= 0) return;

    setIsLoading(true);
    try {
      // Buscar preço de emissão atual antes de processar
      const { data: precoAtual } = await supabase.rpc('obter_preco_emissao');
      const precoFinal = Number(precoAtual) || precoEmissao;
      const valorFinal = quantidadeNum * precoFinal;

      await adicionarTransacao({
        tipo: 'compra',
        valor: quantidadeNum,
        valor_real: valorFinal,
        descricao: `Compra de ${quantidadeNum} Girinhas`,
        cotacao_utilizada: precoFinal,
        quantidade_girinhas: quantidadeNum
      });

      await refetch();
      setQuantidade('');
      
      toast({
        title: "Compra realizada com sucesso! 🎉",
        description: `${quantidadeNum} Girinhas adicionadas à sua carteira por R$ ${valorFinal.toFixed(2)}`,
      });
    } catch (error: any) {
      console.error('Erro na compra:', error);
      toast({
        title: "Erro na compra",
        description: error.message || "Não foi possível processar a compra",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
          <Sparkles className="w-6 h-6 text-purple-500" />
          Compra de Girinhas
        </CardTitle>
        <p className="text-sm text-gray-600 mt-1">
          Sistema inteligente com markup dinâmico
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Informações de cotação e preço */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Cotação de mercado:</span>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-lg font-bold text-green-600">
                  R$ {cotacaoMercado.toFixed(4)}
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">preço real baseado em oferta/demanda</p>
          </div>

          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Preço de emissão:</span>
              <div className="flex items-center gap-2">
                {sistemaAjustou ? (
                  <Zap className="w-4 h-4 text-orange-500" />
                ) : (
                  <Sparkles className="w-4 h-4 text-purple-500" />
                )}
                <span className="text-lg font-bold text-primary">
                  R$ {precoEmissao.toFixed(4)}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-gray-500">
                {markupReal > 0 ? `+${markupReal.toFixed(1)}%` : markupReal < 0 ? `${markupReal.toFixed(1)}%` : 'sem markup'} sobre mercado
              </p>
              {sistemaAjustou && (
                <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                  Auto-ajustado
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Alerta de sistema inteligente */}
        {sistemaAjustou && markupInfo && (
          <Alert className="border-orange-200 bg-orange-50">
            <Zap className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <div className="space-y-1">
                <p className="font-medium">Sistema de proteção ativado!</p>
                <p className="text-sm">
                  Markup ajustado automaticamente de {markupInfo.markup_atual.toFixed(1)}% 
                  para {markupInfo.markup_necessario.toFixed(1)}% para manter preço dentro dos limites seguros.
                </p>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Status do preço */}
        {isPromocao && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <span className="font-medium">🎉 Preço promocional!</span> Preço abaixo da cotação de mercado.
            </AlertDescription>
          </Alert>
        )}

        {isPrecoAlto && (
          <Alert className="border-blue-200 bg-blue-50">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <span className="font-medium">ℹ️ Preço premium</span> Preço acima da cotação devido ao markup aplicado.
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="simples" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="simples">Compra Simples</TabsTrigger>
            <TabsTrigger value="avancada">Avançado</TabsTrigger>
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
                  <span className="font-bold">R$ {precoEmissao.toFixed(4)}</span>
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
                  <Alert className="border-yellow-200 bg-yellow-50">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-800">
                      <span className="font-medium">Compra grande detectada!</span> 
                      Quantidades acima de 100 Girinhas podem impactar a cotação de mercado.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            <Button
              onClick={realizarCompra}
              disabled={!isQuantidadeValida || isLoading || quantidadeNum <= 0}
              className="w-full h-12 text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processando compra...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
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

          <TabsContent value="avancada" className="space-y-4">
            <div className="bg-white p-4 rounded-lg border space-y-3">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <Info className="w-4 h-4" />
                Detalhes do Sistema Inteligente
              </h3>
              
              {markupInfo && (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Markup configurado:</span>
                    <span>{markupInfo.markup_atual.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Preço com markup original:</span>
                    <span>R$ {markupInfo.preco_com_markup_atual.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Markup aplicado:</span>
                    <span className={markupInfo.precisa_ajuste ? "text-orange-600 font-bold" : ""}>
                      {markupInfo.markup_necessario.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between font-bold border-t pt-2">
                    <span>Preço final:</span>
                    <span>R$ {markupInfo.preco_final.toFixed(4)}</span>
                  </div>
                </div>
              )}

              <div className="text-xs text-gray-500 space-y-1">
                <p>• O sistema ajusta automaticamente o markup para manter preços seguros</p>
                <p>• Limites: R$ 0.80 (mín) - R$ 1.30 (máx)</p>
                <p>• Compras grandes podem impactar a cotação de mercado</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default CompraLivre;
