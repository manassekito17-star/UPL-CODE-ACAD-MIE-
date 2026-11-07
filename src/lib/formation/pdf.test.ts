import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { staticCourses } from "@/content";
import { buildChapterSummaryPdf } from "./pdf";

const course = staticCourses.find((c) => c.slug === "algorithmique")!;
const chapters = course.modules.flatMap((m) => m.lessons).filter((l) => l.pedagogy && l.status === "publie");
const hasPdftotext = spawnSync("which", ["pdftotext"]).status === 0;

describe("résumés PDF des chapitres", () => {
  for (const lesson of chapters) {
    it(`${lesson.slug} : PDF valide contenant les rubriques et les symboles`, async () => {
      const pdf = await buildChapterSummaryPdf(course, lesson);
      expect(Buffer.from(pdf).subarray(0, 5).toString()).toBe("%PDF-");
      expect(pdf.length).toBeGreaterThan(5_000);
      if (!hasPdftotext) return;
      const dir = mkdtempSync(join(tmpdir(), "pdf-"));
      const file = join(dir, "r.pdf");
      writeFileSync(file, pdf);
      const text = spawnSync("pdftotext", ["-layout", file, "-"], { encoding: "utf8" }).stdout;
      expect(text).toContain(lesson.title);
      for (const h of ["Objectifs", "Compétences visées", "Définitions", "À retenir", "Algorithme commenté", "Erreurs fréquentes"]) expect(text).toContain(h);
      expect(text).toContain(lesson.pedagogy!.definitions[0].term);
      // Les symboles de l'algorithme (← ≥ …) sont rendus grâce à la police embarquée.
      const algoCode = lesson.pedagogy!.commentedAlgorithms[0].code;
      for (const sym of ["←", "≥", "é"]) if (algoCode.includes(sym)) expect(text).toContain(sym);
    });
  }
});
