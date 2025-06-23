
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Bell, MapPin, School, Home, Clock } from 'lucide-react';
import { useLocationNotifications } from '@/hooks/useLocationNotifications';

const NotificationSettings: React.FC = () => {
  const { notifications, loading, atualizarPreferencias } = useLocationNotifications();

  if (loading) {
    return <div>Carregando preferências...</div>;
  }

  if (!notifications) {
    return <div>Erro ao carregar preferências</div>;
  }

  const handleUpdate = (field: string, value: any) => {
    atualizarPreferencias({ [field]: value });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Alertas de Proximidade
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Notificações de Novos Itens */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Novos Itens</h3>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <School className="w-4 h-4 text-muted-foreground" />
                <Label htmlFor="escola-switch">Mesma escola dos meus filhos</Label>
              </div>
              <Switch
                id="escola-switch"
                checked={notifications.items_mesma_escola}
                onCheckedChange={(checked) => handleUpdate('items_mesma_escola', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Home className="w-4 h-4 text-muted-foreground" />
                <Label htmlFor="bairro-switch">No meu bairro</Label>
              </div>
              <Switch
                id="bairro-switch"
                checked={notifications.items_mesmo_bairro}
                onCheckedChange={(checked) => handleUpdate('items_mesmo_bairro', checked)}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <Label>Raio de {notifications.items_raio_km}km</Label>
              </div>
              <Slider
                value={[notifications.items_raio_km]}
                onValueChange={(value) => handleUpdate('items_raio_km', value[0])}
                max={20}
                min={1}
                step={1}
                className="w-full"
              />
            </div>
          </div>

          {/* Notificações de Mães */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Novas Mães</h3>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <School className="w-4 h-4 text-muted-foreground" />
                <Label htmlFor="novas-maes-escola">Na escola dos meus filhos</Label>
              </div>
              <Switch
                id="novas-maes-escola"
                checked={notifications.novas_maes_escola}
                onCheckedChange={(checked) => handleUpdate('novas_maes_escola', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Home className="w-4 h-4 text-muted-foreground" />
                <Label htmlFor="novas-maes-bairro">No meu bairro</Label>
              </div>
              <Switch
                id="novas-maes-bairro"
                checked={notifications.novas_maes_bairro}
                onCheckedChange={(checked) => handleUpdate('novas_maes_bairro', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Frequência de Notificações
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup
            value={notifications.frequencia}
            onValueChange={(value) => handleUpdate('frequencia', value)}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="imediata" id="imediata" />
              <Label htmlFor="imediata">Imediata</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="diario" id="diario" />
              <Label htmlFor="diario">Resumo diário</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="semanal" id="semanal" />
              <Label htmlFor="semanal">Resumo semanal</Label>
            </div>
          </RadioGroup>

          {notifications.frequencia !== 'imediata' && (
            <div className="space-y-2">
              <Label htmlFor="horario">Horário preferido</Label>
              <Input
                id="horario"
                type="time"
                value={notifications.horario_resumo}
                onChange={(e) => handleUpdate('horario_resumo', e.target.value)}
                className="w-32"
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preview de Notificações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-3 rounded-lg">
            <p className="text-sm">📍 <strong>Novo item próximo!</strong></p>
            <p className="text-xs text-muted-foreground">
              Vestido infantil rosa - 2km de você
            </p>
          </div>
          
          <div className="bg-muted p-3 rounded-lg">
            <p className="text-sm">🏫 <strong>Item na escola do seu filho!</strong></p>
            <p className="text-xs text-muted-foreground">
              Uniforme escolar - Escola Municipal João Silva
            </p>
          </div>

          <Button variant="outline" className="w-full">
            Testar Notificação
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationSettings;
