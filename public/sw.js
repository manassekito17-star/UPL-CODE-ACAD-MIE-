// Service worker de UPL CODE ACADEMY MK : garde UPL IDE sur l'appareil pour l'utiliser sans Internet.
// - Pages hors ligne autorisées (UPL IDE, éditeur, laboratoire) : réseau d'abord, copie locale si pas de connexion.
// - Fichiers de l'application (/_next/static, versionnés) : copie locale d'abord.
// - Éditeur de code (Monaco) et Python (Pyodide), sur le CDN jsdelivr, versions figées : copie locale d'abord.
// - Comptes, API, administration : jamais mis en cache (toujours le réseau).
const VERSION = "v4";
const PAGES = `upl-pages-${VERSION}`;
const STATIC = `upl-static-${VERSION}`;
const CDN = `upl-cdn-${VERSION}`;
const KEEP = [PAGES, STATIC, CDN];
const OFFLINE_PAGES = ["/ide", "/editeur", "/laboratoire"];
const CDN_PREFIXES = ["https://cdn.jsdelivr.net/npm/monaco-editor@", "https://cdn.jsdelivr.net/npm/pyodide@"];

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith("upl-") && !KEEP.includes(k)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

async function put(cacheName, request, response) {
  // Réponse « opaque » (script chargé sans CORS) : acceptée seulement pour le CDN, dont les versions sont figées.
  if (!response || (response.type === "opaque" ? cacheName !== CDN : !response.ok)) return;
  const cache = await caches.open(cacheName);
  await cache.put(request, response);
}

// Copie locale d'abord. Le téléchargement est indépendant de la page ou du worker demandeur
// (un worker d'exécution se ferme dès la fin du programme) : la copie est terminée même s'il disparaît.
// Un même fichier de worker sert plusieurs moteurs, distingués par la fin de l'adresse (#params=…).
// Le worker lit son adresse dans la réponse : on renvoie une réponse sans adresse propre pour qu'il
// garde exactement celle demandée (sinon le moteur JavaScript recevrait celle du pseudocode).
function forClient(request, response) {
  if (request.destination !== "worker" && request.destination !== "sharedworker") return response;
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers: response.headers });
}

const withoutHash = (u) => u.split("#")[0];

async function cacheFirst(cacheName, request, event) {
  const hit = await caches.match(withoutHash(request.url));
  if (hit) return forClient(request, hit);
  const res = await fetch(withoutHash(request.url), { credentials: "same-origin" });
  event.waitUntil(put(cacheName, withoutHash(request.url), res.clone()));
  return forClient(request, res);
}

const OFFLINE_HTML = `<!doctype html><html lang="fr"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Hors connexion</title>
<body style="margin:0;font-family:system-ui,sans-serif;background:#181818;color:#ccc;display:grid;place-items:center;min-height:100vh;text-align:center;padding:16px">
<div><p style="font-size:20px;color:#fff">Pas de connexion Internet</p><p>Cette page demande Internet. UPL IDE reste utilisable sans connexion.</p>
<p><a href="/ide" style="color:#4daafc">Ouvrir UPL IDE</a></p></div></body></html>`;

async function page(request) {
  const url = new URL(request.url);
  const key = url.pathname; // une copie par page, sans les paramètres
  const offlineOk = OFFLINE_PAGES.includes(url.pathname);
  try {
    const res = await fetch(request);
    // Une page redirigée (vers la connexion) n'est jamais gardée à la place de la page demandée.
    if (offlineOk && res.ok && !res.redirected && !url.search) await put(PAGES, key, res.clone());
    return res;
  } catch {
    const hit = offlineOk ? await caches.match(key) : null;
    return hit || new Response(OFFLINE_HTML, { headers: { "Content-Type": "text/html; charset=utf-8" } });
  }
}

self.addEventListener("fetch", (e) => {
  const r = e.request;
  if (r.method !== "GET") return;
  const url = new URL(r.url);
  if (CDN_PREFIXES.some((p) => r.url.startsWith(p))) return e.respondWith(cacheFirst(CDN, r, e));
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/auth/") || url.pathname.startsWith("/admin")) return;
  if (r.mode === "navigate") return e.respondWith(page(r));
  if (url.pathname.startsWith("/_next/static/")) return e.respondWith(cacheFirst(STATIC, r, e));
  // Données de navigation de Next.js (RSC) : réseau uniquement.
  if (url.searchParams.has("_rsc") || r.headers.get("RSC")) return;
  if (url.pathname.startsWith("/workers/") || url.pathname.startsWith("/icons/") || url.pathname === "/favicon.ico" || url.pathname.endsWith(".webmanifest")) {
    // Réseau d'abord (mises à jour), copie locale si hors ligne.
    return e.respondWith(
      fetch(r)
        .then((res) => {
          e.waitUntil(put(STATIC, r, res.clone()));
          return res;
        })
        .catch(() => caches.match(r).then((hit) => hit || Response.error())),
    );
  }
});

// « Préparer pour une utilisation sans Internet » : la page envoie la liste des fichiers à garder.
self.addEventListener("message", (e) => {
  const data = e.data || {};
  if (data.type === "precache" && Array.isArray(data.urls)) {
    const port = e.ports && e.ports[0];
    e.waitUntil(
      (async () => {
        let ok = 0;
        for (const u of data.urls) {
          try {
            const url = new URL(u, self.location.origin);
            const isPage = url.origin === self.location.origin && OFFLINE_PAGES.includes(url.pathname);
            const cacheName = CDN_PREFIXES.some((p) => url.href.startsWith(p)) ? CDN : isPage ? PAGES : STATIC;
            const key = isPage ? url.pathname : withoutHash(url.href);
            if (!isPage && (await caches.match(key))) {
              ok++;
              continue;
            }
            const res = await fetch(withoutHash(url.href), { credentials: "same-origin" });
            if (res.ok && !res.redirected) {
              await (await caches.open(cacheName)).put(key, res);
              ok++;
            }
          } catch {
            /* fichier ignoré : il sera mis en cache à sa prochaine utilisation */
          }
        }
        if (port) port.postMessage({ type: "precache-done", ok, total: data.urls.length });
      })(),
    );
  }
  if (data.type === "clear-pages") e.waitUntil(caches.delete(PAGES));
});
