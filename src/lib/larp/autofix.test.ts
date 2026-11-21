import { describe, expect, it } from "vitest";
import { autoFix } from "./autofix";
import { runProject } from "./interpreter";

const fix = (code: string) => autoFix([{ name: "PRINCIPAL", main: true, code }], "PRINCIPAL");

describe("Corriger le code : l'éditeur réécrit le module corrigé", () => {
  it.each([
    ["fonction mal écrite", "DÉBUT\n  T = [1, 2]\n  ÉCRIRE LONGEUR(T)\nFIN", "DÉBUT\n  T = [1, 2]\n  ÉCRIRE LONGUEUR(T)\nFIN"],
    ["instruction mal écrite", 'DÉBUT\n  ECRIR "a"\nFIN', 'DÉBUT\n  ÉCRIRE "a"\nFIN'],
    ["ALORS oublié", 'DÉBUT\n  SI 1 < 2\n    ÉCRIRE "a"\n  FINSI\nFIN', 'DÉBUT\n  SI 1 < 2 ALORS\n    ÉCRIRE "a"\n  FINSI\nFIN'],
    ["FAIRE oublié", "DÉBUT\n  POUR i = 1 JUSQU'À 3\n    ÉCRIRE i\n  FINPOUR\nFIN", "DÉBUT\n  POUR i = 1 JUSQU'À 3 FAIRE\n    ÉCRIRE i\n  FINPOUR\nFIN"],
    ["FAIRE mal écrit", "DÉBUT\n  POUR i = 1 JUSQU'À 3 FAIR\n    ÉCRIRE i\n  FINPOUR\nFIN", "DÉBUT\n  POUR i = 1 JUSQU'À 3 FAIRE\n    ÉCRIRE i\n  FINPOUR\nFIN"],
    ["FINSI oublié", 'DÉBUT\n  SI 1 < 2 ALORS\n    ÉCRIRE "a"\nFIN', 'DÉBUT\n  SI 1 < 2 ALORS\n    ÉCRIRE "a"\n  FINSI\nFIN'],
    ["FINPOUR oublié", "DÉBUT\n  POUR i = 1 JUSQU'À 3 FAIRE\n    ÉCRIRE i\nFIN", "DÉBUT\n  POUR i = 1 JUSQU'À 3 FAIRE\n    ÉCRIRE i\n  FINPOUR\nFIN"],
    ["virgule dans ÉCRIRE", 'DÉBUT\n  s = 3\n  ÉCRIRE "Somme = " s\nFIN', 'DÉBUT\n  s = 3\n  ÉCRIRE "Somme = ", s\nFIN'],
    ["guillemet non fermé", 'DÉBUT\n  ÉCRIRE "Bonjour\nFIN', 'DÉBUT\n  ÉCRIRE "Bonjour"\nFIN'],
    ["point-virgule", "DÉBUT\n  x = 1;\n  ÉCRIRE x\nFIN", "DÉBUT\n  x = 1\n  ÉCRIRE x\nFIN"],
  ])("%s", (_n, code, expected) => {
    const r = fix(code);
    expect(r?.code).toBe(expected);
    expect(r?.compiles).toBe(true);
  });

  it("plusieurs erreurs corrigées d'un coup, le programme s'exécute", () => {
    const code = "DÉBUT\n  somme = 0\n  POUR i = 1 JUSQU'À TAILE(3)\n    LIR n\n    somme = somme + n\n  SI somme > 10\n    ECRIR \"Grand : \" somme\n  FINSI\nFIN";
    const r = fix(code)!;
    expect(r.compiles).toBe(true);
    expect(r.changes.length).toBeGreaterThanOrEqual(5);
    const out = runProject([{ name: "PRINCIPAL", main: true, code: r.code }], ["4", "5", "6"]);
    expect(out.error).toBeUndefined();
    expect(out.output).toMatch(/Grand :\s+15/);
    // FINPOUR ferme la boucle avant le SI (d'après le décalage des lignes).
    expect(r.code.split("\n")[5]).toBe("  FINPOUR");
    expect(r.changes.filter((c) => c.line === 8)).toHaveLength(1);
    expect(r.changes.find((c) => c.line === 8)?.after).toBe('    ÉCRIRE "Grand : ", somme');
  });

  it("rien à corriger : null", () => {
    expect(fix('DÉBUT\n  ÉCRIRE "ok"\nFIN')).toBeNull();
  });
});
