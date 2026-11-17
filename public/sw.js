// Service worker de ZENTECH : garde ZENTECH IDE sur l'appareil pour l'utiliser sans Internet.
// - Pages hors ligne autorisées (ZENTECH IDE, ZENTECH Algo, interface LARP, Flow Studio, laboratoire) : réseau d'abord, copie locale si pas de connexion.
// - Fichiers de l'application (/_next/static, versionnés) : copie locale d'abord.
// - Éditeur de code (Monaco) et Python (Pyodide), sur le CDN jsdelivr, versions figées : copie locale d'abord.
// - Projets et programmes enregistrés dans le compte (liste et contenu, pages ?projet= / ?programme=) :
//   réseau d'abord, copie sur l'appareil pour les consulter sans Internet ; effacée à la déconnexion.
// - Autres API, comptes, administration : jamais mis en cache (toujours le réseau).
const VERSION = "v6";
const PAGES = `upl-pages-${VERSION}`;
const STATIC = `upl-static-${VERSION}`;
const CDN = `upl-cdn-${VERSION}`;
const DATA = `upl-donnees-${VERSION}`;
const KEEP = [PAGES, STATIC, CDN, DATA];
const UUID = "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}";
/** API des projets et programmes du compte (lecture) gardées pour une consultation hors ligne. */
const DATA_API = new RegExp(`^/api/(projects|programs)(/${UUID})?$`);
/** Page d'un projet ou d'un programme précis : gardée avec son adresse complète. */
function userPageKey(url) {
  if (url.pathname === "/ide" && new RegExp(`^${UUID}$`).test(url.searchParams.get("projet") ?? "")) return `/ide?projet=${url.searchParams.get("projet")}`;
  if (url.pathname === "/editeur" && new RegExp(`^${UUID}$`).test(url.searchParams.get("programme") ?? "")) return `/editeur?programme=${url.searchParams.get("programme")}`;
  return null;
}

/** Déconnexion (ou nouvelle connexion) : les copies des projets du compte sont effacées de l'appareil. */
async function clearUserData() {
  await caches.delete(DATA);
  const pages = await caches.open(PAGES);
  for (const req of await pages.keys()) if (new URL(req.url).search) await pages.delete(req);
}

const offlineJson = (msg) => new Response(JSON.stringify({ error: msg }), { status: 503, headers: { "Content-Type": "application/json; charset=utf-8" } });

/** Réseau d'abord ; sans connexion, dernière copie gardée (marquée « X-UPL-Hors-Ligne »). */
async function dataFirst(request, event) {
  const url = new URL(request.url);
  const key = url.pathname + url.search;
  try {
    const res = await fetch(request);
    if (res.ok) event.waitUntil(put(DATA, key, res.clone()));
    if (res.status === 401 || res.status === 403) event.waitUntil(clearUserData());
    return res;
  } catch {
    const hit = await caches.match(key, { cacheName: DATA });
    if (!hit) return offlineJson("Pas de connexion Internet : ce contenu n'a pas encore été gardé sur cet appareil.");
    const headers = new Headers(hit.headers);
    headers.set("X-UPL-Hors-Ligne", "1");
    return new Response(hit.body, { status: hit.status, statusText: hit.statusText, headers });
  }
}
// Éditeurs utilisables sans Internet (nom affiché sur la page « Pas de connexion Internet »).
const EDITORS = [
  { path: "/ide", name: "ZENTECH IDE", info: "Python, JavaScript, PHP, SQL, HTML…" },
  { path: "/editeur", name: "ZENTECH Algo", info: "Éditeur d'algorithmes (pseudo-code)" },
  { path: "/flow/classique", name: "Interface LARP", info: "Pseudo-code et organigrammes comme sur LARP" },
  { path: "/flow", name: "ZENTECH Flow Studio", info: "Organigrammes" },
  { path: "/laboratoire", name: "Laboratoire d'algorithmique", info: "Exécution pas à pas" },
];
const OFFLINE_PAGES = EDITORS.map((e) => e.path);
const CDN_PREFIXES = [
  "https://cdn.jsdelivr.net/npm/monaco-editor@",
  "https://cdn.jsdelivr.net/npm/pyodide@",
  // PHP 8.3 (php-wasm, PDO SQLite) et SQLite (sql.js) : moteurs WebAssembly, versions figées.
  "https://cdn.jsdelivr.net/npm/php-wasm@",
  "https://cdn.jsdelivr.net/npm/php-wasm-sqlite@",
  "https://cdn.jsdelivr.net/npm/sql.js@",
];

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

const esc = (t) => t.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

/** Page « Pas de connexion Internet » : propose les éditeurs déjà gardés sur l'appareil. */
async function offlineHtml() {
  const cache = await caches.open(PAGES);
  const rows = await Promise.all(EDITORS.map(async (e) => ({ ...e, ready: Boolean(await cache.match(e.path)) })));
  const ready = rows.filter((r) => r.ready);
  const missing = rows.filter((r) => !r.ready);
  const link = (r) =>
    `<a href="${r.path}" style="display:block;margin:8px 0;padding:12px 14px;border-radius:10px;background:#2563eb;color:#fff;text-decoration:none;text-align:left"><b>${esc(r.name)}</b><br><small style="color:#dbeafe">${esc(r.info)}</small></a>`;
  const later = missing.length
    ? `<p style="margin-top:18px;font-size:13px">Pas encore sur cet appareil : ${missing.map((r) => esc(r.name)).join(", ")}.<br>Ouvrez ZENTECH une fois avec Internet en étant connecté à votre compte : les éditeurs sont alors gardés automatiquement sur cet appareil (chaque adresse du site garde sa propre copie).</p>`
    : "";
  return `<!doctype html><html lang="fr"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Hors connexion</title>
<body style="margin:0;font-family:system-ui,sans-serif;background:#181818;color:#ccc;display:grid;place-items:center;min-height:100vh;text-align:center;padding:16px;box-sizing:border-box">
<div style="width:100%;max-width:380px"><p style="font-size:20px;color:#fff;margin-bottom:4px">Pas de connexion Internet</p>
<p>${ready.length ? "Cette page demande Internet. Ces éditeurs fonctionnent sans connexion :" : "Cette page demande Internet. Aucun éditeur n'est encore gardé sur cet appareil."}</p>
${ready.map(link).join("")}${later}</div></body></html>`;
}

async function page(request) {
  const url = new URL(request.url);
  const key = url.pathname; // une copie par page, sans les paramètres
  const offlineOk = OFFLINE_PAGES.includes(url.pathname);
  // Projet / programme précis : copie à son adresse complète (contenu du compte).
  const userKey = userPageKey(url);
  try {
    const res = await fetch(request);
    // Une page redirigée (vers la connexion) n'est jamais gardée à la place de la page demandée.
    if (offlineOk && res.ok && !res.redirected && !url.search) await put(PAGES, key, res.clone());
    if (userKey && res.ok && !res.redirected) await put(PAGES, userKey, res.clone());
    return res;
  } catch {
    const hit = (userKey ? await caches.match(userKey) : null) || (offlineOk ? await caches.match(key) : null);
    return hit || new Response(await offlineHtml(), { headers: { "Content-Type": "text/html; charset=utf-8" } });
  }
}

self.addEventListener("fetch", (e) => {
  const r = e.request;
  const url = new URL(r.url);
  // Déconnexion : les copies des projets du compte sont effacées de l'appareil.
  if (r.method === "POST" && url.origin === self.location.origin && url.pathname === "/auth/deconnexion") {
    e.waitUntil(clearUserData());
    return;
  }
  if (r.method !== "GET") return;
  // Nouvelle connexion (Google) : on repart sans les copies d'un éventuel autre compte.
  if (url.origin === self.location.origin && url.pathname === "/auth/callback") e.waitUntil(clearUserData());
  if (url.origin === self.location.origin && DATA_API.test(url.pathname)) return e.respondWith(dataFirst(r, e));
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
            const sameOrigin = url.origin === self.location.origin;
            const userKey = sameOrigin ? userPageKey(url) : null;
            // Liste / contenu des projets du compte : copie toujours rafraîchie.
            const isData = sameOrigin && DATA_API.test(url.pathname);
            const isPage = sameOrigin && (OFFLINE_PAGES.includes(url.pathname) || Boolean(userKey));
            const cacheName = isData ? DATA : CDN_PREFIXES.some((p) => url.href.startsWith(p)) ? CDN : isPage ? PAGES : STATIC;
            const key = isData ? url.pathname + url.search : userKey ?? (isPage ? url.pathname : withoutHash(url.href));
            if (!isPage && !isData && (await caches.match(key))) {
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
  if (data.type === "clear-user-data") e.waitUntil(clearUserData());
});
