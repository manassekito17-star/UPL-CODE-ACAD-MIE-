import { strToU8, zipSync } from "fflate";
import { describe, expect, it } from "vitest";
import { exportZip, importZip } from "./zip";

describe("import et export ZIP", () => {
  it("aller-retour avec dossiers vides", () => {
    const p = { files: [{ path: "index.html", content: "<p>é</p>" }, { path: "js/app.js", content: "console.log(1)" }], folders: ["images"] };
    const r = importZip(exportZip(p));
    expect(r.ok).toBe(true);
    expect(r.project).toEqual({ files: p.files, folders: ["images"] });
  });

  it("retire le dossier racine unique, ignore node_modules et écarte les binaires", () => {
    const zip = zipSync({
      "projet-main/README.md": strToU8("# Titre"),
      "projet-main/src/main.py": strToU8("print(1)"),
      "projet-main/node_modules/x/index.js": strToU8("x"),
      "projet-main/logo.png": new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0, 0, 0xff, 0xfe]),
    });
    const r = importZip(zip);
    expect(r.ok).toBe(true);
    expect(r.project!.files.map((f) => f.path).sort()).toEqual(["README.md", "src/main.py"]);
    expect(r.skipped).toEqual(["projet-main/logo.png (fichier binaire)"]); // chemin tel que dans l'archive
  });

  it("refuse les chemins dangereux (zip slip)", () => {
    const r = importZip(zipSync({ "../../etc/passwd": strToU8("x"), "ok.txt": strToU8("y") }));
    expect(r.project!.files.map((f) => f.path)).toEqual(["ok.txt"]);
    expect(r.skipped[0]).toContain("chemin refusé");
  });

  it("signale une archive illisible", () => {
    expect(importZip(strToU8("pas un zip")).ok).toBe(false);
  });
});
