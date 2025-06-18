
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Settings, DollarSign, Percent, Zap, Users, AlertTriangle } from "lucide-react";

const SystemConfig = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query para buscar configurações atuais
  const { data: configs } = useQuery({
    queryKey: ['system-config'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('config_sistema')
        .select('*');
      
      if (error) throw error;
      
      // Converter para objeto mais fácil de usar
      const configObj = data.reduce((acc, config) => {
        acc[config.chave] = config.valor;
        return acc;
      }, {} as Record<string, any>);
      
      return configObj;
    }
  });

  const [formData, setFormData] = useState({
    taxaTransferencia: configs?.taxa_transferencia?.percentual || 1.0,
    queimaPorTransacao: configs?.queima_por_transacao?.quantidade || 1.0,
    cotacaoMin: configs?.cotacao_min_max?.min || 0.80,
    cotacaoMax: configs?.cotacao_min_max?.max || 1.30,
    bonusInicial: 50.0,
    limiteDiario: 1000.0
  });

  // Mutation para atualizar configurações
  const updateConfigMutation = useMutation({
    mutationFn: async (newConfig: typeof formData) => {
      const updates = [
        {
          chave: 'taxa_transferencia',
          valor: { percentual: newConfig.taxaTransferencia }
        },
        {
          chave: 'queima_por_transacao', 
          valor: { quantidade: newConfig.queimaPorTransacao }
        },
        {
          chave: 'cotacao_min_max',
          valor: { min: newConfig.cotacaoMin, max: newConfig.cotacaoMax }
        }
      ];

      for (const update of updates) {
        const { error } = await supabase
          .from('config_sistema')
          .upsert(update);
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: "Configurações atualizadas!",
        description: "As configurações do sistema foram salvas com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ['system-config'] });
    },
    onError: () => {
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível salvar as configurações.",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateConfigMutation.mutate(formData);
  };

  const handleDistribuirGirinhas = () => {
    toast({
      title: "Funcionalidade em desenvolvimento",
      description: "A distribuição promocional será implementada em breve."
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status do Sistema</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge variant="default" className="bg-green-500">
              Operacional
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa P2P Atual</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formData.taxaTransferencia}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Queima/Transação</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formData.queimaPorTransacao}</div>
            <p className="text-xs text-muted-foreground">Girinhas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faixa de Cotação</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold">
              R$ {formData.cotacaoMin} - R$ {formData.cotacaoMax}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Configurações Econômicas</CardTitle>
            <CardDescription>
              Ajuste os parâmetros principais do sistema monetário
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="taxaTransferencia">Taxa P2P (%)</Label>
                  <Input
                    id="taxaTransferencia"
                    type="number"
                    step="0.1"
                    value={formData.taxaTransferencia}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      taxaTransferencia: Number(e.target.value)
                    }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="queimaPorTransacao">Queima/Transação</Label>
                  <Input
                    id="queimaPorTransacao"
                    type="number"
                    step="0.1"
                    value={formData.queimaPorTransacao}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      queimaPorTransacao: Number(e.target.value)
                    }))}
                  />
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cotacaoMin">Cotação Mínima (R$)</Label>
                  <Input
                    id="cotacaoMin"
                    type="number"
                    step="0.01"
                    value={formData.cotacaoMin}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      cotacaoMin: Number(e.target.value)
                    }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cotacaoMax">Cotação Máxima (R$)</Label>
                  <Input
                    id="cotacaoMax"
                    type="number"
                    step="0.01"
                    value={formData.cotacaoMax}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      cotacaoMax: Number(e.target.value)
                    }))}
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={updateConfigMutation.isPending}
              >
                {updateConfigMutation.isPending ? "Salvando..." : "Salvar Configurações"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ações Administrativas</CardTitle>
            <CardDescription>
              Ferramentas para gestão do sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <h4 className="font-medium text-yellow-800">Distribuição Promocional</h4>
              </div>
              <p className="text-sm text-yellow-700 mb-3">
                Distribua Girinhas para usuárias ativas para incentivar o uso da plataforma
              </p>
              <Button 
                variant="outline" 
                onClick={handleDistribuirGirinhas}
                className="w-full"
              >
                <Users className="h-4 w-4 mr-2" />
                Distribuir Girinhas
              </Button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="autoAjuste">Ajuste Automático de Cotação</Label>
                <Switch id="autoAjuste" defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="notificacoes">Notificações de Alerta</Label>
                <Switch id="notificacoes" defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="manutencao">Modo Manutenção</Label>
                <Switch id="manutencao" />
              </div>
            </div>

            <Separator />

            <Button variant="destructive" className="w-full">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Recalcular Cotação Agora
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SystemConfig;
