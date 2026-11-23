import type { ProjectSnapshot } from "@/lib/ide/fs";
import { DEFAULT_SETTINGS_TEXT } from "./settings";

/** Session de ZENTECH Texte, gardée sur l'appareil (fermeture et réouverture sans rien perdre). */
export type Layout = "1" | "2col" | "2lig";

export interface Workspace {
  version: 1;
  project: ProjectSnapshot;
  /** Contenu au dernier enregistrement (Ctrl+S) : un onglet modifié depuis affiche un point. */
  saved: Record<string, string>;
  groups: Array<{ tabs: string[]; active: string | null }>;
  layout: Layout;
  focused: number;
  sidebar: boolean;
  settingsText: string;
  /** Syntaxe choisie à la main (Affichage » Syntaxe) par fichier. */
  syntax: Record<string, string>;
}

export const SETTINGS_PATH = "Préférences.json";
export const STORE_KEY = "zentech:texte:session";

export function starterWorkspace(): Workspace {
  const files = [
    {
      path: "LISEZMOI.md",
      content: `# Bienvenue dans ZENTECH Texte

Un éditeur rapide pour écrire du code, avec les raccourcis des éditeurs de texte pour développeurs.

## À essayer tout de suite
- **Ctrl+P** : aller à un fichier (tapez quelques lettres). Ajoutez **@** pour une fonction, **:** pour une ligne, **#** pour un mot.
- **Ctrl+Maj+P** : palette de commandes (toutes les actions).
- **Ctrl+D** : sélectionner le mot, puis son occurrence suivante (plusieurs curseurs).
- **Ctrl+F** puis **Alt+Entrée** : sélectionner toutes les occurrences trouvées.
- **Ctrl+B** : exécuter le fichier (Python, JavaScript, pseudocode, PHP, SQL, C, Java).
- **Alt+Maj+2** : deux colonnes. **Maj+F11** : mode sans distraction.
- **Ctrl+K puis Ctrl+B** : afficher ou masquer la barre latérale.

Tout est gardé sur cet appareil : fermez la page, vos fichiers et onglets seront là au retour.
`,
    },
    {
      path: "python/main.py",
      content: `def moyenne(notes):
    return sum(notes) / len(notes)


notes = [12, 15.5, 9, 17]
print("Moyenne :", round(moyenne(notes), 2))
for n in notes:
    print(n, "admis" if n >= 10 else "ajourné")
`,
    },
    {
      path: "web/index.html",
      content: `<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Ma page</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <h1>Bonjour</h1>
  <button id="bouton">Compter</button>
  <p id="resultat">0</p>
  <script src="script.js"></script>
</body>
</html>
`,
    },
    { path: "web/style.css", content: `body {\n  font-family: system-ui, sans-serif;\n  margin: 2rem;\n}\n\nh1 {\n  color: #1e66f5;\n}\n` },
    { path: "web/script.js", content: `let compteur = 0;\ndocument.getElementById("bouton").addEventListener("click", () => {\n  compteur++;\n  document.getElementById("resultat").textContent = compteur;\n  console.log("compteur =", compteur);\n});\n` },
    { path: "algo/somme.algo", content: `ALGORITHME Somme\nVARIABLES\n  i, s : ENTIER\nDEBUT\n  s ← 0\n  POUR i DE 1 A 10 FAIRE\n    s ← s + i\n  FINPOUR\n  ECRIRE("Somme = ", s)\nFIN\n` },
  ];
  return {
    version: 1,
    project: { files, folders: [] },
    saved: Object.fromEntries(files.map((f) => [f.path, f.content])),
    groups: [{ tabs: ["LISEZMOI.md", "python/main.py"], active: "LISEZMOI.md" }],
    layout: "1",
    focused: 0,
    sidebar: true,
    settingsText: DEFAULT_SETTINGS_TEXT,
    syntax: {},
  };
}

/** Lit une session gardée ; null si absente ou illisible. */
export function readWorkspace(raw: string | null): Workspace | null {
  if (!raw) return null;
  try {
    const w = JSON.parse(raw) as Workspace;
    if (w?.version !== 1 || !Array.isArray(w.project?.files) || !Array.isArray(w.groups) || !w.groups.length) return null;
    const paths = new Set([...w.project.files.map((f) => f.path), SETTINGS_PATH]);
    const groups = w.groups.slice(0, 2).map((g) => {
      const tabs = (g.tabs ?? []).filter((t) => paths.has(t));
      return { tabs, active: g.active && tabs.includes(g.active) ? g.active : (tabs[0] ?? null) };
    });
    return {
      ...w,
      project: { files: w.project.files, folders: Array.isArray(w.project.folders) ? w.project.folders : [] },
      saved: w.saved ?? {},
      groups,
      layout: w.layout === "2col" || w.layout === "2lig" ? w.layout : "1",
      focused: Math.min(w.focused ?? 0, groups.length - 1),
      sidebar: w.sidebar !== false,
      settingsText: typeof w.settingsText === "string" ? w.settingsText : DEFAULT_SETTINGS_TEXT,
      syntax: w.syntax ?? {},
    };
  } catch {
    return null;
  }
}
