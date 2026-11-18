import type { Language } from "./ipc";

const fr = {
  "nav.home": "Accueil",
  "nav.apps": "Applications",
  "nav.settings": "Paramètres",
  "app.sheets": "Sheets",
  "app.word": "Word",
  "app.slides": "Slides",
  "app.sheets.desc": "Tableur : formules réelles, plusieurs feuilles, XLSX, ODS et CSV.",
  "app.word.desc": "Traitement de texte : styles, tableaux, pagination, DOCX, ODT et PDF.",
  "app.slides.desc": "Présentations : thèmes, formes, notes, mode présentation, PPTX et PDF.",
  "status.phase": "Phase {n} — pas encore disponible",
  "status.soon": "Phase {n}",
  "home.title": "Bienvenue dans ZYNORA Office",
  "home.subtitle": "Suite bureautique indépendante, utilisable hors connexion.",
  "home.foundations": "Fondations en place",
  "home.foundations.desc":
    "Cette version contient le socle de l'application : stockage local, sécurité, thèmes et langues. Les éditeurs arrivent phase après phase ; chacun ne sera activé qu'une fois réellement fonctionnel et testé.",
  "system.title": "Système",
  "system.version": "Version",
  "system.schema": "Schéma de la base locale",
  "system.platform": "Plateforme",
  "system.offline": "Connexion Internet",
  "system.offline.value": "Non requise",
  "settings.title": "Paramètres",
  "settings.appearance": "Apparence",
  "settings.appearance.desc": "Le mode « Système » suit le réglage clair ou sombre de votre ordinateur.",
  "settings.theme": "Thème",
  "settings.theme.light": "Clair",
  "settings.theme.dark": "Sombre",
  "settings.theme.system": "Système",
  "settings.language": "Langue",
  "settings.language.desc": "Langue de l'interface.",
  "settings.journal": "Journal des opérations",
  "settings.journal.desc": "Opérations sensibles enregistrées sur cet ordinateur uniquement (jamais le contenu des documents).",
  "settings.journal.empty": "Aucune opération enregistrée.",
  "settings.journal.refresh": "Actualiser",
  "error.title": "Une erreur est survenue",
  "error.retry": "Réessayer",
  "error.not_in_tauri": "ZYNORA Office doit être lancé depuis l'application de bureau (pnpm dev), pas dans un navigateur.",
  loading: "Chargement…",
} as const;

export type MessageKey = keyof typeof fr;

const en: Record<MessageKey, string> = {
  "nav.home": "Home",
  "nav.apps": "Applications",
  "nav.settings": "Settings",
  "app.sheets": "Sheets",
  "app.word": "Word",
  "app.slides": "Slides",
  "app.sheets.desc": "Spreadsheets: real formulas, multiple sheets, XLSX, ODS and CSV.",
  "app.word.desc": "Word processing: styles, tables, pagination, DOCX, ODT and PDF.",
  "app.slides.desc": "Presentations: themes, shapes, notes, slideshow mode, PPTX and PDF.",
  "status.phase": "Phase {n} — not available yet",
  "status.soon": "Phase {n}",
  "home.title": "Welcome to ZYNORA Office",
  "home.subtitle": "An independent office suite that works offline.",
  "home.foundations": "Foundations in place",
  "home.foundations.desc":
    "This build contains the application core: local storage, security, themes and languages. Editors arrive phase by phase; each one is enabled only once it actually works and is tested.",
  "system.title": "System",
  "system.version": "Version",
  "system.schema": "Local database schema",
  "system.platform": "Platform",
  "system.offline": "Internet connection",
  "system.offline.value": "Not required",
  "settings.title": "Settings",
  "settings.appearance": "Appearance",
  "settings.appearance.desc": "“System” follows your computer's light or dark setting.",
  "settings.theme": "Theme",
  "settings.theme.light": "Light",
  "settings.theme.dark": "Dark",
  "settings.theme.system": "System",
  "settings.language": "Language",
  "settings.language.desc": "Interface language.",
  "settings.journal": "Activity log",
  "settings.journal.desc": "Sensitive operations recorded on this computer only (never document content).",
  "settings.journal.empty": "No operations recorded.",
  "settings.journal.refresh": "Refresh",
  "error.title": "Something went wrong",
  "error.retry": "Try again",
  "error.not_in_tauri": "ZYNORA Office must run inside the desktop application (pnpm dev), not in a browser.",
  loading: "Loading…",
};

const dictionaries: Record<Language, Record<MessageKey, string>> = { fr, en };

export type Translate = (key: MessageKey, vars?: Record<string, string | number>) => string;

export function translator(language: Language): Translate {
  const dictionary = dictionaries[language];
  return (key, vars) =>
    dictionary[key].replace(/\{(\w+)\}/g, (match, name: string) => (vars && name in vars ? String(vars[name]) : match));
}
