import { basename, languageOf } from "./fs";

/**
 * Contenu de départ d'un nouveau fichier, choisi d'après son extension :
 * créer « index.html » donne directement la structure d'une page complète,
 * « Main.java » une classe avec sa méthode main, etc. Un fichier dont le
 * type n'a pas de modèle reste vide.
 */

/** Nom sans extension, réduit aux caractères autorisés dans un identifiant (lettres, chiffres, _). */
function identifier(path: string, fallback: string): string {
  const stem = basename(path).replace(/\.[^.]+$/, "");
  const id = stem.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^A-Za-z0-9_]/g, "_").replace(/^(\d)/, "_$1");
  return id || fallback;
}

export function starterContent(path: string): string {
  const lang = languageOf(path).monaco;
  switch (lang) {
    case "html":
      return `<!DOCTYPE html>
<html lang="fr">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title></title>
</head>

<body>

</body>

</html>
`;
    case "css":
      return `* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: system-ui, sans-serif;
}
`;
    case "javascript":
      return `// Programme JavaScript\n\n`;
    case "typescript":
      return `// Programme TypeScript\n\n`;
    case "python":
      return `# Programme Python\n\n`;
    case "c":
      return /\.h$/i.test(path)
        ? ""
        : ["#include <stdio.h>", "", "int main(void) {", "    ", "    return 0;", "}", ""].join("\n");
    case "java": {
      const cls = identifier(path, "Main");
      return [`public class ${cls} {`, "    public static void main(String[] args) {", "        ", "    }", "}", ""].join("\n");
    }
    case "pseudocode": {
      const name = identifier(path, "Programme");
      return [`ALGORITHME ${name}`, "VARIABLES", "  x : ENTIER", "DEBUT", "  ", "FIN", ""].join("\n");
    }
    case "kplus":
      return `# Programme K+\n\n`;
    case "php":
      return `<?php\n\n`;
    case "sql":
      return `-- Requêtes SQL (exécutées par SQLite dans le navigateur)\n\n`;
    case "markdown":
      return `# ${basename(path).replace(/\.[^.]+$/, "")}\n\n`;
    case "json":
      return `{\n}\n`;
    default:
      return "";
  }
}

/** Position (ligne, colonne) où placer le curseur après la création, ou null. */
export function starterCursor(path: string): { line: number; column: number } | null {
  const content = starterContent(path);
  if (!content) return null;
  const lines = content.split("\n");
  const lang = languageOf(path).monaco;
  // HTML : entre <title> et </title> ; C, Java, pseudocode : la ligne vide du corps.
  if (lang === "html") {
    const i = lines.findIndex((l) => l.includes("<title></title>"));
    return { line: i + 1, column: lines[i].indexOf("</title>") + 1 };
  }
  if (lang === "c" || lang === "java" || lang === "pseudocode") {
    const i = lines.findIndex((l) => l.trim() === "" && l.length > 0);
    if (i >= 0) return { line: i + 1, column: lines[i].length + 1 };
  }
  return { line: lines.length, column: 1 };
}
