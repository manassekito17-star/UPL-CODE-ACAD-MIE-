import { Badge, Button, Card, IconButton } from "@zynora/design-system";
import { AlertTriangle, FileText, FolderOpen, LifeBuoy, Presentation, Sheet, Upload } from "lucide-react";
import { useCallback, useEffect, useState, type ReactNode } from "react";

import { errorText, useApp } from "../context";
import { parentPath } from "../format";
import type { AppInfo, Dashboard, EntryView, RecoveryRecord } from "../ipc";
import { EntryIcon } from "./EntryIcon";
import { useImport } from "./useImport";

interface Module {
  key: "sheets" | "word" | "slides";
  phase: number;
  icon: ReactNode;
}

/** Ordre de développement validé (ROADMAP.md) : un module n'est activé qu'une fois fonctionnel. */
export const MODULES: Module[] = [
  { key: "sheets", phase: 2, icon: <Sheet size={18} aria-hidden /> },
  { key: "word", phase: 3, icon: <FileText size={18} aria-hidden /> },
  { key: "slides", phase: 4, icon: <Presentation size={18} aria-hidden /> },
];

interface Props {
  info: AppInfo | null;
  onLocate: (folder: string) => void;
}

export function HomeView({ info, onLocate }: Props) {
  const { api, t, openWorkbook, createWorkbook, openRecovery } = useApp();
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [recoveries, setRecoveries] = useState<RecoveryRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [noticeDismissed, setNoticeDismissed] = useState(false);

  const load = useCallback(() => {
    api
      .dashboard()
      .then((d) => {
        setDashboard(d);
        setError(null);
      })
      .catch((e: unknown) => setError(errorText(e, t)));
    api.listRecoveries().then(setRecoveries, (e: unknown) => setError(errorText(e, t)));
  }, [api, t]);
  useEffect(load, [load]);
  const { importInto, rejectedDialog } = useImport(load);

  return (
    <div className="page">
      <header className="page__header page__header--row">
        <div>
          <h1>{t("home.title")}</h1>
          <p className="muted">{t("home.subtitle")}</p>
        </div>
        <div className="toolbar">
          <Button icon={<FolderOpen size={16} aria-hidden />} onClick={() => onLocate("")}>
            {t("nav.documents")}
          </Button>
          <Button variant="primary" icon={<Upload size={16} aria-hidden />} onClick={() => void importInto("")}>
            {t("docs.import")}
          </Button>
        </div>
      </header>

      {info?.previous_session_interrupted && !noticeDismissed && (
        <div className="notice" role="status">
          <AlertTriangle size={18} aria-hidden />
          <div>
            <strong>{t("home.interrupted.title")}</strong>
            <p className="muted">{t("home.interrupted.desc")}</p>
          </div>
          <Button size="sm" onClick={() => setNoticeDismissed(true)}>
            {t("home.interrupted.dismiss")}
          </Button>
        </div>
      )}
      {recoveries.length > 0 && (
        <div className="notice notice--recovery" role="region" aria-label={t("recovery.title")}>
          <LifeBuoy size={18} aria-hidden />
          <div>
            <strong>{t("recovery.title")}</strong>
            <p className="muted">{t("recovery.desc")}</p>
            <ul className="doc-list">
              {recoveries.map((r) => (
                <li key={r.path}>
                  <EntryIcon kind="spreadsheet" />
                  <span className="doc-list__name">{r.path}</span>
                  <Button size="sm" variant="primary" onClick={() => void openRecovery(r.path)}>
                    {t("recovery.open")}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => void api.discardRecovery(r.path).then(load, (e: unknown) => setError(errorText(e, t)))}>
                    {t("recovery.discard")}
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      {error && (
        <p className="error-text" role="alert">
          {error}
        </p>
      )}

      <div className="grid-2">
        <DocumentList title={t("home.recent")} empty={t("home.recent.empty")} items={dashboard?.recent} onLocate={onLocate} />
        <DocumentList title={t("home.favorites")} empty={t("home.favorites.empty")} items={dashboard?.favorites} onLocate={onLocate} />
      </div>

      <section className="modules" aria-label={t("nav.apps")}>
        {MODULES.map((m) => (
          <Card key={m.key} className={`module module--${m.key}`}>
            <div className="module__icon">{m.icon}</div>
            <h2>ZYNORA {t(`app.${m.key}`)}</h2>
            <p className="muted">{t(`app.${m.key}.desc`)}</p>
            {m.key === "sheets" ? (
              <Button variant="primary" size="sm" icon={<Sheet size={14} aria-hidden />} onClick={() => void createWorkbook("")}>
                {t("sheets.new")}
              </Button>
            ) : (
              <Badge tone="warning">{t("status.phase", { n: m.phase })}</Badge>
            )}
          </Card>
        ))}
      </section>

      {info && (
        <Card>
          <h2>{t("system.title")}</h2>
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
        </Card>
      )}
      {rejectedDialog}
    </div>
  );
}

function DocumentList({ title, empty, items, onLocate }: { title: string; empty: string; items: EntryView[] | undefined; onLocate: (folder: string) => void }) {
  const { t, openWorkbook } = useApp();
  return (
    <Card>
      <h2>{title}</h2>
      {items?.length === 0 && <p className="muted">{empty}</p>}
      {items && items.length > 0 && (
        <ul className="doc-list">
          {items.map((item) => (
            <li key={item.path}>
              <EntryIcon kind={item.kind} />
              <span className="doc-list__name">
                {item.kind === "spreadsheet" ? (
                  <button type="button" className="link" onClick={() => void openWorkbook(item.path)}>
                    {item.name}
                  </button>
                ) : (
                  item.name
                )}
                <span className="muted">{parentPath(item.path) || t("docs.root")}</span>
              </span>
              <IconButton label={`${t("home.locate")} : ${item.name}`} onClick={() => onLocate(parentPath(item.path))}>
                <FolderOpen size={16} aria-hidden />
              </IconButton>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
