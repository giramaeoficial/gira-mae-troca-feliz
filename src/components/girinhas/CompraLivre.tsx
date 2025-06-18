
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Sparkles, Calculator, ShoppingCart, AlertTriangle, TrendingUp } from 'lucide-react';
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
  const [isLoading, setIsLoading] = useState(false);
  
  const { cotacao } = useGirinhasSystem();
  const { adicionarTransacao, refetch } = useCarteira();
  const { toast } = useToast();
  const { user } = useAuth();

  // Carregar configurações
  useEffect(() => {
    const carregarConfiguracoes = async () => {
      const { data: configMin } = await supabase
        .from('config_sistema')
        .select('valor')
        .eq('chave', 'compra_girinhas_min')
        .single();

      const { data: configMax } = await supabase
        .from('config_sistema')
        .select('valor')
        .eq('chave', 'compra_girinhas_max')
        .single();

      if (configMin && configMax) {
        setConfiguracoes({
          min: configMin.valor.quantidade,
          max: configMax.valor.quantidade
        });
      }
    };

    carregarConfiguracoes();
  }, []);

  const quantidadeNum = parseFloat(quantidade) || 0;
  const cotacaoAtual = cotacao?.cotacao_atual || 1.0;
  const valorTotal = quantidadeNum * cotacaoAtual;
  
  const isQuantidadeValida = quantidadeNum >= configuracoes.min && quantidadeNum <= configuracoes.max;
  const temImpacto = quantidadeNum >= 100;
  
  // Simular impacto na cotação para compras grandes
  const impactoCotacao = temImpacto ? quantidadeNum * 0.0001 : 0;
  const novaCotacao = Math.min(cotacaoAtual + impactoCotacao, 1.30);

  const handleComprar = async () => {
    if (!user || !isQuantidadeValida) return;

    setIsLoading(true);
    try {
      // Simular processamento de pagamento (sempre aprovado para demo)
      const paymentId = `demo_${Date.now()}`;

      // Criar registro da compra
      const { error: compraError } = await supabase
        .from('compras_girinhas')
        .insert({
          user_id: user.id,
          valor_pago: valorTotal,
          girinhas_recebidas: quantidadeNum,
          status: 'aprovado',
          payment_id: paymentId
        });

      if (compraError) throw compraError;

      // Adicionar Girinhas à carteira
      const sucesso = await adicionarTransacao(
        'compra',
        quantidadeNum,
        `Compra de ${quantidadeNum} Girinhas`,
        undefined,
        undefined,
        cotacaoAtual,
        quantidadeNum
      );

      if (sucesso) {
        // Atualizar cotação se houve impacto
        if (temImpacto) {
          await supabase.rpc('calcular_cotacao_dinamica');
        }

        toast({
          title: "✅ Compra realizada com sucesso!",
          description: `${quantidadeNum} Girinhas foram adicionadas à sua carteira por R$ ${valorTotal.toFixed(2)}`,
        });

        setQuantidade('');
        await refetch();
      }
    } catch (error) {
      console.error('Erro ao processar compra:', error);
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
        {/* Cotação atual */}
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Cotação atual:</span>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-lg font-bold text-primary">
                R$ {cotacaoAtual.toFixed(4)}
              </span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">por Girinha</p>
        </div>

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
                <span>Cotação:</span>
                <span>R$ {cotacaoAtual.toFixed(4)}</span>
              </div>
              
              {temImpacto && (
                <div className="flex justify-between text-sm text-orange-600">
                  <span>Nova cotação (estimada):</span>
                  <span>R$ {novaCotacao.toFixed(4)}</span>
                </div>
              )}
              
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between text-lg font-bold">
                  <span>Valor total:</span>
                  <span className="text-primary">R$ {valorTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Alertas */}
            {!isQuantidadeValida && (
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  A quantidade deve estar entre {configuracoes.min} e {configuracoes.max.toLocaleString()} Girinhas.
                </AlertDescription>
              </Alert>
            )}

            {temImpacto && isQuantidadeValida && (
              <Alert className="border-orange-200 bg-orange-50">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-800">
                  <strong>Impacto na cotação detectado!</strong><br />
                  Compras acima de 100 Girinhas podem aumentar a cotação do mercado.
                  Nova cotação estimada: R$ {novaCotacao.toFixed(4)}
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

        {/* Informações adicionais */}
        <div className="text-xs text-gray-500 space-y-1 bg-gray-50 p-3 rounded-lg">
          <p>✅ Girinhas sem prazo de validade</p>
          <p>✅ Uso imediato após a compra</p>
          <p>✅ Cotação em tempo real</p>
          <p>✅ Pagamento seguro (demo)</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompraLivre;
