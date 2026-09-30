/* Navaar Studio PWA helper: add <script src="pwa.js" defer></script> to EVERY page. */
(function () {
  // manifest + theme (only if the page does not have them already)
  var h = document.head;
  if (!document.querySelector('link[rel="manifest"]')) {
    var l = document.createElement('link'); l.rel = 'manifest'; l.href = 'manifest.json'; h.appendChild(l);
  }
  if (!document.querySelector('link[rel="apple-touch-icon"]')) {
    var a = document.createElement('link'); a.rel = 'apple-touch-icon'; a.href = 'icons/apple-touch-icon.png'; h.appendChild(a);
  }
  if (!document.querySelector('meta[name="apple-mobile-web-app-capable"]')) {
    var m = document.createElement('meta'); m.name = 'apple-mobile-web-app-capable'; m.content = 'yes'; h.appendChild(m);
  }

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function () {});
    });
  }

  var standalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  if (standalone) return;                       // already installed
  try { if (localStorage.getItem('nvInstallHide') === '1') return; } catch (e) {}

  var deferred = null, bar = null;
  function build(text, onClick) {
    if (bar) return;
    bar = document.createElement('div');
    bar.style.cssText = 'position:fixed;left:12px;right:12px;bottom:12px;max-width:420px;margin:0 auto;z-index:300;display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:14px;background:#141f22;border:1px solid rgba(121,217,189,.35);box-shadow:0 14px 40px -10px #000;font:14px/1.4 Inter,Arial,sans-serif;color:#f3f7f5';
    var t = document.createElement('span'); t.style.flex = '1'; t.textContent = text;
    var b = document.createElement('button'); b.textContent = 'Install';
    b.style.cssText = 'background:#79d9bd;color:#08201a;border:0;border-radius:999px;padding:8px 16px;font-weight:700;cursor:pointer';
    var x = document.createElement('button'); x.textContent = '\u00d7'; x.setAttribute('aria-label', 'Close');
    x.style.cssText = 'background:none;border:0;color:#93a8a2;font-size:22px;cursor:pointer;line-height:1';
    b.onclick = onClick;
    x.onclick = function () { bar.remove(); bar = null; try { localStorage.setItem('nvInstallHide', '1'); } catch (e) {} };
    if (!onClick) b.style.display = 'none';
    bar.appendChild(t); bar.appendChild(b); bar.appendChild(x); document.body.appendChild(bar);
  }

  // Android / Chrome / Edge
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault(); deferred = e;
    build('Install Navaar Studio on your phone', function () {
      if (!deferred) return; deferred.prompt();
      deferred.userChoice.finally(function () { deferred = null; if (bar) { bar.remove(); bar = null; } });
    });
  });
  window.addEventListener('appinstalled', function () { if (bar) { bar.remove(); bar = null; } });

  // iPhone Safari has no install prompt: show a short hint
  var ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;
  if (ios) window.addEventListener('load', function () {
    setTimeout(function () { build('To install: tap Share, then "Add to Home Screen"', null); }, 2500);
  });
})();
