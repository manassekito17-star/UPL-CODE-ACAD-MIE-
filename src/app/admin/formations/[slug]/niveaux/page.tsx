import Link from "next/link";
import { notFound } from "next/navigation";
import { savePlacement, saveLevel } from "@/app/admin/actions";
import { ActionForm } from "@/components/admin/action-form";
import { Card, Field, inputClass, Notice } from "@/components/ui";
import { LEVEL_NAMES, type LevelNumber } from "@/content/types";
import { quizAsText } from "@/lib/admin/quizzes";
import { canTeach, requireStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const NUMBERS: LevelNumber[] = [1, 2, 3, 4];

export default async function AdminLevels({ params }: PageProps<"/admin/formations/[slug]/niveaux">) {
  const user = await requireStaff("contenus");
  const { slug } = await params;
  const supabase = await createClient();
  const { data: course } = await supabase.from("courses").select("id, slug, title").eq("slug", slug).maybeSingle();
  if (!course) notFound();
  const [{ data: levels }, { data: modules }, { data: quizzes }] = await Promise.all([
    supabase.from("course_levels").select("*").eq("course_id", course.id).order("number"),
    supabase.from("modules").select("id, title, level_number, lessons(id, status)").eq("course_id", course.id).order("position"),
    supabase.from("quizzes").select("id, kind, level_number").eq("course_id", course.id).in("kind", ["examen_niveau", "positionnement"]),
  ]);
  const examText = new Map<number, string>();
  for (const q of quizzes ?? []) if (q.kind === "examen_niveau" && q.level_number) examText.set(q.level_number, await quizAsText(supabase, q.id));
  const placementText = await quizAsText(supabase, (quizzes ?? []).find((q) => q.kind === "positionnement")?.id);

  // Statistiques (permission « suivi » : lecture des progressions de tous les étudiants)
  const canFollow = canTeach(user, "suivi");
  const stats = new Map<number, { valide: number; dispense: number }>();
  const placement = new Map<number, number>();
  const examStats = new Map<number, { attempts: number; passed: number; students: Set<string> }>();
  if (canFollow) {
    const examIds = (quizzes ?? []).filter((q) => q.kind === "examen_niveau");
    const [{ data: lp }, { data: pr }, { data: attempts }] = await Promise.all([
      supabase.from("level_progress").select("level_number, status").eq("course_id", course.id),
      supabase.from("placement_results").select("user_id, recommended_level, created_at").eq("course_id", course.id).order("created_at", { ascending: false }),
      examIds.length ? supabase.from("quiz_attempts").select("quiz_id, user_id, passed").in("quiz_id", examIds.map((q) => q.id)) : Promise.resolve({ data: [] as Array<{ quiz_id: string; user_id: string; passed: boolean }> }),
    ]);
    for (const r of lp ?? []) {
      const s = stats.get(r.level_number) ?? { valide: 0, dispense: 0 };
      if (r.status === "valide") s.valide++;
      if (r.status === "dispense") s.dispense++;
      stats.set(r.level_number, s);
    }
    const seen = new Set<string>();
    for (const r of pr ?? []) {
      if (seen.has(r.user_id)) continue; // dernier résultat de chaque étudiant
      seen.add(r.user_id);
      placement.set(r.recommended_level, (placement.get(r.recommended_level) ?? 0) + 1);
    }
    for (const a of attempts ?? []) {
      const n = examIds.find((q) => q.id === a.quiz_id)?.level_number;
      if (!n) continue;
      const s = examStats.get(n) ?? { attempts: 0, passed: 0, students: new Set<string>() };
      s.attempts++;
      if (a.passed) s.passed++;
      s.students.add(a.user_id);
      examStats.set(n, s);
    }
  }

  return (
    <div className="space-y-6">
      <p className="text-sm"><Link href={`/admin/formations/${course.slug}`} className="text-electrique-600 hover:underline">← {course.title}</Link></p>
      <h1 className="text-2xl font-bold text-nuit-900">Niveaux, critères et examens — {course.title}</h1>
      <Notice tone="info">
        Un niveau est validé quand l&apos;étudiant a validé le pourcentage de chapitres demandé <strong>et</strong> réussi l&apos;examen de fin de niveau. Sans examen, le niveau ne peut pas être validé. Les modules sont rattachés à un niveau depuis la page du parcours.
      </Notice>

      <Card className="overflow-x-auto p-5">
        <h2 className="mb-3 font-bold text-nuit-900">Statistiques par niveau</h2>
        {!canFollow ? (
          <p className="text-sm text-gris-500">Permission « suivi » nécessaire pour consulter les résultats des étudiants.</p>
        ) : (
          <table className="w-full min-w-[36rem] text-left text-sm" data-testid="stats-niveaux">
            <thead className="text-xs uppercase text-gris-500">
              <tr><th className="py-1">Niveau</th><th>Chapitres publiés</th><th>Validé</th><th>Dispensé</th><th>Positionnés ici</th><th>Examen : tentatives / réussites / étudiants</th></tr>
            </thead>
            <tbody>
              {NUMBERS.map((n) => {
                const lessons = (modules ?? []).filter((m) => m.level_number === n).flatMap((m) => (m.lessons as Array<{ status: string }>) ?? []).filter((l) => l.status === "publie").length;
                const e = examStats.get(n);
                return (
                  <tr key={n} className="border-t border-gris-100">
                    <td className="py-2">{n} — {LEVEL_NAMES[n]}</td>
                    <td>{lessons}</td>
                    <td>{stats.get(n)?.valide ?? 0}</td>
                    <td>{stats.get(n)?.dispense ?? 0}</td>
                    <td>{placement.get(n) ?? 0}</td>
                    <td>{e ? `${e.attempts} / ${e.passed} / ${e.students.size}` : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>

      {NUMBERS.map((n) => {
        const lv = (levels ?? []).find((l) => l.number === n);
        const mods = (modules ?? []).filter((m) => m.level_number === n);
        return (
          <Card key={n} className="p-5" data-testid={`admin-niveau-${n}`}>
            <h2 className="mb-1 font-bold text-nuit-900">Niveau {n} — {LEVEL_NAMES[n]}</h2>
            <p className="mb-3 text-xs text-gris-500">Modules : {mods.length ? mods.map((m) => m.title).join(", ") : "aucun"}</p>
            <ActionForm action={saveLevel} submitLabel={`Enregistrer le niveau ${n}`}>
              <input type="hidden" name="course_id" value={course.id} />
              <input type="hidden" name="courseSlug" value={course.slug} />
              <input type="hidden" name="number" value={n} />
              <Field label="Titre" htmlFor={`title-${n}`}><input id={`title-${n}`} name="title" required defaultValue={lv?.title ?? `Niveau ${n} — ${LEVEL_NAMES[n]}`} className={inputClass} /></Field>
              <Field label="Description" htmlFor={`description-${n}`}><textarea id={`description-${n}`} name="description" rows={2} defaultValue={lv?.description ?? ""} className={inputClass} /></Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Objectifs (un par ligne)" htmlFor={`objectives-${n}`}><textarea id={`objectives-${n}`} name="objectives" rows={4} defaultValue={(lv?.objectives ?? []).join("\n")} className={inputClass} /></Field>
                <Field label="Chapitres au programme, pas encore publiés (un par ligne)" htmlFor={`planned-${n}`}><textarea id={`planned-${n}`} name="planned_chapters" rows={4} defaultValue={(lv?.planned_chapters ?? []).join("\n")} className={inputClass} /></Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Chapitres à valider (%)" htmlFor={`pct-${n}`}><input id={`pct-${n}`} name="chapters_validated_pct" type="number" min={0} max={100} defaultValue={lv?.chapters_validated_pct ?? 100} className={inputClass} /></Field>
                <Field label="Note minimale à l'examen (%)" htmlFor={`pass-${n}`}><input id={`pass-${n}`} name="exam_pass_score" type="number" min={1} max={100} defaultValue={lv?.exam_pass_score ?? 70} className={inputClass} /></Field>
              </div>
              <Field label="Examen de fin de niveau" htmlFor={`exam-${n}`} hint="« ? question », « + bonne réponse », « - mauvaise réponse », « > explication ». Vide : pas d'examen.">
                <textarea id={`exam-${n}`} name="exam" rows={8} defaultValue={examText.get(n) ?? ""} className={`${inputClass} font-mono`} />
              </Field>
            </ActionForm>
          </Card>
        );
      })}

      <Card className="p-5">
        <h2 className="mb-1 font-bold text-nuit-900">Test de positionnement</h2>
        <p className="mb-3 text-sm text-gris-700">Chaque question indique le niveau qu&apos;elle évalue avec une ligne « @ niveau 1 » à « @ niveau 4 ». Un niveau est acquis à partir de 70 % de bonnes réponses ; les niveaux acquis sont dispensés.</p>
        <ActionForm action={savePlacement} submitLabel="Enregistrer le test de positionnement">
          <input type="hidden" name="course_id" value={course.id} />
          <input type="hidden" name="courseSlug" value={course.slug} />
          <textarea name="placement" aria-label="Questions du test de positionnement" rows={14} defaultValue={placementText} className={`${inputClass} font-mono`} />
        </ActionForm>
      </Card>
    </div>
  );
}
