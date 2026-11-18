import { Badge, Button, Card, NavItem, SegmentedControl, ZynoraMark, applyTheme } from "@zynora/design-system";
import { FileText, Home, Monitor, Moon, Presentation, RefreshCw, Settings as SettingsIcon, Sheet, Sun } from "lucide-react";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";

import { translator, type MessageKey, type Translate } from "./i18n";
import { api as defaultApi, type Api, type AppInfo, type AuditEvent, type Language, type SettingChange, type Settings, type Theme } from "./ipc";

type View = "home" | "settings";

interface Module {
  key: "sheets" | "word" | "slides";
  phase: number;
  icon: ReactNode;
}

/** Ordre de développement validé (docs/ROADMAP.md) : un module n'est activé qu'une fois fonctionnel. */
const MODULES: Module[] = [
  { key: "sheets", phase: 2, icon: <Sheet size={18} aria-hidden /> },
  { key: "word", phase: 3, icon: <FileText size={18} aria-hidden /> },
  { key: "slides", phase: 4, icon: <Presentation size={18} aria-hidden /> },
];

function errorMessage(error: unknown, t: Translate): string {
  const message = error instanceof Error ? error.message : String(error);
  return message === "not_in_tauri" ? t("error.not_in_tauri") : message;
}

export function App({ api = defaultApi }: { api?: Api }) {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [info, setInfo] = useState<AppInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState<View>("home");

  const language: Language = settings?.language ?? "fr";
  const t = useMemo(() => translator(language), [language]);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [loaded, appInfo] = await Promise.all([api.getSettings(), api.appInfo()]);
      setSettings(loaded);
      setInfo(appInfo);
    } catch (e) {
      setError(errorMessage(e, translator("fr")));
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
      setError(errorMessage(e, t));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <ZynoraMark size={30} />
          <div>
            <div className="brand__name">ZYNORA</div>
            <div className="brand__sub">Office</div>
          </div>
        </div>
        <nav className="nav" aria-label="Navigation principale">
          <NavItem icon={<Home size={18} aria-hidden />} label={t("nav.home")} current={view === "home"} onSelect={() => setView("home")} />
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

      <main className="main">
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
        {settings && view === "home" && <HomeView t={t} info={info} />}
        {settings && view === "settings" && (
          <SettingsView t={t} api={api} settings={settings} saving={saving} onChange={change} language={language} />
        )}
      </main>
    </div>
  );
}

function HomeView({ t, info }: { t: Translate; info: AppInfo | null }) {
  return (
    <div className="page">
      <header className="page__header">
        <h1>{t("home.title")}</h1>
        <p className="muted">{t("home.subtitle")}</p>
      </header>

      <section className="modules" aria-label={t("nav.apps")}>
        {MODULES.map((m) => (
          <Card key={m.key} className={`module module--${m.key}`}>
            <div className="module__icon">{m.icon}</div>
            <h2>ZYNORA {t(`app.${m.key}`)}</h2>
            <p className="muted">{t(`app.${m.key}.desc` as MessageKey)}</p>
            <Badge tone="warning">{t("status.phase", { n: m.phase })}</Badge>
          </Card>
        ))}
      </section>

      <div className="grid-2">
        <Card>
          <h2>{t("home.foundations")}</h2>
          <p className="muted">{t("home.foundations.desc")}</p>
        </Card>
        <Card>
          <h2>{t("system.title")}</h2>
          {info && (
            <dl className="facts">
              <dt>{t("system.version")}</dt>
              <dd>{info.version}</dd>
              <dt>{t("system.schema")}</dt>
              <dd>v{info.schema_version}</dd>
              <dt>{t("system.platform")}</dt>
              <dd>
                {info.os} · {info.arch}
              </dd>
              <dt>{t("system.offline")}</dt>
              <dd>{t("system.offline.value")}</dd>
            </dl>
          )}
        </Card>
      </div>
    </div>
  );
}

interface SettingsViewProps {
  t: Translate;
  api: Api;
  settings: Settings;
  saving: boolean;
  language: Language;
  onChange: (change: SettingChange) => Promise<void>;
}

function SettingsView({ t, api, settings, saving, language, onChange }: SettingsViewProps) {
  const [events, setEvents] = useState<AuditEvent[] | null>(null);
  const [journalError, setJournalError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setEvents(await api.recentEvents(20));
      setJournalError(null);
    } catch (e) {
      setJournalError(errorMessage(e, t));
    }
  }, [api, t]);

  // Le journal est relu après chaque changement de paramètre (qui y ajoute une ligne).
  useEffect(() => {
    void refresh();
  }, [refresh, settings]);

  const dateFormat = useMemo(
    () => new Intl.DateTimeFormat(language === "fr" ? "fr-FR" : "en-GB", { dateStyle: "short", timeStyle: "medium" }),
    [language],
  );

  return (
    <div className="page">
      <header className="page__header">
        <h1>{t("settings.title")}</h1>
      </header>

      <Card className="setting">
        <div>
          <h2>{t("settings.appearance")}</h2>
          <p className="muted">{t("settings.appearance.desc")}</p>
        </div>
        <SegmentedControl<Theme>
          label={t("settings.theme")}
          value={settings.theme}
          disabled={saving}
          onChange={(value) => void onChange({ key: "theme", value })}
          options={[
            { value: "light", label: t("settings.theme.light"), icon: <Sun size={14} aria-hidden /> },
            { value: "dark", label: t("settings.theme.dark"), icon: <Moon size={14} aria-hidden /> },
            { value: "system", label: t("settings.theme.system"), icon: <Monitor size={14} aria-hidden /> },
          ]}
        />
      </Card>

      <Card className="setting">
        <div>
          <h2>{t("settings.language")}</h2>
          <p className="muted">{t("settings.language.desc")}</p>
        </div>
        <SegmentedControl<Language>
          label={t("settings.language")}
          value={settings.language}
          disabled={saving}
          onChange={(value) => void onChange({ key: "language", value })}
          options={[
            { value: "fr", label: "Français" },
            { value: "en", label: "English" },
          ]}
        />
      </Card>

      <Card>
        <div className="setting setting--flat">
          <div>
            <h2>{t("settings.journal")}</h2>
            <p className="muted">{t("settings.journal.desc")}</p>
          </div>
          <Button size="sm" variant="ghost" icon={<RefreshCw size={14} aria-hidden />} onClick={() => void refresh()}>
            {t("settings.journal.refresh")}
          </Button>
        </div>
        {journalError && (
          <p className="error-text" role="alert">
            {journalError}
          </p>
        )}
        {events && events.length === 0 && <p className="muted">{t("settings.journal.empty")}</p>}
        {events && events.length > 0 && (
          <ul className="journal">
            {events.map((e) => (
              <li key={e.id}>
                <time dateTime={new Date(e.at_ms).toISOString()}>{dateFormat.format(e.at_ms)}</time>
                <code>{e.action}</code>
                <span>{e.detail}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
