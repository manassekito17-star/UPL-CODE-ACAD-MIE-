import type { Monaco } from "@monaco-editor/react";
import type { editor, Position } from "monaco-editor";

/**
 * Langage K+ (programmation en français) pour Monaco : coloration, retrait
 * automatique, commentaires et extraits. Les listes suivent la spécification
 * K+ 0.1 ; un test (kplus.test.ts) les compare au moteur copié dans
 * public/workers/kplus-moteur.json.
 */
export const KPLUS_KEYWORDS = [
  "variable", "constante", "fonction", "retourner",
  "si", "alors", "sinon", "fin",
  "tant", "que", "faire", "pour", "chaque", "dans", "de", "à", "pas",
  "arreter", "arrêter", "continuer",
  "essayer", "attraper", "lever",
  "et", "ou", "non",
  "vrai", "faux", "nul",
];
const VALUES = ["vrai", "faux", "nul"];
export const KPLUS_BUILTINS = [
  "afficher", "demander", "texte", "entier", "decimal", "décimal", "type",
  "longueur", "ajouter", "absolu", "racine", "arrondir", "quitter",
];

const SNIPPETS: Array<{ label: string; insert: string; doc: string }> = [
  { label: "si", insert: "si ${1:condition} alors\n\t$0\nfin", doc: "Condition si … alors … fin" },
  { label: "si … sinon", insert: "si ${1:condition} alors\n\t$2\nsinon\n\t$0\nfin", doc: "Condition avec sinon" },
  { label: "tant que", insert: "tant que ${1:condition} faire\n\t$0\nfin", doc: "Boucle tant que" },
  { label: "pour", insert: "pour ${1:i} de ${2:1} à ${3:10} faire\n\t$0\nfin", doc: "Boucle avec compteur" },
  { label: "pour chaque", insert: "pour chaque ${1:element} dans ${2:liste} faire\n\t$0\nfin", doc: "Parcourir une liste ou un texte" },
  { label: "fonction", insert: "fonction ${1:nom}(${2:a})\n\t$0\nfin", doc: "Définir une fonction" },
  { label: "essayer", insert: "essayer\n\t$1\nattraper ${2:erreur}\n\tafficher(\"Erreur : \" + ${2:erreur})\nfin", doc: "Gérer une erreur" },
  { label: "variable", insert: "variable ${1:nom} = ${0:valeur}", doc: "Déclarer une variable" },
];

let registered = false;

export function registerKPlus(monaco: Monaco) {
  if (registered) return;
  registered = true;
  monaco.languages.register({ id: "kplus", extensions: [".kplus"], aliases: ["K+", "kplus"] });
  monaco.languages.setMonarchTokensProvider("kplus", {
    // Lettres accentuées dans les noms et les mots-clés (« à », « arrêter »).
    unicode: true,
    keywords: KPLUS_KEYWORDS.filter((k) => !VALUES.includes(k)),
    values: VALUES,
    builtins: KPLUS_BUILTINS,
    tokenizer: {
      root: [
        [/#.*$/, "comment"],
        [/\/\*/, "comment", "@comment"],
        [/"/, "string", "@texte"],
        [/“/, "string", "@texteTypo"],
        [/\d[\d_]*(\.\d[\d_]*)?([eE][+-]?\d+)?/, "number"],
        [/[\p{L}_][\p{L}\p{M}\p{N}_]*/u, { cases: { "@values": "type", "@keywords": "keyword", "@builtins": "predefined", "@default": "identifier" } }],
        [/==|!=|<=|>=|[=<>+\-*/%^]/, "operator"],
        [/[;@$&|{}'`~?!\\]/, "invalid"],
      ],
      comment: [
        [/\*\//, "comment", "@pop"],
        [/./, "comment"],
      ],
      texte: [
        [/\\[nt"\\]/, "string.escape"],
        [/"/, "string", "@pop"],
        [/[^"\\]+/, "string"],
        [/\\./, "string"],
      ],
      texteTypo: [
        [/\\[nt"\\]/, "string.escape"],
        [/”/, "string", "@pop"],
        [/[^”\\]+/, "string"],
        [/\\./, "string"],
      ],
    },
  });
  monaco.languages.setLanguageConfiguration("kplus", {
    comments: { lineComment: "#", blockComment: ["/*", "*/"] },
    brackets: [["(", ")"], ["[", "]"]],
    autoClosingPairs: [
      { open: "(", close: ")" },
      { open: "[", close: "]" },
      { open: '"', close: '"', notIn: ["string", "comment"] },
      { open: "“", close: "”", notIn: ["string", "comment"] },
    ],
    wordPattern: /[\p{L}_][\p{L}\p{M}\p{N}_]*|-?\d+(?:\.\d+)?/u,
    indentationRules: {
      increaseIndentPattern: /^((?!#).)*\b(alors|faire|sinon|essayer)\s*(#.*)?$|^\s*attraper(\s+[\p{L}_][\p{L}\p{N}_]*)?\s*$|^\s*fonction\s.*\)\s*$/u,
      decreaseIndentPattern: /^\s*(fin|sinon|attraper)\b/,
    },
  });
  monaco.languages.registerCompletionItemProvider("kplus", {
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
          ...KPLUS_KEYWORDS.map((k) => ({ label: k, kind: K.Keyword, insertText: k, range })),
          ...KPLUS_BUILTINS.map((b) => ({ label: `${b}()`, kind: K.Function, insertText: `${b}($0)`, insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, range })),
        ],
      };
    },
  });
}
