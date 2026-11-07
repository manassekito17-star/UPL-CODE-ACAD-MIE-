import { reviewSubmission } from "@/app/admin/actions";
import { Badge, Button, Card, inputClass } from "@/components/ui";
import { formatDateTime } from "@/components/ui/labels";
import { requireStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Corrections" };

export default async function CorrectionsPage({ searchParams }: PageProps<"/admin/corrections">) {
  await requireStaff("corrections");
  const sp = await searchParams;
  const onlyProjects = sp.filtre !== "tout";
  const supabase = await createClient();
  let q = supabase
    .from("submissions")
    .select("id, code, status, score, created_at, teacher_feedback, teacher_score, reviewed_at, attempt_number, profiles:user_id(full_name), exercises!inner(title, type, language_id)")
    .order("created_at", { ascending: false })
    .limit(40);
  if (onlyProjects) q = q.in("exercises.type", ["mini_projet", "probleme"]);
  const { data } = await q;
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold text-nuit-900">Corrections</h1>
        <a href={onlyProjects ? "?filtre=tout" : "?"} className="text-sm text-electrique-600 hover:underline">{onlyProjects ? "Voir toutes les soumissions" : "Problèmes et mini-projets uniquement"}</a>
      </div>
      {(data ?? []).map((s) => {
        const ex = s.exercises as unknown as { title: string; language_id: string };
        return (
          <Card key={s.id} className="p-4">
            <div className="flex flex-wrap items-center gap-2">
              <p className="mr-auto font-semibold text-nuit-900">{ex.title} — {(s.profiles as unknown as { full_name: string } | null)?.full_name ?? "Étudiant"}</p>
              <Badge tone={s.status === "reussi" ? "vert" : s.status === "partiel" ? "orange" : "rouge"}>Auto : {Number(s.score)} / 100</Badge>
              {s.reviewed_at && <Badge tone="bleu">Corrigé</Badge>}
              <span className="text-xs text-gris-500">{formatDateTime(s.created_at)} · tentative {s.attempt_number}</span>
            </div>
            <details className="mt-2">
              <summary className="cursor-pointer text-sm text-electrique-600">Voir le code ({ex.language_id})</summary>
              <pre className="mt-2 max-h-80 overflow-auto rounded-md bg-nuit-950 p-3 font-mono text-xs text-gray-100">{s.code}</pre>
            </details>
            <form action={reviewSubmission} className="mt-3 grid gap-2 sm:grid-cols-[1fr_7rem_auto]">
              <input type="hidden" name="id" value={s.id} />
              <textarea name="teacher_feedback" rows={2} defaultValue={s.teacher_feedback ?? ""} placeholder="Commentaire pour l'étudiant" className={inputClass} />
              <input name="teacher_score" type="number" min={0} max={100} defaultValue={s.teacher_score ?? ""} placeholder="Note /100" className={inputClass} />
              <Button size="sm">Enregistrer</Button>
            </form>
          </Card>
        );
      })}
      {!data?.length && <p className="text-sm text-gris-500">Aucune soumission.</p>}
    </div>
  );
}
