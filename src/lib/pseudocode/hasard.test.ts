import { describe, expect, it } from "vitest";
import { runPseudocode } from "./interpreter";

const devinette = (lireDansBoucle: boolean) => `Algorithme devinette
VAR
  NM, Prop : ENTIER
DEBUT
  NM <- ALEATOIRE(1, 10)
  Ecrire("Devinez le nombre")
  Lire(Prop)
  TANT QUE Prop <> NM FAIRE
    SI Prop < NM ALORS
      Ecrire("plus grand")
    SINON
      Ecrire("plus petit")
    FINSI
${lireDansBoucle ? "    Lire(Prop)\n" : ""}  FINTANTQUE
  Ecrire("Bravo")
FIN`;

describe("ALEATOIRE avec graine", () => {
  it("donne les mêmes tirages avec la même graine", () => {
    const src = "DEBUT\n  Ecrire(ALEATOIRE(1, 1000), ALEATOIRE(1, 1000), ALEATOIRE())\nFIN";
    const a = runPseudocode(src, "", { seed: 42 });
    const b = runPseudocode(src, "", { seed: 42 });
    const c = runPseudocode(src, "", { seed: 43 });
    expect(a.error).toBeNull();
    expect(a.stdout).toBe(b.stdout);
    expect(a.stdout).not.toBe(c.stdout);
  });

  it("garde le nombre secret quand la console relance après une saisie", () => {
    const secret = Number(runPseudocode("DEBUT\n  Ecrire(ALEATOIRE(1, 10))\nFIN", "", { seed: 7 }).stdout.trim());
    const autre = secret === 10 ? 1 : secret + 1;
    const r = runPseudocode(devinette(true), `${autre}\n${secret}\n`, { seed: 7 });
    expect(r.error).toBeNull();
    expect(r.stdout).toContain("Bravo");
  });

  it("explique la boucle sans fin quand la variable de la condition ne change jamais", () => {
    const r = runPseudocode(devinette(false), "0\n", { seed: 7 });
    expect(r.error).not.toBeNull();
    expect(r.error!.hint).toMatch(/Prop et NM.*LIRE\(Prop\)/);
  });

  it("ne donne pas ce conseil quand la boucle modifie sa variable", () => {
    const r = runPseudocode("VAR i : ENTIER\nDEBUT\n  i <- 0\n  TANT QUE i >= 0 FAIRE\n    i <- i + 1\n  FINTANTQUE\nFIN", "", { maxSteps: 1000 });
    expect(r.error).not.toBeNull();
    expect(r.error!.hint ?? "").not.toMatch(/ne change/);
  });
});
