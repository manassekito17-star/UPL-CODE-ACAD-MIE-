/**
 * Langage K+ dans UPL IDE :
 *  - le moteur copié (public/workers/kplus-moteur.json) est complet ;
 *  - la coloration Monaco connaît exactement les mots-clés et fonctions du moteur ;
 *  - les fichiers .kplus sont reconnus et exécutables ;
 *  - le modèle de projet et le fichier de départ sont des programmes K+ valides,
 *    vérifiés avec le vrai moteur (si python3 est installé, comme pour Python).
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { describe, expect, it } from "vitest";
import { KPLUS_BUILTINS, KPLUS_KEYWORDS } from "@/components/editor/kplus-language";
import { languageOf, runFiles, symbolsOf } from "@/lib/ide/fs";
import { starterContent } from "@/lib/ide/starters";
import { templateById } from "@/lib/ide/templates";
import { toExecutionResult, type KPlusError } from "./index";

const paquet = JSON.parse(readFileSync(join(process.cwd(), "public/workers/kplus-moteur.json"), "utf8")) as {
  version: string;
  fichiers: Record<string, string>;
};

const hasPython = spawnSync("python3", ["--version"]).status === 0;

/** Exécute un programme K+ avec le moteur copié, comme le fait le Web Worker (via pont.py). */
function runWithEngine(source: string, stdin = ""): { statut: string; sortie: string; erreur?: KPlusError } {
  const dir = mkdtempSync(join(tmpdir(), "upl-kplus-"));
  try {
    for (const [name, content] of Object.entries(paquet.fichiers)) {
      mkdirSync(dirname(join(dir, name)), { recursive: true });
      writeFileSync(join(dir, name), content);
    }
    const script = [
      "import json, sys",
      "sys.path.insert(0, sys.argv[1])",
      "import pont",
      "data = json.load(sys.stdin)",
      "out = []",
      "r = json.loads(pont.executer(data['source'], data['stdin'], lambda g, t: out.append(t) if g != 'entree' else None))",
      "r['sortie'] = ''.join(out)",
      "print(json.dumps(r))",
    ].join("\n");
    const p = spawnSync("python3", ["-c", script, dir], { input: JSON.stringify({ source, stdin }), encoding: "utf8" });
    if (p.status !== 0) throw new Error(p.stderr);
    return JSON.parse(p.stdout);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

describe("moteur K+ copié dans UPL", () => {
  it("contient le moteur complet et le pont", () => {
    expect(paquet.version).toMatch(/^\d+\.\d+\.\d+$/);
    for (const f of ["pont.py", "kplus/__init__.py", "kplus/lexer.py", "kplus/parser.py", "kplus/interpreteur.py", "kplus/pile.py"]) {
      expect(paquet.fichiers[f], f).toBeTruthy();
    }
    expect(paquet.fichiers["kplus/__init__.py"]).toContain(`__version__ = "${paquet.version}"`);
  });

  it("coloration : mêmes mots-clés et fonctions natives que le moteur", () => {
    const jetons = paquet.fichiers["kplus/jetons.py"];
    const bloc = /MOTS_CLES = frozenset\(\{([\s\S]*?)\}\)/.exec(jetons)![1];
    const motsCles = new Set([...bloc.matchAll(/"([^"]+)"/g)].map((m) => m[1]));
    for (const alias of /ALIAS_MOTS_CLES = \{([^}]*)\}/.exec(jetons)![1].matchAll(/"([^"]+)":/g)) motsCles.add(alias[1]);
    expect(new Set(KPLUS_KEYWORDS)).toEqual(motsCles);

    const natives = /NATIVES = \{([\s\S]*?)\n\}/.exec(paquet.fichiers["kplus/natives.py"])![1];
    expect(new Set(KPLUS_BUILTINS)).toEqual(new Set([...natives.matchAll(/^\s+"([^"]+)":/gm)].map((m) => m[1])));
  });
});

describe("fichiers .kplus dans UPL IDE", () => {
  it("sont reconnus, exécutables et ont leurs symboles", () => {
    expect(languageOf("cours/main.kplus")).toEqual({ monaco: "kplus", label: "K+", run: "kplus" });
    const tpl = templateById("kplus")!;
    const r = runFiles({ files: tpl.files, folders: [] }, "main.kplus");
    expect(r?.language).toBe("kplus");
    expect(r?.files[0].name).toBe("main.kplus");
    expect(symbolsOf("a.kplus", "variable x = 1\nfonction carré(n)\n    retourner n * n\nfin").map((s) => [s.name, s.kind, s.line])).toEqual([["carré", "fonction", 2]]);
  });

  it("résultat du moteur converti au format de la plateforme", () => {
    const syntaxe: KPlusError = { categorie: "ErreurSyntaxe", nom: "Erreur de syntaxe", message: "m", ligne: 2, colonne: 1, conseil: null, texte: "Erreur de syntaxe (ligne 2, colonne 1) : m" };
    expect(toExecutionResult({ ok: false, erreur: syntaxe })).toMatchObject({ status: "erreur_compilation", compileOutput: syntaxe.texte, stderr: "", errorLine: 2 });
    const division = { ...syntaxe, categorie: "ErreurDivisionParZero", texte: "Erreur de division par zéro (ligne 3, colonne 12) : division par zéro", ligne: 3 };
    expect(toExecutionResult({ ok: false, stdout: "avant\n", erreur: division })).toMatchObject({ status: "erreur_execution", stdout: "avant\n", stderr: division.texte, errorLine: 3 });
    expect(toExecutionResult({ ok: true, stdout: "42\n", timeMs: 3 })).toMatchObject({ status: "ok", stdout: "42\n", timeMs: 3, engine: "navigateur" });
    expect(toExecutionResult({ ok: false, stderr: "Impossible de charger K+", erreur: null }).status).toBe("erreur_interne");
  });
});

describe.skipIf(!hasPython)("programmes K+ exécutés par le vrai moteur", () => {
  it("le modèle de projet K+ fonctionne", () => {
    const main = templateById("kplus")!.files[0].content;
    const r = runWithEngine(main, "Awa\n");
    expect(r.statut).toBe("ok");
    expect(r.sortie).toBe("Votre nom ? Bonjour Awa\n1 au carré = 1\n2 au carré = 4\n3 au carré = 9\n4 au carré = 16\n5 au carré = 25\n");
  });

  it("le fichier de départ est un programme K+ valide", () => {
    expect(runWithEngine(starterContent("exercice.kplus")).statut).toBe("ok");
  });

  it("les erreurs ont une ligne précise", () => {
    const r = runWithEngine('afficher("avant")\nafficher(10 / 0)\n');
    expect(r.statut).toBe("erreur");
    expect(r.sortie).toBe("avant\n");
    expect(r.erreur).toMatchObject({ categorie: "ErreurDivisionParZero", ligne: 2, colonne: 13 });
    expect(runWithEngine("si vrai alors\n").erreur).toMatchObject({ categorie: "ErreurSyntaxe", ligne: 1 });
  });
});
