// ProstateView service worker retirement shim.
// Keep this file so browsers with the previous worker installed can update,
// clear ProstateView caches, and then unregister cleanly.

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    try {
      const keys = await caches.keys();
      await Promise.all(keys.filter((key) => key.startsWith("pv-")).map((key) => caches.delete(key)));
    } catch (_) {
      // Ignore cache APIs blocked by managed browsers.
    }

    try {
      await self.registration.unregister();
    } catch (_) {
      // If unregister is blocked, the absence of a fetch handler still lets
      // requests pass through to the network.
    }

    try {
      const clients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const client of clients) {
        client.navigate(client.url);
      }
    } catch (_) {
      // Navigation refresh is best-effort only.
    }
  })());
});
