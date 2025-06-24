
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useOneSignal } from '@/hooks/useOneSignal';
import { Bell, Check, X, TestTube, Smartphone } from 'lucide-react';
import { toast } from 'sonner';

export const OneSignalSettings: React.FC = () => {
  const { 
    isInitialized, 
    playerId, 
    isPermissionGranted,
    requestPermission,
    sendTestNotification,
    isPushSupported 
  } = useOneSignal();

  const handleRequestPermission = async () => {
    try {
      const granted = await requestPermission();
      if (granted) {
        toast.success('Permissão concedida! Notificações ativadas.');
      } else {
        toast.error('Permissão negada. Ative nas configurações do navegador.');
      }
    } catch (error) {
      toast.error('Erro ao solicitar permissão');
    }
  };

  if (!isPushSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Notificações Push
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <X className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">
              Notificações push não são suportadas neste navegador
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Notificações Push
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status da Configuração */}
        <div className="grid grid-cols-1 gap-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-sm">Status do OneSignal</p>
              <p className="text-xs text-gray-500">Serviço de notificações</p>
            </div>
            <Badge variant={isInitialized ? "default" : "secondary"}>
              {isInitialized ? "Ativo" : "Inativo"}
            </Badge>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-sm">Permissões</p>
              <p className="text-xs text-gray-500">Autorização do navegador</p>
            </div>
            <Badge variant={isPermissionGranted ? "default" : "destructive"}>
              {isPermissionGranted ? "Concedida" : "Negada"}
            </Badge>
          </div>

          {playerId && (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-sm">Player ID</p>
                <p className="text-xs text-gray-500 font-mono truncate">
                  {playerId.substring(0, 20)}...
                </p>
              </div>
              <Badge variant="outline">
                <Check className="w-3 h-3 mr-1" />
                Conectado
              </Badge>
            </div>
          )}
        </div>

        {/* Ações */}
        <div className="space-y-3">
          {!isPermissionGranted && (
            <Button 
              onClick={handleRequestPermission}
              className="w-full"
              variant="default"
            >
              <Bell className="w-4 h-4 mr-2" />
              Ativar Notificações
            </Button>
          )}

          {isPermissionGranted && (
            <Button 
              onClick={sendTestNotification}
              variant="outline"
              className="w-full"
            >
              <TestTube className="w-4 h-4 mr-2" />
              Testar Notificação
            </Button>
          )}
        </div>

        {/* Informações */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-800 mb-2">📱 Como funciona</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Receba alertas em tempo real</li>
            <li>• Funciona mesmo com o app fechado</li>
            <li>• Notificações de mensagens, reservas e Girinhas</li>
            <li>• Controle total das suas preferências</li>
          </ul>
        </div>

        {!isPermissionGranted && (
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h4 className="font-medium text-yellow-800 mb-2">⚠️ Permissão necessária</h4>
            <p className="text-sm text-yellow-700">
              Para receber notificações, você precisa autorizar no navegador. 
              Clique em "Ativar Notificações" e depois em "Permitir" na janela que aparecer.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
