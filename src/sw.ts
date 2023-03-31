import { precacheAndRoute } from 'workbox-precaching';

declare let self: ServiceWorkerGlobalScope;
declare let clients: Clients;

precacheAndRoute(self.__WB_MANIFEST);

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('push', (event) => {
  if (event.data?.text() === undefined) return;
  const data = JSON.parse(event.data?.text());
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.message,
      icon: '/pwa-assets/manifest-icon-192.maskable.png',
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        if (clientList.length > 0) {
          let client = clientList[0];
          for (let i = 0; i < clientList.length; i++) {
            if (clientList[i].focused) {
              client = clientList[i];
            }
          }
          return client.focus();
        }
        return clients.openWindow('/');
      }),
  );
});
