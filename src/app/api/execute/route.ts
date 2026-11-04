import { NextResponse } from "next/server";
import { jsonError, parseBody, sameOrigin } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/env";
import { LANGUAGES } from "@/lib/execution/languages";
import { ExecutionUnavailableError, executeOnServer } from "@/lib/execution/run";
import type { ExecutionRequest } from "@/lib/execution/types";
import { recordExecution } from "@/lib/progress";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { getSettings } from "@/lib/settings";
import { executeSchema } from "@/lib/validation";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return jsonError(403, "Origine non autorisée.");
  const body = await parseBody(request, executeSchema);
  if ("response" in body) return body.response;
  const { language, files, stdin, programId } = body.data;

  const settings = await getSettings();
  if (!settings.execution.enabled) return jsonError(503, "L'exécution de code est temporairement désactivée.");

  const user = await getCurrentUser();
  if (user?.status === "suspendu") return jsonError(403, "Compte suspendu.");

  const lang = LANGUAGES[language as ExecutionRequest["language"]];
  // Sans compte, seul le pseudocode est exécuté sur le serveur (il ne coûte rien) ;
  // Python et JavaScript s'exécutent alors dans le navigateur de l'utilisateur.
  if (!user && isSupabaseConfigured() && language !== "pseudocode") {
    if (lang.browserFallback) return jsonError(401, "Connexion requise pour l'exécution serveur.", { fallback: "navigateur" });
    return jsonError(401, `Connectez-vous pour compiler et exécuter du ${lang.shortLabel}.`);
  }

  const key = user ? `exec:u:${user.id}` : `exec:ip:${clientIp(request.headers)}`;
  const limit = rateLimit(key, settings.execution.max_runs_per_minute, 60_000);
  if (!limit.ok) {
    return jsonError(429, `Trop d'exécutions. Réessayez dans ${limit.retryAfterSeconds} s.`, { retryAfter: limit.retryAfterSeconds });
  }

  try {
    const result = await executeOnServer(
      { language: language as ExecutionRequest["language"], files, stdin },
      { cpuTimeLimitSeconds: settings.execution.cpu_time_limit_s, memoryLimitKb: settings.execution.memory_limit_kb },
    );
    if (user) {
      await recordExecution(user.id, {
        language,
        source: files.map((f) => f.content).join("\n\n"),
        stdin,
        stdout: result.stdout,
        stderr: result.stderr,
        compileOutput: result.compileOutput,
        status: result.status,
        timeMs: result.timeMs,
        memoryKb: result.memoryKb,
        programId,
      });
    }
    return NextResponse.json(result);
  } catch (e) {
    if (e instanceof ExecutionUnavailableError) {
      return e.browserFallback
        ? jsonError(503, "Exécution serveur non configurée.", { fallback: "navigateur" })
        : jsonError(503, `L'exécution du ${lang.shortLabel} nécessite le service d'exécution isolé (Judge0), qui n'est pas encore configuré sur cette installation.`);
    }
    console.error("[execute]", e);
    return jsonError(500, "Erreur inattendue pendant l'exécution.");
  }
}
