import { Badge, Button, Card, SegmentedControl, useToasts } from "@zynora/design-system";
import { FolderOpen, Monitor, Moon, RefreshCw, Sun } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { errorText, useApp } from "../context";
import type { AuditEvent, Language, LibraryInfo, SettingChange, Settings, Theme } from "../ipc";

interface Props {
  /** Sur téléphone, la bibliothèque ne peut pas être déplacée (espace privé de l'application). */
  mobile: boolean;
  settings: Settings;
  saving: boolean;
  onChange: (change: SettingChange) => Promise<void>;
  onLibraryChanged: () => void;
}

export function SettingsView({ mobile, settings, saving, onChange, onLibraryChanged }: Props) {
  const { api, t, language } = useApp();
  const toast = useToasts();
  const [events, setEvents] = useState<AuditEvent[] | null>(null);
  const [journalError, setJournalError] = useState<string | null>(null);
  const [library, setLibrary] = useState<LibraryInfo | null>(null);

  const refresh = useCallback(async () => {
    try {
      setEvents(await api.recentEvents(20));
      setJournalError(null);
    } catch (e) {
      setJournalError(errorText(e, t));
    }
  }, [api, t]);

  // Le journal est relu après chaque changement de paramètre (qui y ajoute une ligne).
  useEffect(() => {
    void refresh();
  }, [refresh, settings]);

  useEffect(() => {
    api.libraryInfo().then(setLibrary, (e: unknown) => toast({ tone: "error", message: errorText(e, t) }));
  }, [api, t, toast]);

  async function changeLibrary() {
    try {
      const chosen = await api.chooseLibrary();
      if (!chosen) return;
      setLibrary(chosen);
      onLibraryChanged();
      void refresh();
      toast({ tone: "success", message: t("settings.library.changed", { path: chosen.path }) });
    } catch (e) {
      toast({ tone: "error", message: errorText(e, t) });
    }
  }

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

      <Card className="setting">
        <div className="setting__text">
          <h2>{t("settings.library")}</h2>
          <p className="muted">{t("settings.library.desc")}</p>
          {library && (
            <p className="path">
              <code>{library.path}</code> {library.is_default && <Badge>{t("settings.library.default")}</Badge>}
            </p>
          )}
        </div>
        {!mobile && (
          <Button icon={<FolderOpen size={16} aria-hidden />} onClick={() => void changeLibrary()}>
            {t("settings.library.change")}
          </Button>
        )}
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
