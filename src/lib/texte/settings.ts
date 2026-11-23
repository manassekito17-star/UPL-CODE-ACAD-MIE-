/**
 * Préférences de ZENTECH Texte, écrites comme un fichier de réglages JSON (commentaires // et
 * virgules finales acceptés, à la façon des éditeurs de texte pour développeurs).
 */

export const COLOR_SCHEMES = ["Nuit marine", "Monokai", "Clair"] as const;
export type ColorScheme = (typeof COLOR_SCHEMES)[number];

export interface TexteSettings {
  font_size: number;
  tab_size: number;
  translate_tabs_to_spaces: boolean;
  word_wrap: boolean;
  color_scheme: ColorScheme;
  draw_white_space: "none" | "selection" | "all";
  rulers: number[];
  highlight_line: boolean;
  line_numbers: boolean;
  minimap: boolean;
  auto_complete: boolean;
  auto_close_brackets: boolean;
  scroll_past_end: boolean;
  caret_style: "smooth" | "blink" | "solid" | "phase";
  fold_buttons: boolean;
  save_on_focus_lost: boolean;
}

export const DEFAULT_SETTINGS: TexteSettings = {
  font_size: 15,
  tab_size: 4,
  translate_tabs_to_spaces: true,
  word_wrap: false,
  color_scheme: "Nuit marine",
  draw_white_space: "selection",
  rulers: [],
  highlight_line: true,
  line_numbers: true,
  minimap: true,
  auto_complete: true,
  auto_close_brackets: true,
  scroll_past_end: true,
  caret_style: "smooth",
  fold_buttons: true,
  save_on_focus_lost: false,
};

/** Fichier de préférences proposé au départ (modifiable, enregistré avec Ctrl+S). */
export const DEFAULT_SETTINGS_TEXT = `// Préférences de ZENTECH Texte.
// Modifiez une valeur puis enregistrez (Ctrl+S) : le changement s'applique tout de suite.
{
\t// Taille du texte (aussi : Ctrl+= et Ctrl+-)
\t"font_size": 15,

\t// Largeur d'une tabulation et remplacement des tabulations par des espaces
\t"tab_size": 4,
\t"translate_tabs_to_spaces": true,

\t// Retour à la ligne automatique des lignes longues
\t"word_wrap": false,

\t// Thème : "Nuit marine", "Monokai" ou "Clair"
\t"color_scheme": "Nuit marine",

\t// Espaces visibles : "none", "selection" ou "all"
\t"draw_white_space": "selection",

\t// Règles verticales, par exemple [80, 120]
\t"rulers": [],

\t"highlight_line": true,
\t"line_numbers": true,
\t"minimap": true,
\t"auto_complete": true,
\t"auto_close_brackets": true,
\t"scroll_past_end": true,

\t// Curseur : "smooth", "blink", "solid" ou "phase"
\t"caret_style": "smooth",
\t"fold_buttons": true,

\t// Enregistrer quand on quitte l'éditeur
\t"save_on_focus_lost": false,
}
`;

/** Retire les commentaires // et /* *\/ hors chaînes, et les virgules avant } ou ]. */
export function stripJsonComments(text: string): string {
  return text
    .replace(/("(?:\\.|[^"\\])*")|\/\/[^\n]*|\/\*[\s\S]*?\*\//g, (m, str: string | undefined) => str ?? "")
    .replace(/,(\s*[}\]])/g, "$1");
}

/**
 * Lit le fichier de préférences. Les clés inconnues ou de mauvais type sont ignorées (signalées dans
 * `warnings`) ; un JSON invalide renvoie une erreur et les préférences par défaut.
 */
export function parseSettings(text: string): { settings: TexteSettings; error: string | null; warnings: string[] } {
  let raw: unknown;
  try {
    raw = JSON.parse(stripJsonComments(text));
  } catch (e) {
    return { settings: { ...DEFAULT_SETTINGS }, error: `Préférences illisibles : ${(e as Error).message}`, warnings: [] };
  }
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return { settings: { ...DEFAULT_SETTINGS }, error: "Les préférences doivent être un objet { … }.", warnings: [] };
  const out: TexteSettings = { ...DEFAULT_SETTINGS };
  const warnings: string[] = [];
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (!(key in DEFAULT_SETTINGS)) {
      warnings.push(`Réglage inconnu « ${key} » (ignoré).`);
      continue;
    }
    const k = key as keyof TexteSettings;
    const def = DEFAULT_SETTINGS[k];
    const ok =
      k === "color_scheme"
        ? COLOR_SCHEMES.includes(value as ColorScheme)
        : k === "draw_white_space"
          ? ["none", "selection", "all"].includes(value as string)
          : k === "caret_style"
            ? ["smooth", "blink", "solid", "phase"].includes(value as string)
            : k === "rulers"
              ? Array.isArray(value) && value.every((n) => typeof n === "number" && n > 0 && n < 500)
              : k === "font_size"
                ? typeof value === "number" && value >= 8 && value <= 40
                : k === "tab_size"
                  ? typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= 8
                  : typeof value === typeof def;
    if (!ok) {
      warnings.push(`Valeur invalide pour « ${key} » (valeur par défaut gardée).`);
      continue;
    }
    (out as unknown as Record<string, unknown>)[k] = value;
  }
  return { settings: out, error: null, warnings };
}

/** Remplace la valeur d'un réglage dans le texte des préférences (garde les commentaires). */
export function setSettingInText(text: string, key: keyof TexteSettings, value: unknown): string {
  const json = JSON.stringify(value);
  const re = new RegExp(`("${key}"\\s*:\\s*)([^,\\n}]+|\\[[^\\]]*\\])`);
  if (re.test(text)) return text.replace(re, `$1${json}`);
  const end = text.lastIndexOf("}");
  if (end < 0) return text;
  return `${text.slice(0, end).replace(/\s*$/, "")}\n\t"${key}": ${json},\n${text.slice(end)}`;
}
