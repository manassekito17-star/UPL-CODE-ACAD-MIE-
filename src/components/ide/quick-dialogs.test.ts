import { describe, expect, it } from "vitest";
import { fuzzyScore, SHORTCUTS } from "./quick-dialogs";

describe("Aller au fichier (Ctrl+P)", () => {
  it("classe d'abord le nom de fichier qui commence par la recherche, puis les lettres dans l'ordre", () => {
    const files = ["index.html", "css/style.css", "js/script.js", "js/utils.js"];
    const sorted = files.filter((f) => fuzzyScore("sc", f) >= 0).sort((a, b) => fuzzyScore("sc", b) - fuzzyScore("sc", a));
    expect(sorted[0]).toBe("js/script.js");
    expect(fuzzyScore("utl", "js/utils.js")).toBeGreaterThan(0);
    expect(fuzzyScore("zz", "index.html")).toBe(-1);
    expect(fuzzyScore("", "index.html")).toBeGreaterThan(0);
  });

  it("liste des raccourcis : les commandes essentielles de VS Code sont présentes", () => {
    const all = SHORTCUTS.flatMap((g) => g.items.map(([k]) => k)).join(" ");
    for (const k of ["Ctrl+P", "Ctrl+D", "F2", "F12", "Ctrl+G", "Ctrl+Maj+L", "Alt+↑ / Alt+↓", "Ctrl+/"]) expect(all).toContain(k);
  });
});
