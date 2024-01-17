self.addEventListener("activate", function (event) {
  console.log("ServiceWorker activated.");
});

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open("chatgpt-web-proxy").then(function (cache) {
      return cache.addAll([]);
    }),
  );
});

self.addEventListener("fetch", (e) => { });