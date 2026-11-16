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

describe("modèles d'organigramme (tous ceux de LARP sur PC)", () => {
  it("chaque modèle crée un bloc qui se traduit en pseudo-code valide", async () => {
    const { FLOW_TEMPLATES } = await import("./project");
    const { compileProject } = await import("./interpreter");
    expect(FLOW_TEMPLATES.map((t) => t.id)).toEqual(
      expect.arrayContaining(["assign", "input", "output", "call", "comment", "if", "while", "repeat", "for", "requete", "lire-de", "ecrire-dans", "selectionner", "ouvrir", "fermer", "separateur", "detruire", "compresser"]),
    );
    for (const t of FLOW_TEMPLATES) {
      const doc: LarpDoc = { id: "m", kind: "organigramme", name: "PRINCIPAL", main: true, flow: { name: "P", vars: [], body: [t.make()] } };
      const aux: LarpDoc = { id: "a", kind: "pseudo", name: "Module", code: "ENTRER\nRETOURNER\n" };
      const { modules } = projectSources({ name: "t", docs: [doc, aux] });
      const r = compileProject(modules);
      expect(r.ok, `${t.id} : ${docSource(doc).code} ${r.ok ? "" : r.error.message}`).toBe(true);
    }
  });

  it("SÉLECTIONNER et REQUÊTE s'exécutent depuis l'organigramme", async () => {
    const { flowTemplate } = await import("./project");
    const doc: LarpDoc = { id: "m", kind: "organigramme", name: "PRINCIPAL", main: true, flow: { name: "P", vars: [], body: [flowTemplate("requete")!.make(), flowTemplate("selectionner")!.make()] } };
    const { modules } = projectSources({ name: "t", docs: [doc] });
    expect(runProject(modules, ["2"]).output).toBe("Entrez une valeur : 2\ndeux ou trois\n");
  });
});

describe("structures en miroir et commentaires latéraux (comme LARP sur PC)", () => {
  it("les variantes en miroir donnent le même pseudo-code et s'exécutent", async () => {
    const { flowTemplate } = await import("./project");
    for (const id of ["if-sinon", "if-sinon-miroir", "while-miroir", "repeat-miroir", "for-miroir", "while-losange-miroir", "comment", "comment-droite"]) {
      // x = 5 : SI va dans la branche Vrai, TANTQUE / POUR / RÉPÉTER se terminent.
      const init = { id: "i", kind: "assign" as const, target: "", expr: "x = 5" };
      const body = [init, flowTemplate(id)!.make()];
      const doc: LarpDoc = { id: "m", kind: "organigramme", name: "PRINCIPAL", main: true, flow: { name: "P", vars: [], body } };
      const { modules } = projectSources({ name: "t", docs: [doc] });
      const r = id.startsWith("while") ? runProject(modules, [], { maxSteps: 500 }) : runProject(modules, []);
      if (id.startsWith("while")) expect(r.error?.message ?? "", id).toMatch(/limite|boucle/i);
      else expect(r.error, id).toBeUndefined();
      if (id.startsWith("if-sinon")) expect(r.output).toBe("Vrai\n");
    }
  });

  it("disposition : Vrai à droite et retour de boucle à droite en miroir", async () => {
    const { flowTemplate } = await import("./project");
    const { layoutProgram } = await import("../flow/layout");
    const si = flowTemplate("if-sinon-miroir")!.make();
    const tq = flowTemplate("while-miroir")!.make();
    const lay = layoutProgram({ name: "P", vars: [], body: [si, tq] });
    expect(lay.edges.find((e) => e.source === si.id && e.label === "Oui")!.sourceHandle).toBe("r");
    expect(lay.edges.find((e) => e.target === tq.id && e.back)!.targetHandle).toBe("rt");
    const com = flowTemplate("comment-droite")!.make();
    const l2 = layoutProgram({ name: "P", vars: [], body: [com] });
    const n = l2.nodes.find((x) => x.flowId === com.id)!;
    expect(n.x).toBeGreaterThan(n.attach!);
  });
});
