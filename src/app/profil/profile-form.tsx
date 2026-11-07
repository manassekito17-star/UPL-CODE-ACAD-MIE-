"use client";

import { useActionState } from "react";
import { Button, Field, inputClass, Notice } from "@/components/ui";
import { updateProfile } from "./actions";

export interface ProfileData {
  full_name: string;
  student_number: string | null;
  faculty: string | null;
  level: string;
  learning_goal: string | null;
  weekly_goal_minutes: number;
}

export function ProfileForm({ profile }: { profile: ProfileData }) {
  const [state, action, pending] = useActionState(updateProfile, {});
  return (
    <form action={action} className="space-y-4">
      {state.error && <Notice tone="erreur">{state.error}</Notice>}
      {state.success && <Notice tone="succes">{state.success}</Notice>}
      <Field label="Nom complet" htmlFor="full_name"><input id="full_name" name="full_name" defaultValue={profile.full_name} required className={inputClass} /></Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Numéro matricule (facultatif)" htmlFor="student_number"><input id="student_number" name="student_number" defaultValue={profile.student_number ?? ""} className={inputClass} /></Field>
        <Field label="Faculté / filière (facultatif)" htmlFor="faculty"><input id="faculty" name="faculty" defaultValue={profile.faculty ?? ""} className={inputClass} /></Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Niveau ressenti" htmlFor="level">
          <select id="level" name="level" defaultValue={profile.level} className={inputClass}>
            <option value="debutant">Débutant</option>
            <option value="intermediaire">Intermédiaire</option>
            <option value="avance">Avancé</option>
          </select>
        </Field>
        <Field label="Objectif hebdomadaire (minutes)" htmlFor="weekly_goal_minutes"><input id="weekly_goal_minutes" name="weekly_goal_minutes" type="number" min={0} max={10080} defaultValue={profile.weekly_goal_minutes} className={inputClass} /></Field>
      </div>
      <Field label="Mon objectif personnel" htmlFor="learning_goal" hint="Exemple : réussir l'examen d'algorithmique de juin.">
        <textarea id="learning_goal" name="learning_goal" rows={3} maxLength={500} defaultValue={profile.learning_goal ?? ""} className={inputClass} />
      </Field>
      <Button type="submit" disabled={pending}>{pending ? "Enregistrement…" : "Enregistrer"}</Button>
    </form>
  );
}
