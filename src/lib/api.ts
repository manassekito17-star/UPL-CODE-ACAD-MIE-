import "server-only";

import { NextResponse } from "next/server";
import type { z } from "zod";

export function jsonError(status: number, error: string, extra: Record<string, unknown> = {}) {
  return NextResponse.json({ error, ...extra }, { status });
}

/**
 * Erreur interne : détail écrit dans les journaux du serveur, message générique pour l'utilisateur
 * (pas de requête SQL, de nom de table ni de trace technique exposés).
 */
export function serverError(error: unknown, message = "Opération impossible pour le moment. Réessayez dans quelques instants.") {
  console.error("[api]", error);
  return jsonError(500, message);
}

/** Lit et valide le corps JSON d'une requête. */
export async function parseBody<T extends z.ZodType>(request: Request, schema: T): Promise<{ data: z.infer<T> } | { response: NextResponse }> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return { response: jsonError(400, "Corps de requête JSON invalide.") };
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return { response: jsonError(400, "Données invalides.", { details: parsed.error.issues.map((i) => `${i.path.join(".")} : ${i.message}`) }) };
  }
  return { data: parsed.data };
}

/** Refuse les requêtes provenant d'un autre site (protection CSRF pour les API à cookies). */
export function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true; // requêtes non navigateur (tests, outils) : pas de cookie tiers en jeu
  try {
    return new URL(origin).host === request.headers.get("host");
  } catch {
    return false;
  }
}
