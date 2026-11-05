import { z } from "zod";

/**
 * Validation de la structure pédagogique d'un chapitre saisie dans
 * l'administration (format JSON, hors interrogation et évaluation qui sont
 * des quiz gérés séparément).
 */
const text = (max: number) => z.string().trim().min(1).max(max);

export const pedagogySchema = z
  .object({
    competences: z.array(text(200)).max(20),
    definitions: z.array(z.object({ term: text(120), definition: text(2000) }).strict()).max(40),
    commentedAlgorithms: z
      .array(
        z
          .object({
            title: text(200),
            language: z.enum(["pseudocode", "python", "c", "javascript", "java", "html", "css"]).optional(),
            code: text(20_000),
            stdin: z.string().max(5000).optional(),
            comments: z.record(z.string().regex(/^\d+$/), text(500)),
            showTrace: z.boolean().optional(),
            showFlowchart: z.boolean().optional(),
            showPreview: z.boolean().optional(),
          })
          .strict(),
      )
      .max(10),
    commonErrors: z
      .array(z.object({ title: text(200), wrong: text(10_000), right: text(10_000), explanation: text(3000), run: z.boolean().optional(), stdin: z.string().max(5000).optional() }).strict())
      .max(20),
    solvedExercises: z
      .array(z.object({ title: text(200), statement: text(10_000), solution: text(20_000), explanation: text(5000), stdin: z.string().max(5000).optional() }).strict())
      .max(20),
    project: z
      .object({
        title: text(200),
        context: text(5000),
        steps: z.array(text(1000)).min(1).max(20),
        deliverables: z.array(text(500)).max(20),
        exerciseSlug: z.string().regex(/^[a-z0-9-]{2,80}$/).optional(),
      })
      .strict()
      .optional(),
    td: z.object({ title: text(200), instructions: text(3000), exerciseSlugs: z.array(z.string().regex(/^[a-z0-9-]{2,80}$/)).max(20) }).strict().optional(),
  })
  .strict();

export type PedagogyInput = z.infer<typeof pedagogySchema>;

export function parsePedagogy(json: string): { ok: true; value: PedagogyInput | null } | { ok: false; error: string } {
  if (!json.trim()) return { ok: true, value: null };
  let raw: unknown;
  try {
    raw = JSON.parse(json);
  } catch {
    return { ok: false, error: "La structure pédagogique n'est pas un JSON valide." };
  }
  const r = pedagogySchema.safeParse(raw);
  if (!r.success) return { ok: false, error: `Structure pédagogique : ${r.error.issues.slice(0, 3).map((i) => `${i.path.join(".")} — ${i.message}`).join(" ; ")}` };
  return { ok: true, value: r.data };
}
