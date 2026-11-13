"use client";

import { useActionState, useState } from "react";
import { quickAccess, type AuthState } from "@/app/(auth)/actions";
import { FILIERES, POSITIONS, QUICK_ACCESS_IDLE_DAYS, SEXES } from "@/lib/quick-access";
import { Button, Field, inputClass, Notice } from "../ui";
import { PhotoField } from "./photo-field";

/** Option B : accès rapide avec un profil (sans mot de passe). */
export function QuickAccessForm({ suite = "" }: { suite?: string }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(quickAccess, {});
  const [faculty, setFaculty] = useState("");
  return (
    <form action={action} className="space-y-4" data-testid="acces-rapide">
      {state.error && <Notice tone="erreur">{state.error}</Notice>}
      <input type="hidden" name="suite" value={suite} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nom" htmlFor="qa-nom">
          <input id="qa-nom" name="last_name" required minLength={2} maxLength={60} autoComplete="family-name" className={inputClass} />
        </Field>
        <Field label="Prénom" htmlFor="qa-prenom">
          <input id="qa-prenom" name="first_name" required minLength={2} maxLength={60} autoComplete="given-name" className={inputClass} />
        </Field>
      </div>
      <PhotoField />
      <fieldset>
        <legend className="mb-1 text-sm font-medium text-nuit-900">Poste</legend>
        <div className="flex flex-wrap gap-2">
          {Object.entries(POSITIONS).map(([v, label]) => (
            <label key={v} className="flex cursor-pointer items-center gap-2 rounded-lg border border-gris-200 px-3 py-2 text-sm has-[:checked]:border-electrique-500 has-[:checked]:bg-electrique-100">
              <input type="radio" name="position" value={v} required defaultChecked={v === "etudiant"} /> {label}
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="mb-1 text-sm font-medium text-nuit-900">Sexe</legend>
        <div className="flex flex-wrap gap-2">
          {Object.entries(SEXES).map(([v, label]) => (
            <label key={v} className="flex cursor-pointer items-center gap-2 rounded-lg border border-gris-200 px-3 py-2 text-sm has-[:checked]:border-electrique-500 has-[:checked]:bg-electrique-100">
              <input type="radio" name="sex" value={v} required /> {label}
            </label>
          ))}
        </div>
      </fieldset>
      <Field label="Filière" htmlFor="qa-filiere">
        <select id="qa-filiere" name="faculty" required value={faculty} onChange={(e) => setFaculty(e.target.value)} className={inputClass}>
          <option value="" disabled>Choisissez votre filière…</option>
          {FILIERES.map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
          <option value="autre">Autre (à préciser)</option>
        </select>
      </Field>
      {faculty === "autre" && (
        <Field label="Votre filière" htmlFor="qa-filiere-autre">
          <input id="qa-filiere-autre" name="faculty_other" required minLength={2} maxLength={120} className={inputClass} />
        </Field>
      )}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Création de votre espace…" : "ACCÉDER À LA PLATEFORME"}
      </Button>
      <p className="text-xs text-gris-500">
        Sans mot de passe : votre espace reste ouvert sur cet appareil (session sécurisée, fermée après {QUICK_ACCESS_IDLE_DAYS} jours sans visite). Ce profil n&apos;est pas vérifié :
        n&apos;y mettez pas de données sensibles. Pour le retrouver sur un autre appareil, liez-le ensuite à Google depuis « Mon profil ».
      </p>
    </form>
  );
}
