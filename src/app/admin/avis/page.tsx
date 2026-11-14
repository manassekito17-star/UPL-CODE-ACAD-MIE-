import { Card } from "@/components/ui";
import { formatDate } from "@/components/ui/labels";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Avis des utilisateurs" };

const Stars = ({ n, size = "text-base" }: { n: number; size?: string }) => (
  <span className={`${size} leading-none tracking-tight`} aria-label={`${n} sur 5`}>
    <span className="text-amber-400">{"★".repeat(n)}</span>
    <span className="text-gris-200">{"★".repeat(5 - n)}</span>
  </span>
);

/** Notes sur 5 étoiles et commentaires laissés depuis le message d'accueil (lecture réservée aux administrateurs). */
export default async function RatingsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireAdmin();
  const sp = await searchParams;
  const filtre = typeof sp.note === "string" && /^[1-5]$/.test(sp.note) ? Number(sp.note) : null;
  const supabase = await createClient();
  const { data, error } = await supabase.from("app_ratings").select("user_id, stars, comment, created_at, updated_at").order("updated_at", { ascending: false }).limit(1000);

  if (error)
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-nuit-900">Avis des utilisateurs</h1>
        <Card className="p-5 text-sm text-gris-700" data-testid="avis-inactifs">
          Les avis ne sont pas encore activés : exécutez <code className="rounded bg-gris-100 px-1">supabase/migrations/20261115000001_avis.sql</code> dans Supabase → SQL Editor (une seule fois), puis rechargez cette page.
        </Card>
      </div>
    );

  const rows = data ?? [];
  const ids = rows.map((r) => r.user_id);
  const { data: people } = ids.length
    ? await supabase.from("profiles").select("id, full_name, first_name, last_name, faculty, avatar_url").in("id", ids)
    : { data: [] as Array<{ id: string; full_name: string; first_name: string | null; last_name: string | null; faculty: string | null; avatar_url: string | null }> };
  const byId = new Map((people ?? []).map((p) => [p.id, p]));
  const total = rows.length;
  const average = total ? rows.reduce((s, r) => s + r.stars, 0) / total : 0;
  const counts = [5, 4, 3, 2, 1].map((n) => ({ n, c: rows.filter((r) => r.stars === n).length }));
  const withComment = rows.filter((r) => r.comment.trim()).length;
  const list = filtre ? rows.filter((r) => r.stars === filtre) : rows;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-nuit-900">Avis des utilisateurs</h1>
        <p className="text-sm text-gris-700">Notes sur 5 étoiles et commentaires laissés depuis le message d&apos;accueil de la plateforme (un avis par utilisateur, modifiable).</p>
      </div>
      <div className="grid gap-4 md:grid-cols-[260px_1fr]">
        <Card className="flex flex-col items-center justify-center p-5 text-center" data-testid="avis-moyenne">
          <p className="text-5xl font-extrabold text-nuit-900">{total ? average.toFixed(1).replace(".", ",") : "—"}</p>
          <Stars n={Math.round(average)} size="text-2xl" />
          <p className="mt-2 text-sm text-gris-700">
            {total} avis · {withComment} commentaire{withComment > 1 ? "s" : ""}
          </p>
        </Card>
        <Card className="space-y-2 p-5">
          {counts.map(({ n, c }) => (
            <a key={n} href={filtre === n ? "/admin/avis" : `/admin/avis?note=${n}`} className={`flex items-center gap-3 rounded-md px-1 text-sm hover:bg-gris-100 ${filtre === n ? "bg-electrique-100" : ""}`}>
              <span className="w-20 shrink-0">
                <Stars n={n} size="text-sm" />
              </span>
              <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-gris-100">
                <span className="block h-full rounded-full bg-amber-400" style={{ width: `${total ? (c / total) * 100 : 0}%` }} />
              </span>
              <span className="w-10 text-right font-medium text-nuit-900">{c}</span>
            </a>
          ))}
          {filtre && (
            <p className="pt-1 text-xs text-gris-500">
              Filtre : {filtre} étoile{filtre > 1 ? "s" : ""} — <a href="/admin/avis" className="text-electrique-600 underline">tout afficher</a>
            </p>
          )}
        </Card>
      </div>
      <Card className="divide-y divide-gris-200" data-testid="avis-liste">
        {!list.length && <p className="p-5 text-sm text-gris-500">Aucun avis pour le moment.</p>}
        {list.map((r) => {
          const p = byId.get(r.user_id);
          const name = p?.full_name || [p?.first_name, p?.last_name].filter(Boolean).join(" ") || "Utilisateur";
          return (
            <div key={r.user_id} className="flex gap-3 p-4">
              {p?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.avatar_url} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover" />
              ) : (
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-electrique-100 font-bold text-electrique-600">{name.slice(0, 1).toUpperCase()}</span>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <a href={`/admin/utilisateurs/${r.user_id}`} className="font-semibold text-nuit-900 hover:underline">
                    {name}
                  </a>
                  <Stars n={r.stars} />
                  <span className="text-xs text-gris-500">
                    {formatDate(r.updated_at)}
                    {r.updated_at !== r.created_at ? " (modifié)" : ""}
                  </span>
                </div>
                {p?.faculty && <p className="text-xs text-gris-500">{p.faculty}</p>}
                {r.comment.trim() ? <p className="mt-1 whitespace-pre-wrap text-sm text-gris-700">{r.comment}</p> : <p className="mt-1 text-sm italic text-gris-500">Sans commentaire</p>}
              </div>
            </div>
          );
        })}
      </Card>
    </div>
  );
}
