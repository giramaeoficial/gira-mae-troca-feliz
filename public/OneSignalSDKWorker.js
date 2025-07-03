
// OneSignal Service Worker com fallback robusto
try {
  // Tentar carregar o SDK do OneSignal
  importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDKWorker.js');
} catch (error) {
  console.warn('OneSignal CDN falhou, usando implementação local:', error);
  
  // Implementação básica local se o CDN falhar
  self.addEventListener('push', function(event) {
    if (!event.data) return;
    
    try {
      const data = event.data.json();
      const options = {
        body: data.message || data.body || 'Nova notificação',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: data.tag || 'default',
        data: data,
        requireInteraction: false
      };
      
      event.waitUntil(
        self.registration.showNotification(data.title || 'GiraMãe', options)
      );
    } catch (parseError) {
      console.warn('Erro ao processar notificação:', parseError);
    }
  });
  
  self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    
    if (event.action === 'dismiss') {
      return;
    }
    
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus();
          }
        }
        
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
    );
  });
}

// Eventos básicos do service worker
self.addEventListener('install', function(event) {
  console.log('OneSignal Worker instalado');
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  console.log('OneSignal Worker ativado');
  event.waitUntil(self.clients.claim());
});
