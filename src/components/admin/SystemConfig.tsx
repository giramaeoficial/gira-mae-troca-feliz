
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, Settings, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ConfigCompraGirinhas from './ConfigCompraGirinhas';
import ConfigExtensaoValidade from './ConfigExtensaoValidade';

const SystemConfig: React.FC = () => {
  const [config, setConfig] = useState({
    taxaTransacao: 5.0,
    taxaTransferencia: 1.0,
    markupEmissao: 0.0,
    validadeGirinhas: 12,
    cotacaoMin: 0.80,
    cotacaoMax: 1.30
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

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
            case 'markup_emissao':
              const markupEmissao = config.valor as { percentual: number };
              setConfig(prev => ({ ...prev, markupEmissao: markupEmissao.percentual }));
              break;
            case 'validade_girinhas':
              const validadeGirinhas = config.valor as { meses: number };
              setConfig(prev => ({ ...prev, validadeGirinhas: validadeGirinhas.meses }));
              break;
            case 'cotacao_min_max':
              const cotacao = config.valor as { min: number; max: number };
              setConfig(prev => ({ 
                ...prev, 
                cotacaoMin: cotacao.min,
                cotacaoMax: cotacao.max
              }));
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
          chave: 'markup_emissao',
          valor: { percentual: config.markupEmissao }
        },
        {
          chave: 'validade_girinhas',
          valor: { meses: config.validadeGirinhas }
        },
        {
          chave: 'cotacao_min_max',
          valor: { min: config.cotacaoMin, max: config.cotacaoMax }
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
                  <Label htmlFor="cotacaoMin">Cotação Mínima (R$)</Label>
                  <Input
                    id="cotacaoMin"
                    type="number"
                    step="0.01"
                    value={config.cotacaoMin}
                    onChange={(e) => setConfig(prev => ({ 
                      ...prev, 
                      cotacaoMin: parseFloat(e.target.value) || 0 
                    }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cotacaoMax">Cotação Máxima (R$)</Label>
                  <Input
                    id="cotacaoMax"
                    type="number"
                    step="0.01"
                    value={config.cotacaoMax}
                    onChange={(e) => setConfig(prev => ({ 
                      ...prev, 
                      cotacaoMax: parseFloat(e.target.value) || 0 
                    }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="markupEmissao">Markup de Emissão (%)</Label>
                  <Input
                    id="markupEmissao"
                    type="number"
                    step="0.1"
                    value={config.markupEmissao}
                    onChange={(e) => setConfig(prev => ({ 
                      ...prev, 
                      markupEmissao: parseFloat(e.target.value) || 0 
                    }))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Margem sobre cotação para emissão
                  </p>
                </div>

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
