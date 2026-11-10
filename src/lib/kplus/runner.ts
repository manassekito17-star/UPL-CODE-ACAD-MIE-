/**
 * Exécution de K+ hors du navigateur : sur le serveur d'exécution (Judge0,
 * langage Python) et dans les tests de contenu (python3 local).
 *
 * Le moteur K+ copié dans public/workers/kplus-moteur.json est joint au
 * programme de l'élève dans un unique fichier Python, comme les programmes
 * Python multi-fichiers (prelude.ts).
 *
 * Une erreur K+ est signalée sur la sortie d'erreur par une ligne
 * « \x1eKPLUS{…json…} », convertie ensuite au format de la plateforme.
 */
import moteur from "../../../public/workers/kplus-moteur.json";
import type { ExecutionResult } from "../execution/types";

const MARQUEUR = "\u001eKPLUS";
/** Fichiers du moteur utiles à l'exécution (pas la ligne de commande ni l'export de site). */
const FICHIERS_UTILES = Object.fromEntries(
  Object.entries((moteur as { fichiers: Record<string, string> }).fichiers).filter(
    ([nom]) => !["kplus/cli.py", "kplus/__main__.py", "kplus/site.py"].includes(nom),
  ),
);

export const KPLUS_ENGINE_VERSION = (moteur as { version: string }).version;

/** Programme Python complet : installe le moteur, exécute le programme K+ avec l'entrée standard. */
export function kplusRunnerSource(program: string): string {
  return [
    "import json as _j, os as _o, sys as _s",
    `for _n, _c in _j.loads(${JSON.stringify(JSON.stringify(FICHIERS_UTILES))}).items():`,
    "    _o.makedirs(_o.path.dirname(_n) or '.', exist_ok=True)",
    "    open(_n, 'w', encoding='utf-8').write(_c)",
    "_s.path.insert(0, '.')",
    "_s.stdin.reconfigure(encoding='utf-8')",
    "_s.stdout.reconfigure(encoding='utf-8')",
    "_s.stderr.reconfigure(encoding='utf-8')",
    "import pont",
    `_r = _j.loads(pont.executer_test(${JSON.stringify(program)}, _s.stdin.read()))`,
    "_s.stdout.write(_r.get('sortie', ''))",
    "if _r['statut'] != 'ok':",
    `    _s.stderr.write(${JSON.stringify(MARQUEUR)} + _j.dumps(_r, ensure_ascii=False) + '\\n')`,
    "    _s.exit(1)",
  ].join("\n");
}

/** Convertit le résultat brut (Judge0 ou python3 local) au format de la plateforme. */
export function fromKPlusRunner(r: ExecutionResult): ExecutionResult {
  const i = r.stderr.indexOf(MARQUEUR);
  if (i < 0) return r;
  const data = JSON.parse(r.stderr.slice(i + MARQUEUR.length).split("\n")[0]) as {
    statut: string;
    message?: string;
    erreur?: { categorie: string; texte: string; ligne: number | null };
  };
  if (data.statut === "scenario") {
    return { ...r, status: "erreur_execution", stderr: `Scénario de test : ${data.message}` };
  }
  const e = data.erreur!;
  const compile = e.categorie === "ErreurLexicale" || e.categorie === "ErreurSyntaxe";
  return {
    ...r,
    status: compile ? "erreur_compilation" : "erreur_execution",
    stderr: compile ? "" : e.texte,
    compileOutput: compile ? e.texte : "",
    errorLine: e.ligne ?? undefined,
  };
}
