const CACHE_NAME = "routine-planner-v2"; // bump version when you deploy
const urlsToCache = ["/", "/manifest.json", "/icon-192.png", "/icon-512.png"];

self.addEventListener("install", (event) => {
  // Take over immediately
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener("activate", (event) => {
  // Claim control of all clients right away
  event.waitUntil(
    Promise.all([
      clients.claim(),
      caches.keys().then((cacheNames) =>
        Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        )
      ),
    ])
  );
});

// Network-first for HTML, cache-first for static assets
self.addEventListener("fetch", (event) => {
  if (event.request.mode === "navigate") {
    // For page navigation (HTML), always go to network first
    event.respondWith(
      fetch(event.request).catch(() => caches.match("/"))
    );
    return;
  }

  // For other assets: cache-first
  event.respondWith(
    caches.match(event.request).then((response) => {
      return (
        response ||
        fetch(event.request).then((networkResponse) => {
          // Optionally update the cache
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        })
      );
    })
  );
});

// Notifications
self.addEventListener("message", (event) => {
  if (!event.data) return;
  const { type, title, options } = event.data || {};
  if (type === "SHOW_NOTIFICATION" && title) {
    self.registration.showNotification(title, options || {});
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow("/");
      }
    })
  );
});
