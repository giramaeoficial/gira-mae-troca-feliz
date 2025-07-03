// OneSignal SDK Service Worker
try {
  importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js');
} catch (error) {
  // Fallback básico se o CDN falhar
  self.addEventListener('push', function(event) {
    if (!event.data) return;
    
    try {
      const data = event.data.json();
      const options = {
        body: data.message || data.body || 'Nova notificação do GiraMãe',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: data.tag || 'giramae',
        data: data,
        requireInteraction: false,
        actions: [
          {
            action: 'view',
            title: 'Ver'
          },
          {
            action: 'dismiss',
            title: 'Dispensar'
          }
        ]
      };
      
      event.waitUntil(
        self.registration.showNotification(data.title || 'GiraMãe', options)
      );
    } catch (parseError) {
      // Erro silencioso
    }
  });
  
  self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    
    if (event.action === 'dismiss') {
      return;
    }
    
    let url = '/';
    const notificationData = event.notification.data;
    
    if (notificationData && notificationData.type) {
      switch(notificationData.type) {
        case 'nova_mensagem':
          url = '/mensagens';
          break;
        case 'item_reservado':
        case 'reserva_confirmada':
          url = '/minhas-reservas';
          break;
        case 'girinhas_recebidas':
          url = '/carteira';
          break;
        default:
          url = '/';
      }
    }
    
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.navigate(url);
            return client.focus();
          }
        }
        
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
    );
  });
}

self.addEventListener('install', function(event) {
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(self.clients.claim());
});