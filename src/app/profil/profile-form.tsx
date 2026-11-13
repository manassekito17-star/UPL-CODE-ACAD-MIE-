"use client";

import { useActionState, useState } from "react";
import { Button, Field, inputClass, Notice } from "@/components/ui";
import { PhotoField } from "@/components/auth/photo-field";
import { FILIERES, POSITIONS, SEXES } from "@/lib/quick-access";
import { addEmail, updateProfile } from "./actions";

export interface ProfileData {
  full_name: string;
  first_name: string | null;
  last_name: string | null;
  position: string | null;
  sex: string | null;
  student_number: string | null;
  faculty: string | null;
  level: string;
  learning_goal: string | null;
  weekly_goal_minutes: number;
}

export function ProfileForm({ profile, avatarUrl }: { profile: ProfileData; avatarUrl?: string | null }) {
  const [state, action, pending] = useActionState(updateProfile, {});
  const known = (FILIERES as readonly string[]).includes(profile.faculty ?? "");
  const [faculty, setFaculty] = useState(profile.faculty ?? "");
  return (
    <form action={action} className="space-y-4" data-testid="formulaire-profil">
      {state.error && <Notice tone="erreur">{state.error}</Notice>}
      {state.success && <Notice tone="succes">{state.success}</Notice>}
      <input type="hidden" name="full_name" value={profile.full_name} />
      <PhotoField initialUrl={avatarUrl} label="Photo de profil" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nom" htmlFor="last_name"><input id="last_name" name="last_name" defaultValue={profile.last_name ?? ""} maxLength={60} className={inputClass} /></Field>
        <Field label="Prénom" htmlFor="first_name"><input id="first_name" name="first_name" defaultValue={profile.first_name ?? ""} maxLength={60} className={inputClass} /></Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Poste" htmlFor="position">
          <select id="position" name="position" defaultValue={profile.position ?? ""} className={inputClass}>
            <option value="">Non précisé</option>
            {Object.entries(POSITIONS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </Field>
        <Field label="Sexe" htmlFor="sex">
          <select id="sex" name="sex" defaultValue={profile.sex ?? ""} className={inputClass}>
            <option value="">Non précisé</option>
            {Object.entries(SEXES).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Filière" htmlFor="faculty" hint={known || !faculty ? undefined : "Filière personnalisée"}>
          <input id="faculty" name="faculty" list="liste-filieres" value={faculty} onChange={(e) => setFaculty(e.target.value)} maxLength={120} className={inputClass} />
          <datalist id="liste-filieres">{FILIERES.map((f) => <option key={f} value={f} />)}</datalist>
        </Field>
        <Field label="Numéro matricule (facultatif)" htmlFor="student_number"><input id="student_number" name="student_number" defaultValue={profile.student_number ?? ""} className={inputClass} /></Field>
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

/** Accès rapide : ajouter une adresse e-mail (puis un mot de passe) pour sécuriser le compte. */
export function AddEmailForm() {
  const [state, action, pending] = useActionState(addEmail, {});
  return (
    <form action={action} className="mt-3 space-y-2">
      {state.error && <Notice tone="erreur">{state.error}</Notice>}
      {state.success ? (
        <Notice tone="succes">{state.success}</Notice>
      ) : (
        <>
          <label htmlFor="ajout-email" className="block text-xs text-gris-700">Ou ajoutez une adresse e-mail :</label>
          <input id="ajout-email" name="email" type="email" required autoComplete="email" className={inputClass} />
          <Button type="submit" size="sm" variant="secondaire" disabled={pending}>{pending ? "Envoi…" : "Ajouter cette adresse"}</Button>
        </>
      )}
    </form>
  );
}
