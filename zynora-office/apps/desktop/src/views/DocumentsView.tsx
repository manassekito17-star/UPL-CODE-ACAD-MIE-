import { Button, Dialog, IconButton, TextField, useToasts } from "@zynora/design-system";
import { ChevronRight, FileText, FolderPlus, Pencil, Search, Sheet, Star, Trash2, Upload } from "lucide-react";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";

import { errorText, useApp } from "../context";
import { dateFormatter, editorPhase, formatSize, parentPath } from "../format";
import type { EntryView } from "../ipc";
import { EntryIcon } from "./EntryIcon";
import { useImport } from "./useImport";

interface Props {
  path: string;
  onNavigate: (path: string) => void;
}

export function DocumentsView({ path, onNavigate }: Props) {
  const { api, t, language, openWorkbook, createWorkbook, openText, createText } = useApp();
  const toast = useToasts();
  const [entries, setEntries] = useState<EntryView[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<EntryView[] | null>(null);
  const [newFolderOpen, setNewFolderOpen] = useState(false);
  const [renaming, setRenaming] = useState<EntryView | null>(null);
  const [revision, setRevision] = useState(0);
  const refresh = useCallback(() => setRevision((r) => r + 1), []);
  const { importInto, rejectedDialog } = useImport(refresh);
  const dates = useMemo(() => dateFormatter(language), [language]);

  useEffect(() => {
    let active = true;
    api
      .listFolder(path)
      .then((list) => {
        if (!active) return;
        setEntries(list);
        setLoadError(null);
      })
      .catch((error: unknown) => active && setLoadError(errorText(error, t)));
    return () => {
      active = false;
    };
  }, [api, path, revision, t]);

  // Recherche dans toute la bibliothèque, déclenchée après une courte pause de frappe.
  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults(null);
      return;
    }
    let active = true;
    const timer = setTimeout(() => {
      api
        .searchDocuments(q)
        .then((found) => active && setResults(found))
        .catch((error: unknown) => active && toast({ tone: "error", message: errorText(error, t) }));
    }, 250);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [api, query, revision, t, toast]);

  async function toggleFavorite(entry: EntryView) {
    try {
      await api.setFavorite(entry.path, !entry.favorite);
      refresh();
    } catch (error) {
      toast({ tone: "error", message: errorText(error, t) });
    }
  }

  async function moveToTrash(entry: EntryView) {
    try {
      const item = await api.trashEntry(entry.path);
      refresh();
      toast({
        tone: "success",
        message: t("docs.trashed", { name: entry.name }),
        action: {
          label: t("docs.undo"),
          onAction: () => {
            api
              .restoreTrash(item.id)
              .then((restored) => {
                refresh();
                toast({ tone: "success", message: t("docs.restored", { name: restored.name }) });
              })
              .catch((error: unknown) => toast({ tone: "error", message: errorText(error, t) }));
          },
        },
      });
    } catch (error) {
      toast({ tone: "error", message: errorText(error, t) });
    }
  }

  const searching = results !== null;
  const rows = searching ? results : entries;
  const segments = path ? path.split("/") : [];

  return (
    <div className="page">
      <header className="page__header page__header--row">
        <h1>{t("docs.title")}</h1>
        <div className="toolbar">
          <Button icon={<Sheet size={16} aria-hidden />} onClick={() => void createWorkbook(path)} disabled={searching}>
            {t("sheets.new")}
          </Button>
          <Button icon={<FileText size={16} aria-hidden />} onClick={() => void createText(path)} disabled={searching}>
            {t("word.new")}
          </Button>
          <Button icon={<FolderPlus size={16} aria-hidden />} onClick={() => setNewFolderOpen(true)} disabled={searching}>
            {t("docs.newFolder")}
          </Button>
          <Button variant="primary" icon={<Upload size={16} aria-hidden />} onClick={() => void importInto(path)} disabled={searching}>
            {t("docs.import")}
          </Button>
        </div>
      </header>

      <div className="search">
        <Search size={16} aria-hidden className="search__icon" />
        <TextField label={t("docs.search")} hideLabel placeholder={t("docs.search")} type="search" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      {!searching && (
        <nav className="breadcrumb" aria-label={t("docs.root")}>
          <button type="button" onClick={() => onNavigate("")} aria-current={segments.length === 0 ? "location" : undefined}>
            {t("docs.root")}
          </button>
          {segments.map((segment, index) => {
            const target = segments.slice(0, index + 1).join("/");
            return (
              <span key={target} className="breadcrumb__item">
                <ChevronRight size={14} aria-hidden />
                <button type="button" onClick={() => onNavigate(target)} aria-current={index === segments.length - 1 ? "location" : undefined}>
                  {segment}
                </button>
              </span>
            );
          })}
        </nav>
      )}

      {searching && (
        <p className="muted" aria-live="polite">
          {results.length > 0 ? t("docs.search.results", { n: results.length, q: query.trim() }) : t("docs.search.none", { q: query.trim() })}
        </p>
      )}
      {loadError && !searching && (
        <p className="error-text" role="alert">
          {loadError}
        </p>
      )}
      {!searching && entries?.length === 0 && <p className="empty">{t("docs.empty")}</p>}

      {rows && rows.length > 0 && (
        <table className="files">
          <thead>
            <tr>
              <th scope="col">{t("docs.col.name")}</th>
              <th scope="col">{searching ? t("docs.col.location") : t("docs.col.kind")}</th>
              <th scope="col" className="num">
                {t("docs.col.size")}
              </th>
              <th scope="col">{t("docs.col.modified")}</th>
              <th scope="col">
                <span className="z-visually-hidden">{t("docs.col.actions")}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((entry) => {
              const phase = editorPhase(entry.kind);
              return (
                <tr key={entry.path}>
                  <td>
                    <span className="files__name">
                      <EntryIcon kind={entry.kind} />
                      {entry.kind === "folder" ? (
                        <button type="button" className="link" aria-label={t("docs.open", { name: entry.name })} onClick={() => { setQuery(""); onNavigate(entry.path); }}>
                          {entry.name}
                        </button>
                      ) : entry.kind === "spreadsheet" || entry.kind === "text" ? (
                        <button
                          type="button"
                          className="link"
                          aria-label={t("docs.open", { name: entry.name })}
                          onClick={() => void (entry.kind === "text" ? openText(entry.path) : openWorkbook(entry.path))}
                        >
                          {entry.name}
                        </button>
                      ) : (
                        <span title={phase ? t("docs.editorLater", { n: phase }) : undefined}>{entry.name}</span>
                      )}
                    </span>
                  </td>
                  <td className="muted">{searching ? parentPath(entry.path) || t("docs.root") : t(`kind.${entry.kind}`)}</td>
                  <td className="num muted">{entry.kind === "folder" ? "—" : formatSize(entry.size, language)}</td>
                  <td className="muted">{entry.modified_ms ? dates.format(entry.modified_ms) : "—"}</td>
                  <td>
                    <span className="row-actions">
                      {entry.kind !== "folder" && (
                        <IconButton
                          label={t(entry.favorite ? "docs.favorite.remove" : "docs.favorite.add", { name: entry.name })}
                          aria-pressed={entry.favorite}
                          onClick={() => void toggleFavorite(entry)}
                        >
                          <Star size={16} aria-hidden fill={entry.favorite ? "currentColor" : "none"} />
                        </IconButton>
                      )}
                      <IconButton label={t("docs.rename", { name: entry.name })} onClick={() => setRenaming(entry)}>
                        <Pencil size={16} aria-hidden />
                      </IconButton>
                      <IconButton label={t("docs.trash", { name: entry.name })} onClick={() => void moveToTrash(entry)}>
                        <Trash2 size={16} aria-hidden />
                      </IconButton>
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      <NameDialog
        key={newFolderOpen ? "nouveau-ouvert" : "nouveau"}
        open={newFolderOpen}
        title={t("dialog.newFolder.title")}
        label={t("dialog.newFolder.label")}
        submitLabel={t("dialog.create")}
        initial=""
        onClose={() => setNewFolderOpen(false)}
        onSubmit={async (name) => {
          await api.createFolder(path, name);
          refresh();
        }}
      />
      <NameDialog
        key={renaming?.path ?? "renommer"}
        open={renaming !== null}
        title={t("dialog.rename.title")}
        label={t("dialog.rename.label")}
        submitLabel={t("dialog.save")}
        initial={renaming?.name ?? ""}
        selectStem={renaming?.kind !== "folder"}
        onClose={() => setRenaming(null)}
        onSubmit={async (name) => {
          if (renaming) await api.renameEntry(renaming.path, name);
          refresh();
        }}
      />
      {rejectedDialog}
    </div>
  );
}

interface NameDialogProps {
  open: boolean;
  title: string;
  label: string;
  submitLabel: string;
  initial: string;
  /** Sélectionne le nom sans l'extension, pour un renommage rapide. */
  selectStem?: boolean;
  onClose: () => void;
  onSubmit: (name: string) => Promise<void>;
}

/**
 * Saisie d'un nom ; l'erreur du backend (nom réservé, déjà pris…) s'affiche sous le champ.
 * Le parent la remonte (`key`) à chaque ouverture : le champ est rempli avant de prendre le focus.
 */
function NameDialog({ open, title, label, submitLabel, initial, selectStem, onClose, onSubmit }: NameDialogProps) {
  const { t } = useApp();
  const [value, setValue] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      await onSubmit(value.trim());
      onClose();
    } catch (e) {
      setError(errorText(e, t));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog
      open={open}
      title={title}
      onClose={onClose}
      actions={
        <>
          <Button onClick={onClose}>{t("dialog.cancel")}</Button>
          <Button variant="primary" type="submit" form="name-dialog-form" disabled={busy || value.trim() === ""}>
            {submitLabel}
          </Button>
        </>
      }
    >
      <form id="name-dialog-form" onSubmit={(e) => void submit(e)}>
        <TextField
          label={label}
          value={value}
          error={error}
          data-autofocus
          onChange={(e) => {
            setValue(e.target.value);
            setError(null);
          }}
          onFocus={(e) => {
            const dot = e.target.value.lastIndexOf(".");
            if (selectStem && dot > 0) e.target.setSelectionRange(0, dot);
            else e.target.select();
          }}
        />
      </form>
    </Dialog>
  );
}
