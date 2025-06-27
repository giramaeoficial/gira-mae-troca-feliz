
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Users, Gift, Save, UserPlus, ShoppingCart, Package } from 'lucide-react';
import { useConfigIndicacoes } from '@/hooks/useConfigIndicacoes';

const ConfigIndicacoes: React.FC = () => {
  const { configuracoes, loading, atualizarConfiguracao } = useConfigIndicacoes();
  const [values, setValues] = useState<Record<string, { valor: number; ativo: boolean }>>({});
  const [saving, setSaving] = useState<string | null>(null);

  // Inicializar valores quando configurações carregam
  React.useEffect(() => {
    if (configuracoes.length > 0) {
      const newValues: Record<string, { valor: number; ativo: boolean }> = {};
      configuracoes.forEach(config => {
        newValues[config.id] = {
          valor: config.valor_girinhas,
          ativo: config.ativo
        };
      });
      setValues(newValues);
    }
  }, [configuracoes]);

  const handleSave = async (configId: string) => {
    setSaving(configId);
    const config = values[configId];
    if (config) {
      await atualizarConfiguracao(configId, config.valor, config.ativo);
    }
    setSaving(null);
  };

  const updateValue = (configId: string, field: 'valor' | 'ativo', value: number | boolean) => {
    setValues(prev => ({
      ...prev,
      [configId]: {
        ...prev[configId],
        [field]: value
      }
    }));
  };

  const getIcon = (tipo: string) => {
    switch (tipo) {
      case 'indicacao_cadastro':
        return <UserPlus className="w-4 h-4" />;
      case 'indicacao_primeiro_item':
        return <Package className="w-4 h-4" />;
      case 'indicacao_primeira_compra':
        return <ShoppingCart className="w-4 h-4" />;
      case 'bonus_cadastro_indicado':
        return <Gift className="w-4 h-4" />;
      default:
        return <Gift className="w-4 h-4" />;
    }
  };

  const getTitle = (tipo: string) => {
    switch (tipo) {
      case 'indicacao_cadastro':
        return 'Bônus por Cadastro de Indicado';
      case 'indicacao_primeiro_item':
        return 'Bônus por Primeiro Item do Indicado';
      case 'indicacao_primeira_compra':
        return 'Bônus por Primeira Compra do Indicado';
      case 'bonus_cadastro_indicado':
        return 'Bônus para o Usuário Indicado';
      default:
        return tipo;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-500" />
            Configuração de Bônus de Indicação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-500" />
          Configuração de Bônus de Indicação
        </CardTitle>
        <p className="text-sm text-gray-600 mt-2">
          Configure os valores de bônus para o sistema de indicações. Os valores devem estar entre 0 e 100 Girinhas.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {configuracoes.map((config) => {
          const currentValue = values[config.id];
          if (!currentValue) return null;

          return (
            <div key={config.id} className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getIcon(config.tipo_bonus)}
                  <div>
                    <h3 className="font-medium">{getTitle(config.tipo_bonus)}</h3>
                    <p className="text-sm text-gray-600">{config.descricao}</p>
                  </div>
                </div>
                <Badge variant={currentValue.ativo ? "default" : "secondary"}>
                  {currentValue.ativo ? "Ativo" : "Inativo"}
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="space-y-2">
                  <Label htmlFor={`valor-${config.id}`}>Valor (Girinhas)</Label>
                  <Input
                    id={`valor-${config.id}`}
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={currentValue.valor}
                    onChange={(e) => updateValue(config.id, 'valor', parseFloat(e.target.value) || 0)}
                    className="w-full"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id={`ativo-${config.id}`}
                    checked={currentValue.ativo}
                    onCheckedChange={(checked) => updateValue(config.id, 'ativo', checked)}
                  />
                  <Label htmlFor={`ativo-${config.id}`}>Ativo</Label>
                </div>
                
                <Button
                  onClick={() => handleSave(config.id)}
                  disabled={saving === config.id}
                  className="w-full md:w-auto"
                >
                  {saving === config.id ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Salvar
                    </>
                  )}
                </Button>
              </div>
            </div>
          );
        })}

        {configuracoes.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Nenhuma configuração de bônus encontrada.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ConfigIndicacoes;
