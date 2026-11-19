import { Badge, Button, NavItem, ToastProvider, ZynoraMark, applyTheme } from "@zynora/design-system";
import { FolderOpen, Home, Settings as SettingsIcon, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { AppContext, errorText } from "./context";
import { translator } from "./i18n";
import { api as defaultApi, type Api, type AppInfo, type Language, type SettingChange, type Settings } from "./ipc";
import { DocumentsView } from "./views/DocumentsView";
import { HomeView, MODULES } from "./views/HomeView";
import { SettingsView } from "./views/SettingsView";
import { TrashView } from "./views/TrashView";

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
  const context = useMemo(() => ({ api, t, language }), [api, t, language]);

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
    <AppContext.Provider value={context}>
      <ToastProvider closeLabel={t("dialog.close")}>
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
              {MODULES.map((m) => (
                <NavItem
                  key={m.key}
                  icon={m.icon}
                  label={t(`app.${m.key}`)}
                  disabled
                  title={t("status.phase", { n: m.phase })}
                  trailing={<Badge>{t("status.soon", { n: m.phase })}</Badge>}
                />
              ))}
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
      </ToastProvider>
    </AppContext.Provider>
  );
}
