import { z } from "zod";

/**
 * Accès rapide sans mot de passe : profil déclaratif (nom, prénom, poste, sexe, filière).
 * Ces informations ne prouvent pas l'identité de la personne et ne donnent aucun droit :
 * le rôle d'un nouveau compte est toujours « etudiant » (fixé par la base de données).
 */
export const POSITIONS = { etudiant: "Étudiant", enseignant: "Enseignant", autre: "Autre" } as const;
export const SEXES = { masculin: "Masculin", feminin: "Féminin" } as const;
export const FILIERES = [
  "Informatique",
  "Génie logiciel",
  "Réseaux et télécommunications",
  "Mathématiques",
  "Sciences économiques",
  "Gestion",
  "Droit",
  "Médecine",
  "Polytechnique",
  "Lettres et sciences humaines",
] as const;

/** Durée de validité d'un accès rapide sans activité, en jours (ensuite : nouvelle saisie du profil). */
export const QUICK_ACCESS_IDLE_DAYS = 30;

const name = (label: string) =>
  z
    .string()
    .trim()
    .min(2, `${label} : au moins 2 caractères.`)
    .max(60, `${label} : 60 caractères au plus.`)
    .regex(/^[\p{L}][\p{L}' .-]*$/u, `${label} : lettres, espaces, apostrophes et tirets uniquement.`);

export const quickProfileSchema = z
  .object({
    last_name: name("Nom"),
    first_name: name("Prénom"),
    position: z.enum(["etudiant", "enseignant", "autre"], { message: "Choisissez votre poste." }),
    sex: z.enum(["masculin", "feminin"], { message: "Choisissez votre sexe." }),
    faculty: z.string().trim().max(120).optional().default(""),
    faculty_other: z.string().trim().max(120).optional().default(""),
  })
  .transform((d) => {
    const faculty = (d.faculty === "autre" ? d.faculty_other : d.faculty).replace(/[<>]/g, "").trim();
    return { last_name: d.last_name, first_name: d.first_name, position: d.position, sex: d.sex, faculty };
  })
  .refine((d) => d.faculty.length >= 2, { message: "Indiquez votre filière.", path: ["faculty"] });

export type QuickProfile = z.output<typeof quickProfileSchema>;

export const fullNameOf = (p: Pick<QuickProfile, "first_name" | "last_name">) => `${p.first_name} ${p.last_name}`.trim();
