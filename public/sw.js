const CACHE_NAME = "akal-center-v3";
const STATIC_EXTS = /\.(ico|png|jpg|jpeg|gif|svg|webp|woff2?|ttf|eot|css|js)$/i;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((c) => c.addAll(["/offline.html", "/offline", "/icon.svg"]).catch(() => {}))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (event.request.mode === "navigate") {
    event.respondWith(handleNavigate(event.request));
    return;
  }
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(networkFirst(event.request));
    return;
  }
  if (STATIC_EXTS.test(url.pathname) || url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/pdf/")) {
    event.respondWith(cacheFirst(event.request));
    return;
  }
  event.respondWith(networkFirst(event.request));
});

async function handleNavigate(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cachedHtml = await caches.match("/offline.html");
    if (cachedHtml) return cachedHtml;
    const cachedOffline = await caches.match("/offline");
    if (cachedOffline) return cachedOffline;
    return new Response("Offline", { status: 503, headers: { "Content-Type": "text/html; charset=utf-8" } });
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response("Offline", { status: 503 });
  }
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached || new Response(JSON.stringify({ error: "Offline" }), { status: 503, headers: { "Content-Type": "application/json" } });
  }
}

// F9-3: Background Sync — queue replay for offline POSTs
// TODO: Implement IndexedDB queue (idb) for POST /api/v1/guru/uploads & drafts/generate
// Full replay requires IndexedDB helper + queue serialization; stub keeps SW installable.
self.addEventListener("sync", (event) => {
  if (event.tag === "akal-queue") {
    event.waitUntil(replayQueue());
  }
});

async function replayQueue() {
  // TODO: open IndexedDB "akal-offline-queue", iterate pending requests,
  // replay POST /api/v1/guru/uploads and /api/v1/guru/drafts/[id]/generate
  // when back online. Requires idb wrapper + fetch replay with original body/headers.
  // Stub resolves immediately — no queued requests to replay yet.
  return Promise.resolve();
}

// F9-4: Waiting lifecycle — only skipWaiting when client asks
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
