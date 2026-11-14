import { describe, expect, it } from "vitest";
import { runProject } from "./interpreter";
import { docSource, exampleProject, larpNode, nodeForLine, projectSources, type LarpDoc } from "./project";

describe("projet classique : organigramme ↔ pseudo-code", () => {
  it("traduit un organigramme (boucle, condition, lecture, écriture) et l'exécute", () => {
    const lire = { ...larpNode("input"), target: "n" } as ReturnType<typeof larpNode>;
    const init = { ...larpNode("assign"), expr: "s = 0" } as ReturnType<typeof larpNode>;
    const add = { ...larpNode("assign"), expr: "s = s + i" } as ReturnType<typeof larpNode>;
    const pour = { ...larpNode("for"), to: "n", body: [add] } as ReturnType<typeof larpNode>;
    const out = { ...larpNode("output"), expr: '"Somme = ", s' } as ReturnType<typeof larpNode>;
    const si = { ...larpNode("if"), cond: "s > 5", yes: [{ ...larpNode("output"), expr: '"grand"' } as ReturnType<typeof larpNode>], no: [] } as ReturnType<typeof larpNode>;
    const doc: LarpDoc = { id: "m", kind: "organigramme", name: "PRINCIPAL", main: true, flow: { name: "P", vars: [], body: [lire, init, pour, out, si] } };
    const src = docSource(doc);
    expect(src.code).toBe('DÉBUT\n  LIRE n\n  s = 0\n  POUR i = 1 JUSQU\'À n FAIRE\n    s = s + i\n  FINPOUR\n  ÉCRIRE "Somme = ", s\n  SI s > 5 ALORS\n    ÉCRIRE "grand"\n  FINSI\nFIN\n');
    expect(nodeForLine(src, 5)).toBe(add.id);
    expect(nodeForLine(src, 1)).toBe("debut");
    const { modules } = projectSources({ name: "t", docs: [doc] });
    expect(runProject(modules, ["4"]).output).toBe("4\nSomme =  10\ngrand\n");
  });

  it("module auxiliaire en organigramme : ENTRER / RETOURNER", () => {
    const doc: LarpDoc = { id: "a", kind: "organigramme", name: "Carre", flow: { name: "Carre", vars: [], body: [{ ...larpNode("assign"), expr: "r = x * x" } as ReturnType<typeof larpNode>] }, entree: "x", retour: "r" };
    expect(docSource(doc).code).toBe("ENTRER x\n  r = x * x\nRETOURNER r\n");
    const main: LarpDoc = { id: "p", kind: "pseudo", name: "PRINCIPAL", main: true, code: "DÉBUT\n ÉCRIRE Carre(7)\nFIN" };
    const { modules } = projectSources({ name: "t", docs: [main, doc] });
    expect(runProject(modules).output).toBe("49\n");
  });

  it("l'exemple fourni s'exécute", () => {
    const { modules } = projectSources(exampleProject());
    expect(runProject(modules, ["5"]).output).toBe("Entrez un entier : 5\nLa factorielle de  5  est  120\n");
  });
});
