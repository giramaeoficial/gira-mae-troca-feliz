
import { WebNotificationProvider } from '@/types/notifications';

export class OneSignalProvider implements WebNotificationProvider {
  private apiKey: string;
  private appId: string;

  constructor(apiKey: string, appId: string) {
    this.apiKey = apiKey;
    this.appId = appId;
  }

  async sendPushNotification(userId: string, title: string, body: string, data?: any): Promise<void> {
    try {
      const response = await fetch('https://onesignal.com/api/v1/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${this.apiKey}`
        },
        body: JSON.stringify({
          app_id: this.appId,
          include_external_user_ids: [userId],
          headings: { en: title },
          contents: { en: body },
          data: data || {}
        })
      });

      if (!response.ok) {
        throw new Error(`Erro OneSignal: ${response.status}`);
      }

      console.log('Push notification enviado com sucesso');
    } catch (error) {
      console.error('Erro ao enviar push notification:', error);
      throw error;
    }
  }

  async registerUser(userId: string, metadata?: any): Promise<void> {
    try {
      // Usar a nova API do OneSignal v16
      if (typeof window !== 'undefined' && window.OneSignal) {
        // Usar addTag em vez de setExternalUserId
        await window.OneSignal.User?.addTag('user_id', userId);
        console.log('Usuário registrado no OneSignal:', userId);
      }
    } catch (error) {
      console.error('Erro ao registrar usuário no OneSignal:', error);
      throw error;
    }
  }
}
