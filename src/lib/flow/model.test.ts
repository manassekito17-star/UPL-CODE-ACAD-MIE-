import { describe, expect, it } from "vitest";
import { runPseudocode, traceExecution } from "../pseudocode";
import { createNode, fromPseudocode, insertNodes, removeNodes, toPseudocode, updateNode, validate, type FlowProgram } from "./model";

const SOMME = `ALGORITHME Somme
VARIABLES
  i, s, n : ENTIER
DEBUT
  LIRE(n)
  s ← 0
  POUR i DE 1 A n FAIRE
    s ← s + i
  FINPOUR
  SI s > 10 ALORS
    ECRIRE("Grand : ", s)
  SINON
    ECRIRE("Petit : ", s)
  FINSI
FIN`;

describe("UPL Flow Studio : modèle commun", () => {
  it("pseudocode → organigramme → pseudocode : même résultat à l'exécution", () => {
    const { program, warnings } = fromPseudocode(SOMME);
    expect(warnings).toEqual([]);
    expect(program.body.map((n) => n.kind)).toEqual(["input", "assign", "for", "if"]);
    const { code } = toPseudocode(program);
    for (const n of ["3", "5"]) expect(runPseudocode(code, n).stdout).toBe(runPseudocode(SOMME, n).stdout);
    // Aller-retour stable
    expect(toPseudocode(fromPseudocode(code).program).code).toBe(code);
  });

  it("toutes les structures : TANT QUE, RÉPÉTER, SINON SI, SELON, tableaux, constantes", () => {
    const src = `ALGORITHME Tout
CONSTANTES
  MAX = 3
VARIABLES
  T : TABLEAU[1..3] DE ENTIER
  i, k : ENTIER
DEBUT
  i ← 1
  TANT QUE i <= MAX FAIRE
    T[i] ← i * i
    i ← i + 1
  FINTANTQUE
  k ← 0
  REPETER
    k ← k + 1
  JUSQU'A k >= 2
  SELON T[2] FAIRE
    CAS 4 : ECRIRE("quatre")
    AUTRE : ECRIRE("autre")
  FINSELON
  SI k = 1 ALORS
    ECRIRE("un")
  SINON SI k = 2 ALORS
    ECRIRE("deux")
  FINSI
FIN`;
    const ref = runPseudocode(src);
    expect(ref.error).toBeNull();
    const { program, warnings } = fromPseudocode(src);
    expect(warnings.some((w) => /Constante MAX/.test(w))).toBe(true);
    expect(warnings.some((w) => /SELON/.test(w))).toBe(true);
    expect(program.vars.find((v) => v.name === "T")).toEqual({ name: "T", type: "ENTIER", size: 3 });
    expect(runPseudocode(toPseudocode(program).code).stdout).toBe(ref.stdout);
  });

  it("chaque ligne exécutée correspond à un bloc de l'organigramme (surlignage du débogueur)", () => {
    const { program } = fromPseudocode(SOMME);
    const g = toPseudocode(program);
    const trace = traceExecution(g.code, "4", 5000);
    const lines = trace.trace.filter((s) => s.kind !== "fin").map((s) => s.line);
    expect(lines.length).toBeGreaterThan(5);
    for (const l of lines) expect(g.nodeAtLine[l], `ligne ${l}`).toBeDefined();
  });

  it("édition : insérer dans une branche, modifier, supprimer ; erreurs rattachées au bloc", () => {
    let p: FlowProgram = { name: "Test", vars: [{ name: "x", type: "ENTIER" }], body: [] };
    const si = createNode("if", "si");
    p = insertNodes(p, { parent: null, branch: "body", index: 0 }, [createNode("input", "lire"), si]);
    p = insertNodes(p, { parent: "si", branch: "yes", index: 0 }, [{ id: "oui", kind: "output", expr: '"positif"' }]);
    p = updateNode(p, "si", { cond: "x > 0" });
    expect(runPseudocode(toPseudocode(p).code, "5").stdout).toBe("positif\n");
    expect(runPseudocode(toPseudocode(p).code, "-1").stdout).toBe("");
    p = updateNode(p, "oui", { expr: '"positif' });
    const v = validate(p);
    expect(v.ok).toBe(false);
    if (!v.ok) expect(v.nodeId).toBe("oui");
    p = removeNodes(p, new Set(["si"]));
    expect(p.body.map((n) => n.id)).toEqual(["lire"]);
  });
});

import { FLOW_TEMPLATES } from "./templates";
describe("modèles prêts à l'emploi", () => {
  for (const t of FLOW_TEMPLATES) {
    it(`${t.title} : se convertit sans avertissement et s'exécute comme l'original`, () => {
      const { program, warnings } = fromPseudocode(t.code);
      expect(warnings).toEqual([]);
      const stdin = "5\n3\n12\n-1";
      expect(runPseudocode(toPseudocode(program).code, stdin)).toEqual(runPseudocode(t.code, stdin));
    });
  }
});
