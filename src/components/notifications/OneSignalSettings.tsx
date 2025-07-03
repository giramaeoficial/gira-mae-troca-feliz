
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNotificationSystem } from '@/hooks/useNotificationSystem';
import { useAuth } from '@/hooks/useAuth';
import { Bell, Check, X, TestTube, Smartphone, CheckCircle, Server } from 'lucide-react';
import { toast } from 'sonner';

export const OneSignalSettings: React.FC = () => {
  const { 
    pushEnabled: isPermissionGranted,
    requestPushPermission,
    sendTestNotification 
  } = useNotificationSystem();
  const { user } = useAuth();

  const isPushSupported = typeof window !== 'undefined' && 'Notification' in window;
  const browserPermission = isPushSupported ? Notification.permission : 'denied';

  // Registrar usuário no OneSignal quando já tem permissão
  useEffect(() => {
    const registerUserInOneSignal = async () => {
      if (!user || !browserPermission || browserPermission !== 'granted') return;
      
      // Aguardar OneSignal carregar se necessário
      if (typeof window !== 'undefined' && window.OneSignal) {
        try {
          console.log('🔗 Registrando usuário no OneSignal:', user.id);
          await window.OneSignal.setExternalUserId(user.id);
          console.log('✅ Usuário registrado no OneSignal com sucesso');
        } catch (error) {
          console.error('❌ Erro ao registrar usuário no OneSignal:', error);
        }
      }
    };

    // Pequeno delay para garantir que OneSignal carregou
    const timer = setTimeout(registerUserInOneSignal, 1000);
    return () => clearTimeout(timer);
  }, [user, browserPermission]);

  const handleRequestPermission = async () => {
    try {
      const granted = await requestPushPermission();
      if (granted && user) {
        toast.success('Permissão concedida! Notificações ativadas.');
        
        // Registrar no OneSignal após aceitar permissão
        setTimeout(async () => {
          if (window.OneSignal) {
            try {
              console.log('🔗 Registrando usuário após aceitar permissão:', user.id);
              await window.OneSignal.setExternalUserId(user.id);
              console.log('✅ Usuário registrado no OneSignal após permissão');
              toast.success('Usuário registrado com sucesso!');
            } catch (error) {
              console.error('❌ Erro ao registrar após permissão:', error);
            }
          }
        }, 2000);
      } else {
        toast.error('Permissão negada. Ative nas configurações do navegador.');
      }
    } catch (error) {
      toast.error('Erro ao solicitar permissão');
    }
  };

  const handleTestNotification = async () => {
    if (!user) {
      toast.error('Usuário não encontrado');
      return;
    }

    // Garantir que usuário está registrado antes de testar
    if (window.OneSignal && browserPermission === 'granted') {
      try {
        console.log('🔗 Verificando registro do usuário antes do teste...');
        await window.OneSignal.setExternalUserId(user.id);
        console.log('✅ Usuário registrado/verificado antes do teste');
      } catch (error) {
        console.warn('⚠️ Aviso ao verificar registro:', error);
      }
    }

    // Enviar notificação de teste
    await sendTestNotification();
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
              <p className="font-medium text-sm">Sistema de Notificações</p>
              <p className="text-xs text-gray-500">Edge Function (Servidor Seguro)</p>
            </div>
            <Badge variant="default">
              <div className="flex items-center gap-1">
                <Server className="w-3 h-3" />
                Ativo
              </div>
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

          {/* Status do Registro OneSignal */}
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div>
              <p className="font-medium text-sm text-blue-800">Registro OneSignal</p>
              <p className="text-xs text-blue-600">Usuário vinculado ao dispositivo</p>
            </div>
            <Badge variant={user && browserPermission === 'granted' ? "default" : "secondary"}>
              {user && browserPermission === 'granted' ? (
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Registrado
                </div>
              ) : (
                'Pendente'
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
            onClick={handleTestNotification}
            variant="outline"
            className="w-full"
          >
            <TestTube className="w-4 h-4 mr-2" />
            Testar Notificação
          </Button>
        </div>

        {/* Informações */}
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <h4 className="font-medium text-green-800 mb-2">✅ Sistema Ativo</h4>
          <ul className="text-sm text-green-700 space-y-1">
            <li>• Notificações in-app sempre ativas (sininho no header)</li>
            <li>• Push notifications via Edge Function (servidor seguro)</li>
            <li>• Credenciais OneSignal protegidas no servidor</li>
            <li>• Usuário automaticamente registrado no OneSignal</li>
            <li>• Sistema otimizado e escalável</li>
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

        {user && (
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-600">
              <strong>Usuário ID:</strong> {user.id}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
