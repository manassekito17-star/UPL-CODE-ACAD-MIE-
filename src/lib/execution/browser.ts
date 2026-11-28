"use client";

import { pythonHint } from "./python-hints";
import type { LanguageId } from "@/content/types";
import { runKPlus, runKPlusTest } from "@/lib/kplus";
import type { ExecutionResult, SourceFile } from "./types";

const TIMEOUT_MS: Record<string, number> = { pseudocode: 8000, javascript: 5000, python: 10000, php: 10000, sql: 8000 };
/** Chargement d'un moteur lourd (Python ≈ 12 Mo, PHP…) la première fois : au-delà, on arrête et on explique. */
export const LOAD_TIMEOUT_MS = 120_000;
const ENGINE_NAMES: Partial<Record<LanguageId, string>> = { python: "Python", php: "PHP", sql: "SQLite" };

/** Moteurs chargés une fois puis réutilisés (Pyodide, PHP, SQLite). */
const PERSISTENT: Partial<Record<LanguageId, Worker | null>> = {};
const isPersistent = (l: LanguageId) => l === "python" || l === "php" || l === "sql";

function createWorker(language: LanguageId): Worker {
  switch (language) {
    case "pseudocode":
      return new Worker(new URL("../../workers/pseudocode.worker.ts", import.meta.url), { type: "module" });
    case "javascript":
      return new Worker(new URL("../../workers/javascript.worker.ts", import.meta.url), { type: "module" });
    case "python":
      // Fichier statique (public/workers) : Pyodide exige un worker de type module.
      return (PERSISTENT.python ??= new Worker("/workers/python-worker.mjs", { type: "module" }));
    case "php":
      // Vrai PHP 8.3 compilé en WebAssembly (php-wasm), avec PDO SQLite.
      return (PERSISTENT.php ??= new Worker("/workers/php-worker.mjs", { type: "module" }));
    case "sql":
      // Vrai moteur SQLite compilé en WebAssembly (sql.js).
      return (PERSISTENT.sql ??= new Worker("/workers/sql-worker.js"));
    default:
      throw new Error("Langage non exécutable dans le navigateur");
  }
}

/** Précharge un moteur lourd (Python, PHP, SQLite) pour accélérer la première exécution. */
export function warmupEngine(language: LanguageId) {
  if (!isPersistent(language)) return;
  try {
    createWorker(language).postMessage({ files: [], stdin: "", warmup: true });
  } catch {
    /* ignoré */
  }
}

/** Précharge Python (Pyodide) pour accélérer la première exécution. */
export function warmupPython() {
  warmupEngine("python");
}

/** Nom affiché du moteur navigateur. */
const ENGINE_LABELS: Partial<Record<LanguageId, string>> = { php: "PHP 8.3 (WebAssembly)" };

/**
 * Exécute un programme dans un Web Worker isolé du reste de la page.
 * Le worker est détruit si le temps limite est dépassé.
 */
export function runInBrowser(
  language: LanguageId,
  files: SourceFile[],
  stdin: string,
  onStatus?: (message: string) => void,
  seed?: number,
): Promise<ExecutionResult> {
  // K+ : son moteur gère son propre worker ; ici, exécution « test »
  // (sortie, ou description de la page pour un programme web).
  if (language === "kplus") return runKPlusTest(files, stdin, onStatus);
  return new Promise((resolve) => {
    const worker = createWorker(language);
    const persistent = isPersistent(language);
    let timer: ReturnType<typeof setTimeout> | undefined;
    let loadTimer: ReturnType<typeof setTimeout> | undefined;
    let slowTimer: ReturnType<typeof setTimeout> | undefined;
    const engine = ENGINE_NAMES[language];

    const finish = (r: ExecutionResult) => {
      if (timer) clearTimeout(timer);
      clearTimeout(loadTimer);
      clearTimeout(slowTimer);
      worker.onmessage = null;
      worker.onerror = null;
      if (!persistent) worker.terminate();
      resolve(r);
    };
    /** Moteur perdu (chargement trop long, plantage) : on l'arrête et le prochain essai repart de zéro. */
    const fail = (stderr: string) => {
      worker.terminate();
      if (persistent) PERSISTENT[language] = null;
      finish({ status: "erreur_execution", stdout: "", stderr, compileOutput: "", timeMs: null, memoryKb: null, engine: "navigateur" });
    };
    // Chargement : jamais d'attente sans fin (connexion lente ou coupée pendant le téléchargement).
    if (engine) {
      slowTimer = setTimeout(() => onStatus?.(`Chargement de ${engine}… connexion lente : patientez (la première fois seulement, ensuite ${engine} reste sur l'appareil).`), 15_000);
      loadTimer = setTimeout(
        () => fail(`${engine} n'a pas pu se charger en ${LOAD_TIMEOUT_MS / 60_000} minutes : la connexion est trop lente ou a été coupée. Réessayez avec une meilleure connexion (Wi-Fi) : une fois chargé, ${engine} reste sur l'appareil et fonctionne même sans Internet.`),
        LOAD_TIMEOUT_MS,
      );
    }
    const arm = () => {
      timer = setTimeout(() => {
        worker.terminate();
        if (persistent) PERSISTENT[language] = null;
        finish({
          status: "temps_depasse",
          stdout: "",
          stderr: `Temps limite dépassé (${TIMEOUT_MS[language] / 1000} s) : le programme a été arrêté. Vérifiez qu'il n'y a pas de boucle infinie.`,
          compileOutput: "",
          timeMs: TIMEOUT_MS[language],
          memoryKb: null,
          engine: language === "pseudocode" ? "interpreteur" : "navigateur",
        });
      }, TIMEOUT_MS[language]);
    };

    worker.onmessage = (e: MessageEvent) => {
      const d = e.data;
      if (d?.type === "statut") {
        onStatus?.(d.message);
        return;
      }
      if (d?.type === "debut") {
        clearTimeout(loadTimer);
        clearTimeout(slowTimer);
        arm();
        return;
      }
      if (language === "pseudocode") {
        const err = d.error as { kind: string; message: string; line: number; hint?: string } | null;
        const msg = err ? `${err.kind === "syntaxe" ? "Erreur de syntaxe" : "Erreur"}${err.line ? ` (ligne ${err.line})` : ""} : ${err.message}` : "";
        finish({
          status: d.ok ? "ok" : /Limite d'exécution/.test(err?.message ?? "") ? "temps_depasse" : err?.kind === "syntaxe" ? "erreur_compilation" : "erreur_execution",
          stdout: d.stdout,
          stderr: err && err.kind !== "syntaxe" ? msg : "",
          compileOutput: err?.kind === "syntaxe" ? msg : "",
          timeMs: d.timeMs,
          memoryKb: null,
          engine: "interpreteur",
          errorLine: err?.line || undefined,
          hint: err?.hint,
        });
        return;
      }
      // PHP : une erreur d'analyse (Parse error) est l'équivalent d'une erreur de compilation.
      const parse = language === "php" && d.parse;
      finish({
        status: d.ok ? "ok" : parse ? "erreur_compilation" : "erreur_execution",
        stdout: parse ? "" : d.stdout ?? "",
        stderr: parse ? "" : d.stderr ?? "",
        compileOutput: parse ? `${d.stdout ?? ""}${d.stderr ?? ""}`.trim() : "",
        timeMs: d.timeMs ?? null,
        memoryKb: null,
        engine: "navigateur",
        engineLabel: d.engineLabel ?? ENGINE_LABELS[language],
        errorLine: d.errorLine,
        // Python : explication en français des erreurs courantes (sous le message d'origine).
        hint: d.hint ?? (language === "python" && !d.ok ? pythonHint(d.stderr || d.stdout || "") : undefined),
        tables: d.tables,
        schema: d.schema,
        log: d.log,
      });
    };
    worker.onerror = (e) => {
      e.preventDefault?.();
      // Moteur lourd planté (mémoire du téléphone insuffisante…) : il est relancé au prochain essai.
      if (engine) return fail(`Le moteur ${engine} s'est arrêté (mémoire de l'appareil insuffisante ?). Fermez d'autres applications puis réessayez.${e.message ? `\n(${e.message})` : ""}`);
      finish({ status: "erreur_interne", stdout: "", stderr: e.message || "Erreur du moteur d'exécution.", compileOutput: "", timeMs: null, memoryKb: null, engine: "navigateur" });
    };

    if (language === "sql") {
      // Base neuve à chaque exécution ; la zone « Entrée » peut contenir des données de départ.
      worker.postMessage({ files, setup: stdin });
    } else if (persistent) {
      // Le délai ne démarre qu'au signal « debut » : le chargement du moteur peut prendre quelques secondes.
      worker.postMessage({ files, stdin });
    } else {
      arm();
      worker.postMessage({ code: files[0]?.content ?? "", stdin, seed });
    }
  });
}

export interface RunOutcome {
  result: ExecutionResult | null;
  error?: string;
}

/**
 * Exécute un programme : sur le serveur (Judge0) quand c'est possible,
 * sinon dans le navigateur pour le pseudocode, Python et JavaScript.
 */
export async function runProgram(
  language: LanguageId,
  files: SourceFile[],
  stdin: string,
  opts: { programId?: string; onStatus?: (m: string) => void; seed?: number } = {},
): Promise<RunOutcome> {
  if (language === "pseudocode") {
    // L'interpréteur de la plateforme tourne directement dans le navigateur : réponse instantanée.
    return { result: await runInBrowser("pseudocode", files, stdin, undefined, opts.seed) };
  }
  if (language === "kplus") {
    // Le moteur K+ tourne dans le navigateur (même hors ligne) ; un programme
    // web renvoie aussi sa page, affichée et utilisable.
    return { result: await runKPlus(files, stdin, opts.onStatus) };
  }
  if (language === "php" || language === "sql") {
    // PHP et SQL ne sont jamais exécutés sur le serveur de la plateforme :
    // le code de l'étudiant tourne dans un Web Worker isolé de son navigateur.
    return { result: await runInBrowser(language, files, stdin, opts.onStatus) };
  }
  // Sans Internet : Python et JavaScript tournent sur l'appareil ; le C et le Java demandent le serveur.
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    if (language === "python" || language === "javascript") return { result: await runInBrowser(language, files, stdin, opts.onStatus) };
    return { result: null, error: "Hors connexion : le C et le Java s'exécutent sur le serveur de la plateforme. Reconnectez-vous à Internet pour les lancer (le pseudocode, Python, JavaScript et les pages web fonctionnent sans Internet)." };
  }
  try {
    const res = await fetch("/api/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ language, files, stdin, programId: opts.programId }),
    });
    const data = await res.json();
    if (res.ok) return { result: data as ExecutionResult };
    if (data.fallback === "navigateur") {
      return { result: await runInBrowser(language, files, stdin, opts.onStatus) };
    }
    return { result: null, error: data.error ?? "Exécution impossible." };
  } catch {
    if (language === "python" || language === "javascript") {
      return { result: await runInBrowser(language, files, stdin, opts.onStatus) };
    }
    return { result: null, error: "Connexion au serveur impossible. Le C et le Java demandent Internet ; le pseudocode, Python et JavaScript fonctionnent sans connexion." };
  }
}
