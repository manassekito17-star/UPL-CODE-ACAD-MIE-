import type { Monaco } from "@monaco-editor/react";
import type { editor, Position } from "monaco-editor";

const KEYWORDS = [
  "ALGORITHME", "PROGRAMME", "CONSTANTES", "CONSTANTE", "VARIABLES", "VARIABLE", "VAR", "DEBUT", "FIN",
  "SI", "ALORS", "SINON", "FINSI", "POUR", "DE", "PAS", "FAIRE", "FINPOUR", "TANTQUE", "TANT", "QUE",
  "FINTANTQUE", "REPETER", "JUSQUA", "SELON", "CAS", "AUTRE", "FINSELON", "FONCTION", "FINFONCTION",
  "PROCEDURE", "FINPROCEDURE", "RETOURNER", "ECRIRE", "AFFICHER", "LIRE", "SAISIR", "ET", "OU", "NON",
  "DIV", "MOD", "VRAI", "FAUX", "TABLEAU",
  // Formes accentuées (« Début », « écrire »…) ; « A » seul est exclu pour ne pas colorer une variable « a ».
  "DÉBUT", "À", "RÉPÉTER", "JUSQUÀ", "ÉCRIRE", "PROCÉDURE", "FINPROCÉDURE",
];
const TYPES = ["ENTIER", "REEL", "CHAINE", "CARACTERE", "BOOLEEN", "RÉEL", "CHAÎNE", "CARACTÈRE", "BOOLÉEN"];
const BUILTINS = ["LONGUEUR", "TAILLE", "RACINE", "ABS", "ENT", "ARRONDI", "PUISSANCE", "MIN", "MAX", "ALEA", "MAJUSCULE", "MINUSCULE", "SOUSCHAINE", "EXTRAIRE", "CONCAT", "CHAINE", "ENTIER", "REEL", "ORD", "CHR"];

const SNIPPETS: Array<{ label: string; insert: string; doc: string }> = [
  { label: "ALGORITHME", insert: "ALGORITHME ${1:Nom}\nVARIABLES\n  ${2:x} : ${3:ENTIER}\nDEBUT\n  $0\nFIN", doc: "Structure complète d'un algorithme" },
  { label: "SI", insert: "SI ${1:condition} ALORS\n  $0\nFINSI", doc: "Condition simple" },
  { label: "SI … SINON", insert: "SI ${1:condition} ALORS\n  $2\nSINON\n  $0\nFINSI", doc: "Condition avec alternative" },
  { label: "POUR", insert: "POUR ${1:i} DE ${2:1} A ${3:n} FAIRE\n  $0\nFINPOUR", doc: "Boucle avec compteur" },
  { label: "TANT QUE", insert: "TANT QUE ${1:condition} FAIRE\n  $0\nFINTANTQUE", doc: "Boucle conditionnelle" },
  { label: "REPETER", insert: "REPETER\n  $0\nJUSQU'A ${1:condition}", doc: "Boucle exécutée au moins une fois" },
  { label: "SELON", insert: "SELON ${1:x}\n  CAS ${2:1} : $3\n  AUTRE : $0\nFINSELON", doc: "Choix multiple" },
  { label: "FONCTION", insert: "FONCTION ${1:nom}(${2:x} : ${3:ENTIER}) : ${4:ENTIER}\nDEBUT\n  $0\n  RETOURNER ${5:x}\nFIN", doc: "Fonction qui retourne une valeur" },
  { label: "PROCEDURE", insert: "PROCEDURE ${1:nom}(${2:x} : ${3:ENTIER})\nDEBUT\n  $0\nFIN", doc: "Procédure" },
  { label: "ECRIRE", insert: "ECRIRE(${1:\"texte\"})", doc: "Afficher" },
  { label: "LIRE", insert: "LIRE(${1:x})", doc: "Lire une valeur" },
];

let registered = false;

export function registerPseudocode(monaco: Monaco) {
  if (registered) return;
  registered = true;
  monaco.languages.register({ id: "pseudocode" });
  monaco.languages.setMonarchTokensProvider("pseudocode", {
    ignoreCase: true,
    keywords: KEYWORDS,
    typeKeywords: TYPES,
    builtins: BUILTINS,
    tokenizer: {
      root: [
        [/\/\/.*$/, "comment"],
        [/#.*$/, "comment"],
        [/\/\*/, "comment", "@comment"],
        [/JUSQU'[AÀ]/i, "keyword"],
        [/"[^"]*"/, "string"],
        [/«[^»]*»/, "string"],
        [/'[^']*'/, "string"],
        [/\d+(\.\d+)?/, "number"],
        [/[a-zA-ZÀ-ÿ_][\wÀ-ÿ]*/, { cases: { "@typeKeywords": "type", "@builtins": "predefined", "@keywords": "keyword", "@default": "identifier" } }],
        [/←|<-|<=|>=|<>|[=<>+\-*/^]/, "operator"],
      ],
      comment: [
        [/\*\//, "comment", "@pop"],
        [/./, "comment"],
      ],
    },
  });
  monaco.languages.setLanguageConfiguration("pseudocode", {
    comments: { lineComment: "//", blockComment: ["/*", "*/"] },
    brackets: [["(", ")"], ["[", "]"]],
    autoClosingPairs: [{ open: "(", close: ")" }, { open: "[", close: "]" }, { open: '"', close: '"' }],
    indentationRules: {
      increaseIndentPattern: /^\s*(DEBUT|SI\b.*ALORS|SINON|POUR\b.*|TANT\s*QUE\b.*|TANTQUE\b.*|REPETER|SELON\b.*|VARIABLES|CONSTANTES|FONCTION\b.*|PROCEDURE\b.*)\s*$/i,
      decreaseIndentPattern: /^\s*(FIN|FINSI|FIN\s+SI|SINON|FINPOUR|FIN\s+POUR|FINTANTQUE|FIN\s+TANT\s+QUE|JUSQU'A|FINSELON|FINFONCTION|FINPROCEDURE)\b/i,
    },
  });
  monaco.languages.registerCompletionItemProvider("pseudocode", {
    provideCompletionItems(model: editor.ITextModel, position: Position) {
      const word = model.getWordUntilPosition(position);
      const range = { startLineNumber: position.lineNumber, endLineNumber: position.lineNumber, startColumn: word.startColumn, endColumn: word.endColumn };
      const K = monaco.languages.CompletionItemKind;
      return {
        suggestions: [
          ...SNIPPETS.map((s) => ({
            label: s.label,
            kind: K.Snippet,
            insertText: s.insert,
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: s.doc,
            range,
          })),
          ...KEYWORDS.map((k) => ({ label: k, kind: K.Keyword, insertText: k, range })),
          ...TYPES.map((t) => ({ label: t, kind: K.TypeParameter, insertText: t, range })),
          ...BUILTINS.map((b) => ({ label: `${b}()`, kind: K.Function, insertText: `${b}($0)`, insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, range })),
        ],
      };
    },
  });
}
