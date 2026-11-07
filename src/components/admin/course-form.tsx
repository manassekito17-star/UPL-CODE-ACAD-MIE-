import { saveCourse } from "@/app/admin/actions";
import { LANGUAGE_IDS, LANGUAGES } from "@/lib/execution/languages";
import { Field, inputClass } from "../ui";
import { ActionForm } from "./action-form";

export interface CourseRow {
  id?: string;
  slug?: string;
  code?: string | null;
  title?: string;
  tagline?: string | null;
  description?: string | null;
  language_id?: string;
  level?: string;
  duration_hours?: number | string;
  objectives?: string[];
  prerequisites?: string[];
  sort_order?: number;
}

export function CourseForm({ course = {} }: { course?: CourseRow }) {
  return (
    <ActionForm action={saveCourse} submitLabel={course.id ? "Enregistrer la formation" : "Créer la formation"}>
      <input type="hidden" name="id" value={course.id ?? ""} />
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Titre" htmlFor="title"><input id="title" name="title" required defaultValue={course.title} className={inputClass} /></Field>
        <Field label="Slug (adresse)" htmlFor="slug" hint="ex. langage-c"><input id="slug" name="slug" required defaultValue={course.slug} pattern="[a-z0-9-]{2,80}" className={inputClass} /></Field>
        <Field label="Code" htmlFor="code" hint="ex. Parcours B"><input id="code" name="code" defaultValue={course.code ?? ""} className={inputClass} /></Field>
      </div>
      <Field label="Accroche" htmlFor="tagline"><input id="tagline" name="tagline" defaultValue={course.tagline ?? ""} className={inputClass} /></Field>
      <Field label="Description" htmlFor="description"><textarea id="description" name="description" rows={4} defaultValue={course.description ?? ""} className={inputClass} /></Field>
      <div className="grid gap-4 sm:grid-cols-4">
        <Field label="Langage" htmlFor="language_id">
          <select id="language_id" name="language_id" defaultValue={course.language_id ?? "pseudocode"} className={inputClass}>
            {LANGUAGE_IDS.map((l) => <option key={l} value={l}>{LANGUAGES[l].label}</option>)}
          </select>
        </Field>
        <Field label="Niveau" htmlFor="level">
          <select id="level" name="level" defaultValue={course.level ?? "debutant"} className={inputClass}>
            <option value="debutant">Débutant</option><option value="intermediaire">Intermédiaire</option><option value="avance">Avancé</option>
          </select>
        </Field>
        <Field label="Durée (heures)" htmlFor="duration_hours"><input id="duration_hours" name="duration_hours" type="number" step="0.5" min="0" defaultValue={course.duration_hours ?? 10} className={inputClass} /></Field>
        <Field label="Ordre d'affichage" htmlFor="sort_order"><input id="sort_order" name="sort_order" type="number" min="0" defaultValue={course.sort_order ?? 0} className={inputClass} /></Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Objectifs (un par ligne)" htmlFor="objectives"><textarea id="objectives" name="objectives" rows={4} defaultValue={(course.objectives ?? []).join("\n")} className={inputClass} /></Field>
        <Field label="Prérequis (un par ligne)" htmlFor="prerequisites"><textarea id="prerequisites" name="prerequisites" rows={4} defaultValue={(course.prerequisites ?? []).join("\n")} className={inputClass} /></Field>
      </div>
    </ActionForm>
  );
}
