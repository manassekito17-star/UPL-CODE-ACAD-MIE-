import { describe, expect, it } from "vitest";
import { checkPseudocode, runPseudocode } from "@/lib/pseudocode";
import { starterContent, starterCursor } from "./starters";

describe("modèles de départ des nouveaux fichiers", () => {
  it("index.html : structure complète d'une page, curseur dans le titre", () => {
    const html = starterContent("index.html");
    expect(html).toMatch(/^<!DOCTYPE html>/);
    for (const part of ['<html lang="fr">', '<meta charset="UTF-8">', 'name="viewport"', "<title></title>", "<body>", "</body>", "</html>"]) expect(html).toContain(part);
    const c = starterCursor("pages/index.html")!;
    expect(html.split("\n")[c.line - 1].slice(0, c.column - 1)).toMatch(/<title>$/);
  });
  it("Java : la classe porte le nom du fichier", () => {
    expect(starterContent("src/Calcul.java")).toContain("public class Calcul {");
    expect(starterContent("ma-classe.java")).toContain("public class ma_classe {");
  });
  it("pseudocode : modèle valide pour l'interpréteur", () => {
    const algo = starterContent("moyenne.algo");
    expect(algo).toContain("ALGORITHME moyenne");
    expect(checkPseudocode(algo)).toBeFalsy();
    expect(runPseudocode(algo).error).toBeFalsy();
    // Curseur sur la ligne indentée entre DEBUT et FIN.
    const at = starterCursor("moyenne.algo")!;
    expect(algo.split("\n")[at.line - 2]).toBe("DEBUT");
    expect(at.column).toBe(3);
  });
  it("C et Java : curseur dans le corps de main, indenté", () => {
    const c = starterCursor("main.c")!;
    expect(starterContent("main.c").split("\n")[c.line - 2]).toBe("int main(void) {");
    expect(c.column).toBe(5);
    const j = starterCursor("Main.java")!;
    expect(starterContent("Main.java").split("\n")[j.line - 2]).toContain("public static void main");
    expect(j.column).toBe(9);
  });
  it("C, CSS, Python, JSON ; fichiers sans modèle vides", () => {
    expect(starterContent("main.c")).toContain("int main(void)");
    expect(starterContent("main.h")).toBe("");
    expect(starterContent("style.css")).toContain("box-sizing");
    expect(starterContent("app.py")).toContain("#");
    expect(JSON.parse(starterContent("data.json"))).toEqual({});
    expect(starterContent("notes.txt")).toBe("");
    expect(starterCursor("notes.txt")).toBeNull();
  });
});
