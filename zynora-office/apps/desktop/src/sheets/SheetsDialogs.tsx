import { Button, Dialog, TextField } from "@zynora/design-system";
import { Trash2 } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";

import { errorText, useApp } from "../context";
import type { CellRange, DefinedName, FindOptions, FunctionInfo } from "../ipc";
import type { DialogKind } from "./Ribbon";
import { SYMBOLS, type RibbonText } from "./ribbon-text";
import { cellName, columnName, parseRange, rangeName, type Cell } from "./refs";

interface Props {
  kind: DialogKind;
  r: RibbonText;
  id: number;
  sheet: number;
  sheetName: string;
  selection: CellRange;
  functions: FunctionInfo[];
  onClose: () => void;
  /** Exécute une modification du classeur (état et grille mis à jour par l'éditeur). */
  run: <T>(action: () => Promise<{ value: T; state: import("../ipc").BookState }>) => Promise<T | undefined>;
  select: (anchor: Cell, focus?: Cell) => void;
  insertText: (text: string) => void;
  renameSheet: (name: string) => Promise<boolean>;
  notify: (message: string, tone?: "success" | "error" | "info") => void;
}

export function SheetsDialog(props: Props) {
  switch (props.kind) {
    case "find":
    case "replace":
      return <FindReplace {...props} replace={props.kind === "replace"} />;
    case "goto":
      return <GoTo {...props} />;
    case "sort":
      return <SortDialog {...props} />;
    case "duplicates":
      return <Duplicates {...props} />;
    case "functions":
      return <Functions {...props} />;
    case "names":
      return <Names {...props} />;
    case "symbols":
      return <Symbols {...props} />;
    case "columnWidth":
      return <ColumnWidth {...props} />;
    case "renameSheet":
      return <RenameSheet {...props} />;
  }
}

function Actions({ r, onClose, submit, form, disabled }: { r: RibbonText; onClose: () => void; submit?: string; form?: string; disabled?: boolean }) {
  return (
    <>
      <Button onClick={onClose}>{submit ? r("dlg.cancel") : r("dlg.close")}</Button>
      {submit && (
        <Button variant="primary" type="submit" form={form} disabled={disabled}>
          {submit}
        </Button>
      )}
    </>
  );
}

function FindReplace({ r, id, sheet, onClose, run, select, notify, replace }: Props & { replace: boolean }) {
  const { api, t } = useApp();
  const [text, setText] = useState("");
  const [replacement, setReplacement] = useState("");
  const [options, setOptions] = useState<FindOptions>({ match_case: false, whole_cell: false, in_formulas: false });
  const [results, setResults] = useState<Array<{ row: number; column: number }> | null>(null);
  const [index, setIndex] = useState(0);

  async function findNext(event?: FormEvent) {
    event?.preventDefault();
    try {
      // Nouvelle recherche si le texte ou les options ont changé.
      const list = results ?? (await api.sheetsFind(id, sheet, text, options));
      setResults(list);
      if (list.length === 0) {
        notify(r("notFound"), "info");
        return;
      }
      const next = results ? (index + 1) % list.length : 0;
      setIndex(next);
      const hit = list[next];
      if (hit) select(hit);
    } catch (error) {
      notify(errorText(error, t), "error");
    }
  }

  async function replaceAll() {
    const count = await run(() => api.sheetsReplace(id, sheet, text, replacement, options.match_case));
    if (count !== undefined) {
      notify(r("replaced", { n: count }), "success");
      setResults(null);
    }
  }

  const change = (patch: Partial<FindOptions>) => {
    setOptions((o) => ({ ...o, ...patch }));
    setResults(null);
  };

  return (
    <Dialog
      open
      title={r("dlg.find")}
      onClose={onClose}
      actions={
        <>
          <Button onClick={onClose}>{r("dlg.close")}</Button>
          {replace && (
            <Button disabled={!text} onClick={() => void replaceAll()}>
              {r("dlg.replaceAll")}
            </Button>
          )}
          <Button variant="primary" type="submit" form="find-form" disabled={!text}>
            {r("dlg.findNext")}
          </Button>
        </>
      }
    >
      <form id="find-form" className="dialog-form" onSubmit={(e) => void findNext(e)}>
        <TextField
          label={r("dlg.findWhat")}
          value={text}
          data-autofocus
          onChange={(e) => {
            setText(e.target.value);
            setResults(null);
          }}
        />
        {replace && <TextField label={r("dlg.replaceWith")} value={replacement} onChange={(e) => setReplacement(e.target.value)} />}
        <label className="dialog-check">
          <input type="checkbox" checked={options.match_case} onChange={(e) => change({ match_case: e.target.checked })} />
          {r("dlg.matchCase")}
        </label>
        <label className="dialog-check">
          <input type="checkbox" checked={options.whole_cell} onChange={(e) => change({ whole_cell: e.target.checked })} />
          {r("dlg.wholeCell")}
        </label>
        <label className="dialog-check">
          <input type="checkbox" checked={options.in_formulas} onChange={(e) => change({ in_formulas: e.target.checked })} />
          {r("dlg.inFormulas")}
        </label>
        {results && results.length > 0 && (
          <p className="muted" aria-live="polite">
            {r("dlg.results", { i: index + 1, n: results.length })} — {cellName(results[index] ?? { row: 1, column: 1 })}
          </p>
        )}
      </form>
    </Dialog>
  );
}

function GoTo({ r, sheet, onClose, select }: Props) {
  const [reference, setReference] = useState("");
  const [error, setError] = useState<string | null>(null);
  function submit(event: FormEvent) {
    event.preventDefault();
    const range = parseRange(reference, sheet);
    if (!range) {
      setError(r("dlg.reference"));
      return;
    }
    select({ row: range.top, column: range.left }, { row: range.bottom, column: range.right });
    onClose();
  }
  return (
    <Dialog open title={r("dlg.goTo")} onClose={onClose} actions={<Actions r={r} onClose={onClose} submit={r("dlg.ok")} form="goto-form" disabled={!reference} />}>
      <form id="goto-form" onSubmit={submit}>
        <TextField label={r("dlg.reference")} value={reference} error={error} data-autofocus onChange={(e) => setReference(e.target.value)} />
      </form>
    </Dialog>
  );
}

function SortDialog({ r, id, selection, onClose, run }: Props) {
  const { api } = useApp();
  const [key, setKey] = useState(selection.left);
  const [ascending, setAscending] = useState(true);
  const [header, setHeader] = useState(true);
  const columns = Array.from({ length: selection.right - selection.left + 1 }, (_, i) => selection.left + i);
  async function submit(event: FormEvent) {
    event.preventDefault();
    const done = await run(() => api.sheetsData(id, { op: "sort", range: selection, key, ascending, header }));
    if (done !== undefined) onClose();
  }
  return (
    <Dialog open title={r("dlg.sort")} description={rangeName(selection)} onClose={onClose} actions={<Actions r={r} onClose={onClose} submit={r("dlg.ok")} form="sort-form" />}>
      <form id="sort-form" className="dialog-form" onSubmit={(e) => void submit(e)}>
        <label className="z-field">
          <span className="z-field__label">{r("dlg.sortBy")}</span>
          <select className="z-field__input" value={key} onChange={(e) => setKey(Number(e.target.value))} data-autofocus>
            {columns.map((c) => (
              <option key={c} value={c}>
                {columnName(c)}
              </option>
            ))}
          </select>
        </label>
        <fieldset className="dialog-fieldset">
          <legend className="z-field__label">{r("dlg.order")}</legend>
          <label className="dialog-check">
            <input type="radio" name="ordre" checked={ascending} onChange={() => setAscending(true)} />
            {r("dlg.asc")}
          </label>
          <label className="dialog-check">
            <input type="radio" name="ordre" checked={!ascending} onChange={() => setAscending(false)} />
            {r("dlg.desc")}
          </label>
        </fieldset>
        <label className="dialog-check">
          <input type="checkbox" checked={header} onChange={(e) => setHeader(e.target.checked)} />
          {r("dlg.header")}
        </label>
      </form>
    </Dialog>
  );
}

function Duplicates({ r, id, selection, onClose, run, notify }: Props) {
  const { api } = useApp();
  const [header, setHeader] = useState(true);
  async function submit(event: FormEvent) {
    event.preventDefault();
    const removed = await run(() => api.sheetsData(id, { op: "remove_duplicates", range: selection, header }));
    if (removed !== undefined) {
      notify(r("removed", { n: removed }), "success");
      onClose();
    }
  }
  return (
    <Dialog
      open
      title={r("dlg.duplicates")}
      description={r("dlg.duplicatesDesc", { range: rangeName(selection) })}
      onClose={onClose}
      actions={<Actions r={r} onClose={onClose} submit={r("dlg.ok")} form="dup-form" />}
    >
      <form id="dup-form" onSubmit={(e) => void submit(e)}>
        <label className="dialog-check">
          <input type="checkbox" checked={header} data-autofocus onChange={(e) => setHeader(e.target.checked)} />
          {r("dlg.header")}
        </label>
      </form>
    </Dialog>
  );
}

function Functions({ r, functions, onClose, insertText }: Props) {
  const { language } = useApp();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [selected, setSelected] = useState<FunctionInfo | null>(null);
  const categories = useMemo(() => [...new Set(functions.map((f) => f.category))], [functions]);
  const name = (f: FunctionInfo) => (language === "fr" ? f.fr : f.en);
  const visible = functions.filter(
    (f) => (!category || f.category === category) && (!query || `${name(f)} ${f.description}`.toLowerCase().includes(query.toLowerCase())),
  );
  useEffect(() => {
    setSelected((s) => (s && visible.includes(s) ? s : (visible[0] ?? null)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, category]);
  return (
    <Dialog
      open
      title={r("dlg.functions")}
      onClose={onClose}
      actions={
        <>
          <Button onClick={onClose}>{r("dlg.cancel")}</Button>
          <Button
            variant="primary"
            disabled={!selected}
            onClick={() => {
              if (selected) insertText(`=${name(selected)}(`);
              onClose();
            }}
          >
            {r("dlg.insert")}
          </Button>
        </>
      }
    >
      <div className="dialog-form">
        <TextField label={r("dlg.search")} type="search" value={query} data-autofocus onChange={(e) => setQuery(e.target.value)} />
        <label className="z-field">
          <span className="z-field__label">{r("dlg.category")}</span>
          <select className="z-field__input" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">{r("dlg.allCategories")}</option>
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <ul className="function-list" role="listbox" aria-label={r("dlg.functions")}>
          {visible.map((f) => (
            <li key={f.en} role="option" aria-selected={selected === f}>
              <button type="button" className="function-list__item" onClick={() => setSelected(f)} onDoubleClick={() => {
                insertText(`=${name(f)}(`);
                onClose();
              }}>
                {name(f)}
              </button>
            </li>
          ))}
        </ul>
        {selected && (
          <div className="function-help">
            <code>{language === "fr" ? selected.syntax_fr : selected.syntax_fr.replace(selected.fr, selected.en).replaceAll(";", ",")}</code>
            <p className="muted">{selected.description}</p>
          </div>
        )}
      </div>
    </Dialog>
  );
}

function Names({ r, id, sheetName, selection, onClose, run, notify }: Props) {
  const { api, t } = useApp();
  const [names, setNames] = useState<DefinedName[]>([]);
  const [name, setName] = useState("");
  const [formula, setFormula] = useState(() => `='${sheetName}'!${absolute(rangeName(selection))}`);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    api.sheetsNames(id, { op: "list" }).then((res) => setNames(res.value), (e: unknown) => notify(errorText(e, t), "error"));
  }, [api, id, notify, t]);
  async function add(event: FormEvent) {
    event.preventDefault();
    try {
      setNames((await api.sheetsNames(id, { op: "add", name, scope: null, formula })).value);
      setName("");
      setError(null);
      await run(() => api.sheetsNames(id, { op: "list" }));
    } catch (e) {
      setError(errorText(e, t));
    }
  }
  async function remove(entry: DefinedName) {
    const updated = await run(() => api.sheetsNames(id, { op: "delete", name: entry.name, scope: entry.scope }));
    if (updated) setNames(updated);
  }
  return (
    <Dialog open title={r("dlg.names")} onClose={onClose} actions={<Actions r={r} onClose={onClose} />}>
      {names.length === 0 ? (
        <p className="muted">{r("dlg.noNames")}</p>
      ) : (
        <table className="names-table">
          <thead>
            <tr>
              <th scope="col">{r("dlg.name")}</th>
              <th scope="col">{r("dlg.refersTo")}</th>
              <th scope="col">
                <span className="z-visually-hidden">{r("delete")}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {names.map((n) => (
              <tr key={`${n.name}-${n.scope}`}>
                <td>{n.name}</td>
                <td>
                  <code>{n.formula}</code>
                </td>
                <td>
                  <button type="button" className="z-icon-button" aria-label={`${r("delete")} ${n.name}`} onClick={() => void remove(n)}>
                    <Trash2 size={14} aria-hidden />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <form className="dialog-form" onSubmit={(e) => void add(e)}>
        <TextField label={r("dlg.name")} value={name} error={error} data-autofocus onChange={(e) => setName(e.target.value)} />
        <TextField label={r("dlg.refersTo")} value={formula} onChange={(e) => setFormula(e.target.value)} />
        <Button type="submit" disabled={!name.trim() || !formula.trim()}>
          {r("dlg.add")}
        </Button>
      </form>
    </Dialog>
  );
}

/** « B2:C4 » → « $B$2:$C$4 » (un nom désigne en général une plage fixe). */
function absolute(range: string): string {
  return range.replace(/([A-Z]+)(\d+)/g, "$$$1$$$2");
}

function Symbols({ r, onClose, insertText }: Props) {
  return (
    <Dialog open title={r("dlg.symbols")} onClose={onClose} actions={<Actions r={r} onClose={onClose} />}>
      <div className="symbol-grid" role="group" aria-label={r("dlg.symbols")}>
        {SYMBOLS.map((symbol) => (
          <button
            key={symbol}
            type="button"
            className="symbol-grid__item"
            onClick={() => {
              insertText(symbol);
              onClose();
            }}
          >
            {symbol}
          </button>
        ))}
      </div>
    </Dialog>
  );
}

function ColumnWidth({ r, id, sheet, selection, onClose, run }: Props) {
  const { api } = useApp();
  const [width, setWidth] = useState("100");
  async function submit(event: FormEvent) {
    event.preventDefault();
    const value = Number(width);
    for (let column = selection.left; column <= Math.min(selection.right, selection.left + 200); column++) {
      await run(() => api.sheetsStructure(id, { op: "column_width", sheet, column, width: value }));
    }
    onClose();
  }
  const valid = Number(width) >= 8 && Number(width) <= 2000;
  return (
    <Dialog open title={r("columnWidth")} onClose={onClose} actions={<Actions r={r} onClose={onClose} submit={r("dlg.ok")} form="width-form" disabled={!valid} />}>
      <form id="width-form" onSubmit={(e) => void submit(e)}>
        <TextField label={r("dlg.width")} type="number" min={8} max={2000} value={width} data-autofocus onChange={(e) => setWidth(e.target.value)} />
      </form>
    </Dialog>
  );
}

function RenameSheet({ r, sheetName, onClose, renameSheet }: Props) {
  const [name, setName] = useState(sheetName);
  return (
    <Dialog open title={r("renameSheet")} onClose={onClose} actions={<Actions r={r} onClose={onClose} submit={r("dlg.ok")} form="rename-sheet-form" disabled={!name.trim()} />}>
      <form
        id="rename-sheet-form"
        onSubmit={(e) => {
          e.preventDefault();
          void renameSheet(name.trim()).then((ok) => ok && onClose());
        }}
      >
        <TextField label={r("renameSheet")} value={name} data-autofocus onChange={(e) => setName(e.target.value)} />
      </form>
    </Dialog>
  );
}
