import { NextResponse } from "next/server";
import { jsonError, parseBody, sameOrigin } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/env";
import { LANGUAGES } from "@/lib/execution/languages";
import { ExecutionUnavailableError, executeOnServer } from "@/lib/execution/run";
import { isJudge0Configured } from "@/lib/server-env";
import { consumeServerRuns } from "@/lib/usage";
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
  // HTML et CSS ne sont jamais exécutés sur le serveur : ils s'affichent dans l'aperçu isolé du navigateur.
  if (lang.preview) return jsonError(400, "HTML et CSS s'affichent dans l'aperçu de l'éditeur ; ils ne sont pas exécutés sur le serveur.");
  // PHP et SQL ne sont jamais exécutés sur le serveur : moteur WebAssembly du navigateur.
  if (language === "php" || language === "sql") return jsonError(503, "Exécution dans le navigateur.", { fallback: "navigateur" });
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

  // Budget 0 : Python et JavaScript tournent dans le navigateur de l'étudiant (aucun coût serveur).
  if (settings.execution.browser_first && lang.browserFallback && language !== "pseudocode") {
    return jsonError(503, "Exécution dans le navigateur.", { fallback: "navigateur" });
  }
  // Service isolé externe : réservation dans les quotas avant l'appel.
  if (language !== "pseudocode" && isJudge0Configured()) {
    const quota = await consumeServerRuns(user, 1);
    if (!quota.ok) return lang.browserFallback ? jsonError(429, quota.reason!, { fallback: "navigateur" }) : jsonError(429, quota.reason!);
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
