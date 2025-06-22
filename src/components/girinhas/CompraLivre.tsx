
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShoppingCart, Info, CheckCircle, Shield, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useCarteira } from '@/hooks/useCarteira';
import { usePrecoManual } from '@/hooks/usePrecoManual';

interface ConfigCompra {
  min: number;
  max: number;
}

const CompraLivre: React.FC = () => {
  const [quantidade, setQuantidade] = useState('');
  const [configuracoes, setConfiguracoes] = useState<ConfigCompra>({ min: 10, max: 999000 });
  const [isComprandoManual, setIsComprandoManual] = useState(false);
  
  const { precoManual } = usePrecoManual();
  const { refetch } = useCarteira();
  const { toast } = useToast();
  const { user } = useAuth();

  // Carregar configurações
  useEffect(() => {
    const carregarDados = async () => {
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

    carregarDados();
  }, []);

  const quantidadeNum = parseFloat(quantidade) || 0;
  const valorTotal = quantidadeNum * precoManual;
  const isQuantidadeValida = quantidadeNum >= configuracoes.min && quantidadeNum <= configuracoes.max;

  const realizarCompraManual = async () => {
    if (!user || !isQuantidadeValida || quantidadeNum <= 0) return;

    setIsComprandoManual(true);
    try {
      console.log('🔒 [CompraLivre] Iniciando compra manual:', quantidadeNum);
      
      // Gerar chave de idempotência única
      const idempotencyKey = `compra_manual_${user.id}_${Date.now()}_${Math.random()}`;
      
      // Usar RPC que processa com preço manual
      const { data, error } = await supabase.rpc('processar_compra_manual', {
        p_user_id: user.id,
        p_quantidade: quantidadeNum,
        p_idempotency_key: idempotencyKey
      });

      if (error) {
        console.error('❌ Erro na compra manual:', error);
        throw error;
      }
      
      console.log('✅ [CompraLivre] Compra manual processada:', data);
      
      await refetch();
      setQuantidade('');
      
      toast({
        title: "🎉 Compra realizada com sucesso!",
        description: `${quantidadeNum} Girinhas adicionadas por R$ ${valorTotal.toFixed(2)}`,
      });
    } catch (error: any) {
      console.error('❌ Erro na compra manual:', error);
      
      toast({
        title: "Erro na compra",
        description: error.message || "Não foi possível processar a compra. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsComprandoManual(false);
    }
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
            Sistema seguro e preço fixo
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

        {/* Alerta de segurança */}
        <Alert className="border-green-200 bg-green-50">
          <Shield className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <div className="space-y-1">
              <p className="font-medium">🔒 Compra 100% segura!</p>
              <p className="text-sm">
                Preço fixo e transparente, sem surpresas ou taxas ocultas.
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
              onClick={realizarCompraManual}
              disabled={!isQuantidadeValida || isComprandoManual || quantidadeNum <= 0}
              className="w-full h-12 text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {isComprandoManual ? (
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
                  <span>Preço fixo e transparente</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Sem flutuações ou surpresas</span>
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
                  <span className="font-medium">💡 Preço controlado:</span> O valor é definido manualmente 
                  pela administração, garantindo estabilidade e previsibilidade.
                </p>
              </div>

              <div className="bg-purple-50 p-3 rounded-lg mt-4">
                <p className="text-sm text-purple-800">
                  <span className="font-medium">💡 Dica:</span> As Girinhas têm validade de 12 meses e podem ser usadas 
                  para qualquer item na plataforma!
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
