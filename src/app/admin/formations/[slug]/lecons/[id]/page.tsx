import Link from "next/link";
import { notFound } from "next/navigation";
import { saveLesson } from "@/app/admin/actions";
import { ActionForm } from "@/components/admin/action-form";
import { Card, Field, inputClass } from "@/components/ui";
import { serializeQuiz } from "@/lib/admin/formats";
import { requireStaff } from "@/lib/auth";
import { createAdminClient, hasAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export default async function AdminLesson({ params, searchParams }: PageProps<"/admin/formations/[slug]/lecons/[id]">) {
  await requireStaff("contenus");
  const { slug, id } = await params;
  const sp = await searchParams;
  const supabase = await createClient();
  const { data: course } = await supabase.from("courses").select("id, slug, title").eq("slug", slug).maybeSingle();
  if (!course) notFound();
  const { data: modules } = await supabase.from("modules").select("id, title").eq("course_id", course.id).order("position");
  const isNew = id === "nouvelle";
  const { data: lesson } = isNew ? { data: null } : await supabase.from("lessons").select("*").eq("id", id).eq("course_id", course.id).maybeSingle();
  if (!isNew && !lesson) notFound();

  let quizText = "";
  if (lesson) {
    const { data: quiz } = await supabase.from("quizzes").select("id").eq("lesson_id", lesson.id).eq("is_final", false).eq("kind", "verification").maybeSingle();
    if (quiz) {
      const { data: qs } = await supabase.from("quiz_questions").select("id, prompt, choices").eq("quiz_id", quiz.id).order("position");
      const keys = hasAdminClient() ? (await createAdminClient().from("quiz_answer_keys").select("*").in("question_id", (qs ?? []).map((q) => q.id))).data ?? [] : [];
      quizText = serializeQuiz((qs ?? []).map((q) => {
        const k = keys.find((x) => x.question_id === q.id);
        return { prompt: q.prompt, choices: q.choices as string[], correct: (k?.correct as number[]) ?? [], explanation: k?.explanation ?? undefined };
      }));
    }
  }
  const l = lesson ?? { module_id: typeof sp.module === "string" ? sp.module : modules?.[0]?.id, level: "debutant", duration_minutes: 20, position: 1, status: "brouillon", objectives: [], prerequisites: [], summary: [], content: "", examples: [] };

  return (
    <div className="space-y-4">
      <p className="text-sm"><Link href={`/admin/formations/${course.slug}`} className="text-electrique-600 hover:underline">← {course.title}</Link></p>
      <h1 className="text-2xl font-bold text-nuit-900">{isNew ? "Nouvelle leçon" : lesson!.title}</h1>
      <Card className="p-5">
        <ActionForm action={saveLesson} submitLabel="Enregistrer la leçon">
          <input type="hidden" name="id" value={lesson?.id ?? ""} />
          <input type="hidden" name="course_id" value={course.id} />
          <input type="hidden" name="courseSlug" value={course.slug} />
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Titre" htmlFor="title"><input id="title" name="title" required defaultValue={lesson?.title} className={inputClass} /></Field>
            <Field label="Slug" htmlFor="slug"><input id="slug" name="slug" required defaultValue={lesson?.slug} pattern="[a-z0-9-]{2,80}" className={inputClass} /></Field>
            <Field label="Module" htmlFor="module_id">
              <select id="module_id" name="module_id" defaultValue={l.module_id} className={inputClass}>{(modules ?? []).map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}</select>
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-4">
            <Field label="Niveau" htmlFor="level">
              <select id="level" name="level" defaultValue={l.level} className={inputClass}><option value="debutant">Débutant</option><option value="intermediaire">Intermédiaire</option><option value="avance">Avancé</option></select>
            </Field>
            <Field label="Durée (min)" htmlFor="duration_minutes"><input id="duration_minutes" name="duration_minutes" type="number" min={1} defaultValue={l.duration_minutes} className={inputClass} /></Field>
            <Field label="Position" htmlFor="position"><input id="position" name="position" type="number" min={0} defaultValue={l.position} className={inputClass} /></Field>
            <Field label="Statut" htmlFor="status" hint="« publie » vaut validation pédagogique.">
              <select id="status" name="status" defaultValue={l.status} className={inputClass}><option value="brouillon">Brouillon</option><option value="en_revision">En révision</option><option value="publie">Publié (validé)</option><option value="archive">Archivé</option></select>
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Objectifs (un par ligne)" htmlFor="objectives"><textarea id="objectives" name="objectives" rows={4} defaultValue={(l.objectives as string[]).join("\n")} className={inputClass} /></Field>
            <Field label="Prérequis (un par ligne)" htmlFor="prerequisites"><textarea id="prerequisites" name="prerequisites" rows={4} defaultValue={(l.prerequisites as string[]).join("\n")} className={inputClass} /></Field>
            <Field label="Résumé (un point par ligne)" htmlFor="summary"><textarea id="summary" name="summary" rows={4} defaultValue={(l.summary as string[]).join("\n")} className={inputClass} /></Field>
          </div>
          <Field label="Contenu (Markdown)" htmlFor="content" hint="Titres ##, listes, tableaux, blocs de code ~~~python … ~~~">
            <textarea id="content" name="content" rows={18} defaultValue={l.content} className={`${inputClass} font-mono`} />
          </Field>
          <Field label="Exemples exécutables (JSON)" htmlFor="examples" hint='[{"title": "…", "language": "python", "code": "print(1)", "stdin": "", "explanation": "…"}]'>
            <textarea id="examples" name="examples" rows={8} defaultValue={JSON.stringify(l.examples, null, 2)} className={`${inputClass} font-mono`} />
          </Field>
          <Field
            label="Structure pédagogique du chapitre (JSON)"
            htmlFor="pedagogy"
            hint="Compétences, définitions, algorithmes commentés, erreurs fréquentes, exercices corrigés, TD. Vide : leçon simple. Le format est validé à l'enregistrement ; l'interrogation et l'évaluation sont des quiz distincts."
          >
            <textarea id="pedagogy" name="pedagogy" rows={14} defaultValue={lesson?.pedagogy ? JSON.stringify(lesson.pedagogy, null, 2) : ""} className={`${inputClass} font-mono`} />
          </Field>
          <Field label="Quiz de compréhension" htmlFor="quiz" hint="« ? question », « + bonne réponse », « - mauvaise réponse », « > explication ». Laisser vide : pas de quiz.">
            <textarea id="quiz" name="quiz" rows={8} defaultValue={quizText} className={`${inputClass} font-mono`} />
          </Field>
        </ActionForm>
      </Card>
    </div>
  );
}
