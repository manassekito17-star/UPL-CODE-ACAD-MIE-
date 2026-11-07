import "server-only";

import type { LanguageId } from "@/content/types";
import { serverEnv } from "../server-env";
import { EXECUTION_LIMITS } from "./languages";
import { bundlePythonFiles, withNodePrelude } from "./prelude";
import type { ExecutionRequest, ExecutionResult, ExecutionStatus } from "./types";

/**
 * Client Judge0 CE (https://judge0.com).
 *
 * Le code de l'étudiant n'est JAMAIS exécuté par le serveur web : il est
 * transmis à Judge0, qui l'exécute dans un bac à sable isolé (isolate),
 * sans réseau, avec des limites de temps CPU, de mémoire et de taille.
 */

const b64 = (s: string) => Buffer.from(s, "utf8").toString("base64");
const unb64 = (s: string | null | undefined) => (s ? Buffer.from(s, "base64").toString("utf8") : "");

function headers(): Record<string, string> {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  if (serverEnv.judge0AuthToken) h["X-Auth-Token"] = serverEnv.judge0AuthToken;
  if (serverEnv.judge0RapidApiKey) {
    h["X-RapidAPI-Key"] = serverEnv.judge0RapidApiKey;
    h["X-RapidAPI-Host"] = serverEnv.judge0RapidApiHost;
  }
  return h;
}

function sourceFor(req: ExecutionRequest): string {
  switch (req.language) {
    case "python":
      return bundlePythonFiles(req.files);
    case "javascript":
      return withNodePrelude(req.files[0]?.content ?? "");
    default:
      return req.files[0]?.content ?? "";
  }
}

// Statuts Judge0 : 3 Accepted, 5 Time Limit, 6 Compilation Error, 7-12 Runtime Error, 13 Internal, 14 Exec Format
function mapStatus(id: number): ExecutionStatus {
  if (id === 3) return "ok";
  if (id === 5) return "temps_depasse";
  if (id === 6) return "erreur_compilation";
  if (id >= 7 && id <= 12) return "erreur_execution";
  return "erreur_interne";
}

const truncate = (s: string) =>
  s.length > EXECUTION_LIMITS.maxOutputChars ? `${s.slice(0, EXECUTION_LIMITS.maxOutputChars)}\n… (sortie tronquée)` : s;

export async function runOnJudge0(
  req: ExecutionRequest,
  limits: { cpuTimeLimitSeconds?: number; memoryLimitKb?: number } = {},
): Promise<ExecutionResult> {
  const language = req.language as Exclude<LanguageId, "pseudocode" | "html" | "css">;
  const languageId = serverEnv.judge0LanguageIds[language];
  const body = {
    language_id: languageId,
    source_code: b64(sourceFor(req)),
    stdin: b64(req.stdin),
    cpu_time_limit: limits.cpuTimeLimitSeconds ?? EXECUTION_LIMITS.cpuTimeLimitSeconds,
    wall_time_limit: EXECUTION_LIMITS.wallTimeLimitSeconds,
    memory_limit: limits.memoryLimitKb ?? EXECUTION_LIMITS.memoryLimitKb,
    max_file_size: 1024, // Ko
    enable_network: false,
    redirect_stderr_to_stdout: false,
    ...(language === "java" ? { compiler_options: "-encoding UTF-8" } : {}),
    ...(language === "c" ? { compiler_options: "-std=c11 -O2 -lm" } : {}),
  };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30_000);
  try {
    const res = await fetch(`${serverEnv.judge0Url}/submissions?base64_encoded=true&wait=true&fields=stdout,stderr,compile_output,status,time,memory,message`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(body),
      signal: controller.signal,
      cache: "no-store",
    });
    if (!res.ok) {
      const text = await res.text();
      console.error("[judge0]", res.status, text.slice(0, 500));
      return internalError(`Le service d'exécution a répondu ${res.status}.`);
    }
    const data = (await res.json()) as {
      stdout: string | null;
      stderr: string | null;
      compile_output: string | null;
      message: string | null;
      status: { id: number; description: string };
      time: string | null;
      memory: number | null;
    };
    const stderr = unb64(data.stderr);
    const memoryKb = data.memory ?? null;
    let status = mapStatus(data.status.id);
    if (status === "erreur_execution" && memoryKb && memoryKb >= (limits.memoryLimitKb ?? EXECUTION_LIMITS.memoryLimitKb) * 0.95) {
      status = "memoire_depassee";
    }
    return {
      status,
      stdout: truncate(unb64(data.stdout)),
      stderr: truncate(stderr || (status !== "ok" && data.message ? unb64(data.message) : "")),
      compileOutput: truncate(unb64(data.compile_output)),
      timeMs: data.time ? Math.round(Number(data.time) * 1000) : null,
      memoryKb,
      engine: "serveur",
    };
  } catch (e) {
    const aborted = (e as Error).name === "AbortError";
    return internalError(aborted ? "Le service d'exécution ne répond pas." : "Service d'exécution injoignable.");
  } finally {
    clearTimeout(timer);
  }
}

function internalError(message: string): ExecutionResult {
  return {
    status: "erreur_interne",
    stdout: "",
    stderr: message,
    compileOutput: "",
    timeMs: null,
    memoryKb: null,
    engine: "serveur",
  };
}
