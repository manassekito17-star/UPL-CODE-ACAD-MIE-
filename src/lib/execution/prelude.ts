import type { SourceFile } from "./types";

/**
 * Fonction lireLigne() pour JavaScript côté serveur (Node.js).
 * Ajoutée sur UNE seule ligne en FIN de fichier : la déclaration de fonction
 * est « remontée » (hoisting), et les numéros de ligne des erreurs restent exacts.
 */
export const NODE_INPUT_PRELUDE =
  'function lireLigne(){if(!lireLigne.l){lireLigne.l=require("fs").readFileSync(0,"utf8").split(/\\r?\\n/);lireLigne.p=0;}return lireLigne.p<lireLigne.l.length?lireLigne.l[lireLigne.p++]:null;}';

export function withNodePrelude(code: string): string {
  return `${code}\n;${NODE_INPUT_PRELUDE}\n`;
}

/**
 * Programme Python multi-fichiers : les modules secondaires sont écrits sur
 * le disque du bac à sable avant d'exécuter main.py. Le code principal est
 * compilé avec son vrai nom de fichier : les numéros de ligne des erreurs
 * restent exacts.
 */
export function bundlePythonFiles(files: SourceFile[]): string {
  if (files.length <= 1) return files[0]?.content ?? "";
  const [main, ...others] = files;
  const payload = JSON.stringify(Object.fromEntries(others.map((f) => [f.name, f.content])));
  return [
    "import json as _j, sys as _s",
    `for _n, _c in _j.loads(${JSON.stringify(payload)}).items():`,
    "    open(_n, 'w', encoding='utf-8').write(_c)",
    "_s.path.insert(0, '.')",
    `_src = ${JSON.stringify(main.content)}`,
    `exec(compile(_src, ${JSON.stringify(main.name)}, 'exec'), {'__name__': '__main__'})`,
  ].join("\n");
}
