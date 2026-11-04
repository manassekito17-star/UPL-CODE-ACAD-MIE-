import Link from "next/link";
import { notFound } from "next/navigation";
import { saveExercise } from "@/app/admin/actions";
import { ActionForm } from "@/components/admin/action-form";
import { Card, Field, inputClass } from "@/components/ui";
import { EXERCISE_TYPE_LABELS } from "@/content/types";
import { serializeTests } from "@/lib/admin/formats";
import { requireStaff } from "@/lib/auth";
import { LANGUAGE_IDS, LANGUAGES } from "@/lib/execution/languages";
import { createAdminClient, hasAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export default async function AdminExercise({ params }: PageProps<"/admin/exercices/[slug]">) {
  await requireStaff("contenus");
  const { slug } = await params;
  const supabase = await createClient();
  const isNew = slug === "nouveau";
  const { data: e } = isNew ? { data: null } : await supabase.from("exercises").select("*").eq("slug", slug).maybeSingle();
  if (!isNew && !e) notFound();
  const [{ data: courses }, { data: lessons }] = await Promise.all([
    supabase.from("courses").select("id, title").order("sort_order"),
    supabase.from("lessons").select("id, title, course_id").order("position"),
  ]);
  let tests = "### Test 1\n<<<\n\n>>>\n";
  let solution = { solution_code: "", correction: "" };
  if (e) {
    const { data: t } = await supabase.from("exercise_test_cases").select("*").eq("exercise_id", e.id).order("position");
    tests = serializeTests((t ?? []).map((x) => ({ input: x.input, expected: x.expected_output, hidden: x.is_hidden })));
    const client = hasAdminClient() ? createAdminClient() : supabase;
    const { data: s } = await client.from("exercise_solutions").select("solution_code, correction").eq("exercise_id", e.id).maybeSingle();
    if (s) solution = s;
  }
  const v = e ?? { language_id: "pseudocode", difficulty: "debutant", type: "ecrire_algorithme", points: 10, status: "brouillon", objectives: [], constraints: [], hints: [], starter_code: "", statement: "", is_evaluated: false };
  return (
    <div className="space-y-4">
      <p className="text-sm"><Link href="/admin/exercices" className="text-electrique-600 hover:underline">← Exercices</Link></p>
      <h1 className="text-2xl font-bold text-nuit-900">{isNew ? "Nouvel exercice" : e!.title}</h1>
      <Card className="p-5">
        <ActionForm action={saveExercise} submitLabel="Enregistrer l'exercice">
          <input type="hidden" name="id" value={e?.id ?? ""} />
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Titre" htmlFor="title"><input id="title" name="title" required defaultValue={e?.title} className={inputClass} /></Field>
            <Field label="Slug" htmlFor="slug"><input id="slug" name="slug" required defaultValue={e?.slug} pattern="[a-z0-9-]{2,80}" className={inputClass} /></Field>
            <Field label="Statut" htmlFor="status">
              <select id="status" name="status" defaultValue={v.status} className={inputClass}><option value="brouillon">Brouillon</option><option value="en_revision">En révision</option><option value="publie">Publié (validé)</option><option value="archive">Archivé</option></select>
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Parcours" htmlFor="course_id">
              <select id="course_id" name="course_id" defaultValue={e?.course_id ?? ""} className={inputClass}><option value="">—</option>{(courses ?? []).map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}</select>
            </Field>
            <Field label="Leçon associée" htmlFor="lesson_id">
              <select id="lesson_id" name="lesson_id" defaultValue={e?.lesson_id ?? ""} className={inputClass}><option value="">—</option>{(lessons ?? []).map((l) => <option key={l.id} value={l.id}>{l.title}</option>)}</select>
            </Field>
            <Field label="Langage" htmlFor="language_id">
              <select id="language_id" name="language_id" defaultValue={v.language_id} className={inputClass}>{LANGUAGE_IDS.map((l) => <option key={l} value={l}>{LANGUAGES[l].label}</option>)}</select>
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-4">
            <Field label="Difficulté" htmlFor="difficulty">
              <select id="difficulty" name="difficulty" defaultValue={v.difficulty} className={inputClass}><option value="debutant">Débutant</option><option value="intermediaire">Intermédiaire</option><option value="avance">Avancé</option></select>
            </Field>
            <Field label="Type" htmlFor="type">
              <select id="type" name="type" defaultValue={v.type} className={inputClass}>{Object.entries(EXERCISE_TYPE_LABELS).map(([k, label]) => <option key={k} value={k}>{label}</option>)}</select>
            </Field>
            <Field label="Points" htmlFor="points"><input id="points" name="points" type="number" min={0} defaultValue={v.points} className={inputClass} /></Field>
            <label className="flex items-center gap-2 pt-7 text-sm"><input type="checkbox" name="is_evaluated" defaultChecked={v.is_evaluated} /> Exercice évalué (l&apos;IA ne donne pas la solution)</label>
          </div>
          <Field label="Énoncé (Markdown)" htmlFor="statement"><textarea id="statement" name="statement" rows={8} required defaultValue={v.statement} className={`${inputClass} font-mono`} /></Field>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Objectifs (un par ligne)" htmlFor="objectives"><textarea id="objectives" name="objectives" rows={4} defaultValue={(v.objectives as string[]).join("\n")} className={inputClass} /></Field>
            <Field label="Contraintes (une par ligne)" htmlFor="constraints"><textarea id="constraints" name="constraints" rows={4} defaultValue={(v.constraints as string[]).join("\n")} className={inputClass} /></Field>
            <Field label="Indices progressifs (un par ligne)" htmlFor="hints"><textarea id="hints" name="hints" rows={4} defaultValue={(v.hints as string[]).join("\n")} className={inputClass} /></Field>
          </div>
          <Field label="Code de départ" htmlFor="starter_code"><textarea id="starter_code" name="starter_code" rows={8} defaultValue={v.starter_code} className={`${inputClass} font-mono`} /></Field>
          <Field label="Tests automatiques" htmlFor="tests" hint="### Test n (ajoutez [caché] pour un test caché), puis <<< entrée >>> sortie attendue.">
            <textarea id="tests" name="tests" rows={12} defaultValue={tests} className={`${inputClass} font-mono`} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Solution de référence (jamais montrée avant réussite)" htmlFor="solution_code"><textarea id="solution_code" name="solution_code" rows={10} defaultValue={solution.solution_code} className={`${inputClass} font-mono`} /></Field>
            <Field label="Correction pédagogique (Markdown)" htmlFor="correction"><textarea id="correction" name="correction" rows={10} defaultValue={solution.correction} className={inputClass} /></Field>
          </div>
        </ActionForm>
      </Card>
    </div>
  );
}
