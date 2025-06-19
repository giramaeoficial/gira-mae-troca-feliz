
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Sparkles, Calculator, ShoppingCart, AlertTriangle, TrendingUp, Info, Gift, TrendingDown } from 'lucide-react';
import { useGirinhasSystem } from '@/modules/girinhas/hooks/useGirinhasSystem';
import { useCarteira } from '@/hooks/useCarteira';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

const CompraLivre: React.FC = () => {
  const [quantidade, setQuantidade] = useState('');
  const [configuracoes, setConfiguracoes] = useState<{
    min: number;
    max: number;
  }>({ min: 10, max: 999000 });
  const [markupEmissao, setMarkupEmissao] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  const { cotacao } = useGirinhasSystem();
  const { refetch } = useCarteira();
  const { toast } = useToast();
  const { user } = useAuth();

  // Carregar configurações
  useEffect(() => {
    const carregarConfiguracoes = async () => {
      const { data: configs } = await supabase
        .from('config_sistema')
        .select('chave, valor')
        .in('chave', ['compra_girinhas_min', 'compra_girinhas_max', 'markup_emissao']);

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
            case 'markup_emissao':
              const markup = config.valor as { percentual: number };
              setMarkupEmissao(markup.percentual);
              break;
          }
        });
      }
    };

    carregarConfiguracoes();
  }, []);

  const quantidadeNum = parseFloat(quantidade) || 0;
  const cotacaoMercado = cotacao?.cotacao_atual || 1.0;
  
  // Calcular preço de emissão com markup
  const precoEmissao = cotacaoMercado * (1 + markupEmissao / 100);
  const valorTotal = quantidadeNum * precoEmissao;
  
  const isQuantidadeValida = quantidadeNum >= configuracoes.min && quantidadeNum <= configuracoes.max;
  const temImpacto = quantidadeNum >= 100;
  
  // Verificar se é promoção ou preço acima do mercado
  const isPromocao = precoEmissao < cotacaoMercado;
  const isPrecoAlto = precoEmissao > cotacaoMercado;

  const handleComprar = async () => {
    if (!user || !isQuantidadeValida) return;

    setIsLoading(true);
    try {
      console.log('🛒 [CompraLivre] Iniciando compra:', {
        quantidade: quantidadeNum,
        precoEmissao,
        valorTotal,
        cotacaoMercado
      });

      // Obter data de expiração configurada
      const { data: dataExpiracao } = await supabase.rpc('obter_data_expiracao');
      
      console.log('📅 [CompraLivre] Data de expiração obtida:', dataExpiracao);

      // Simular processamento de pagamento (sempre aprovado para demo)
      const paymentId = `demo_${Date.now()}`;

      // Criar registro da compra (sem pacote_id, pois é compra livre)
      const { error: compraError } = await supabase
        .from('compras_girinhas')
        .insert({
          user_id: user.id,
          valor_pago: valorTotal,
          girinhas_recebidas: quantidadeNum,
          status: 'aprovado',
          payment_id: paymentId,
          pacote_id: null // Compra livre, sem pacote
        });

      if (compraError) {
        console.error('❌ Erro ao criar compra:', compraError);
        throw compraError;
      }

      console.log('✅ [CompraLivre] Compra registrada com sucesso');

      // Inserir transação diretamente (o trigger irá atualizar a carteira e cotação automaticamente)
      const { error: transacaoError } = await supabase
        .from('transacoes')
        .insert({
          user_id: user.id,
          tipo: 'compra',
          valor: quantidadeNum,
          descricao: `Compra de ${quantidadeNum} Girinhas`,
          cotacao_utilizada: precoEmissao,
          quantidade_girinhas: quantidadeNum,
          data_expiracao: dataExpiracao
        });

      if (transacaoError) {
        console.error('❌ Erro ao criar transação:', transacaoError);
        throw transacaoError;
      }

      console.log('✅ [CompraLivre] Transação criada com sucesso - trigger irá processar automaticamente');

      toast({
        title: "✅ Compra realizada com sucesso!",
        description: `${quantidadeNum} Girinhas foram adicionadas à sua carteira por R$ ${valorTotal.toFixed(2)}`,
      });

      setQuantidade('');
      
      // Aguardar um pouco para o trigger processar
      setTimeout(async () => {
        await refetch();
      }, 1000);
      
    } catch (error) {
      console.error('❌ [CompraLivre] Erro ao processar compra:', error);
      toast({
        title: "Erro na compra",
        description: "Não foi possível processar a compra. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-2xl">
          <Sparkles className="w-6 h-6 text-purple-600" />
          Comprar Girinhas
        </CardTitle>
        <p className="text-muted-foreground">
          Adquira Girinhas para fazer trocas incríveis na plataforma
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
            <p className="text-xs text-gray-500 mt-1">preço de referência</p>
          </div>

          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Preço de emissão:</span>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-500" />
                <span className="text-lg font-bold text-primary">
                  R$ {precoEmissao.toFixed(4)}
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {markupEmissao > 0 ? `+${markupEmissao}%` : markupEmissao < 0 ? `${markupEmissao}%` : 'sem markup'} sobre o mercado
            </p>
          </div>
        </div>

        {/* Alertas de promoção ou preço alto */}
        {isPromocao && (
          <Alert className="border-green-200 bg-green-50">
            <Gift className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>🎉 Aproveite a promoção!</strong><br />
              O preço de emissão está R$ {(cotacaoMercado - precoEmissao).toFixed(4)} abaixo do valor de mercado. 
              Excelente oportunidade para adquirir Girinhas com desconto!
            </AlertDescription>
          </Alert>
        )}

        {isPrecoAlto && (
          <Alert className="border-orange-200 bg-orange-50">
            <TrendingDown className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <strong>⚠️ Preço acima do mercado</strong><br />
              O preço de emissão está R$ {(precoEmissao - cotacaoMercado).toFixed(4)} acima do valor de mercado. 
              Considere aguardar uma oportunidade melhor.
            </AlertDescription>
          </Alert>
        )}

        {/* Informação sobre markup */}
        {markupEmissao !== 0 && (
          <Alert className="border-blue-200 bg-blue-50">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              {markupEmissao > 0 
                ? `O preço de emissão inclui um markup de ${markupEmissao}% sobre a cotação de mercado.`
                : `O preço de emissão tem um desconto de ${Math.abs(markupEmissao)}% sobre a cotação de mercado.`
              }
            </AlertDescription>
          </Alert>
        )}

        {/* Input de quantidade */}
        <div className="space-y-2">
          <Label htmlFor="quantidade" className="text-sm font-medium">
            Quantidade de Girinhas
          </Label>
          <Input
            id="quantidade"
            type="number"
            value={quantidade}
            onChange={(e) => setQuantidade(e.target.value)}
            placeholder={`Mín: ${configuracoes.min} | Máx: ${configuracoes.max.toLocaleString()}`}
            min={configuracoes.min}
            max={configuracoes.max}
            className="text-lg"
          />
          <p className="text-xs text-gray-500">
            Quantidade mínima: {configuracoes.min} Girinhas
          </p>
        </div>

        {/* Cálculo do valor */}
        {quantidade && quantidadeNum > 0 && (
          <div className="space-y-3">
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex items-center gap-2 mb-3">
                <Calculator className="w-4 h-4 text-blue-500" />
                <span className="font-medium">Cálculo da compra</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span>Quantidade:</span>
                <span className="font-medium">{quantidadeNum} Girinhas</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span>Preço unitário:</span>
                <span>R$ {precoEmissao.toFixed(4)}</span>
              </div>

              {markupEmissao !== 0 && (
                <div className="flex justify-between text-sm text-blue-600">
                  <span>Markup aplicado:</span>
                  <span>{markupEmissao > 0 ? '+' : ''}{markupEmissao}%</span>
                </div>
              )}
              
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between text-lg font-bold">
                  <span>Valor total:</span>
                  <span className="text-primary">R$ {valorTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {!isQuantidadeValida && (
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  A quantidade deve estar entre {configuracoes.min} e {configuracoes.max.toLocaleString()} Girinhas.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Botão de compra */}
        <Button
          onClick={handleComprar}
          disabled={!isQuantidadeValida || !quantidade || isLoading}
          className="w-full text-lg py-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          size="lg"
        >
          {isLoading ? (
            'Processando compra...'
          ) : (
            <>
              <ShoppingCart className="w-5 h-5 mr-2" />
              Comprar por R$ {valorTotal.toFixed(2)}
            </>
          )}
        </Button>

        <div className="text-xs text-gray-500 space-y-1 bg-gray-50 p-3 rounded-lg">
          <p>✅ Girinhas com validade de 12 meses</p>
          <p>✅ Uso imediato após a compra</p>
          <p>✅ Preço baseado na cotação + markup configurado</p>
          <p>✅ Cotação atualizada automaticamente</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompraLivre;
