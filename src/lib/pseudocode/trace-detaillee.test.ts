import { describe, expect, it } from "vitest";
import { traceExecution } from "./index";

const src = (body: string, vars = "i, s, n : ENTIER") => `ALGORITHME Test\nVARIABLES\n  ${vars}\nDEBUT\n${body}\nFIN`;

describe("trace détaillée (laboratoire)", () => {
  it("POUR : une étape par tour avec la valeur du compteur, puis la sortie", () => {
    const r = traceExecution(src("  s ← 0\n  POUR i DE 1 A 3 FAIRE\n    s ← s + i\n  FINPOUR\n  ECRIRE(s)"), "", 500, {}, { detailed: true });
    expect(r.ok).toBe(true);
    const loop = r.trace.filter((t) => t.line === 6);
    expect(loop.map((t) => t.note)).toEqual([
      "i = 1 : tour n° 1 de la boucle POUR.",
      "i = 2 : tour n° 2 de la boucle POUR.",
      "i = 3 : tour n° 3 de la boucle POUR.",
      "i = 4 > 3 : fin de la boucle POUR (3 tour(s)).",
    ]);
    expect(loop.map((t) => t.decision)).toEqual([true, true, true, false]);
    // L'état affiché à la vérification est celui après incrémentation
    expect(loop[1].variables.find((v) => v.name === "i")?.value).toBe("2");
    expect(r.stdout).toBe("6\n");
  });

  it("TANT QUE : chaque réévaluation de la condition est visible", () => {
    const r = traceExecution(src("  n ← 2\n  TANT QUE n > 0 FAIRE\n    n ← n - 1\n  FINTANTQUE"), "", 500, {}, { detailed: true });
    const loop = r.trace.filter((t) => t.line === 6);
    expect(loop).toHaveLength(3);
    expect(loop.map((t) => t.decision)).toEqual([true, true, false]);
    expect(loop[2].note).toContain("sortie de la boucle TANT QUE (2 tour(s))");
  });

  it("RÉPÉTER … JUSQU'A : condition évaluée en fin de tour", () => {
    const r = traceExecution(src("  n ← 0\n  REPETER\n    n ← n + 1\n  JUSQU'A n >= 2"), "", 500, {}, { detailed: true });
    const checks = r.trace.filter((t) => t.loopCheck);
    expect(checks.map((t) => t.decision)).toEqual([true, false]);
    expect(checks[1].note).toContain("VRAIE : sortie de la boucle (2 tour(s))");
  });

  it("SI / SINON SI / SINON : la branche prise est expliquée", () => {
    const code = (n: number) => src(`  n ← ${n}\n  SI n > 10 ALORS\n    ECRIRE("grand")\n  SINON SI n > 5 ALORS\n    ECRIRE("moyen")\n  SINON\n    ECRIRE("petit")\n  FINSI`);
    const note = (n: number) => traceExecution(code(n), "", 500, {}, { detailed: true }).trace.find((t) => t.kind === "if")?.note;
    expect(note(20)).toBe("Condition VRAIE : on exécute le bloc ALORS.");
    expect(note(7)).toContain("SINON SI n° 1 VRAIE");
    expect(note(1)).toBe("Condition(s) FAUSSE(S) : on exécute le bloc SINON.");
  });

  it("appels et retours : pile d'appels et valeur retournée", () => {
    const code = `ALGORITHME Appel
FONCTION carre(x : ENTIER) : ENTIER
DEBUT
  RETOURNER x * x
FIN
VARIABLES
  r : ENTIER
DEBUT
  r ← carre(4)
  ECRIRE(r)
FIN`;
    const r = traceExecution(code, "", 500, {}, { detailed: true });
    const ret = r.trace.find((t) => t.kind === "return")!;
    expect(ret.stack).toEqual(["Programme principal", "carre(x)"]);
    expect(ret.note).toBe("carre retourne 16 à l'appelant.");
  });

  it("le mode normal reste inchangé (pas d'étapes supplémentaires ni de notes)", () => {
    const code = src("  POUR i DE 1 A 3 FAIRE\n    ECRIRE(i)\n  FINPOUR");
    const normal = traceExecution(code);
    expect(normal.trace.every((t) => t.note === undefined && !t.loopCheck)).toBe(true);
    expect(traceExecution(code, "", 500, {}, { detailed: true }).trace.length).toBe(normal.trace.length + 3);
  });

  it("une donnée manquante pour LIRE arrête la trace sur la ligne du LIRE", () => {
    const r = traceExecution(src("  LIRE(n)\n  LIRE(s)\n  ECRIRE(n + s)"), "4", 500, {}, { detailed: true });
    expect(r.ok).toBe(false);
    expect(r.error?.message).toContain("Aucune donnée disponible pour LIRE(s)");
    expect(r.error?.line).toBe(6);
  });
});
