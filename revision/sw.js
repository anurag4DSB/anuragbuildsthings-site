// Offline cache for the revision pack, scope /revision/.
// Pages: network first, cache fallback; VERSION is stamped at build time so a deploy refreshes the precache.
// Assets (site_libs, css, js, fonts): cache first, refreshed in the background; kept across versions.
const VERSION = '20261004-2219';
const PAGES = 'rev-pages-' + VERSION, ASSETS = 'rev-assets';
const URLS = ['./', 'index.html', 'daily.html', 'reference.html', 'coding.html', 'data-paths.html'];
self.addEventListener('install', (e) => e.waitUntil(
  caches.open(PAGES).then((c) => c.addAll(URLS)).then(() => self.skipWaiting())));
self.addEventListener('activate', (e) => e.waitUntil(
  caches.keys().then((ks) => Promise.all(ks.filter((k) => k.startsWith('rev-pages-') && k !== PAGES).map((k) => caches.delete(k))))
    .then(() => self.clients.claim())));
function put(name, req, res) {
  if (res && (res.ok || res.type === 'opaque')) { const c = res.clone(); caches.open(name).then((x) => x.put(req, c)); }
  return res;
}
self.addEventListener('fetch', (e) => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET') return;
  const fonts = /(^|\.)fonts\.(googleapis|gstatic)\.com$/.test(u.hostname);
  if (u.origin !== self.location.origin && !fonts) return;
  if (r.mode === 'navigate') {
    e.respondWith(fetch(r).then((res) => put(PAGES, r, res)).catch(() => caches.match(r, { ignoreSearch: true })));
    return;
  }
  e.respondWith(caches.match(r).then((hit) => {
    const net = fetch(r).then((res) => put(ASSETS, r, res)).catch(() => hit);
    return hit || net;
  }));
});
