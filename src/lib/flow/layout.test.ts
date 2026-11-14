import { describe, expect, it } from "vitest";
import { layoutProgram } from "./layout";
import { allNodes, fromPseudocode, insertNodes, createNode, emptyProgram } from "./model";

const SRC = `ALGORITHME Test
VARIABLES
  i, s : ENTIER
DEBUT
  s ← 0
  POUR i DE 1 A 3 FAIRE
    SI i MOD 2 = 0 ALORS
      s ← s + i
    FINSI
  FINPOUR
  REPETER
    s ← s - 1
  JUSQU'A s < 0
  ECRIRE(s)
FIN`;

describe("UPL Flow Studio : disposition automatique", () => {
  it("un nœud par bloc, Début et Fin, chaque flèche relie des nœuds existants", () => {
    const { program } = fromPseudocode(SRC);
    const l = layoutProgram(program);
    const ids = new Set(l.nodes.map((n) => n.id));
    for (const b of allNodes(program.body)) expect(ids.has(b.id)).toBe(true);
    expect(ids.has("debut") && ids.has("fin")).toBe(true);
    for (const e of l.edges) expect(ids.has(e.source) && ids.has(e.target), e.id).toBe(true);
    // Pas de chevauchement vertical dans la colonne principale : Fin est sous tous les blocs.
    const fin = l.nodes.find((n) => n.id === "fin")!;
    for (const n of l.nodes) if (n.id !== "fin") expect(n.y).toBeLessThan(fin.y);
  });

  it("un point d'insertion « + » par position possible, y compris les branches vides", () => {
    let p = emptyProgram();
    expect(layoutProgram(p).edges.filter((e) => e.loc)).toHaveLength(1);
    p = insertNodes(p, { parent: null, branch: "body", index: 0 }, [createNode("if", "si")]);
    const locs = layoutProgram(p).edges.flatMap((e) => (e.loc ? [`${e.loc.parent}/${e.loc.branch}/${e.loc.index}`] : []));
    expect(locs.sort()).toEqual(["null/body/0", "null/body/1", "si/no/0", "si/yes/0"]);
  });

  it("boucles : retour vers la condition, sortie étiquetée", () => {
    const { program } = fromPseudocode(SRC);
    const l = layoutProgram(program);
    expect(l.edges.filter((e) => e.back)).toHaveLength(2);
    expect(l.edges.some((e) => e.label === "Fin")).toBe(true);
  });
});
