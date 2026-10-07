/* Jāmiʿ al-Kāmil service worker — offline reading.
 *
 * Pages a user has already viewed (plus their data, assets, and fonts) are
 * served from cache so they load again with no network. Strategy per type:
 *   - navigations:            stale-while-revalidate (jk-pages)
 *   - Supabase REST GETs:     stale-while-revalidate (jk-data)
 *   - build assets and fonts: cache-first (jk-assets, jk-fonts)
 * Never cached: /auth and /admin routes, /api, anything non-GET, /auth/v1.
 */

const VERSION = "v2";
const PAGES = `jk-pages-${VERSION}`;
const ASSETS = `jk-assets-${VERSION}`;
const DATA = `jk-data-${VERSION}`;
const FONTS = `jk-fonts-${VERSION}`;
const KNOWN_CACHES = [PAGES, ASSETS, DATA, FONTS];

const LIMITS = {
  [PAGES]: 150,
  [ASSETS]: 100,
  [DATA]: 300,
  [FONTS]: 60,
};

const NEVER_CACHE_PATHS = [/^\/auth(?:\/|$)/, /^\/admin(?:\/|$)/, /^\/api(?:\/|$)/];

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((key) => !KNOWN_CACHES.includes(key)).map((key) => caches.delete(key)),
      );
      await self.clients.claim();
    })(),
  );
});

function isFontHost(hostname) {
  return hostname === "fonts.googleapis.com" || hostname === "fonts.gstatic.com";
}

function isSupabaseDataRequest(url) {
  return url.hostname.endsWith(".supabase.co") && url.pathname.includes("/rest/v1/");
}

async function trimCache(cacheName) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  const overflow = keys.length - LIMITS[cacheName];
  for (let i = 0; i < overflow; i++) {
    await cache.delete(keys[i]);
  }
}

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok || response.type === "opaque") {
    const cache = await caches.open(cacheName);
    await cache.put(request, response.clone());
    await trimCache(cacheName);
  }
  return response;
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const network = fetch(request).then(async (response) => {
    if (response.ok || response.type === "opaque") {
      await cache.put(request, response.clone());
      await trimCache(cacheName);
    }
    return response;
  });
  // Cached copy wins (even offline); rejection propagates when uncached offline.
  return cached ?? network;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  const isSameOrigin = url.origin === self.location.origin;
  if (!isSameOrigin && !isFontHost(url.hostname) && !isSupabaseDataRequest(url)) return;
  if (isSameOrigin && NEVER_CACHE_PATHS.some((pattern) => pattern.test(url.pathname))) return;

  if (request.mode === "navigate") {
    event.respondWith(staleWhileRevalidate(request, PAGES));
    return;
  }
  if (isSupabaseDataRequest(url)) {
    event.respondWith(staleWhileRevalidate(request, DATA));
    return;
  }
  if (isFontHost(url.hostname)) {
    event.respondWith(cacheFirst(request, FONTS));
    return;
  }
  if (
    isSameOrigin &&
    (url.pathname.startsWith("/assets/") ||
      /\.(?:png|ico|webp|svg|txt|webmanifest|woff2?)$/i.test(url.pathname))
  ) {
    event.respondWith(cacheFirst(request, ASSETS));
  }
});
