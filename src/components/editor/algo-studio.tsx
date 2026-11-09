"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import type { LanguageId } from "@/content/types";
import { runInBrowser, runProgram, warmupPython } from "@/lib/execution/browser";
import { LANGUAGE_IDS, LANGUAGES } from "@/lib/execution/languages";
import { STATUS_LABELS, type ExecutionResult, type SourceFile } from "@/lib/execution/types";
import { buildPreviewDocument } from "@/lib/execution/web-document";
import { OfflineDialog, type InstallPromptEvent } from "../ide/offline-dialog";
import { cn } from "../ui";
import type { MonacoEditor } from "./code-editor";
import { WebPreview, type PreviewConsoleLine } from "./web-preview";

const CodeEditor = dynamic(() => import("./code-editor").then((m) => m.CodeEditor), {
  ssr: false,
  loading: () => <div className="grid h-full place-items-center bg-[#2b2b2b] text-sm text-gray-400">Chargement de l&apos;éditeur…</div>,
});

/**
 * Page Éditeur en plein écran, à la manière d'une application d'interpréteur d'algorithmes :
 * barre d'icônes (menu, exécuter, pas à pas, enregistrer, plus d'options), éditeur gris anthracite,
 * console en panneau, et rangée de symboles de programmation en bas de l'écran.
 * Ni en-tête ni pied de page du site : tout l'écran est consacré au code.
 */

const BG = "#2b2b2b";
const BAR = "#3c3f41";

/** Icônes au trait (24×24). */
const PATHS = {
  menu: "M4 6h16M4 12h16M4 18h16",
  plus: "M12 5v14M5 12h14",
  bug: "M9 9V7a3 3 0 0 1 6 0v2M8 9h8v5a4 4 0 0 1-8 0zM4 13h4M16 13h4M5 8l3 2M19 8l-3 2M5 19l3-2M19 19l-3-2M12 9v9",
  save: "M5 3h11l3 3v15H5zM8 3v6h8V3M8 21v-7h8v7",
  more: "M12 5h.01M12 12h.01M12 19h.01",
  undo: "M9 14L4 9l5-5M4 9h10a6 6 0 0 1 0 12h-3",
  redo: "M15 14l5-5-5-5M20 9H10a6 6 0 0 0 0 12h3",
  copy: "M9 9h11v11H9zM5 15H4V4h11v1",
  paste: "M8 4h8v3H8zM6 5H4v16h16V5h-2",
  clear: "M6 6l12 12M18 6L6 18",
  search: "M11 4a7 7 0 1 1 0 14 7 7 0 0 1 0-14zm5 12 4 4",
  replace: "M4 7h11l-3-3M20 17H9l3 3M18 7a4 4 0 0 1 0 6M6 17a4 4 0 0 1 0-6",
  share: "M18 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM6 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM18 22a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM8.6 13.5l6.8 4M15.4 6.5l-6.8 4",
  download: "M12 4v11M7 10l5 5 5-5M5 20h14",
  code: "M8 6l-6 6 6 6M16 6l6 6-6 6",
  help: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM9.1 9a3 3 0 0 1 5.8 1c0 2-3 2.5-3 4.5M12 17.5h.01",
  training: "M9 4h6v3H9zM7 5H5v16h14V5h-2M9 12h6M9 16h4",
  settings: "M12 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6zM19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.3.9a7 7 0 0 0-2-1.2L14.2 3h-4l-.4 2.6a7 7 0 0 0-2 1.2l-2.3-.9-2 3.4 2 1.5a7 7 0 0 0 0 2.4l-2 1.5 2 3.4 2.3-.9a7 7 0 0 0 2 1.2l.4 2.6h4l.4-2.6a7 7 0 0 0 2-1.2l2.3.9 2-3.4-2-1.5c.1-.4.1-.8.1-1.2z",
  terminal: "M4 5h16v14H4zM7 9l3 3-3 3M12 15h5",
  back: "M15 6l-6 6 6 6",
  folder: "M3 6h6l2 2h10v11H3z",
  phone: "M7 2h10v20H7zM11 18h2M12 6v7M9 10l3 3 3-3",
  home: "M3 12l9-8 9 8M5 10v10h14V10",
} as const;

function Icon({ name, className = "h-6 w-6" }: { name: keyof typeof PATHS; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d={PATHS[name]} />
    </svg>
  );
}

/** Exemples d'algorithmes prêts à exécuter (avec leurs entrées). */
const EXAMPLES: Array<{ title: string; code: string; stdin: string }> = [
  {
    title: "Somme de deux nombres",
    code: `Algorithme sommeDeuxNombres
Variables a, b, som : entier
Début
  écrire("Entrez un nombre a : ")
  lire(a)
  écrire("Entrez un nombre b : ")
  lire(b)
  som <- a + b
  écrire(a, " + ", b, " = ", som)
Fin`,
    stdin: "7\n12",
  },
  {
    title: "Somme des entiers de 1 à n",
    code: `Algorithme sommeNombres
Variables n, i, s : entier
Début
  écrire("Entrez un nombre : ")
  lire(n)
  s <- 0
  Pour i <- 1 à n Faire
    s <- s + i
  FinPour
  écrire("Somme = ", s)
Fin`,
    stdin: "5",
  },
  {
    title: "Plus grand de trois nombres",
    code: `Algorithme maximum
Variables a, b, c, max : réel
Début
  lire(a)
  lire(b)
  lire(c)
  max <- a
  Si b > max Alors
    max <- b
  FinSi
  Si c > max Alors
    max <- c
  FinSi
  écrire("Le plus grand est ", max)
Fin`,
    stdin: "4\n19\n7",
  },
  {
    title: "Table de multiplication",
    code: `Algorithme table
Variables n, i : entier
Début
  écrire("Table de : ")
  lire(n)
  Pour i <- 1 à 10 Faire
    écrire(n, " x ", i, " = ", n * i)
  FinPour
Fin`,
    stdin: "7",
  },
  {
    title: "Pair ou impair",
    code: `Algorithme parite
Variable n : entier
Début
  lire(n)
  Si n mod 2 = 0 Alors
    écrire(n, " est pair")
  Sinon
    écrire(n, " est impair")
  FinSi
Fin`,
    stdin: "14",
  },
  {
    title: "Lire une chaîne",
    code: `Algorithme lireChaine
Variable ch : chaîne
Début
  écrire("Entrez une chaîne de caractères : ")
  lire(ch)
  écrire("Vous avez écrit : ", ch)
Fin`,
    stdin: "Bonjour UPL",
  },
];

/** Rangée de symboles de programmation (en bas de l'écran). */
type Key = { label: string; title: string; text?: string; command?: "tab" | "cursorLeft" | "cursorRight" };
function keysFor(language: LanguageId): Key[] {
  const t = (s: string, title = s): Key => ({ label: s, title, text: s });
  const nav: Key[] = [
    { label: "⇥", title: "Tabulation", command: "tab" },
    { label: "←", title: "Caractère précédent", command: "cursorLeft" },
    { label: "→", title: "Caractère suivant", command: "cursorRight" },
  ];
  if (language === "pseudocode")
    return [...nav, { label: "<-", title: "Affectation", text: "<- " }, t("<"), t(">"), t("-"), t("="), t("+"), t("/"), t("*"), t("("), t(")"), t('"', "Guillemets"), t(":"), t(","), t("≤", "Inférieur ou égal"), t("≥", "Supérieur ou égal"), t("≠", "Différent"), t("^", "Puissance"), t("["), t("]"), t("_")];
  if (LANGUAGES[language].preview) return [...nav, t("<"), t(">"), t("/"), t("="), t('"', "Guillemets"), t("{"), t("}"), t(":"), t(";"), t("."), t("#"), t("-"), t("("), t(")"), t("!")];
  return [...nav, t("("), t(")"), t("{"), t("}"), t("["), t("]"), t(";"), t(":"), t("="), t("<"), t(">"), t("+"), t("-"), t("*"), t("/"), t("%"), t('"', "Guillemets"), t("'", "Apostrophe"), t("!"), t("&"), t("|"), t("_"), t(","), t("."), t("#")];
}

interface MenuItem {
  id: "installer" | "nouveau" | "programmes" | "annuler" | "retablir" | "copier" | "coller" | "effacer" | "rechercher" | "remplacer" | "partager" | "telecharger" | "exemples" | "aide" | "entrainement" | "parametres";
  icon: keyof typeof PATHS;
  label: string;
  separatorBefore?: boolean;
}

export function AlgoStudio({
  initialLanguage = "pseudocode",
  initialFiles,
  initialStdin = "",
  canSave = false,
  programId: initialProgramId,
  programTitle = "",
  back,
  initialNotice,
}: {
  initialLanguage?: LanguageId;
  initialFiles?: SourceFile[];
  initialStdin?: string;
  canSave?: boolean;
  programId?: string;
  programTitle?: string;
  /** Retour au chapitre d'où vient la démonstration. */
  back?: string | null;
  initialNotice?: string | null;
}) {
  const defaultFiles = useCallback(
    // Page blanche : chacun écrit son propre code (les modèles restent dans le menu « Exemples »).
    (lang: LanguageId): SourceFile[] => LANGUAGES[lang].defaultFiles?.map((f) => ({ ...f, content: "" })) ?? [{ name: LANGUAGES[lang].mainFile, content: "" }],
    [],
  );
  const [language, setLanguage] = useState<LanguageId>(initialLanguage);
  const [files, setFiles] = useState<SourceFile[]>(initialFiles?.length ? initialFiles : defaultFiles(initialLanguage));
  const [active, setActive] = useState(0);
  const [stdin, setStdin] = useState(initialStdin);
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [markers, setMarkers] = useState<Array<{ line: number; message: string }>>([]);
  const [programId, setProgramId] = useState(initialProgramId);
  const [title, setTitle] = useState(programTitle);
  const [toast, setToast] = useState<ReactNode>(initialNotice ?? null);
  const [panel, setPanel] = useState(Boolean(LANGUAGES[initialLanguage].preview));
  const [drawer, setDrawer] = useState(false);
  const [menu, setMenu] = useState(false);
  const [dialog, setDialog] = useState<null | "exemples" | "aide" | "parametres" | "coller" | "programmes">(null);
  const [fontSize, setFontSize] = useState(15);
  const [pasteText, setPasteText] = useState("");
  const editorRef = useRef<MonacoEditor | null>(null);
  // Installation (écran d'accueil) et utilisation sans Internet.
  const [offlineOpen, setOfflineOpen] = useState(false);
  const [installEvent, setInstallEvent] = useState<InstallPromptEvent | null>(null);
  const [online, setOnline] = useState(true);
  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as InstallPromptEvent);
    };
    const onNet = () => setOnline(navigator.onLine);
    onNet();
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("online", onNet);
    window.addEventListener("offline", onNet);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("online", onNet);
      window.removeEventListener("offline", onNet);
    };
  }, []);
  const loadLanguages = async () => {
    const monaco = (window as unknown as { monaco?: { editor: { colorize(t: string, l: string, o: object): Promise<string> } } }).monaco;
    if (!monaco) throw new Error("L'éditeur n'est pas encore chargé : patientez un instant puis réessayez.");
    await Promise.all(LANGUAGE_IDS.map((id) => monaco.editor.colorize("x", LANGUAGES[id].monaco, {}).catch(() => "")));
    await runInBrowser("pseudocode", [{ name: "main.algo", content: "ALGORITHME Test\nDEBUT\n  ECRIRE(1)\nFIN\n" }], "");
    await runInBrowser("javascript", [{ name: "main.js", content: "console.log(1)" }], "");
  };
  const warmPython = async () => {
    const r = await runInBrowser("python", [{ name: "main.py", content: "print(1)" }], "");
    if (r.status !== "ok") throw new Error(r.stderr || "Python n'a pas pu être téléchargé.");
  };
  // Sélection en cours : barre Copier / Couper / Coller / Supprimer, et toucher = étendre la sélection.
  const [hasSelection, setHasSelection] = useState(false);
  // Poignées de début et de fin de sélection (à faire glisser au doigt, comme dans les applications de notes).
  type Handle = { x: number; y: number; h: number };
  const [handles, setHandles] = useState<{ start: Handle | null; end: Handle | null } | null>(null);
  const placeHandles = (ed: MonacoEditor) => {
    const sel = ed.getSelection();
    if (!sel || sel.isEmpty()) return setHandles(null);
    const height = ed.getLayoutInfo().height;
    const at = (lineNumber: number, column: number): Handle | null => {
      const p = ed.getScrolledVisiblePosition({ lineNumber, column });
      return p && p.top >= -p.height && p.top <= height ? { x: p.left, y: p.top, h: p.height } : null;
    };
    setHandles({ start: at(sel.startLineNumber, sel.startColumn), end: at(sel.endLineNumber, sel.endColumn) });
  };
  const dragHandle = (which: "start" | "end", e: React.TouchEvent) => {
    const ed = editorRef.current;
    const sel = ed?.getSelection();
    if (!ed || !sel) return;
    e.stopPropagation();
    e.preventDefault();
    // L'autre extrémité reste fixe ; le doigt est sous le texte, on vise la ligne juste au-dessus.
    const fixed = which === "start" ? { lineNumber: sel.endLineNumber, column: sel.endColumn } : { lineNumber: sel.startLineNumber, column: sel.startColumn };
    const lift = (handles?.[which]?.h ?? 20) * 0.9 + 14;
    const move = (ev: TouchEvent) => {
      ev.preventDefault();
      const t = ev.touches[0];
      const p = ed.getTargetAtClientPoint(t.clientX, t.clientY - lift)?.position;
      if (!p) return;
      const pBefore = p.lineNumber < fixed.lineNumber || (p.lineNumber === fixed.lineNumber && p.column < fixed.column);
      const [a, b] = pBefore ? [p, fixed] : [fixed, p];
      if (a.lineNumber === b.lineNumber && a.column === b.column) return;
      ed.setSelection({ startLineNumber: a.lineNumber, startColumn: a.column, endLineNumber: b.lineNumber, endColumn: b.column });
    };
    const end = () => {
      window.removeEventListener("touchmove", move);
      window.removeEventListener("touchend", end);
      window.removeEventListener("touchcancel", end);
    };
    window.addEventListener("touchmove", move, { passive: false });
    window.addEventListener("touchend", end);
    window.addEventListener("touchcancel", end);
  };
  const onHandleTouch = (e: React.TouchEvent<HTMLDivElement>) => dragHandle(e.currentTarget.dataset.which === "start" ? "start" : "end", e);
  const router = useRouter();

  const lang = LANGUAGES[language];
  const isWeb = Boolean(lang.preview);
  const current = files[Math.min(active, files.length - 1)];

  const notify = (m: ReactNode) => {
    setToast(m);
    setTimeout(() => setToast(null), 3500);
  };

  // Plein écran : la page du site derrière ne défile plus.
  useEffect(() => {
    // Le site derrière l'éditeur est masqué (y compris quand le clavier du téléphone fait défiler la page).
    const html = document.documentElement;
    html.classList.add("upl-plein-ecran");
    return () => html.classList.remove("upl-plein-ecran");
  }, []);

  // Clavier du téléphone ouvert : l'éditeur se limite à la partie visible, la rangée de symboles reste au-dessus du clavier.
  const [viewport, setViewport] = useState<{ top: number; height: number } | null>(null);
  useEffect(() => {
    const v = window.visualViewport;
    if (!v) return;
    const update = () => setViewport(Math.abs(v.height - window.innerHeight) > 80 ? { top: v.offsetTop, height: v.height } : null);
    update();
    v.addEventListener("resize", update);
    v.addEventListener("scroll", update);
    return () => {
      v.removeEventListener("resize", update);
      v.removeEventListener("scroll", update);
    };
  }, []);

  // Préférence : taille du texte. L'éditeur s'ouvre toujours vide (aucun brouillon rechargé) :
  // les programmes se retrouvent par « Mes programmes » une fois enregistrés.
  useEffect(() => {
    try {
      const size = Number(localStorage.getItem("upl:editeur:taille"));
      // Lecture des préférences après le montage (indisponibles au rendu serveur).
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (size >= 11 && size <= 24) setFontSize(size);
    } catch {
      /* stockage indisponible */
    }
  }, []);

  useEffect(() => {
    if (language === "python") warmupPython();
  }, [language]);

  // Aperçu des projets web
  const [previewDoc, setPreviewDoc] = useState(() => (isWeb ? buildPreviewDocument(files) : ""));
  const [previewConsole, setPreviewConsole] = useState<PreviewConsoleLine[]>([]);
  useEffect(() => {
    if (!isWeb) return;
    const t = setTimeout(() => {
      setPreviewConsole([]);
      setPreviewDoc(buildPreviewDocument(files));
    }, 600);
    return () => clearTimeout(t);
  }, [files, isWeb]);
  const onPreviewConsole = useCallback((l: PreviewConsoleLine) => setPreviewConsole((c) => [...c.slice(-199), l]), []);

  const updateContent = (v: string) => {
    setFiles((fs) => fs.map((f, i) => (i === active ? { ...f, content: v } : f)));
    if (markers.length) setMarkers([]);
  };

  const replaceCode = (code: string, input?: string) => {
    setFiles((fs) => fs.map((f, i) => (i === active ? { ...f, content: code } : f)));
    if (input !== undefined) setStdin(input);
    setResult(null);
    setError(null);
    setMarkers([]);
  };

  const changeLanguage = (next: LanguageId) => {
    setDrawer(false);
    if (next === language) return;
    const modified = files.some((f) => f.content.trim() !== "" && f.content !== LANGUAGES[language].template);
    if (modified && !confirm("Changer de langage remplacera le code actuel par un modèle. Continuer ?")) return;
    setLanguage(next);
    setFiles(defaultFiles(next));
    setActive(0);
    setResult(null);
    setError(null);
    setMarkers([]);
    setPanel(Boolean(LANGUAGES[next].preview));
  };

  const run = async (input: string = stdin) => {
    if (running) return;
    setPanel(true);
    if (isWeb) {
      setPreviewConsole([]);
      setPreviewDoc(buildPreviewDocument(files));
      return;
    }
    setRunning(true);
    setError(null);
    setResult(null);
    setStatus(null);
    const { result: r, error: e } = await runProgram(language, files, input, { programId, onStatus: setStatus });
    setRunning(false);
    setStatus(null);
    if (e) setError(e);
    if (r) {
      setResult(r);
      const waitsForInput = /Aucune donnée disponible pour LIRE/i.test(r.stderr || "");
      setMarkers(r.errorLine && !waitsForInput ? [{ line: r.errorLine, message: [r.compileOutput, r.stderr].filter(Boolean).join("\n") }] : []);
    }
  };

  // « lire » sans valeur : la console demande la valeur, puis relance l'algorithme avec cette entrée en plus
  // (comme un interpréteur interactif ; les valeurs données restent dans « Entrée »).
  const missingInput = !running && result && result.status !== "ok" ? (result.stderr || "").match(/Aucune donnée disponible pour LIRE\((.+?)\)/i)?.[1] : undefined;
  const [answer, setAnswer] = useState("");
  const giveInput = () => {
    const next = (stdin && !stdin.endsWith("\n") ? `${stdin}\n` : stdin) + answer;
    setStdin(next);
    setAnswer("");
    void run(next);
  };

  // Mes programmes : liste des programmes enregistrés dans le compte, à rouvrir d'un toucher.
  const [programs, setPrograms] = useState<Array<{ id: string; title: string; language_id: string; updated_at: string }> | null>(null);
  const [programsError, setProgramsError] = useState<string | null>(null);
  const loadPrograms = async () => {
    setPrograms(null);
    setProgramsError(null);
    try {
      const res = await fetch("/api/programs");
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return setProgramsError(data.error ?? "Liste indisponible pour le moment.");
      setPrograms(data.programs ?? []);
    } catch {
      setProgramsError("Pas de connexion Internet : la liste ne peut pas être chargée.");
    }
  };
  const newProgram = () => {
    const hasCode = files.some((f) => f.content.trim() !== "");
    if (hasCode && !confirm("Commencer un nouveau programme ? Le code non enregistré sera effacé.")) return;
    setFiles(defaultFiles(language));
    setActive(0);
    setStdin("");
    setResult(null);
    setError(null);
    setMarkers([]);
    setProgramId(undefined);
    setTitle("");
    window.history.replaceState(null, "", `/editeur?langage=${language}`);
  };

  const save = async () => {
    if (!canSave) {
      notify(
        <>
          <Link href="/connexion?suite=%2Fediteur" className="underline">
            Connectez-vous
          </Link>{" "}
          pour enregistrer vos programmes.
        </>,
      );
      return;
    }
    if (!navigator.onLine) {
      notify("Pas de connexion Internet : l'enregistrement dans « Mes programmes » se fera avec Internet. En attendant, ⋮ → Télécharger garde le fichier sur le téléphone.");
      return;
    }
    const t = title.trim() || prompt("Titre du programme :", "Mon programme")?.trim();
    if (!t) return;
    setTitle(t);
    notify("Enregistrement…");
    const res = await fetch(programId ? `/api/programs/${programId}` : "/api/programs", {
      method: programId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: t, language, files, stdin }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setProgramId(data.id);
      notify("Programme enregistré ✓ — retrouvez-le dans ⋮ → Mes programmes");
      if (!programId) window.history.replaceState(null, "", `/editeur?programme=${data.id}`);
    } else notify(data.error ?? "Échec de l'enregistrement.");
  };

  // Pas à pas : le laboratoire d'algorithmique reçoit le code (pseudocode uniquement).
  const debug = () => {
    if (language !== "pseudocode") {
      notify("L'exécution pas à pas est disponible pour l'algorithmique (pseudocode).");
      return;
    }
    try {
      sessionStorage.setItem("upl:labo:transfert", JSON.stringify({ code: current?.content ?? "", stdin }));
    } catch {
      /* stockage indisponible : le laboratoire s'ouvre avec son exemple */
    }
    router.push("/laboratoire?depuis=editeur");
  };

  const editorAction = (id: string) => {
    const ed = editorRef.current;
    if (!ed) return;
    ed.focus();
    void ed.getAction(id)?.run();
  };
  const insert = (text: string) => {
    const ed = editorRef.current;
    if (!ed) return;
    ed.focus();
    ed.trigger("clavier", "type", { text });
  };
  const writeClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Ancien navigateur ou permission refusée : copie par une zone de texte temporaire.
      const ta = Object.assign(document.createElement("textarea"), { value: text });
      ta.setAttribute("readonly", "");
      ta.style.cssText = "position:fixed;top:0;left:0;opacity:0";
      document.body.appendChild(ta);
      ta.select();
      ta.setSelectionRange(0, text.length);
      let ok = false;
      try {
        ok = document.execCommand("copy");
      } catch {
        ok = false;
      }
      ta.remove();
      return ok;
    }
  };
  const selectedText = () => {
    const ed = editorRef.current;
    const sel = ed?.getSelection();
    return sel && !sel.isEmpty() ? (ed?.getModel()?.getValueInRange(sel) ?? "") : "";
  };
  const copy = async () => {
    const selected = selectedText();
    const ok = await writeClipboard(selected || (current?.content ?? ""));
    notify(ok ? (selected ? "Sélection copiée ✓" : "Tout le code est copié ✓") : "Copie impossible : utilisez le menu du téléphone.");
  };
  const deleteSelection = () => {
    const ed = editorRef.current;
    const sel = ed?.getSelection();
    if (!ed || !sel || sel.isEmpty()) return;
    ed.executeEdits("selection", [{ range: sel, text: "", forceMoveMarkers: true }]);
    ed.focus();
  };
  const cut = async () => {
    const selected = selectedText();
    if (!selected) return;
    if (await writeClipboard(selected)) {
      deleteSelection();
      notify("Sélection coupée ✓");
    } else notify("Copie impossible : utilisez le menu du téléphone.");
  };
  const selectAll = () => {
    const ed = editorRef.current;
    const model = ed?.getModel() as unknown as { getFullModelRange(): Parameters<NonNullable<typeof ed>["setSelection"]>[0] } | null;
    if (!ed || !model) return;
    ed.setSelection(model.getFullModelRange());
    ed.focus();
  };
  const onSelectionAction = (label: "Tout" | "Copier" | "Couper" | "Coller" | "Supprimer") => {
    if (label === "Tout") return selectAll();
    if (label === "Copier") return void copy();
    if (label === "Couper") return void cut();
    if (label === "Coller") return void paste();
    deleteSelection();
  };
  const unselect = () => {
    const ed = editorRef.current;
    const pos = ed?.getPosition();
    if (ed && pos) ed.setPosition(pos);
  };
  const paste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) return insert(text);
    } catch {
      /* lecture du presse-papiers refusée : saisie manuelle */
    }
    setPasteText("");
    setDialog("coller");
  };
  const share = async () => {
    const text = current?.content ?? "";
    if (navigator.share) {
      try {
        await navigator.share({ title: title || current?.name || "Mon algorithme", text });
      } catch {
        /* partage annulé */
      }
      return;
    }
    await copy();
  };
  const download = () => {
    if (!current) return;
    const url = URL.createObjectURL(new Blob([current.content], { type: "text/plain;charset=utf-8" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: current.name });
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const setSize = (n: number) => {
    const v = Math.max(11, Math.min(24, n));
    setFontSize(v);
    try {
      localStorage.setItem("upl:editeur:taille", String(v));
    } catch {
      /* ignoré */
    }
  };

  const menuItems: MenuItem[] = [
    { id: "installer", icon: "phone", label: "Installer · utiliser sans Internet" },
    { id: "nouveau", icon: "plus", label: "Nouveau programme", separatorBefore: true },
    { id: "programmes", icon: "folder", label: "Mes programmes" },
    { id: "annuler", icon: "undo", label: "Annuler", separatorBefore: true },
    { id: "retablir", icon: "redo", label: "Rétablir" },
    { id: "copier", icon: "copy", label: "Copier", separatorBefore: true },
    { id: "coller", icon: "paste", label: "Coller" },
    { id: "effacer", icon: "clear", label: "Effacer l'éditeur", separatorBefore: true },
    { id: "rechercher", icon: "search", label: "Rechercher" },
    { id: "remplacer", icon: "replace", label: "Rechercher et remplacer" },
    { id: "partager", icon: "share", label: "Partager le code", separatorBefore: true },
    { id: "telecharger", icon: "download", label: "Télécharger" },
    { id: "exemples", icon: "code", label: "Exemples", separatorBefore: true },
    { id: "aide", icon: "help", label: "Aide" },
    { id: "entrainement", icon: "training", label: "Entraînement" },
    { id: "parametres", icon: "settings", label: "Paramètres", separatorBefore: true },
  ];
  const onMenu = (id: MenuItem["id"]) => {
    setMenu(false);
    const ed = editorRef.current;
    switch (id) {
      case "annuler":
      case "retablir":
        ed?.focus();
        return ed?.trigger("menu", id === "annuler" ? "undo" : "redo", null);
      case "copier":
        return void copy();
      case "coller":
        return void paste();
      case "effacer":
        if (confirm("Effacer tout le code ?")) replaceCode("");
        return;
      case "rechercher":
        return editorAction("actions.find");
      case "remplacer":
        return editorAction("editor.action.startFindReplaceAction");
      case "partager":
        return void share();
      case "telecharger":
        return download();
      case "nouveau":
        return newProgram();
      case "installer":
        return setOfflineOpen(true);
      case "entrainement":
        return router.push("/exercices");
      default:
        if (id === "programmes") void loadPrograms();
        return setDialog(id);
    }
  };

  const keep = (e: React.PointerEvent | React.MouseEvent) => e.preventDefault();
  const iconButton = "grid h-12 w-12 shrink-0 place-items-center rounded-full text-gray-100 hover:bg-white/10 active:bg-white/20";

  return (
    <div
      className="fixed inset-x-0 top-0 z-[60] flex w-screen max-w-full flex-col overflow-hidden text-gray-100"
      style={
        {
          background: BG,
          height: viewport ? viewport.height : "100dvh",
          top: viewport?.top ?? 0,
          // Couleurs de la fenêtre « Installer · utiliser sans Internet » (partagée avec UPL IDE).
          "--ide-border": "#4a4d50",
          "--ide-menu": "#3c3f41",
          "--ide-text": "#e8e8e8",
          "--ide-muted": "#a8a8a8",
          "--ide-accent": "#e07b1a",
          "--ide-hover": "#4a4d50",
        } as React.CSSProperties
      }
      data-testid="editeur-algo"
    >
      {/* Barre du haut */}
      <header className="flex h-14 shrink-0 items-center gap-1 px-1 shadow-md" style={{ background: BAR }}>
        <button type="button" className={iconButton} aria-label="Menu" title="Menu" onClick={() => setDrawer(true)}>
          <Icon name="menu" />
        </button>
        {back && (
          <Link href={back} className={iconButton} aria-label="Retour au cours" title="Retour au cours" data-testid="retour-cours">
            <Icon name="back" />
          </Link>
        )}
        <h1 className="min-w-0 flex-1 truncate pl-1 text-lg font-semibold">
          {title || "UPL"}
          {!online && <span className="ml-2 rounded bg-amber-500/20 px-1.5 py-0.5 align-middle text-[11px] font-medium text-amber-300">hors ligne</span>}
        </h1>
        <button type="button" className={iconButton} aria-label={isWeb ? "↻ Actualiser l'aperçu" : "▶ Exécuter"} title="Exécuter (Ctrl + Entrée)" aria-keyshortcuts="Control+Enter" onClick={() => run()} disabled={running}>
          {running ? <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden><path d="M7 4.5v15l13-7.5z" /></svg>}
        </button>
        <button type="button" className={iconButton} aria-label="Exécution pas à pas" title="Exécution pas à pas (laboratoire)" onClick={debug}>
          <Icon name="bug" />
        </button>
        <button type="button" className={iconButton} aria-label="Enregistrer" title="Enregistrer" onClick={save}>
          <Icon name="save" />
        </button>
        <button type="button" className={iconButton} aria-label="Plus d'options" title="Plus d'options" aria-expanded={menu} onClick={() => setMenu((m) => !m)}>
          <Icon name="more" />
        </button>
      </header>

      {/* Fichiers (projets web et langages à plusieurs fichiers) */}
      {(lang.multiFile || files.length > 1) && (
        <div className="flex shrink-0 overflow-x-auto border-b border-black/30" style={{ background: "#313335" }}>
          {files.map((f, i) => (
            <button key={f.name} type="button" onClick={() => setActive(i)} className={cn("shrink-0 px-4 py-2 font-mono text-xs", i === active ? "border-b-2 border-[#f28c28] text-white" : "text-gray-400")}>
              {f.name}
            </button>
          ))}
        </div>
      )}

      {/* Éditeur */}
      <div
        className="relative min-h-0 flex-1"
        onKeyDown={(e) => {
          if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
            e.preventDefault();
            run();
          }
        }}
      >
        <CodeEditor
          language={language}
          value={current?.content ?? ""}
          onChange={updateContent}
          markers={markers}
          path={`algo/${language}/${current?.name}`}
          theme="upl-algo"
          fontSize={fontSize}
          onEditor={(ed) => {
            editorRef.current = ed;
            ed.onDidChangeCursorSelection((e) => {
              const on = !e.selection.isEmpty();
              setHasSelection(on);
              placeHandles(ed);
            });
            ed.onDidScrollChange(() => placeHandles(ed));
            ed.onDidLayoutChange(() => placeHandles(ed));
          }}
        />
        {!current?.content && (
          <p className="pointer-events-none absolute left-[72px] right-4 top-3 z-[5] font-mono text-sm leading-6 text-gray-500" data-testid="editeur-vide">
            Écrivez votre algorithme ici…
            <br />
            (des exemples prêts à l&apos;emploi sont dans le menu ⋮ → Exemples)
          </p>
        )}
        {hasSelection &&
          handles &&
          (["start", "end"] as const).map((which) => {
            const hd = handles[which];
            if (!hd) return null;
            return (
              <div key={which} className="pointer-events-none absolute z-20" style={{ left: hd.x, top: hd.y }} data-testid={`poignee-${which === "start" ? "debut" : "fin"}`}>
                <div className="absolute left-[-1px] top-0 w-[3px] rounded bg-[#f28c28]" style={{ height: hd.h }} />
                <div
                  className="pointer-events-auto absolute -translate-x-1/2 p-2.5"
                  style={{ top: hd.h - 4, touchAction: "none" }}
                  data-which={which}
                  onTouchStart={onHandleTouch}
                  aria-hidden
                >
                  <div className="h-5 w-5 rounded-full border-2 border-white bg-[#f28c28] shadow-lg" />
                </div>
              </div>
            );
          })}
        {hasSelection && (
          <div className="absolute inset-x-2 bottom-2 z-10 flex items-stretch overflow-x-auto rounded-md shadow-2xl" style={{ background: "#45484a" }} role="toolbar" aria-label="Sélection" data-testid="barre-selection">
            {(["Tout", "Copier", "Couper", "Coller", "Supprimer"] as const).map((label) => (
              <button
                key={label}
                type="button"
                onPointerDown={(e) => e.preventDefault()}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onSelectionAction(label)}
                className="shrink-0 px-3 py-2.5 text-sm font-medium text-white active:bg-[#f28c28] active:text-black"
              >
                {label}
              </button>
            ))}
            <button type="button" onPointerDown={(e) => e.preventDefault()} onClick={unselect} aria-label="Fermer la sélection" className="ml-auto shrink-0 px-3 text-gray-300">
              ✕
            </button>
          </div>
        )}
        {toast && (
          <div className="pointer-events-auto absolute inset-x-3 top-3 z-10 rounded-md bg-[#1f1f1f] px-4 py-3 text-sm text-white shadow-xl" role="status">
            {toast}
          </div>
        )}
      </div>

      {/* Console / aperçu */}
      {panel ? (
        <section className="flex max-h-[55%] min-h-[40%] shrink-0 flex-col border-t-2 border-[#f28c28]" style={{ background: "#1e1f22" }} aria-label="Console">
          <div className="flex shrink-0 items-center gap-2 px-3 py-1.5" style={{ background: BAR }}>
            <Icon name="terminal" className="h-4 w-4 text-[#f28c28]" />
            <span className="text-sm font-semibold">{isWeb ? "Aperçu" : "Console"}</span>
            {result && missingInput && (
              <span className="truncate text-xs text-amber-300">
                En attente de votre saisie… · {result.engine === "serveur" ? "bac à sable serveur" : result.engine === "interpreteur" ? "interpréteur UPL" : "navigateur"}
              </span>
            )}
            {result && !missingInput && (
              <span className={cn("truncate text-xs", result.status === "ok" ? "text-green-400" : "text-red-400")}>
                {STATUS_LABELS[result.status]}
                {result.timeMs !== null && ` · ${result.timeMs} ms`}
                {` · ${result.engine === "serveur" ? "bac à sable serveur" : result.engine === "interpreteur" ? "interpréteur UPL" : "navigateur"}`}
              </span>
            )}
            <button type="button" onClick={() => setPanel(false)} className="ml-auto grid h-8 w-8 place-items-center rounded-full hover:bg-white/10" aria-label="Fermer la console">
              <Icon name="clear" className="h-4 w-4" />
            </button>
          </div>
          {isWeb ? (
            <div className="flex min-h-0 flex-1 flex-col gap-2 p-2">
              <WebPreview doc={previewDoc} onConsole={onPreviewConsole} className="min-h-0 w-full flex-1 rounded border border-white/10 bg-white" />
              <pre className="max-h-20 shrink-0 overflow-auto whitespace-pre-wrap rounded bg-black/50 p-2 font-mono text-xs" aria-live="polite" data-testid="console-apercu">
                {previewConsole.length === 0 && <span className="text-gray-500">Messages de console.log()…</span>}
                {previewConsole.map((l, i) => (
                  <span key={i} className={cn("block", l.level === "error" && "text-red-300", l.level === "warn" && "text-amber-300")}>
                    {l.text}
                  </span>
                ))}
              </pre>
            </div>
          ) : (
            <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-auto p-2">
              <label className="flex shrink-0 flex-col gap-1 text-xs text-gray-400">
                Entrées (facultatif : demandées au moment de « lire »)
                <textarea
                  value={stdin}
                  onChange={(e) => setStdin(e.target.value)}
                  rows={2}
                  spellCheck={false}
                  className="resize-y rounded border border-white/10 bg-[#2b2b2b] px-2 py-1 font-mono text-sm text-gray-100 focus:border-[#f28c28] focus:outline-none"
                  placeholder="ex. 5"
                />
              </label>
              <pre className="min-h-16 flex-1 overflow-auto whitespace-pre-wrap break-words rounded bg-black/50 p-2 font-mono text-[13px] leading-relaxed text-gray-100" aria-live="polite">
                {running && <span className="text-[#f28c28]">{status ?? "Exécution en cours…"}</span>}
                {!running && !result && !error && <span className="text-gray-500">Appuyez sur ▶ pour exécuter votre algorithme.</span>}
                {error && <span className="text-red-300">{error}</span>}
                {result?.compileOutput && <span className="text-red-300">{result.compileOutput}{"\n"}</span>}
                {result?.stdout}
                {result?.stderr && !missingInput && <span className="text-red-300">{result.stdout && !result.stdout.endsWith("\n") ? "\n" : ""}{result.stderr}</span>}
                {result?.hint && !missingInput && <span className="mt-2 block text-amber-300">💡 {result.hint}</span>}
              </pre>
                {missingInput && (
                  <form
                    className="flex shrink-0 items-center gap-2 rounded border border-[#f28c28]/60 bg-black/50 px-2 py-2 font-mono text-[13px]"
                    onSubmit={(e) => {
                      e.preventDefault();
                      giveInput();
                    }}
                    data-testid="saisie-console"
                  >
                    <span className="text-[#f28c28]">{missingInput} ?</span>
                    <input
                      autoFocus
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      aria-label={`Valeur de ${missingInput}`}
                      enterKeyHint="send"
                      className="min-w-0 flex-1 border-b border-[#f28c28] bg-transparent font-mono text-gray-100 outline-none"
                    />
                    <button type="submit" className="rounded bg-[#f28c28] px-3 py-1 font-sans text-xs font-semibold text-black">
                      OK
                    </button>
                  </form>
                )}
            </div>
          )}
        </section>
      ) : (
        <button type="button" onClick={() => setPanel(true)} className="flex h-8 shrink-0 items-center gap-2 border-t border-black/40 px-3 text-xs text-gray-300" style={{ background: "#313335" }}>
          <Icon name="terminal" className="h-4 w-4 text-[#f28c28]" />
          {isWeb ? "Aperçu" : "Console et entrées"}
          <span className="ml-auto">▲</span>
        </button>
      )}

      {/* Rangée de symboles de programmation */}
      <div className="flex h-12 shrink-0 items-stretch overflow-x-auto" style={{ background: BAR }} role="toolbar" aria-label="Symboles de programmation" data-testid="clavier-symboles">
        {keysFor(language).map((k) => (
          <button
            key={k.title + k.label}
            type="button"
            title={k.title}
            aria-label={k.title}
            onPointerDown={keep}
            onMouseDown={keep}
            onClick={() => {
              const ed = editorRef.current;
              if (!ed) return;
              ed.focus();
              if (k.command) ed.trigger("clavier", k.command, null);
              else if (k.text) ed.trigger("clavier", "type", { text: k.text });
            }}
            className="min-w-11 shrink-0 px-2 font-mono text-lg text-gray-100 [font-variant-ligatures:none] active:bg-[#f28c28] active:text-black"
          >
            {k.label}
          </button>
        ))}
      </div>

      <OfflineDialog
        open={offlineOpen}
        onClose={() => setOfflineOpen(false)}
        installEvent={installEvent}
        onInstalled={() => setInstallEvent(null)}
        online={online}
        loadLanguages={loadLanguages}
        warmPython={warmPython}
        warmEngines={async () => {}}
        appName="UPL Algo"
        features={
          <ul className="space-y-0.5 text-[var(--ide-muted)]">
            <li>✓ Écrire et exécuter vos algorithmes (pseudocode), JavaScript et Python</li>
            <li>✓ Console, saisie au moment de « lire », clavier de symboles</li>
            <li>✓ Exemples, sélection, copier-coller, télécharger le fichier</li>
            <li>✗ Enregistrer dans « Mes programmes », C et Java, cours en ligne (Internet nécessaire)</li>
          </ul>
        }
      />
      {/* Menu « plus d'options » */}
      {menu && (
        <>
          <button type="button" className="fixed inset-0 z-[61] cursor-default" aria-label="Fermer le menu" onClick={() => setMenu(false)} />
          <ul className="absolute right-1 top-1 z-[62] max-h-[calc(100%-0.5rem)] w-64 overflow-auto rounded-md py-1 shadow-2xl" style={{ background: "#3c3f41" }} role="menu">
            {menuItems.map((m) => (
              <li key={m.label} role="none" className={cn(m.separatorBefore && "border-t border-white/10")}>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => onMenu(m.id)}
                  className="flex w-full items-center gap-4 px-4 py-3 text-left text-[15px] hover:bg-white/10"
                >
                  <Icon name={m.icon} className="h-5 w-5 text-gray-300" />
                  {m.label}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      {/* Menu latéral */}
      {drawer && (
        <>
          <button type="button" className="fixed inset-0 z-[61] bg-black/50" aria-label="Fermer le menu latéral" onClick={() => setDrawer(false)} />
          <nav className="fixed inset-y-0 left-0 z-[62] flex w-72 max-w-[85vw] flex-col overflow-y-auto shadow-2xl" style={{ background: "#313335" }} aria-label="Menu de l'éditeur">
            <div className="flex items-center gap-3 px-4 py-5" style={{ background: BAR }}>
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#f28c28] font-mono text-sm font-bold text-black">{"</>"}</span>
              <span className="leading-tight">
                <span className="block font-bold">UPL CODE ACADEMY MK</span>
                <span className="block text-xs text-gray-400">Interpréteur d&apos;algorithmes</span>
              </span>
            </div>
            {back && (
              <Link href={back} className="flex items-center gap-3 px-4 py-3 text-[15px] text-[#f28c28] hover:bg-white/10">
                <Icon name="back" className="h-5 w-5" /> Retour au cours
              </Link>
            )}
            <p className="px-4 pb-1 pt-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Langage</p>
            {LANGUAGE_IDS.map((id) => (
              <button key={id} type="button" onClick={() => changeLanguage(id)} className={cn("flex items-center gap-3 px-4 py-2.5 text-left text-[15px] hover:bg-white/10", id === language && "text-[#f28c28]")} aria-pressed={id === language}>
                <span className={cn("h-2.5 w-2.5 rounded-full border border-current", id === language && "bg-current")} />
                {LANGUAGES[id].label}
              </button>
            ))}
            <p className="px-4 pb-1 pt-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Plateforme</p>
            {[
              ["/", "Accueil"],
              ["/formations", "Formations"],
              ["/exercices", "Exercices"],
              ["/ide", "UPL IDE"],
              ["/laboratoire", "Laboratoire pas à pas"],
              ["/tableau-de-bord", "Mon espace"],
            ].map(([href, label]) => (
              <Link key={href} href={href} className="px-4 py-2.5 text-[15px] hover:bg-white/10">
                {label}
              </Link>
            ))}
          </nav>
        </>
      )}

      {/* Fenêtres : exemples, aide, paramètres, coller */}
      {dialog && (
        <div className="fixed inset-0 z-[63] grid place-items-center bg-black/60 p-4" role="dialog" aria-modal aria-label={dialog}>
          <div className="flex max-h-[85dvh] w-full max-w-md flex-col overflow-hidden rounded-lg shadow-2xl" style={{ background: "#3c3f41" }}>
            <div className="flex items-center justify-between px-4 py-3">
              <h2 className="text-lg font-semibold">{{ exemples: "Exemples", aide: "Aide", parametres: "Paramètres", coller: "Coller", programmes: "Mes programmes" }[dialog]}</h2>
              <button type="button" onClick={() => setDialog(null)} className="grid h-9 w-9 place-items-center rounded-full hover:bg-white/10" aria-label="Fermer">
                <Icon name="clear" className="h-5 w-5" />
              </button>
            </div>
            <div className="min-h-0 overflow-auto px-4 pb-4 text-sm">
              {dialog === "exemples" && (
                <ul className="space-y-1">
                  {(language === "pseudocode" ? EXAMPLES : [{ title: `Modèle ${lang.label}`, code: lang.template, stdin: "" }]).map((ex) => (
                    <li key={ex.title}>
                      <button
                        type="button"
                        className="w-full rounded px-3 py-2.5 text-left hover:bg-white/10"
                        onClick={() => {
                          const modified = (current?.content ?? "").trim() !== "" && current?.content !== lang.template;
                          if (modified && !confirm("Remplacer le code actuel par cet exemple ?")) return;
                          replaceCode(ex.code, ex.stdin);
                          setDialog(null);
                        }}
                      >
                        {ex.title}
                      </button>
                    </li>
                  ))}
                  <li className="pt-2 text-xs text-gray-400">
                    D&apos;autres exemples commentés se trouvent dans les{" "}
                    <Link href="/formations/algorithmique" className="text-[#f28c28] underline">
                      formations
                    </Link>
                    .
                  </li>
                </ul>
              )}
              {dialog === "aide" && (
                <div className="space-y-3 text-gray-200">
                  <p>Écrivez votre algorithme puis appuyez sur ▶. Les valeurs lues par <code>lire</code> se saisissent dans « Console et entrées », une par ligne. 🐞 ouvre l&apos;exécution pas à pas.</p>
                  <pre className="overflow-auto rounded bg-[#2b2b2b] p-3 font-mono text-xs leading-relaxed">{`Algorithme nom
Variables a, b : entier
Début
  lire(a)
  a <- a + 1          (ou ←)
  Si a > 10 Alors ... Sinon ... FinSi
  Pour i <- 1 à n Faire ... FinPour
  TantQue a < 100 Faire ... FinTantQue
  Répéter ... Jusqu'à a = 0
  écrire("Résultat : ", a)
Fin`}</pre>
                  <p>Types : entier, réel, chaîne, caractère, booléen. Opérateurs : + - * / div mod, = ≠ &lt; &gt; ≤ ≥, et, ou, non.</p>
                  <p className="text-xs text-gray-400">Majuscules et accents sont acceptés : « Écrire », « ECRIRE » et « ecrire » sont équivalents.</p>
                </div>
              )}
              {dialog === "parametres" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Taille du texte</span>
                    <span className="flex items-center gap-2">
                      <button type="button" className="h-9 w-9 rounded bg-white/10 text-lg" onClick={() => setSize(fontSize - 1)} aria-label="Réduire le texte">
                        −
                      </button>
                      <span className="w-8 text-center font-mono">{fontSize}</span>
                      <button type="button" className="h-9 w-9 rounded bg-white/10 text-lg" onClick={() => setSize(fontSize + 1)} aria-label="Agrandir le texte">
                        +
                      </button>
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">Le langage se choisit dans le menu ☰. Votre code est conservé automatiquement sur cet appareil.</p>
                </div>
              )}
              {dialog === "programmes" && (
                <div className="space-y-2" data-testid="mes-programmes">
                  {programsError && <p className="text-red-300">{programsError}</p>}
                  {!programs && !programsError && <p className="text-gray-400">Chargement…</p>}
                  {programs?.length === 0 && <p className="text-gray-300">Aucun programme enregistré. Écrivez votre code puis touchez 💾 pour l&apos;enregistrer.</p>}
                  <ul className="space-y-1">
                    {programs?.map((p) => (
                      <li key={p.id}>
                        <Link
                          href={`/editeur?programme=${p.id}`}
                          onClick={() => setDialog(null)}
                          className={cn("flex items-center justify-between gap-3 rounded px-3 py-2.5 hover:bg-white/10", p.id === programId && "bg-white/10")}
                        >
                          <span className="min-w-0 truncate">{p.title}</span>
                          <span className="shrink-0 text-xs text-gray-400">
                            {LANGUAGES[p.language_id as LanguageId]?.shortLabel ?? p.language_id} · {new Date(p.updated_at).toLocaleDateString("fr-FR")}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <Link href="/mes-programmes" className="block pt-2 text-xs text-[#f28c28] underline">
                    Gérer tous mes programmes (renommer, supprimer)
                  </Link>
                </div>
              )}
              {dialog === "coller" && (
                <div className="space-y-3">
                  <p className="text-gray-300">Appuyez longuement dans la zone ci-dessous, choisissez « Coller », puis « Insérer ».</p>
                  <textarea value={pasteText} onChange={(e) => setPasteText(e.target.value)} rows={6} className="w-full rounded border border-white/10 bg-[#2b2b2b] p-2 font-mono text-sm" autoFocus aria-label="Texte à coller" />
                  <button
                    type="button"
                    className="w-full rounded bg-[#f28c28] py-2.5 font-semibold text-black"
                    onClick={() => {
                      setDialog(null);
                      if (pasteText) insert(pasteText);
                    }}
                  >
                    Insérer dans l&apos;éditeur
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
