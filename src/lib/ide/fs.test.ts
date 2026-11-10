import { describe, expect, it } from "vitest";
import { buildPreviewDocument } from "@/lib/execution/web-document";
import {
  allFolders,
  buildTree,
  copyPath,
  countInside,
  createFile,
  createFolder,
  deletePath,
  languageOf,
  movePath,
  normalizePath,
  previewFiles,
  relativePath,
  runFiles,
  searchProject,
  symbolsOf,
  updateFile,
  validateSnapshot,
  type ProjectSnapshot,
} from "./fs";
import { PROJECT_TEMPLATES } from "./templates";

const webTpl = PROJECT_TEMPLATES.find((t) => t.id === "web")!;
const web: ProjectSnapshot = { files: webTpl.files, folders: [] };
const ok = (r: ReturnType<typeof createFile>) => {
  if (!r.ok) throw new Error(r.error);
  return r.project;
};

describe("chemins", () => {
  it("normalise et refuse les chemins dangereux", () => {
    expect(normalizePath("./src//main.py")).toBe("src/main.py");
    expect(normalizePath("a\\b.txt")).toBe("a/b.txt");
    for (const bad of ["../secret", "a/../../b", "", "/", "a/<b>.txt", " espace.txt"]) expect(normalizePath(bad), bad).toBeNull();
  });
  it("calcule un chemin relatif", () => {
    expect(relativePath("", "css/style.css")).toBe("css/style.css");
    expect(relativePath("pages", "css/style.css")).toBe("../css/style.css");
    expect(relativePath("a/b", "a/c.js")).toBe("../c.js");
  });
});

describe("opérations de l'explorateur", () => {
  it("crée fichiers et dossiers, refuse les doublons", () => {
    let p = ok(createFolder(web, "images"));
    expect(allFolders(p)).toEqual(["css", "images", "js"]);
    p = ok(createFile(p, "images/logo.svg", "<svg/>"));
    expect(p.folders).toEqual([]); // dossier désormais déduit du fichier
    expect(createFile(p, "index.html").ok).toBe(false);
    expect(createFolder(p, "index.html").ok).toBe(false);
    expect(createFile(p, "index.html/x.txt").ok).toBe(false);
  });

  it("arborescence : dossiers d'abord, ordre alphabétique", () => {
    const tree = buildTree(web);
    expect(tree.map((n) => n.name)).toEqual(["css", "js", "index.html"]);
    expect(tree[0].children.map((n) => n.path)).toEqual(["css/style.css"]);
  });

  it("renomme et déplace un dossier avec son contenu", () => {
    const p = ok(movePath(web, "css", "assets/styles"));
    expect(p.files.map((f) => f.path).sort()).toEqual(["assets/styles/style.css", "index.html", "js/script.js"]);
    expect(movePath(web, "css", "css/sous").ok).toBe(false);
    expect(movePath(web, "css/style.css", "js/script.js").ok).toBe(false);
  });

  it("copie un fichier ou un dossier sans écraser", () => {
    let p = ok(copyPath(web, "index.html"));
    expect(p.files.some((f) => f.path === "index (copie).html")).toBe(true);
    p = ok(copyPath(p, "index.html"));
    expect(p.files.some((f) => f.path === "index (copie 2).html")).toBe(true);
    p = ok(copyPath(web, "css"));
    expect(p.files.some((f) => f.path === "css (copie)/style.css")).toBe(true);
  });

  it("supprime un dossier et compte les fichiers concernés", () => {
    expect(countInside(web, "css")).toBe(1);
    const p = ok(deletePath(web, "css"));
    expect(p.files.some((f) => f.path.startsWith("css/"))).toBe(false);
    expect(allFolders(p)).toEqual(["js"]);
  });

  it("modifie un fichier et applique les limites", () => {
    expect(ok(updateFile(web, "js/script.js", "x")).files.find((f) => f.path === "js/script.js")!.content).toBe("x");
    expect(updateFile(web, "absent.js", "x").ok).toBe(false);
    expect(updateFile(web, "index.html", "a".repeat(300_001)).ok).toBe(false);
  });

  it("valide un instantané reçu (import, API)", () => {
    expect(validateSnapshot({ files: [{ path: "../x", content: "" }], folders: [] }).ok).toBe(false);
    expect(validateSnapshot({ files: [{ path: "a.txt", content: "" }, { path: "./a.txt", content: "" }], folders: [] }).ok).toBe(false);
    expect(validateSnapshot({ files: [{ path: "a", content: "" }, { path: "a/b", content: "" }], folders: [] }).ok).toBe(false);
    expect(validateSnapshot({ files: [{ path: "src/a.py", content: "" }], folders: ["src", "vide"] })).toEqual({ ok: true, project: { files: [{ path: "src/a.py", content: "" }], folders: ["vide"] } });
  });
});

describe("langages, exécution, aperçu, recherche", () => {
  it("détecte le langage et l'exécutabilité réelle", () => {
    expect(languageOf("a/main.py")).toMatchObject({ monaco: "python", run: "python" });
    expect(languageOf("app.ts").run).toBeUndefined(); // pas de moteur TypeScript branché
    expect(languageOf("index.html").preview).toBe(true);
    expect(languageOf("notes").monaco).toBe("plaintext");
  });

  it("exécute le fichier actif avec les modules du même dossier", () => {
    const py = { files: PROJECT_TEMPLATES.find((t) => t.id === "python")!.files, folders: [] };
    expect(runFiles(py, "main.py")).toEqual({ language: "python", files: [py.files[0], py.files[1]].map((f) => ({ name: f.path, content: f.content })) });
    expect(runFiles(web, "index.html")).toBeNull();
  });

  it("PHP : tout le projet (dossiers compris) est transmis, le fichier actif en premier ; SQL : le script actif seul", () => {
    const php = { files: PROJECT_TEMPLATES.find((t) => t.id === "php")!.files, folders: ["includes", "css"] };
    const r = runFiles(php, "includes/functions.php")!;
    expect(r.language).toBe("php");
    expect(r.files[0].name).toBe("includes/functions.php");
    expect(r.files.map((f) => f.name).sort()).toEqual(php.files.map((f) => f.path).sort());
    const sql = { files: [...PROJECT_TEMPLATES.find((t) => t.id === "sql")!.files, { path: "autre.sql", content: "SELECT 2;" }], folders: [] };
    expect(runFiles(sql, "autre.sql")).toEqual({ language: "sql", files: [{ name: "autre.sql", content: "SELECT 2;" }] });
  });

  it("aperçu d'une page située dans un sous-dossier", () => {
    const p = ok(createFile(web, "pages/contact.html", '<html><head><link rel="stylesheet" href="../css/style.css"></head><body><h1>Contact</h1></body></html>'));
    const doc = buildPreviewDocument(previewFiles(p, "pages/contact.html"));
    expect(doc).toContain("<h1>Contact</h1>");
    expect(doc).toContain("color: #1d5fe0"); // feuille de style résolue depuis ../css
    expect(buildPreviewDocument(previewFiles(web, "index.html"))).toContain('console.log("Bouton cliqué !")');
  });

  it("recherche dans tous les fichiers", () => {
    const r = searchProject(web, "BOUTON");
    expect([...new Set(r.map((x) => x.path))]).toEqual(["index.html", "js/script.js"]);
    expect(r.every((x) => x.text.toLowerCase().includes("bouton"))).toBe(true);
    expect(searchProject(web, "BOUTON", { caseSensitive: true })).toEqual([]);
  });

  it("chaque modèle est valide", () => {
    for (const t of PROJECT_TEMPLATES) {
      expect(validateSnapshot({ files: t.files, folders: t.folders ?? [] }).ok, t.id).toBe(true);
      expect(t.files.some((f) => f.path === t.open), t.id).toBe(true);
    }
  });
});

describe("symboles", () => {
  it("repère fonctions et classes selon le langage", () => {

    expect(symbolsOf("a.py", "import x\ndef f(a):\n    pass\nclass Etudiant:\n    def nom(self):\n        return 1").map((s) => [s.name, s.kind, s.line])).toEqual([
      ["f", "fonction", 2],
      ["Etudiant", "classe", 4],
      ["nom", "fonction", 5],
    ]);
    expect(symbolsOf("a.js", "function a() {}\nconst b = (x) => x;\nexport class C {}\nif (x) {}").map((s) => s.name)).toEqual(["a", "b", "C"]);
    expect(symbolsOf("m.c", "#include <stdio.h>\nint somme(int a, int b) {\n  return a + b;\n}\nint main(void) {\n  if (x) {\n  }\n}").map((s) => s.name)).toEqual(["somme", "main"]);
    expect(symbolsOf("Main.java", "public class Main {\n  public static void main(String[] args) {\n  }\n  private int calcul(int x) {\n  }\n}").map((s) => s.name)).toEqual(["Main", "main", "calcul"]);
    expect(symbolsOf("x.algo", "ALGORITHME Test\nFONCTION carre(x : ENTIER) : ENTIER\nPROCEDURE afficher()").map((s) => s.kind)).toEqual(["algorithme", "fonction", "procédure"]);
  });
});
