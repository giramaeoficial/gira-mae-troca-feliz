
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNotificationSystem } from '@/hooks/useNotificationSystem';
import { Bell, Check, X, TestTube, Smartphone, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export const OneSignalSettings: React.FC = () => {
  const { 
    oneSignalInitialized: isInitialized, 
    pushEnabled: isPermissionGranted,
    requestPushPermission,
    sendTestNotification 
  } = useNotificationSystem();

  const isPushSupported = typeof window !== 'undefined' && 'Notification' in window;
  const browserPermission = isPushSupported ? Notification.permission : 'denied';

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
        {/* Status da Configuração */}
        <div className="grid grid-cols-1 gap-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-sm">Status do Sistema</p>
              <p className="text-xs text-gray-500">Serviço de notificações</p>
            </div>
            <Badge variant={isInitialized ? "default" : "secondary"}>
              {isInitialized ? (
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Ativo
                </div>
              ) : (
                'Inativo'
              )}
            </Badge>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-sm">Permissões do Navegador</p>
              <p className="text-xs text-gray-500">Autorização para notificações</p>
            </div>
            <Badge variant={browserPermission === 'granted' ? "default" : "secondary"}>
              {browserPermission === 'granted' ? (
                <div className="flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  Concedida
                </div>
              ) : browserPermission === 'denied' ? (
                <div className="flex items-center gap-1">
                  <X className="w-3 h-3" />
                  Negada
                </div>
              ) : (
                'Pendente'
              )}
            </Badge>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-sm">Push Notifications</p>
              <p className="text-xs text-gray-500">Configuradas nas preferências</p>
            </div>
            <Badge variant={isPermissionGranted ? "default" : "secondary"}>
              {isPermissionGranted ? (
                <div className="flex items-center gap-1">
                  <Bell className="w-3 h-3" />
                  Ativadas
                </div>
              ) : (
                'Desativadas'
              )}
            </Badge>
          </div>
        </div>

        {/* Ações */}
        <div className="space-y-3">
          {browserPermission !== 'granted' && (
            <Button 
              onClick={handleRequestPermission}
              className="w-full"
            >
              <Bell className="w-4 h-4 mr-2" />
              Solicitar Permissão
            </Button>
          )}

          <Button 
            onClick={sendTestNotification}
            variant="outline"
            className="w-full"
          >
            <TestTube className="w-4 h-4 mr-2" />
            Testar Notificação
          </Button>
        </div>

        {/* Informações */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-800 mb-2">📱 Como Funciona</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Notificações in-app sempre ativas (sininho no header)</li>
            <li>• Push notifications via OneSignal (servidor seguro)</li>
            <li>• Permissões gerenciadas nas configurações do usuário</li>
            <li>• Sistema totalmente automatizado e seguro</li>
          </ul>
        </div>

        {browserPermission === 'denied' && (
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h4 className="font-medium text-yellow-800 mb-2">⚠️ Permissão Negada</h4>
            <p className="text-sm text-yellow-700">
              Para receber notificações push, você precisa ativar as permissões nas configurações do seu navegador.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
