
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNotificationSystem } from '@/hooks/useNotificationSystem';
import { Bell, Check, X, TestTube, Smartphone, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export const OneSignalSettings: React.FC = () => {
  const { 
    oneSignalInitialized: isInitialized, 
    playerId, 
    pushEnabled: isPermissionGranted,
    requestPushPermission,
    sendTestNotification 
  } = useNotificationSystem();

  const isPushSupported = typeof window !== 'undefined' && 'Notification' in window;

  const handleRequestPermission = async () => {
    try {
      const granted = await requestPushPermission();
      if (granted) {
        toast.success('Permissão concedida! Notificações ativadas.');
      } else {
        toast.error('Permissão negada. Ative nas configurações do navegador.');
      }
    } catch (error) {
      toast.error('Erro ao solicitar permissão');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="w-5 h-5" />
          Notificações Push
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Aviso sobre desabilitação temporária */}
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <h4 className="font-medium text-yellow-800">Temporariamente Desabilitado</h4>
          </div>
          <p className="text-sm text-yellow-700">
            As notificações push estão temporariamente desabilitadas para resolver problemas de compatibilidade. 
            Você ainda receberá notificações dentro do aplicativo (sininho no header).
          </p>
        </div>

        {/* Status da Configuração */}
        <div className="grid grid-cols-1 gap-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-sm">Status do OneSignal</p>
              <p className="text-xs text-gray-500">Serviço de notificações</p>
            </div>
            <Badge variant="secondary">
              Desabilitado
            </Badge>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-sm">Permissões</p>
              <p className="text-xs text-gray-500">Autorização do navegador</p>
            </div>
            <Badge variant="secondary">
              Pendente
            </Badge>
          </div>
        </div>

        {/* Ações */}
        <div className="space-y-3">
          <Button 
            onClick={sendTestNotification}
            variant="outline"
            className="w-full"
          >
            <TestTube className="w-4 h-4 mr-2" />
            Testar Notificação In-App
          </Button>
        </div>

        {/* Informações */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-800 mb-2">📱 Notificações In-App Ativas</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Receba alertas dentro do aplicativo</li>
            <li>• Veja o sininho vermelho no header</li>
            <li>• Lista completa de notificações</li>
            <li>• Controle suas preferências abaixo</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
