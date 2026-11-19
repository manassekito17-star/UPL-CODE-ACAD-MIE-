import { Badge, Button, NavItem, ToastProvider, ZynoraMark, applyTheme, useToasts } from "@zynora/design-system";
import { FolderOpen, Home, Settings as SettingsIcon, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";

import { translator } from "./i18n";
import { AppContext, errorText, isTextPath, useApp } from "./context";
import { api as defaultApi, type Api, type AppInfo, type DocumentInfo, type Language, type SettingChange, type Settings, type WorkbookInfo } from "./ipc";
import { SheetsEditor } from "./sheets/SheetsEditor";
import { DocumentsView } from "./views/DocumentsView";
import { HomeView, MODULES } from "./views/HomeView";
import { SettingsView } from "./views/SettingsView";
import { TrashView } from "./views/TrashView";
import { WordEditor } from "./word/WordEditor";

type View = "home" | "documents" | "trash" | "settings";

export function App({ api = defaultApi }: { api?: Api }) {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [info, setInfo] = useState<AppInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState<View>("home");
  const [folder, setFolder] = useState("");
  /** Incrémenté quand la bibliothèque change : les vues repartent de zéro. */
  const [libraryRevision, setLibraryRevision] = useState(0);

  const language: Language = settings?.language ?? "fr";
  const t = useMemo(() => translator(language), [language]);
  const [book, setBook] = useState<WorkbookInfo | null>(null);
  const [textDoc, setTextDoc] = useState<DocumentInfo | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [loaded, appInfo] = await Promise.all([api.getSettings(), api.appInfo()]);
      setSettings(loaded);
      setInfo(appInfo);
    } catch (e) {
      setError(errorText(e, translator("fr")));
    }
  }, [api]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => applyTheme(settings?.theme ?? "system"), [settings?.theme]);
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === ",") {
        event.preventDefault();
        setView("settings");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  async function change(next: SettingChange) {
    setSaving(true);
    setError(null);
    try {
      setSettings(await api.updateSetting(next));
    } catch (e) {
      setError(errorText(e, t));
    } finally {
      setSaving(false);
    }
  }

  function openFolder(path: string) {
    setFolder(path);
    setView("documents");
  }

  return (
    <ToastProvider closeLabel={t("dialog.close")}>
      <Workspace api={api} t={t} language={language} onBook={setBook} onText={setTextDoc}>
        {book ? (
          <SheetsEditor
            key={book.id}
            book={book}
            onClose={() => {
              setBook(null);
              setLibraryRevision((r) => r + 1);
            }}
          />
        ) : textDoc ? (
          <WordEditor
            key={textDoc.path}
            doc={textDoc}
            onReplace={setTextDoc}
            onClose={() => {
              setTextDoc(null);
              setLibraryRevision((r) => r + 1);
            }}
          />
        ) : (
        <div className="shell">
          <aside className="sidebar">
            <div className="brand">
              <ZynoraMark size={30} />
              <div>
                <div className="brand__name">ZYNORA</div>
                <div className="brand__sub">Office</div>
              </div>
            </div>
            <nav className="nav" aria-label={t("nav.home")}>
              <NavItem icon={<Home size={18} aria-hidden />} label={t("nav.home")} current={view === "home"} onSelect={() => setView("home")} />
              <div className="nav__section">{t("nav.library")}</div>
              <NavItem
                icon={<FolderOpen size={18} aria-hidden />}
                label={t("nav.documents")}
                current={view === "documents"}
                onSelect={() => openFolder(view === "documents" ? "" : folder)}
              />
              <NavItem icon={<Trash2 size={18} aria-hidden />} label={t("nav.trash")} current={view === "trash"} onSelect={() => setView("trash")} />
              <div className="nav__section">{t("nav.apps")}</div>
              {MODULES.map((m) =>
                m.key === "sheets" ? (
                  <SheetsNavItem key={m.key} icon={m.icon} label={t("app.sheets")} folder={view === "documents" ? folder : ""} />
                ) : m.key === "word" ? (
                  <WordNavItem key={m.key} icon={m.icon} label={t("app.word")} folder={view === "documents" ? folder : ""} />
                ) : (
                  <NavItem
                    key={m.key}
                    icon={m.icon}
                    label={t(`app.${m.key}`)}
                    disabled
                    title={t("status.phase", { n: m.phase })}
                    trailing={<Badge>{t("status.soon", { n: m.phase })}</Badge>}
                  />
                ),
              )}
            </nav>
            <div className="nav nav--bottom">
              <NavItem
                icon={<SettingsIcon size={18} aria-hidden />}
                label={t("nav.settings")}
                current={view === "settings"}
                onSelect={() => setView("settings")}
              />
            </div>
          </aside>

          <main className="main" key={libraryRevision}>
            {error && (
              <div className="alert" role="alert">
                <strong>{t("error.title")}</strong>
                <span>{error}</span>
                <Button size="sm" onClick={() => void load()}>
                  {t("error.retry")}
                </Button>
              </div>
            )}
            {!settings && !error && <p className="muted">{t("loading")}</p>}
            {settings && view === "home" && <HomeView info={info} onLocate={openFolder} />}
            {settings && view === "documents" && <DocumentsView path={folder} onNavigate={setFolder} />}
            {settings && view === "trash" && <TrashView />}
            {settings && view === "settings" && (
              <SettingsView
                mobile={info?.mobile ?? false}
                settings={settings}
                saving={saving}
                onChange={change}
                onLibraryChanged={() => {
                  setFolder("");
                  setLibraryRevision((r) => r + 1);
                }}
              />
            )}
          </main>
        </div>
        )}
      </Workspace>
    </ToastProvider>
  );
}

/** Fournit le contexte (API, traductions, ouverture des classeurs) sous le fournisseur de notifications. */
function Workspace({
  api,
  t,
  language,
  onBook,
  onText,
  children,
}: {
  api: Api;
  t: ReturnType<typeof translator>;
  language: Language;
  onBook: (book: WorkbookInfo) => void;
  onText: (doc: DocumentInfo) => void;
  children: ReactNode;
}) {
  const toast = useToasts();
  const attempt = useCallback(
    async <T,>(open: () => Promise<T>, show: (value: T) => void) => {
      try {
        show(await open());
      } catch (e) {
        toast({ tone: "error", message: errorText(e, t) });
      }
    },
    [t, toast],
  );
  const guard = useCallback((open: () => Promise<WorkbookInfo>) => attempt(open, onBook), [attempt, onBook]);
  const text = useCallback((open: () => Promise<DocumentInfo>) => attempt(open, onText), [attempt, onText]);
  const context = useMemo(
    () => ({
      api,
      t,
      language,
      openWorkbook: (path: string) => guard(() => api.sheetsOpen(path)),
      createWorkbook: (folder: string) => guard(() => api.sheetsCreate(folder)),
      openRecovery: (path: string) => (isTextPath(path) ? text(() => api.wordOpenRecovery(path)) : guard(() => api.sheetsOpenRecovery(path))),
      openText: (path: string) => text(() => api.wordOpen(path)),
      createText: (folder: string) => text(() => api.wordCreate(folder)),
    }),
    [api, t, language, guard, text],
  );
  return <AppContext.Provider value={context}>{children}</AppContext.Provider>;
}

function SheetsNavItem({ icon, label, folder }: { icon: ReactNode; label: string; folder: string }) {
  const { createWorkbook, t } = useApp();
  return <NavItem icon={icon} label={label} title={t("sheets.new")} onSelect={() => void createWorkbook(folder)} />;
}

function WordNavItem({ icon, label, folder }: { icon: ReactNode; label: string; folder: string }) {
  const { createText, t } = useApp();
  return <NavItem icon={icon} label={label} title={t("word.new")} onSelect={() => void createText(folder)} />;
}
