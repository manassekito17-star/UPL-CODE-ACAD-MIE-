import { Button, Dialog, useToasts } from "@zynora/design-system";
import { RotateCcw, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { errorText, useApp } from "../context";
import { dateFormatter, formatSize, parentPath } from "../format";
import type { TrashItem } from "../ipc";
import { EntryIcon } from "./EntryIcon";

/** Confirmation en attente : un élément précis, ou toute la corbeille. */
type Pending = { kind: "one"; item: TrashItem } | { kind: "all" } | null;

export function TrashView() {
  const { api, t, language } = useApp();
  const toast = useToasts();
  const [items, setItems] = useState<TrashItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<Pending>(null);
  const [busy, setBusy] = useState(false);
  const dates = useMemo(() => dateFormatter(language), [language]);

  const load = useCallback(() => {
    api
      .listTrash()
      .then((list) => {
        setItems(list);
        setError(null);
      })
      .catch((e: unknown) => setError(errorText(e, t)));
  }, [api, t]);

  useEffect(load, [load]);

  async function restore(item: TrashItem) {
    try {
      const entry = await api.restoreTrash(item.id);
      toast({ tone: "success", message: t("docs.restored", { name: entry.name }) });
    } catch (e) {
      toast({ tone: "error", message: errorText(e, t) });
    }
    load();
  }

  async function confirm() {
    if (!pending) return;
    setBusy(true);
    try {
      if (pending.kind === "one") {
        await api.purgeTrash(pending.item.id);
        toast({ tone: "success", message: t("trash.purged") });
      } else {
        const n = await api.emptyTrash();
        toast({ tone: "success", message: t("trash.emptied", { n }) });
      }
    } catch (e) {
      toast({ tone: "error", message: errorText(e, t) });
    } finally {
      setBusy(false);
      setPending(null);
      load();
    }
  }

  return (
    <div className="page">
      <header className="page__header page__header--row">
        <div>
          <h1>{t("trash.title")}</h1>
          <p className="muted">{t("trash.desc")}</p>
        </div>
        <Button icon={<Trash2 size={16} aria-hidden />} disabled={!items || items.length === 0} onClick={() => setPending({ kind: "all" })}>
          {t("trash.emptyAll")}
        </Button>
      </header>

      {error && (
        <p className="error-text" role="alert">
          {error}
        </p>
      )}
      {items?.length === 0 && <p className="empty">{t("trash.empty")}</p>}
      {items && items.length > 0 && (
        <table className="files">
          <thead>
            <tr>
              <th scope="col">{t("docs.col.name")}</th>
              <th scope="col">{t("docs.col.location")}</th>
              <th scope="col" className="num">
                {t("docs.col.size")}
              </th>
              <th scope="col">{t("trash.deleted")}</th>
              <th scope="col">
                <span className="z-visually-hidden">{t("docs.col.actions")}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>
                  <span className="files__name">
                    <EntryIcon kind={item.is_dir ? "folder" : "text"} />
                    {item.name}
                  </span>
                </td>
                <td className="muted">{parentPath(item.original_path) || t("docs.root")}</td>
                <td className="num muted">{item.is_dir ? "—" : formatSize(item.size, language)}</td>
                <td className="muted">{dates.format(item.deleted_at_ms)}</td>
                <td>
                  <span className="row-actions">
                    <Button size="sm" variant="ghost" icon={<RotateCcw size={14} aria-hidden />} onClick={() => void restore(item)}>
                      {t("trash.restore")}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setPending({ kind: "one", item })}>
                      {t("trash.purge")}
                    </Button>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Dialog
        open={pending !== null}
        role="alertdialog"
        title={pending?.kind === "one" ? t("trash.confirmPurge.title", { name: pending.item.name }) : t("trash.confirmEmpty.title")}
        description={t("trash.confirm.desc")}
        onClose={() => setPending(null)}
        actions={
          <>
            {/* Le bouton sûr reçoit le focus en premier. */}
            <Button onClick={() => setPending(null)}>{t("dialog.cancel")}</Button>
            <Button variant="danger" disabled={busy} onClick={() => void confirm()}>
              {pending?.kind === "one" ? t("trash.purge") : t("trash.emptyAll")}
            </Button>
          </>
        }
      />
    </div>
  );
}
