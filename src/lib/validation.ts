import { z } from "zod";
import { LANGUAGE_IDS, EXECUTION_LIMITS } from "./execution/languages";

/** Schémas de validation des entrées des API (aucune donnée du client n'est utilisée sans validation). */

export const languageSchema = z.enum(LANGUAGE_IDS as [string, ...string[]]);

const fileNameSchema = z
  .string()
  .min(1)
  .max(64)
  .regex(/^[A-Za-z0-9_][A-Za-z0-9_.-]*$/, "Nom de fichier invalide");

export const sourceFilesSchema = z
  .array(z.object({ name: fileNameSchema, content: z.string().max(EXECUTION_LIMITS.maxSourceChars) }))
  .min(1)
  .max(EXECUTION_LIMITS.maxFiles)
  .refine((files) => new Set(files.map((f) => f.name)).size === files.length, "Noms de fichiers en double")
  .refine((files) => files.reduce((n, f) => n + f.content.length, 0) <= EXECUTION_LIMITS.maxSourceChars, "Code trop long");

export const executeSchema = z.object({
  language: languageSchema,
  files: sourceFilesSchema,
  stdin: z.string().max(EXECUTION_LIMITS.maxStdinChars).default(""),
  programId: z.string().uuid().optional(),
});

export const submitSchema = z.object({
  files: sourceFilesSchema,
});

export const quizSubmitSchema = z.object({
  answers: z.record(z.string().max(80), z.array(z.number().int().min(0).max(20)).max(20)),
});

export const progressSchema = z.object({
  courseSlug: z.string().regex(/^[a-z0-9-]{2,80}$/),
  lessonSlug: z.string().regex(/^[a-z0-9-]{2,80}$/),
  action: z.enum(["ouvrir", "terminer"]),
  secondsSpent: z.number().int().min(0).max(4 * 3600).default(0),
});

export const programSchema = z.object({
  title: z.string().trim().min(1).max(120),
  language: languageSchema,
  files: sourceFilesSchema,
  stdin: z.string().max(EXECUTION_LIMITS.maxStdinChars).default(""),
});

export const tutorModes = [
  "question",
  "enseigner",
  "expliquer_code",
  "analyser_erreur",
  "indice",
  "interroger",
  "generer_exercice",
  "pseudocode_vs_code",
  "preparer_evaluation",
  "mentor_projet",
] as const;

export const tutorSchema = z.object({
  conversationId: z.string().uuid().optional(),
  message: z.string().trim().min(1).max(4000),
  mode: z.enum(tutorModes).default("question"),
  level: z.enum(["debutant", "intermediaire", "avance"]).optional(),
  context: z
    .object({
      language: languageSchema.optional(),
      code: z.string().max(20_000).optional(),
      output: z.string().max(5_000).optional(),
      error: z.string().max(5_000).optional(),
      exerciseSlug: z.string().regex(/^[a-z0-9-]{2,80}$/).optional(),
      // Parcours et chapitre : le programme et le niveau réel sont relus côté serveur.
      courseSlug: z.string().regex(/^[a-z0-9-]{2,80}$/).optional(),
      lessonSlug: z.string().regex(/^[a-z0-9-]{2,80}$/).optional(),
      lessonTitle: z.string().max(200).optional(),
      hintLevel: z.number().int().min(1).max(5).optional(),
    })
    .default({}),
  history: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(8000) }))
    .max(20)
    .default([]),
});

export type TutorRequest = z.infer<typeof tutorSchema>;
