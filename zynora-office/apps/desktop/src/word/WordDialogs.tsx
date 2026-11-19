import { Button, Dialog, TextField } from "@zynora/design-system";
import { NodeSelection, TextSelection, type EditorState, type Transaction } from "prosemirror-state";
import { useMemo, useState, type FormEvent } from "react";

import type { DocPage } from "../ipc";
import { SYMBOLS } from "../sheets/ribbon-text";
import { countWords } from "./convert";
import { findAll, replaceAll, selectedParagraphs } from "./commands";
import { isSafeLink, schema } from "./schema";
import type { WordDialogKind } from "./WordRibbon";
import type { WordText } from "./word-text";

export interface DialogControl {
  w: WordText;
  /** État courant de l'éditeur (lu à l'appel). */
  state: () => EditorState;
  dispatch: (tr: Transaction) => void;
  page: DocPage;
  setPage: (change: Partial<DocPage>) => void;
  insertTable: (rows: number, columns: number) => void;
  saveCopy: (name: string) => Promise<boolean>;
  defaultCopyName: string;
  notify: (message: string, tone?: "success" | "error" | "info") => void;
  onClose: () => void;
}

export function WordDialog({ kind, ...c }: DialogControl & { kind: WordDialogKind }) {
  switch (kind) {
    case "find":
    case "replace":
      return <FindReplace {...c} replace={kind === "replace"} />;
    case "link":
      return <LinkDialog {...c} />;
    case "symbol":
      return <SymbolDialog {...c} />;
    case "table":
      return <TableDialog {...c} />;
    case "margins":
      return <MarginsDialog {...c} />;
    case "paragraph":
      return <ParagraphDialog {...c} />;
    case "wordCount":
      return <WordCount {...c} />;
    case "saveCopy":
      return <SaveCopy {...c} />;
    case "image":
      return <ImageSize {...c} />;
  }
}

function Actions({ w, onClose, submit, form, disabled }: { w: WordText; onClose: () => void; submit?: string; form?: string; disabled?: boolean }) {
  return (
    <>
      <Button onClick={onClose}>{submit ? w("dlg.cancel") : w("dlg.close")}</Button>
      {submit && (
        <Button variant="primary" type="submit" form={form} disabled={disabled}>
          {submit}
        </Button>
      )}
    </>
  );
}

function parseNumber(value: string): number | null {
  const n = Number(value.trim().replace(",", "."));
  return value.trim() !== "" && Number.isFinite(n) ? n : null;
}

function FindReplace({ w, state, dispatch, notify, onClose, replace }: DialogControl & { replace: boolean }) {
  const [text, setText] = useState("");
  const [replacement, setReplacement] = useState("");
  const [matchCase, setMatchCase] = useState(false);
  const [count, setCount] = useState<number | null>(null);

  function select(from: number, to: number) {
    const s = state();
    dispatch(s.tr.setSelection(TextSelection.create(s.doc, from, to)).scrollIntoView());
  }

  function findNext(event?: FormEvent) {
    event?.preventDefault();
    const s = state();
    const hits = findAll(s.doc, text, matchCase);
    setCount(hits.length);
    if (hits.length === 0) {
      notify(w("dlg.notFound"), "info");
      return;
    }
    // Occurrence suivante après la sélection, en reprenant au début.
    const hit = hits.find((h) => h.from >= s.selection.to) ?? hits[0]!;
    select(hit.from, hit.to);
  }

  function replaceOne() {
    const s = state();
    const { from, to } = s.selection;
    const current = s.doc.textBetween(from, to);
    if (from !== to && (matchCase ? current === text : current.toLocaleLowerCase() === text.toLocaleLowerCase())) {
      const marks = s.doc.resolve(from + 1).marks();
      dispatch(replacement ? s.tr.replaceWith(from, to, schema.text(replacement, marks)) : s.tr.delete(from, to));
    }
    findNext();
  }

  function all() {
    const n = replaceAll(state(), dispatch, text, replacement, matchCase);
    setCount(null);
    notify(w("dlg.replaced", { n }), n ? "success" : "info");
  }

  return (
    <Dialog
      open
      title={replace ? w("replace") : w("find")}
      onClose={onClose}
      actions={
        <>
          <Button onClick={onClose}>{w("dlg.close")}</Button>
          {replace && (
            <>
              <Button disabled={!text} onClick={replaceOne}>
                {w("dlg.replaceOne")}
              </Button>
              <Button disabled={!text} onClick={all}>
                {w("dlg.replaceAll")}
              </Button>
            </>
          )}
          <Button variant="primary" type="submit" form="word-find" disabled={!text}>
            {w("dlg.findNext")}
          </Button>
        </>
      }
    >
      <form id="word-find" className="dialog-form" onSubmit={findNext}>
        <TextField
          label={w("dlg.findWhat")}
          value={text}
          data-autofocus
          onChange={(e) => {
            setText(e.target.value);
            setCount(null);
          }}
        />
        {replace && <TextField label={w("dlg.replaceWith")} value={replacement} onChange={(e) => setReplacement(e.target.value)} />}
        <label className="dialog-check">
          <input type="checkbox" checked={matchCase} onChange={(e) => setMatchCase(e.target.checked)} />
          {w("dlg.matchCase")}
        </label>
        {count !== null && <p className="muted" role="status">{count ? w("dlg.found", { n: count }) : w("dlg.notFound")}</p>}
      </form>
    </Dialog>
  );
}

function LinkDialog({ w, state, dispatch, onClose }: DialogControl) {
  const initial = useMemo(() => {
    const s = state();
    const { from, to, $from } = s.selection;
    const mark = schema.marks.link.isInSet($from.marks());
    return { text: s.doc.textBetween(from, to), url: (mark?.attrs.href as string | undefined) ?? "https://" };
  }, [state]);
  const [text, setText] = useState(initial.text);
  const [url, setUrl] = useState(initial.url);
  const valid = isSafeLink(url) && url.trim().length > "https://".length - 1;

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!valid) return;
    const s = state();
    const mark = schema.marks.link.create({ href: url.trim() });
    const { from, to } = s.selection;
    const label = text || url.trim();
    const marks = s.selection.$from.marks().filter((m) => m.type !== schema.marks.link);
    const tr = s.tr.replaceWith(from, to, schema.text(label, [...marks, mark]));
    dispatch(tr.setSelection(TextSelection.create(tr.doc, from + label.length)).scrollIntoView());
    onClose();
  }

  return (
    <Dialog open title={w("link")} onClose={onClose} actions={<Actions w={w} onClose={onClose} submit={w("dlg.ok")} form="word-link" disabled={!valid} />}>
      <form id="word-link" className="dialog-form" onSubmit={submit}>
        <TextField label={w("dlg.linkText")} value={text} onChange={(e) => setText(e.target.value)} />
        <TextField label={w("dlg.linkUrl")} value={url} data-autofocus onChange={(e) => setUrl(e.target.value)} error={url.length > 8 && !isSafeLink(url) ? w("dlg.linkInvalid") : undefined} />
      </form>
    </Dialog>
  );
}

function SymbolDialog({ w, state, dispatch, onClose }: DialogControl) {
  return (
    <Dialog open title={w("symbol")} onClose={onClose} actions={<Actions w={w} onClose={onClose} />}>
      <div className="symbol-grid">
        {SYMBOLS.map((s) => (
          <button
            key={s}
            type="button"
            className="symbol-grid__item"
            aria-label={s}
            onClick={() => {
              dispatch(state().tr.insertText(s).scrollIntoView());
              onClose();
            }}
          >
            {s}
          </button>
        ))}
      </div>
    </Dialog>
  );
}

function TableDialog({ w, insertTable, onClose }: DialogControl) {
  const [rows, setRows] = useState("3");
  const [columns, setColumns] = useState("3");
  const r = parseNumber(rows);
  const c = parseNumber(columns);
  const valid = r !== null && c !== null && Number.isInteger(r) && Number.isInteger(c) && r >= 1 && r <= 100 && c >= 1 && c <= 20;
  return (
    <Dialog open title={w("table.custom")} onClose={onClose} actions={<Actions w={w} onClose={onClose} submit={w("dlg.ok")} form="word-table" disabled={!valid} />}>
      <form
        id="word-table"
        className="dialog-form"
        onSubmit={(e) => {
          e.preventDefault();
          if (!valid) return;
          insertTable(r, c);
          onClose();
        }}
      >
        <TextField label={w("dlg.rows")} inputMode="numeric" value={rows} data-autofocus onChange={(e) => setRows(e.target.value)} />
        <TextField label={w("dlg.columns")} inputMode="numeric" value={columns} onChange={(e) => setColumns(e.target.value)} />
      </form>
    </Dialog>
  );
}

function MarginsDialog({ w, page, setPage, onClose }: DialogControl) {
  const [values, setValues] = useState({
    top: String(page.margin_top_mm),
    bottom: String(page.margin_bottom_mm),
    left: String(page.margin_left_mm),
    right: String(page.margin_right_mm),
  });
  const parsed = Object.fromEntries(Object.entries(values).map(([k, v]) => [k, parseNumber(v)])) as Record<keyof typeof values, number | null>;
  const width = page.orientation === "portrait" ? Math.min(page.width_mm, page.height_mm) : Math.max(page.width_mm, page.height_mm);
  const height = page.orientation === "portrait" ? Math.max(page.width_mm, page.height_mm) : Math.min(page.width_mm, page.height_mm);
  const ok = Object.values(parsed).every((v) => v !== null && v >= 0 && v <= 200);
  const fits = ok && parsed.left! + parsed.right! < width - 10 && parsed.top! + parsed.bottom! < height - 10;
  const field = (key: keyof typeof values, label: string) => (
    <TextField label={label} inputMode="decimal" value={values[key]} onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))} error={parsed[key] === null ? w("dlg.invalidNumber") : undefined} />
  );
  return (
    <Dialog open title={w("margins.custom")} onClose={onClose} actions={<Actions w={w} onClose={onClose} submit={w("dlg.apply")} form="word-margins" disabled={!fits} />}>
      <form
        id="word-margins"
        className="dialog-form dialog-form--grid"
        onSubmit={(e) => {
          e.preventDefault();
          if (!fits) return;
          setPage({ margin_top_mm: parsed.top!, margin_bottom_mm: parsed.bottom!, margin_left_mm: parsed.left!, margin_right_mm: parsed.right! });
          onClose();
        }}
      >
        {field("top", w("dlg.top"))}
        {field("bottom", w("dlg.bottom"))}
        {field("left", w("dlg.left"))}
        {field("right", w("dlg.right"))}
      </form>
    </Dialog>
  );
}

function ParagraphDialog({ w, state, dispatch, onClose }: DialogControl) {
  const current = selectedParagraphs(state())[0]?.node.attrs;
  const [indent, setIndent] = useState(String(current?.indentLeft ?? 0));
  const [first, setFirst] = useState(String(current?.firstLine ?? 0));
  const [before, setBefore] = useState(current?.spaceBefore == null ? "" : String(current.spaceBefore));
  const [after, setAfter] = useState(current?.spaceAfter == null ? "" : String(current.spaceAfter));
  const [line, setLine] = useState(current?.lineSpacing == null ? "" : String(current.lineSpacing));
  const i = parseNumber(indent);
  const f = parseNumber(first);
  const optional = (v: string, lo: number, hi: number) => (v.trim() === "" ? { ok: true, value: null } : ((n) => ({ ok: n !== null && n >= lo && n <= hi, value: n }))(parseNumber(v)));
  const b = optional(before, 0, 1584);
  const a = optional(after, 0, 1584);
  const l = optional(line, 0.5, 10);
  const valid = i !== null && i >= 0 && i <= 500 && f !== null && f >= -200 && f <= 200 && b.ok && a.ok && l.ok;
  return (
    <Dialog open title={w("paragraphDialog").replace("…", "")} onClose={onClose} actions={<Actions w={w} onClose={onClose} submit={w("dlg.apply")} form="word-paragraph" disabled={!valid} />}>
      <form
        id="word-paragraph"
        className="dialog-form dialog-form--grid"
        onSubmit={(e) => {
          e.preventDefault();
          if (!valid) return;
          const s = state();
          const tr = s.tr;
          for (const { node, pos } of selectedParagraphs(s)) {
            tr.setNodeMarkup(pos, undefined, { ...node.attrs, indentLeft: i, firstLine: f, spaceBefore: b.value, spaceAfter: a.value, lineSpacing: l.value });
          }
          dispatch(tr);
          onClose();
        }}
      >
        <TextField label={w("indentLeft")} inputMode="decimal" value={indent} data-autofocus onChange={(e) => setIndent(e.target.value)} />
        <TextField label={w("firstLine")} inputMode="decimal" value={first} onChange={(e) => setFirst(e.target.value)} />
        <TextField label={`${w("spaceBefore")} (pt)`} inputMode="decimal" value={before} placeholder={w("spacing.default")} onChange={(e) => setBefore(e.target.value)} />
        <TextField label={`${w("spaceAfter")} (pt)`} inputMode="decimal" value={after} placeholder={w("spacing.default")} onChange={(e) => setAfter(e.target.value)} />
        <TextField label={w("lineSpacing")} inputMode="decimal" value={line} placeholder={w("spacing.default")} onChange={(e) => setLine(e.target.value)} />
      </form>
    </Dialog>
  );
}

function WordCount({ w, state, onClose }: DialogControl) {
  const c = countWords(state().doc);
  const rows: Array<[string, number]> = [
    [w("dlg.words"), c.words],
    [w("dlg.characters"), c.characters],
    [w("dlg.charactersNoSpaces"), c.charactersNoSpaces],
    [w("dlg.paragraphs"), c.paragraphs],
  ];
  return (
    <Dialog open title={w("wordCount")} onClose={onClose} actions={<Actions w={w} onClose={onClose} />}>
      <dl className="word-stats">
        {rows.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </Dialog>
  );
}

function SaveCopy({ w, saveCopy, defaultCopyName, onClose }: DialogControl) {
  const [name, setName] = useState(defaultCopyName);
  const [busy, setBusy] = useState(false);
  const valid = /\.(docx|txt)$/i.test(name.trim()) && name.trim().length > 5;
  return (
    <Dialog open title={w("dlg.copyTitle")} onClose={onClose} actions={<Actions w={w} onClose={onClose} submit={w("saveCopy")} form="word-copy" disabled={!valid || busy} />}>
      <form
        id="word-copy"
        className="dialog-form"
        onSubmit={(e) => {
          e.preventDefault();
          if (!valid) return;
          setBusy(true);
          void saveCopy(name.trim()).then((ok) => {
            setBusy(false);
            if (ok) onClose();
          });
        }}
      >
        <TextField label={w("dlg.copyName")} value={name} data-autofocus onChange={(e) => setName(e.target.value)} error={valid ? undefined : w("dlg.badName")} />
      </form>
    </Dialog>
  );
}

function ImageSize({ w, state, dispatch, onClose }: DialogControl) {
  const selected = state().selection;
  const node = selected instanceof NodeSelection && selected.node.type.name === "image" ? selected.node : null;
  const ratio = node ? node.attrs.height / node.attrs.width : 1;
  const [width, setWidth] = useState(String(node?.attrs.width ?? ""));
  const [height, setHeight] = useState(String(node?.attrs.height ?? ""));
  const [keep, setKeep] = useState(true);
  const wv = parseNumber(width);
  const hv = parseNumber(height);
  const valid = !!node && wv !== null && hv !== null && wv >= 1 && wv <= 2000 && hv >= 1 && hv <= 2000;
  const round = (v: number) => String(Math.round(v * 10) / 10);
  return (
    <Dialog open title={w("imageSize").replace("…", "")} onClose={onClose} actions={<Actions w={w} onClose={onClose} submit={w("dlg.apply")} form="word-image" disabled={!valid} />}>
      <form
        id="word-image"
        className="dialog-form dialog-form--grid"
        onSubmit={(e) => {
          e.preventDefault();
          if (!valid || !node) return;
          const s = state();
          const tr = s.tr.setNodeMarkup(selected.from, undefined, { ...node.attrs, width: wv, height: hv });
          dispatch(tr.setSelection(NodeSelection.create(tr.doc, selected.from)));
          onClose();
        }}
      >
        <TextField
          label={w("dlg.width")}
          inputMode="decimal"
          value={width}
          data-autofocus
          onChange={(e) => {
            setWidth(e.target.value);
            const v = parseNumber(e.target.value);
            if (keep && v !== null) setHeight(round(v * ratio));
          }}
        />
        <TextField
          label={w("dlg.height")}
          inputMode="decimal"
          value={height}
          onChange={(e) => {
            setHeight(e.target.value);
            const v = parseNumber(e.target.value);
            if (keep && v !== null) setWidth(round(v / ratio));
          }}
        />
        <label className="dialog-check">
          <input type="checkbox" checked={keep} onChange={(e) => setKeep(e.target.checked)} />
          {w("dlg.keepRatio")}
        </label>
      </form>
    </Dialog>
  );
}
