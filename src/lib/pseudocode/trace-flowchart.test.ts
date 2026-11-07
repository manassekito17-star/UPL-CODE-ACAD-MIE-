import { describe, expect, it } from "vitest";
import { staticCourses } from "@/content";
import { generateFlowcharts } from "./flowchart";
import { traceExecution } from "./interpreter";

describe("trace d'exécution", () => {
  it("enregistre l'état des variables avant chaque instruction", () => {
    const r = traceExecution("VARIABLES a, b : ENTIER\nDEBUT\n  a ← 2\n  b ← a * 3\n  ECRIRE(b)\nFIN");
    expect(r.ok).toBe(true);
    expect(r.trace.map((s) => s.line)).toEqual([3, 4, 5, 6]);
    expect(r.trace[0].variables).toEqual([
      { name: "a", type: "ENTIER", value: "?" },
      { name: "b", type: "ENTIER", value: "?" },
    ]);
    expect(r.trace[2].variables.find((v) => v.name === "b")?.value).toBe("6");
    expect(r.trace.at(-1)).toMatchObject({ kind: "fin", output: "6\n" });
  });

  it("suit la pile d'appels des fonctions", () => {
    const r = traceExecution("FONCTION carre(x : ENTIER) : ENTIER\nDEBUT\n  RETOURNER x * x\nFIN\nDEBUT\n  ECRIRE(carre(4))\nFIN");
    const inside = r.trace.find((s) => s.line === 3)!;
    expect(inside.stack).toEqual(["Programme principal", "carre(x)"]);
    expect(inside.variables).toContainEqual({ name: "x", type: "ENTIER", value: "4" });
  });

  it("s'arrête proprement sur une erreur et sur une trace trop longue", () => {
    const err = traceExecution("VARIABLES a : ENTIER\nDEBUT\n  a ← 1 / 0\nFIN");
    expect(err.ok).toBe(false);
    expect(err.trace.length).toBeGreaterThan(0);
    const long = traceExecution("VARIABLES i : ENTIER\nDEBUT\n  POUR i DE 1 A 100000 FAIRE\n    i ← i\n  FINPOUR\nFIN", "", 50);
    expect(long.truncated).toBe(true);
    expect(long.trace).toHaveLength(50);
  });
});

describe("organigrammes", () => {
  it("génère un SVG valide pour chaque exemple de pseudocode des cours", () => {
    let count = 0;
    for (const c of staticCourses) for (const m of c.modules) for (const l of m.lessons) for (const ex of l.examples) {
      if (ex.language !== "pseudocode") continue;
      const r = generateFlowcharts(ex.code);
      expect(r.ok, `${l.slug} : ${ex.title}`).toBe(true);
      if (r.ok) for (const ch of r.charts) {
        expect(ch.svg.startsWith("<svg")).toBe(true);
        expect(ch.svg).not.toMatch(/NaN|undefined/);
        count++;
      }
    }
    expect(count).toBeGreaterThan(20);
  });

  it("utilise les symboles normalisés et échappe le texte", () => {
    const r = generateFlowcharts('VARIABLES n : ENTIER\nDEBUT\n  LIRE(n)\n  SI n < 0 ALORS\n    ECRIRE("<négatif>")\n  FINSI\nFIN');
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const svg = r.charts[0].svg;
    expect(svg).toContain("Début");
    expect(svg).toContain("polygon"); // losange et parallélogramme
    expect(svg).toContain("&lt;négatif&gt;");
    expect(svg).not.toContain('"<négatif>"');
  });

  it("signale une erreur de syntaxe avec la ligne", () => {
    const r = generateFlowcharts("DEBUT\n  SI x ALORS\nFIN");
    expect(r.ok).toBe(false);
  });
});
