"use client";

/**
 * Utilisation sans Internet de UPL IDE (côté navigateur) : enregistrement du
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
  const urls = new Set<string>(["/ide", "/editeur", "/laboratoire", "/workers/python-worker.mjs", "/favicon.ico", "/ide.webmanifest", "/icons/ide-192.png", "/icons/ide-512.png"]);
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
 * Télécharge tout ce qu'il faut pour utiliser UPL IDE sans Internet :
 * pages et fichiers de l'application, coloration et analyse de chaque langage
 * de l'éditeur, et (facultatif) Python.
 * `loadLanguages` crée un modèle par langage pour que l'éditeur charge ses modules ;
 * `warmPython` exécute un petit programme Python pour télécharger Python.
 */
export async function prepareOffline(opts: {
  loadLanguages: () => Promise<void>;
  warmPython?: () => Promise<void>;
  onStep: (label: string) => void;
}): Promise<{ ok: number; total: number }> {
  if (!offlineSupported()) throw new Error("Ce navigateur ne permet pas l'utilisation hors ligne.");
  await registerServiceWorker();
  const stopTracking = trackWorkers();
  let workerFiles: string[] = [];
  try {
    opts.onStep("Langages de l'éditeur (coloration, suggestions, erreurs)…");
    await opts.loadLanguages();
    if (opts.warmPython) {
      opts.onStep("Python (environ 10 Mo)…");
      await opts.warmPython();
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
