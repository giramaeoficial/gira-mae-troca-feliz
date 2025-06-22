
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, Settings, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { usePrecoManual } from '@/hooks/usePrecoManual';
import ConfigCompraGirinhas from './ConfigCompraGirinhas';
import ConfigExtensaoValidade from './ConfigExtensaoValidade';

const SystemConfig: React.FC = () => {
  const [config, setConfig] = useState({
    taxaTransacao: 5.0,
    taxaTransferencia: 1.0,
    validadeGirinhas: 12,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const { precoManual, atualizarPreco, isAtualizando } = usePrecoManual();
  const [precoTemp, setPrecoTemp] = useState(precoManual);

  useEffect(() => {
    setPrecoTemp(precoManual);
  }, [precoManual]);

  useEffect(() => {
    carregarConfiguracoes();
  }, []);

  const carregarConfiguracoes = async () => {
    setIsLoading(true);
    try {
      const { data: configs } = await supabase
        .from('config_sistema')
        .select('chave, valor');

      if (configs) {
        configs.forEach(config => {
          switch (config.chave) {
            case 'taxa_transacao':
              const taxaTransacao = config.valor as { percentual: number };
              setConfig(prev => ({ ...prev, taxaTransacao: taxaTransacao.percentual }));
              break;
            case 'taxa_transferencia':
              const taxaTransferencia = config.valor as { percentual: number };
              setConfig(prev => ({ ...prev, taxaTransferencia: taxaTransferencia.percentual }));
              break;
            case 'validade_girinhas':
              const validadeGirinhas = config.valor as { meses: number };
              setConfig(prev => ({ ...prev, validadeGirinhas: validadeGirinhas.meses }));
              break;
          }
        });
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as configurações.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const salvarConfiguracoes = async () => {
    setIsSaving(true);
    try {
      const updates = [
        {
          chave: 'taxa_transacao',
          valor: { percentual: config.taxaTransacao }
        },
        {
          chave: 'taxa_transferencia',
          valor: { percentual: config.taxaTransferencia }
        },
        {
          chave: 'validade_girinhas',
          valor: { meses: config.validadeGirinhas }
        }
      ];

      for (const update of updates) {
        const { error } = await supabase
          .from('config_sistema')
          .upsert(update);

        if (error) throw error;
      }

      toast({
        title: "Configurações salvas",
        description: "Todas as configurações foram atualizadas com sucesso."
      });
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAtualizarPreco = () => {
    if (precoTemp && precoTemp > 0) {
      atualizarPreco(precoTemp);
    }
  };

  if (isLoading) {
    return <div>Carregando configurações...</div>;
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="sistema" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="sistema">Sistema Geral</TabsTrigger>
          <TabsTrigger value="compras">Compra de Girinhas</TabsTrigger>
          <TabsTrigger value="extensao">Extensão de Validade</TabsTrigger>
        </TabsList>

        <TabsContent value="sistema">
          <div className="space-y-6">
            {/* Preço Manual das Girinhas */}
            <Card className="border-purple-200 bg-purple-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-purple-600" />
                  Preço Manual das Girinhas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                  <div className="space-y-2">
                    <Label htmlFor="precoManual">Preço por Girinha (R$)</Label>
                    <Input
                      id="precoManual"
                      type="number"
                      step="0.01"
                      min="0.01"
                      max="100.00"
                      value={precoTemp}
                      onChange={(e) => setPrecoTemp(parseFloat(e.target.value) || 1.00)}
                      className="text-lg font-bold"
                    />
                    <p className="text-xs text-purple-700">
                      Preço atual: <strong>R$ {precoManual.toFixed(2)}</strong>
                    </p>
                  </div>
                  <Button 
                    onClick={handleAtualizarPreco}
                    disabled={isAtualizando || !precoTemp || precoTemp <= 0}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isAtualizando ? 'Salvando...' : 'Atualizar Preço'}
                  </Button>
                </div>
                <div className="bg-white p-3 rounded border">
                  <p className="text-sm text-gray-700">
                    💡 <strong>Importante:</strong> Este preço será usado para todas as compras de Girinhas. 
                    Use o Painel de Saúde para orientar suas decisões de preço.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Outras Configurações */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Configurações do Sistema
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Taxas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="taxaTransacao">Taxa de Transação (%)</Label>
                    <Input
                      id="taxaTransacao"
                      type="number"
                      step="0.1"
                      value={config.taxaTransacao}
                      onChange={(e) => setConfig(prev => ({ 
                        ...prev, 
                        taxaTransacao: parseFloat(e.target.value) || 0 
                      }))}
                    />
                    <p className="text-xs text-muted-foreground">
                      Taxa cobrada sobre transações do marketplace
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="taxaTransferencia">Taxa de Transferência P2P (%)</Label>
                    <Input
                      id="taxaTransferencia"
                      type="number"
                      step="0.1"
                      value={config.taxaTransferencia}
                      onChange={(e) => setConfig(prev => ({ 
                        ...prev, 
                        taxaTransferencia: parseFloat(e.target.value) || 0 
                      }))}
                    />
                    <p className="text-xs text-muted-foreground">
                      Taxa sobre transferências entre usuárias
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="validadeGirinhas">Validade das Girinhas (meses)</Label>
                    <Input
                      id="validadeGirinhas"
                      type="number"
                      value={config.validadeGirinhas}
                      onChange={(e) => setConfig(prev => ({ 
                        ...prev, 
                        validadeGirinhas: parseInt(e.target.value) || 0 
                      }))}
                    />
                  </div>
                </div>

                <Button 
                  onClick={salvarConfiguracoes}
                  disabled={isSaving}
                  className="w-full md:w-auto"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? 'Salvando...' : 'Salvar Configurações'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="compras">
          <ConfigCompraGirinhas />
        </TabsContent>

        <TabsContent value="extensao">
          <ConfigExtensaoValidade />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemConfig;
