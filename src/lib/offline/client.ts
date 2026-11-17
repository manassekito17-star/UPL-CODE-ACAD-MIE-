"use client";

/**
 * Utilisation sans Internet de ZENTECH IDE (côté navigateur) : enregistrement du
 * service worker et préparation (téléchargement) des fichiers nécessaires.
 */

export const OFFLINE_READY_KEY = "upl:hors-ligne:pret";

export function offlineSupported(): boolean {
  return typeof window !== "undefined" && "serviceWorker" in navigator && "caches" in window;
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!offlineSupported()) return null;
  try {
    return await navigator.serviceWorker.register("/sw.js", { scope: "/" });
  } catch {
    return null;
  }
}

/** Fichiers déjà chargés par la page (scripts, styles, polices, éditeur) à garder sur l'appareil. */
function loadedResources(): string[] {
  const urls = new Set<string>(["/ide", "/editeur", "/laboratoire", "/flow", "/flow/classique", "/workers/python-worker.mjs", "/workers/kplus-worker.mjs", "/workers/kplus-moteur.json", "/favicon.ico", "/ide.webmanifest", "/icons/ide-192.png", "/icons/ide-512.png", "/editeur.webmanifest", "/icons/editeur-v2-192.png", "/icons/editeur-v2-512.png"]);
  for (const e of performance.getEntriesByType("resource") as PerformanceResourceTiming[]) {
    const u = e.name;
    if (u.startsWith(`${location.origin}/_next/static/`) || u.startsWith("https://cdn.jsdelivr.net/npm/monaco-editor@") || u.startsWith("https://cdn.jsdelivr.net/npm/pyodide@")) urls.add(u);
  }
  return [...urls];
}

/**
 * Enregistre les adresses des workers créés pendant la préparation (moteurs d'exécution).
 * Les fichiers qu'un worker charge ne passent pas toujours par le service worker :
 * on lit leur liste dans l'adresse du worker pour les télécharger explicitement.
 */
function trackWorkers(): () => string[] {
  const Original = window.Worker;
  const seen: string[] = [];
  class Tracked extends Original {
    constructor(url: string | URL, options?: WorkerOptions) {
      seen.push(String(url));
      super(url, options);
    }
  }
  window.Worker = Tracked;
  return () => {
    window.Worker = Original;
    const files = new Set<string>();
    for (const raw of seen) {
      let u: URL;
      try {
        u = new URL(raw, location.href);
      } catch {
        continue;
      }
      if (u.origin !== location.origin) continue;
      files.add(u.pathname);
      for (const m of decodeURIComponent(u.hash).matchAll(/\/_next\/static\/[^"',\]\s]+/g)) files.add(m[0]);
    }
    return [...files];
  };
}

/**
 * Charge une page dans un cadre invisible pour que tous ses fichiers (y compris ceux
 * chargés à la demande, comme l'éditeur de code) passent par le service worker et soient gardés.
 */
function warmPage(path: string, timeoutMs = 25_000): Promise<void> {
  return new Promise((resolve) => {
    const frame = document.createElement("iframe");
    frame.src = path;
    frame.setAttribute("aria-hidden", "true");
    frame.tabIndex = -1;
    frame.style.cssText = "position:fixed;left:-10000px;top:0;width:1024px;height:768px;border:0;visibility:hidden";
    const started = Date.now();
    const done = () => {
      clearInterval(timer);
      frame.remove();
      resolve();
    };
    // Prêt quand l'éditeur de code de la page est affiché (puis un court délai pour ses modules).
    const timer = setInterval(() => {
      let ready = false;
      try {
        // Éditeur de code (Monaco), fenêtre de l'interface LARP ou bibliothèque de Flow Studio.
        ready = Boolean(frame.contentDocument?.querySelector('.monaco-editor, [data-testid="larp-fenetre"], [data-testid="bibliotheque"]'));
      } catch {
        /* cadre inaccessible */
      }
      if (ready) {
        clearInterval(timer);
        // Une exécution charge le moteur de la page (interpréteur, exécution pas à pas), qui est alors gardé lui aussi.
        try {
          const run = [...(frame.contentDocument?.querySelectorAll("button") ?? [])].find((el) => /^▶/.test(el.textContent?.trim() ?? ""));
          run?.click();
        } catch {
          /* bouton introuvable */
        }
        setTimeout(done, 4000);
      } else if (Date.now() - started > timeoutMs) done();
    }, 300);
    document.body.appendChild(frame);
  });
}

async function sendPrecache(urls: string[]): Promise<{ ok: number; total: number }> {
  const reg = await navigator.serviceWorker.ready;
  const worker = reg.active;
  if (!worker) throw new Error("Service hors ligne indisponible.");
  return new Promise((resolve) => {
    const channel = new MessageChannel();
    channel.port1.onmessage = (e) => resolve({ ok: e.data.ok, total: e.data.total });
    worker.postMessage({ type: "precache", urls }, [channel.port2]);
  });
}

export interface PrepareStep {
  label: string;
  done: boolean;
}

/**
 * Télécharge tout ce qu'il faut pour utiliser ZENTECH IDE sans Internet :
 * pages et fichiers de l'application, coloration et analyse de chaque langage
 * de l'éditeur, et (facultatif) Python.
 * `loadLanguages` crée un modèle par langage pour que l'éditeur charge ses modules ;
 * `warmPython` exécute un petit programme Python pour télécharger Python.
 */
export async function prepareOffline(opts: {
  loadLanguages: () => Promise<void>;
  warmPython?: () => Promise<void>;
  /** Autres moteurs à télécharger (PHP, SQLite…). */
  extraEngines?: Array<{ label: string; run: () => Promise<void> }>;
  onStep: (label: string) => void;
}): Promise<{ ok: number; total: number }> {
  if (!offlineSupported()) throw new Error("Ce navigateur ne permet pas l'utilisation hors ligne.");
  await registerServiceWorker();
  const stopTracking = trackWorkers();
  let workerFiles: string[] = [];
  try {
    opts.onStep("Langages de l'éditeur (coloration, suggestions, erreurs)…");
    await opts.loadLanguages();
    opts.onStep("ZENTECH Algo, interface LARP, Flow Studio et laboratoire…");
    for (const path of ["/editeur", "/flow/classique", "/flow", "/laboratoire"]) await warmPage(path);
    if (opts.warmPython) {
      opts.onStep("Python (environ 10 Mo)…");
      await opts.warmPython();
    }
    for (const engine of opts.extraEngines ?? []) {
      opts.onStep(engine.label);
      await engine.run();
    }
  } finally {
    workerFiles = stopTracking();
  }
  opts.onStep("Enregistrement sur cet appareil…");
  // Les fichiers chargés juste avant (page et moteurs d'exécution) sont gardés sur l'appareil.
  const r = await sendPrecache([...loadedResources(), ...workerFiles]);
  try {
    localStorage.setItem(OFFLINE_READY_KEY, JSON.stringify({ at: new Date().toISOString(), python: Boolean(opts.warmPython) }));
  } catch {
    /* facultatif */
  }
  return r;
}

export function offlineReadyInfo(): { at: string; python: boolean } | null {
  try {
    return JSON.parse(localStorage.getItem(OFFLINE_READY_KEY) ?? "null");
  } catch {
    return null;
  }
}

/** Réponse servie par la copie de l'appareil (pas de connexion Internet). */
export const isOfflineCopy = (res: Response) => res.headers.get("X-UPL-Hors-Ligne") === "1";

/**
 * Garde sur l'appareil des pages de projets / programmes du compte (ex. « /ide?projet=… »)
 * pour les rouvrir sans Internet. Sans effet hors ligne ou sans service worker.
 */
export function keepForOffline(urls: string[]) {
  if (!offlineSupported() || !navigator.onLine || !urls.length) return;
  void navigator.serviceWorker.ready.then((reg) => reg.active?.postMessage({ type: "precache", urls })).catch(() => undefined);
}

/** Version du service worker : une nouvelle version garde de nouveau les éditeurs (copie précédente effacée). */
export const AUTO_OFFLINE_VERSION = "v6";
const AUTO_KEY = `upl:hors-ligne:auto:${AUTO_OFFLINE_VERSION}`;
let autoRunning = false;

/**
 * Garde automatiquement les éditeurs sur l'appareil (une fois par version et par adresse du site) :
 * à la première visite avec Internet d'un étudiant connecté, chaque éditeur est chargé en arrière-plan
 * dans un cadre invisible pour que ses fichiers passent par le service worker. Ensuite les éditeurs
 * s'ouvrent sans Internet, sans que l'étudiant ait à « préparer » quoi que ce soit.
 */
export async function autoPrepareOffline(loggedIn: boolean) {
  if (!loggedIn || autoRunning || !offlineSupported() || !navigator.onLine || window !== window.top) return;
  // Économiseur de données activé : on n'utilise pas le forfait sans demande.
  if ((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData) return;
  let forced = false;
  try {
    if (localStorage.getItem(AUTO_KEY)) return;
    forced = localStorage.getItem("upl:test:auto-hors-ligne") === "1";
  } catch {
    return;
  }
  // Tests automatisés : seulement sur demande (sinon chaque test téléchargerait tous les éditeurs).
  if (navigator.webdriver && !forced) return;
  autoRunning = true;
  try {
    await navigator.serviceWorker.ready;
    const stopTracking = trackWorkers();
    let workerFiles: string[] = [];
    try {
      for (const path of ["/editeur", "/flow/classique", "/ide", "/flow", "/laboratoire"]) {
        if (!navigator.onLine) return;
        await warmPage(path);
      }
    } finally {
      workerFiles = stopTracking();
    }
    const r = await sendPrecache([...loadedResources(), ...workerFiles]);
    if (r.ok > 0) localStorage.setItem(AUTO_KEY, new Date().toISOString());
  } catch {
    /* nouvel essai à la prochaine visite */
  } finally {
    autoRunning = false;
  }
}
