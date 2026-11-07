/**
 * Contrôle qualité du contenu pédagogique (« vérifié techniquement ») :
 *  - chaque exemple de pseudocode s'exécute sans erreur ;
 *  - chaque solution de référence réussit tous ses tests ;
 *  - les exemples des autres langages s'exécutent (si la chaîne d'outils
 *    correspondante est installée sur la machine de développement).
 */
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { firstDifference, outputsMatch } from "@/lib/execution/compare";
import { withNodePrelude } from "@/lib/execution/prelude";
import { runPseudocode } from "@/lib/pseudocode";
import { staticCourses, staticExercises } from "./index";
import type { LanguageId } from "./types";

function has(cmd: string): boolean {
  return spawnSync("which", [cmd]).status === 0;
}

const TOOLS: Record<LanguageId, boolean> = {
  pseudocode: true,
  python: has("python3"),
  c: has("gcc"),
  javascript: has("node"),
  java: has("javac") && has("java"),
  // HTML / CSS : vérifiés par le correcteur web (voir web-grader.test.ts).
  html: false,
  css: false,
};

function runLocal(language: LanguageId, code: string, stdin: string): { stdout: string; ok: boolean; err: string } {
  if (language === "pseudocode") {
    const r = runPseudocode(code, stdin);
    return { stdout: r.stdout, ok: r.ok, err: r.error ? `ligne ${r.error.line} : ${r.error.message}` : "" };
  }
  const dir = mkdtempSync(join(tmpdir(), "upl-"));
  const env = { ...process.env, JAVA_TOOL_OPTIONS: "" };
  try {
    let cmd: string;
    let args: string[];
    if (language === "python") {
      writeFileSync(join(dir, "main.py"), code);
      cmd = "python3";
      args = ["main.py"];
    } else if (language === "javascript") {
      writeFileSync(join(dir, "main.js"), withNodePrelude(code));
      cmd = "node";
      args = ["main.js"];
    } else if (language === "c") {
      writeFileSync(join(dir, "main.c"), code);
      execFileSync("gcc", ["-std=c11", "-O1", "-o", "prog", "main.c", "-lm"], { cwd: dir });
      cmd = "./prog";
      args = [];
    } else {
      writeFileSync(join(dir, "Main.java"), code);
      execFileSync("javac", ["-encoding", "UTF-8", "Main.java"], { cwd: dir, env });
      cmd = "java";
      args = ["-Dfile.encoding=UTF-8", "-Dstdout.encoding=UTF-8", "Main"];
    }
    const r = spawnSync(cmd, args, { cwd: dir, input: stdin, encoding: "utf8", timeout: 20_000, env });
    return { stdout: r.stdout ?? "", ok: r.status === 0, err: r.stderr ?? "" };
  } catch (e) {
    return { stdout: "", ok: false, err: String((e as Error).message) };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

describe("structure du contenu", () => {
  it("contient les sept parcours", () => {
    expect(staticCourses.map((c) => c.language).sort()).toEqual(["c", "css", "html", "java", "javascript", "pseudocode", "python"]);
  });

  it("a des identifiants uniques et des références valides", () => {
    const slugs = new Set<string>();
    for (const e of staticExercises) {
      expect(slugs.has(e.slug), `doublon ${e.slug}`).toBe(false);
      slugs.add(e.slug);
      expect(e.tests.length, `${e.slug} sans test`).toBeGreaterThan(0);
      expect(e.hints.length, `${e.slug} sans indice`).toBeGreaterThan(0);
    }
    for (const c of staticCourses) {
      const lessonSlugs = new Set<string>();
      for (const m of c.modules) {
        for (const l of m.lessons) {
          expect(lessonSlugs.has(l.slug), `leçon en double ${c.slug}/${l.slug}`).toBe(false);
          lessonSlugs.add(l.slug);
          expect(l.objectives.length).toBeGreaterThan(0);
          expect(l.summary.length, `${l.slug} sans résumé`).toBeGreaterThan(0);
          for (const s of l.exerciseSlugs ?? []) expect(slugs.has(s), `exercice inconnu ${s}`).toBe(true);
          for (const q of l.quiz?.questions ?? []) {
            for (const k of q.correct) expect(k).toBeLessThan(q.choices.length);
          }
        }
      }
      for (const e of staticExercises.filter((x) => x.courseSlug === c.slug && x.lessonSlug)) {
        expect(lessonSlugs.has(e.lessonSlug!), `${e.slug} → leçon ${e.lessonSlug} introuvable`).toBe(true);
      }
    }
  });
});

describe("exemples des leçons", () => {
  for (const course of staticCourses) {
    for (const mod of course.modules) {
      for (const les of mod.lessons) {
        les.examples.forEach((ex, i) => {
          const run = TOOLS[ex.language] ? it : it.skip;
          run(`${course.slug}/${les.slug} — exemple ${i + 1} (${ex.title})`, () => {
            const r = runLocal(ex.language, ex.code, ex.stdin ?? "");
            expect(r.ok, r.err).toBe(true);
            expect(r.stdout.length).toBeGreaterThan(0);
          });
        });
      }
    }
  }
});

describe("solutions de référence des exercices", () => {
  for (const ex of staticExercises) {
    const run = TOOLS[ex.language] ? it : it.skip;
    run(`${ex.slug} (${ex.language})`, () => {
      for (const t of ex.tests) {
        const r = runLocal(ex.language, ex.solution, t.input);
        expect(r.ok, `entrée ${JSON.stringify(t.input)} : ${r.err}`).toBe(true);
        const diff = firstDifference(r.stdout, t.expected);
        expect(outputsMatch(r.stdout, t.expected), `entrée ${JSON.stringify(t.input)} : ${JSON.stringify(diff)}`).toBe(true);
      }
    });
  }
});

describe("codes de départ", () => {
  for (const ex of staticExercises.filter((e) => e.language === "pseudocode" && e.starterCode)) {
    it(`${ex.slug} : le code de départ est syntaxiquement correct`, () => {
      const r = runPseudocode(ex.starterCode, ex.tests[0].input);
      expect(r.error?.kind).not.toBe("syntaxe");
    });
  }
});
