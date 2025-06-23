
// Service Worker para Push Notifications
self.addEventListener('push', function(event) {
  if (!event.data) return;
  
  try {
    const data = event.data.json();
    
    const options = {
      body: data.message || data.body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: data.type || 'default',
      data: data,
      requireInteraction: data.type === 'sistema',
      actions: [
        {
          action: 'view',
          title: 'Ver',
          icon: '/favicon.ico'
        },
        {
          action: 'dismiss',
          title: 'Dispensar',
          icon: '/favicon.ico'
        }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  } catch (error) {
    console.error('Erro ao processar push notification:', error);
  }
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  if (event.action === 'dismiss') {
    return;
  }
  
  // Navegação baseada no tipo
  let url = '/';
  const notificationData = event.notification.data;
  
  if (notificationData && notificationData.type) {
    switch(notificationData.type) {
      case 'nova_mensagem':
        url = notificationData.data?.conversa_id 
          ? `/mensagens?conversa=${notificationData.data.conversa_id}`
          : '/mensagens';
        break;
      case 'item_reservado':
      case 'reserva_confirmada':
        url = '/minhas-reservas';
        break;
      case 'girinhas_expirando':
      case 'girinhas_recebidas':
        url = '/carteira';
        break;
      case 'missao_completada':
        url = '/missoes';
        break;
      case 'sistema':
        url = notificationData.data?.action_url || '/';
        break;
    }
  }
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      // Se já há uma janela aberta, focar nela
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      
      // Caso contrário, abrir nova janela
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

// Evento de instalação
self.addEventListener('install', function(event) {
  self.skipWaiting();
});

// Evento de ativação
self.addEventListener('activate', function(event) {
  event.waitUntil(self.clients.claim());
});
