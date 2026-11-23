import { describe, expect, it } from "vitest";
import { fuzzy, parseGoto, rank } from "./goto";
import { DEFAULT_SETTINGS, DEFAULT_SETTINGS_TEXT, parseSettings, setSettingInText } from "./settings";
import { readWorkspace, starterWorkspace } from "./workspace";

describe("préférences JSON", () => {
  it("le fichier par défaut (commentaires, virgule finale) donne les réglages par défaut", () => {
    const r = parseSettings(DEFAULT_SETTINGS_TEXT);
    expect(r.error).toBeNull();
    expect(r.warnings).toEqual([]);
    expect(r.settings).toEqual(DEFAULT_SETTINGS);
  });
  it("valeurs modifiées, inconnues et invalides", () => {
    const r = parseSettings('{ "font_size": 20, "color_scheme": "Monokai", "tab_size": 99, "inconnu": 1, // x\n "url": "http://a//b" }');
    expect(r.settings.font_size).toBe(20);
    expect(r.settings.color_scheme).toBe("Monokai");
    expect(r.settings.tab_size).toBe(4);
    expect(r.warnings.join(" ")).toMatch(/tab_size/);
    expect(r.warnings.join(" ")).toMatch(/inconnu/);
  });
  it("JSON invalide : erreur et valeurs par défaut", () => {
    const r = parseSettings("{ font_size: 3 ");
    expect(r.error).toMatch(/illisibles/);
    expect(r.settings).toEqual(DEFAULT_SETTINGS);
  });
  it("changer un réglage garde les commentaires", () => {
    const t = setSettingInText(DEFAULT_SETTINGS_TEXT, "font_size", 18);
    expect(t).toContain('"font_size": 18');
    expect(t).toContain("// Taille du texte");
    expect(parseSettings(setSettingInText(t, "rulers", [80])).settings.rulers).toEqual([80]);
  });
});

describe("aller à n'importe quoi", () => {
  it("analyse fichier, @symbole, :ligne et #mot", () => {
    expect(parseGoto("main")).toMatchObject({ file: "main", mode: "fichier" });
    expect(parseGoto("main@moy")).toMatchObject({ file: "main", mode: "symbole", rest: "moy" });
    expect(parseGoto("style:12")).toMatchObject({ file: "style", mode: "ligne", line: 12 });
    expect(parseGoto(":40:3")).toMatchObject({ file: "", mode: "ligne", line: 40, column: 3 });
    expect(parseGoto("#total")).toMatchObject({ file: "", mode: "mot", rest: "total" });
  });
  it("recherche floue : lettres dans l'ordre, débuts de mots favorisés", () => {
    expect(fuzzy("mp", "python/main.py")).toBeGreaterThan(0);
    expect(fuzzy("xyz", "python/main.py")).toBe(-1);
    expect(rank("scr", ["web/style.css", "web/script.js", "LISEZMOI.md"], (x) => x)[0]).toBe("web/script.js");
  });
});

describe("session gardée", () => {
  it("relit une session et retire les onglets de fichiers disparus", () => {
    const w = starterWorkspace();
    w.groups[0].tabs.push("absent.txt");
    const back = readWorkspace(JSON.stringify(w))!;
    expect(back.groups[0].tabs).toEqual(["LISEZMOI.md", "python/main.py"]);
    expect(readWorkspace("pas du json")).toBeNull();
  });
});
