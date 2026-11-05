/**
 * Parcours HTML et CSS : chaque solution de référence réussit toutes ses
 * vérifications structurelles, chaque code de départ en échoue au moins une,
 * et les exemples commentés sont des documents analysables.
 */
import { describe, expect, it } from "vitest";
import { buildPreviewDocument, checkWebProject } from "@/lib/execution/web";
import { gradeExercise } from "@/lib/execution/grading";
import type { SourceFile } from "@/lib/execution/types";
import { staticCourses, staticExercises } from "./index";
import type { Exercise } from "./types";

const web = staticExercises.filter((e) => e.language === "html" || e.language === "css");

/** Fichiers soumis : la solution remplace le fichier actif (index.html ou style.css). */
function filesWith(ex: Exercise, code: string): SourceFile[] {
  const active = ex.activeFile ?? "index.html";
  const base = ex.starterFiles ?? [{ name: "index.html", content: "" }];
  return base.map((f) => (f.name === active ? { name: f.name, content: code } : f));
}

describe("correcteur web", () => {
  it("le parcours contient des exercices HTML et CSS", () => {
    expect(web.filter((e) => e.language === "html").length).toBeGreaterThanOrEqual(10);
    expect(web.filter((e) => e.language === "css").length).toBeGreaterThanOrEqual(8);
  });

  for (const ex of web) {
    describe(ex.slug, () => {
      it("chaque test porte une vérification structurelle", () => {
        for (const t of ex.tests) expect(t.check, `${ex.slug} : test sans vérification`).toBeDefined();
      });
      it("la solution de référence réussit toutes les vérifications", async () => {
        const r = await gradeExercise(ex, filesWith(ex, ex.solution));
        const failed = r.tests.filter((t) => !t.passed).map((t) => `${t.description} — ${t.error}`);
        expect(failed, ex.slug).toEqual([]);
        expect(r.status).toBe("reussi");
      });
      it("le code de départ échoue à au moins une vérification", async () => {
        const starter = ex.starterFiles?.find((f) => f.name === (ex.activeFile ?? "index.html"))?.content ?? ex.starterCode;
        const r = await gradeExercise(ex, filesWith(ex, starter));
        expect(r.status).not.toBe("reussi");
      });
    });
  }

  it("ne se laisse pas tromper par une balise écrite dans un commentaire", async () => {
    const r = await checkWebProject([{ name: "index.html", content: "<!-- <h1>Titre</h1> --><p>x</p>" }], [{ type: "element", selector: "h1", message: "un h1" }]);
    expect(r[0].passed).toBe(false);
  });

  it("l'aperçu intègre la feuille de style et la politique de sécurité", () => {
    const doc = buildPreviewDocument([
      { name: "index.html", content: '<!DOCTYPE html><html><head><link rel="stylesheet" href="style.css"></head><body><p>x</p></body></html>' },
      { name: "style.css", content: "p { color: red; }" },
    ]);
    expect(doc).toContain("p { color: red; }");
    expect(doc).toContain("Content-Security-Policy");
    expect(doc).not.toContain('href="style.css"');
  });
});

describe("exemples commentés HTML et CSS", () => {
  for (const c of staticCourses.filter((x) => x.language === "html" || x.language === "css")) {
    for (const l of c.modules.flatMap((m) => m.lessons)) {
      it(`${l.slug} : exemples avec aperçu et commentaires valides`, () => {
        for (const a of l.pedagogy?.commentedAlgorithms ?? []) {
          expect(a.showPreview, a.title).toBe(true);
          const lines = a.code.split("\n").length;
          for (const k of Object.keys(a.comments)) expect(Number(k)).toBeLessThanOrEqual(lines);
        }
      });
    }
  }
});
