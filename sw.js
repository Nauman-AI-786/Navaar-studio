/* Navaar Studio service worker. Bump VERSION after each site update. */
const VERSION = 'navaar-v2';
const SHELL = ['./', 'index.html', 'editor.html', 'tools.html', 'cartoon.html', 'privacy.html',
  'favicon.svg', 'manifest.json', 'pwa.js', 'icons/icon-192.png', 'icons/icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c =>
    Promise.all(SHELL.map(u => c.add(u).catch(() => {})))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  // Only handle same-site GET pages/files. Supabase, Railway API, fonts, CDN go straight to network.
  if (req.method !== 'GET' || url.origin !== location.origin) return;
  // Network first (users always get the newest site), cache as offline fallback.
  e.respondWith(
    fetch(req).then(res => {
      if (res && res.ok) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req).then(r => r || (req.mode === 'navigate' ? caches.match('index.html') : undefined)))
  );
});
