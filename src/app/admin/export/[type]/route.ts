import { getAdminStats, toCsv } from "@/lib/admin/stats";
import { audit } from "@/lib/audit";
import { getCurrentUser, mfaStatus } from "@/lib/auth";
import { clientIp } from "@/lib/rate-limit";
import { loginMethods } from "@/lib/admin/stats";
import { createAdminClient, hasAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

/**
 * Exports CSV pour l'administrateur. Jamais de mot de passe ni de jeton :
 * seules les informations de compte (nom, e-mail, dates, statut, méthodes de connexion).
 */
export async function GET(request: Request, ctx: RouteContext<"/admin/export/[type]">) {
  const { type } = await ctx.params;
  const user = await getCurrentUser();
  if (!user?.isAdmin || user.status !== "actif") return new Response("Accès réservé à l'administration.", { status: 403 });
  const mfa = await mfaStatus();
  if (mfa.enrolled && !mfa.verified) return new Response("Code de vérification (MFA) requis.", { status: 403 });
  const date = new Date().toISOString().slice(0, 10);
  let csv: string;
  if (type === "statistiques") {
    const { series } = await getAdminStats(90);
    csv = toCsv(series as unknown as Array<Record<string, unknown>>, [["day", "Jour (UTC)"], ["signups", "Inscriptions"], ["active", "Utilisateurs actifs"]]);
  } else if (type === "utilisateurs") {
    if (!hasAdminClient()) return new Response("Service indisponible.", { status: 503 });
    const supabase = await createClient();
    const { data: profiles } = await supabase.from("profiles").select("id, full_name, status, plan, created_at, last_seen_at").order("created_at", { ascending: false }).limit(5000);
    const { data: list } = await createAdminClient().auth.admin.listUsers({ perPage: 1000 });
    const byId = new Map((list?.users ?? []).map((u) => [u.id, u]));
    const rows = (profiles ?? []).map((p) => {
      const u = byId.get(p.id);
      return {
        name: p.full_name,
        email: u?.email ?? "",
        providers: (u ? loginMethods(u) : []).join(" + "),
        created: p.created_at,
        lastSeen: p.last_seen_at ?? "",
        status: p.status,
        plan: p.plan,
      };
    });
    csv = toCsv(rows, [["name", "Nom"], ["email", "E-mail"], ["providers", "Connexion"], ["created", "Inscription"], ["lastSeen", "Dernière visite"], ["status", "Statut"], ["plan", "Offre"]]);
  } else {
    return new Response("Export inconnu.", { status: 404 });
  }
  await audit(user.id, "export.csv", { type: "export", id: type }, {}, clientIp(request.headers));
  return new Response(csv, {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="upl-${type}-${date}.csv"`, "Cache-Control": "private, no-store" },
  });
}
