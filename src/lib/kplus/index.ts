"use client";

/**
 * Langage K+ (programmation en français) dans UPL IDE.
 *
 * Le vrai moteur K+ tourne dans le navigateur, dans un Web Worker isolé
 * (public/workers/kplus-worker.mjs, Pyodide). Il sert à la fois à exécuter les
 * programmes et à vérifier leur syntaxe pendant la saisie.
 */

import type { ExecutionResult, SourceFile } from "@/lib/execution/types";

/** Délai d'exécution, compté après le chargement du moteur (comme pour Python). */
export const KPLUS_TIMEOUT_MS = 10_000;

/** Erreur K+ telle que renvoyée par le moteur (pont.py). */
export interface KPlusError {
  categorie: string;
  nom: string;
  message: string;
  ligne: number | null;
  colonne: number | null;
  conseil: string | null;
  texte: string;
}

let worker: Worker | null = null;
let nextId = 1;
const pendingChecks = new Map<number, (r: { ok: boolean; erreur?: KPlusError } | null) => void>();

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker("/workers/kplus-worker.mjs", { type: "module" });
    worker.addEventListener("message", (e: MessageEvent) => {
      const d = e.data;
      if (d?.type !== "verification") return;
      pendingChecks.get(d.id)?.(d.resultat);
      pendingChecks.delete(d.id);
    });
  }
  return worker;
}

/** Arrête le moteur (boucle infinie…) ; il sera rechargé à la prochaine utilisation. */
function resetWorker() {
  worker?.terminate();
  worker = null;
  for (const resolve of pendingChecks.values()) resolve(null);
  pendingChecks.clear();
}

/** Les erreurs lexicales et de syntaxe empêchent le programme de démarrer. */
export function isCompileError(e: KPlusError): boolean {
  return e.categorie === "ErreurLexicale" || e.categorie === "ErreurSyntaxe";
}

/** Convertit le résultat du moteur K+ au format d'exécution de la plateforme. */
export function toExecutionResult(d: { ok: boolean; stdout?: string; stderr?: string; erreur?: KPlusError | null; timeMs?: number }): ExecutionResult {
  const e = d.erreur ?? null;
  const compile = e !== null && isCompileError(e);
  return {
    status: d.ok ? "ok" : e === null ? "erreur_interne" : compile ? "erreur_compilation" : "erreur_execution",
    stdout: d.stdout ?? "",
    stderr: e && !compile ? e.texte : (d.stderr ?? ""),
    compileOutput: e && compile ? e.texte : "",
    timeMs: d.timeMs ?? null,
    memoryKb: null,
    engine: "navigateur",
    errorLine: e?.ligne ?? undefined,
  };
}

/** Exécute un programme K+ (le premier fichier) avec les entrées données à demander(). */
export function runKPlus(files: SourceFile[], stdin: string, onStatus?: (message: string) => void): Promise<ExecutionResult> {
  return new Promise((resolve) => {
    const w = getWorker();
    let timer: ReturnType<typeof setTimeout> | undefined;
    const onMessage = (e: MessageEvent) => {
      const d = e.data;
      if (d?.type === "statut") return void onStatus?.(d.message);
      if (d?.type === "debut") {
        timer = setTimeout(() => {
          w.removeEventListener("message", onMessage);
          resetWorker();
          resolve({
            status: "temps_depasse",
            stdout: "",
            stderr: `Temps limite dépassé (${KPLUS_TIMEOUT_MS / 1000} s) : le programme a été arrêté. Vérifiez qu'il n'y a pas de boucle infinie.`,
            compileOutput: "",
            timeMs: KPLUS_TIMEOUT_MS,
            memoryKb: null,
            engine: "navigateur",
          });
        }, KPLUS_TIMEOUT_MS);
        return;
      }
      if (d?.type !== "resultat") return;
      if (timer) clearTimeout(timer);
      w.removeEventListener("message", onMessage);
      resolve(toExecutionResult(d));
    };
    w.addEventListener("message", onMessage);
    w.postMessage({ type: "executer", source: files[0]?.content ?? "", stdin });
  });
}

/** Vérifie la syntaxe sans exécuter. Renvoie l'erreur, null si tout va bien,
 *  ou undefined si le moteur n'a pas pu répondre (hors ligne, arrêté). */
export function checkKPlus(source: string): Promise<KPlusError | null | undefined> {
  return new Promise((resolve) => {
    const id = nextId++;
    pendingChecks.set(id, (r) => resolve(r === null ? undefined : r.ok ? null : (r.erreur ?? null)));
    getWorker().postMessage({ type: "verifier", id, source });
  });
}

/** Précharge K+ (préparation hors ligne). */
export async function warmupKPlus(): Promise<void> {
  const r = await runKPlus([{ name: "main.kplus", content: 'afficher("ok")\n' }], "");
  if (r.status !== "ok" || r.stdout !== "ok\n") throw new Error(r.stderr || "K+ n'a pas pu être téléchargé.");
}
