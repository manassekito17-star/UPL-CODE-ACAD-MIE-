import { Button, Dialog, IconButton, useToasts } from "@zynora/design-system";
import { ArrowLeft, Copy as CopyIcon, FileDown, FileText, Redo2, Save, Undo2 } from "lucide-react";
import { toggleMark } from "prosemirror-commands";
import { dropCursor } from "prosemirror-dropcursor";
import { gapCursor } from "prosemirror-gapcursor";
import { history, redo, redoDepth, undo, undoDepth } from "prosemirror-history";
import type { Mark } from "prosemirror-model";
import { AllSelection, EditorState, NodeSelection, type Command, type Transaction } from "prosemirror-state";
import { addColumnAfter, addColumnBefore, addRowAfter, addRowBefore, deleteColumn, deleteRow, deleteTable, isInTable, tableEditing } from "prosemirror-tables";
import { EditorView } from "prosemirror-view";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { errorText, useApp } from "../context";
import type { DocPage, DocumentInfo } from "../ipc";
import {
  changeIndent,
  clearFormatting,
  insertHardBreak,
  insertPageBreak,
  insertTable,
  insertText,
  markAttr,
  setMark,
  setParagraphAttrs,
  stepFontSize,
  toggleList,
  wordKeymap,
} from "./commands";
import { countWords, fromProseMirror, toProseMirror } from "./convert";
import { schema } from "./schema";
import { WordDialog } from "./WordDialogs";
import { WordRibbon, type WordActions, type WordDialogKind, type WordTab } from "./WordRibbon";
import { wordText } from "./word-text";

const AUTOSAVE_MS = 30_000;
const M = schema.marks;
const MM_TO_PX = 96 / 25.4;

interface Props {
  doc: DocumentInfo;
  onClose: () => void;
  /** Le document affiché devient la copie enregistrée. */
  onReplace: (doc: DocumentInfo) => void;
}

/** Dimensions affichées selon l'orientation. */
export function pageBox(page: DocPage): { width: number; height: number } {
  const small = Math.min(page.width_mm, page.height_mm);
  const large = Math.max(page.width_mm, page.height_mm);
  return page.orientation === "portrait" ? { width: small, height: large } : { width: large, height: small };
}

export function WordEditor({ doc, onClose, onReplace }: Props) {
  const { api, t, language } = useApp();
  const toast = useToasts();
  const w = useMemo(() => wordText(language), [language]);
  const host = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLDivElement>(null);
  const view = useRef<EditorView | null>(null);
  const [state, setState] = useState<EditorState | null>(null);
  const [page, setPageState] = useState<DocPage>(doc.document.page);
  const [dirty, setDirty] = useState(doc.recovered);
  const unsnapshotted = useRef(false);
  const [tab, setTab] = useState<WordTab>("home");
  const [dialog, setDialog] = useState<WordDialogKind | null>(null);
  const [closing, setClosing] = useState(false);
  const [marks, setMarks] = useState(false);
  const [spellcheck, setSpellcheck] = useState(true);
  const [zoom, setZoomState] = useState(100);
  const painter = useRef<readonly Mark[] | null>(null);
  const [painterActive, setPainterActive] = useState(false);
  const pageRef = useRef(page);
  pageRef.current = page;

  const fail = useCallback((error: unknown) => toast({ tone: "error", message: errorText(error, t) }), [t, toast]);
  const notify = useCallback((message: string, tone: "success" | "error" | "info" = "info") => toast({ tone, message }), [toast]);

  const model = useCallback(() => fromProseMirror(view.current!.state.doc, pageRef.current), []);
  const hooks = useRef({ save: () => {}, find: () => {}, replace: () => {}, link: () => {}, print: () => {} });

  // Création de l'éditeur (une fois par document).
  useEffect(() => {
    if (!host.current) return;
    const editor = new EditorView(host.current, {
      state: EditorState.create({
        doc: toProseMirror(doc.document),
        plugins: [
          history(),
          ...wordKeymap({
            save: () => hooks.current.save(),
            find: () => hooks.current.find(),
            replace: () => hooks.current.replace(),
            link: () => hooks.current.link(),
            print: () => hooks.current.print(),
          }),
          dropCursor(),
          gapCursor(),
          tableEditing(),
        ],
      }),
      attributes: { "aria-label": doc.name, role: "textbox", "aria-multiline": "true", class: "word-editor", spellcheck: "true" },
      handleDOMEvents: {
        // Reproduire la mise en forme : appliquée à la prochaine sélection faite à la souris.
        mouseup: (v) => {
          if (!painter.current) return false;
          setTimeout(() => {
            const { from, to, empty } = v.state.selection;
            if (empty || !painter.current) return;
            const tr = v.state.tr;
            for (const type of Object.values(M)) if (type !== M.link) tr.removeMark(from, to, type);
            for (const mark of painter.current) if (mark.type !== M.link) tr.addMark(from, to, mark);
            v.dispatch(tr);
            painter.current = null;
            setPainterActive(false);
          });
          return false;
        },
        // Un lien ne s'ouvre jamais d'un simple clic dans l'éditeur.
        click: (_v, event) => {
          if ((event.target as HTMLElement).closest("a")) event.preventDefault();
          return false;
        },
      },
      dispatchTransaction(tr: Transaction) {
        const next = editor.state.apply(tr);
        editor.updateState(next);
        setState(next);
        if (tr.docChanged) {
          setDirty(true);
          unsnapshotted.current = true;
        }
      },
    });
    view.current = editor;
    setState(editor.state);
    editor.focus();
    return () => {
      editor.destroy();
      view.current = null;
    };
  }, [doc]);

  useEffect(() => {
    view.current?.setProps({ attributes: { "aria-label": doc.name, role: "textbox", "aria-multiline": "true", class: "word-editor", spellcheck: String(spellcheck) } });
  }, [spellcheck, doc.name]);

  const exec = useCallback((command: Command) => {
    const v = view.current;
    if (!v) return false;
    const done = command(v.state, v.dispatch);
    v.focus();
    return done;
  }, []);

  function setPage(change: Partial<DocPage>) {
    setPageState((p) => {
      const next = { ...p, ...change };
      if (change.width_mm !== undefined || change.height_mm !== undefined) {
        // Une taille choisie garde l'orientation courante.
        const box = { small: Math.min(next.width_mm, next.height_mm), large: Math.max(next.width_mm, next.height_mm) };
        next.width_mm = box.small;
        next.height_mm = box.large;
      }
      return next;
    });
    setDirty(true);
    unsnapshotted.current = true;
  }

  // Sauvegarde automatique : copie de récupération hors du document, jamais à sa place.
  useEffect(() => {
    if (!dirty) return;
    const timer = setInterval(() => {
      if (!unsnapshotted.current || !view.current) return;
      unsnapshotted.current = false;
      api.wordAutosave(doc.path, model()).catch((e) => {
        unsnapshotted.current = true;
        fail(e);
      });
    }, AUTOSAVE_MS);
    return () => clearInterval(timer);
  }, [api, doc.path, dirty, fail, model]);

  async function save(): Promise<boolean> {
    if (doc.lost.length > 0) {
      notify(w("lostDesc"), "info");
      setDialog("saveCopy");
      return false;
    }
    try {
      await api.wordSave(doc.path, model());
      setDirty(false);
      unsnapshotted.current = false;
      notify(t("sheets.saved"), "success");
      return true;
    } catch (error) {
      fail(error);
      return false;
    }
  }

  async function saveCopy(name: string): Promise<boolean> {
    try {
      const copy = await api.wordSaveCopy(doc.path, name, model());
      notify(`${t("sheets.saved")} : ${copy.name}`, "success");
      onReplace(copy);
      return true;
    } catch (error) {
      fail(error);
      return false;
    }
  }

  async function print() {
    try {
      if (!(await api.printWebview())) window.print();
    } catch (error) {
      fail(error);
    }
  }

  hooks.current = {
    save: () => void save(),
    find: () => setDialog("find"),
    replace: () => setDialog("replace"),
    link: () => setDialog("link"),
    print: () => void print(),
  };

  async function requestClose() {
    if (!dirty) {
      onClose();
      return;
    }
    setClosing(true);
  }

  async function closeWith(saveFirst: boolean) {
    if (saveFirst && !(await save())) {
      setClosing(false);
      return;
    }
    if (!saveFirst) await api.discardRecovery(doc.path).catch(fail);
    onClose();
  }

  async function clipboard(kind: "cut" | "copy" | "paste") {
    const v = view.current;
    if (!v) return;
    v.focus();
    if (kind === "paste") {
      try {
        const text = await navigator.clipboard.readText();
        exec(insertText(text));
      } catch {
        notify(w("pasteFailed"), "info");
      }
      return;
    }
    // La copie passe par le gestionnaire de ProseMirror (texte et mise en forme).
    if (!document.execCommand(kind)) notify(w("copyFailed"), "info");
  }

  /** Le fichier est choisi dans le dialogue natif et validé par le cœur Rust. */
  async function insertImage() {
    try {
      const image = await api.wordPickImage(pageBox(pageRef.current).width - pageRef.current.margin_left_mm - pageRef.current.margin_right_mm);
      if (!image) return;
      exec((s, d) => {
        const node = schema.nodes.image.create({ mime: image.mime, data: image.data, width: image.width_mm, height: image.height_mm });
        const tr = s.tr.replaceSelectionWith(node);
        // L'image insérée reste sélectionnée (prête à être redimensionnée).
        const at = tr.selection.from - 1;
        if (tr.doc.nodeAt(at)?.type === schema.nodes.image) tr.setSelection(NodeSelection.create(tr.doc, at));
        d?.(tr.scrollIntoView());
        return true;
      });
    } catch (error) {
      fail(error);
    }
  }

  function setZoom(value: number | "page") {
    if (value === "page") {
      const available = (canvas.current?.clientWidth ?? 900) - 48;
      setZoomState(Math.max(50, Math.min(200, Math.floor((available / (pageBox(page).width * MM_TO_PX)) * 100))));
    } else setZoomState(value);
  }

  const tableOp: Record<string, Command> = {
    insert2x2: insertTable(2, 2),
    insert3x3: insertTable(3, 3),
    insert4x4: insertTable(4, 4),
    rowBefore: addRowBefore,
    rowAfter: addRowAfter,
    colBefore: addColumnBefore,
    colAfter: addColumnAfter,
    deleteRow,
    deleteCol: deleteColumn,
    delete: deleteTable,
  };

  const actions: WordActions = {
    clipboard: (kind) => void clipboard(kind),
    painter: () => {
      if (painter.current) {
        painter.current = null;
        setPainterActive(false);
        return;
      }
      const s = view.current?.state;
      if (!s) return;
      painter.current = s.selection.$from.marks();
      setPainterActive(true);
    },
    painterActive,
    toggle: (mark) => exec(toggleMark(M[mark]!)),
    script: (kind) => exec((s, d) => setMark(M.script, markAttr(s, M.script, "kind") === kind ? null : { kind })(s, d)),
    font: (name) => exec(setMark(M.font, { name })),
    size: (pt) => exec(setMark(M.size, { pt })),
    sizeStep: (delta) => exec((s, d) => setMark(M.size, { pt: stepFontSize(markAttr<number>(s, M.size, "pt") ?? 11, delta) })(s, d)),
    color: (value) => exec(setMark(M.color, { value })),
    highlight: (value) => exec(setMark(M.highlight, value ? { value } : null)),
    clear: () => exec(clearFormatting),
    list: (kind) => exec(toggleList(kind)),
    indent: (delta) => exec(changeIndent(delta)),
    paragraph: (attrs) => exec(setParagraphAttrs(attrs)),
    open: setDialog,
    selectAll: () => exec((s, d) => (d?.(s.tr.setSelection(new AllSelection(s.doc))), true)),
    pageBreak: () => exec(insertPageBreak),
    lineBreak: () => exec(insertHardBreak),
    table: (op) => exec(tableOp[op]!),
    inTable: state ? isInTable(state) : false,
    insertImage: () => void insertImage(),
    imageSelected: !!state && state.selection instanceof NodeSelection && state.selection.node.type.name === "image",
    unlink: () =>
      exec((s, d) => {
        const { from, to, $from } = s.selection;
        // Sans sélection, retire tout le lien sous le curseur.
        let start = from;
        let end = to;
        if (from === to) {
          const offset = $from.parentOffset;
          $from.parent.forEach((child, childOffset) => {
            if (M.link.isInSet(child.marks) && childOffset <= offset && offset <= childOffset + child.nodeSize) {
              start = $from.start() + childOffset;
              end = start + child.nodeSize;
            }
          });
        }
        d?.(s.tr.removeMark(start, end, M.link));
        return true;
      }),
    insertDate: (format) => {
      const now = new Date();
      const locale = language === "fr" ? "fr-FR" : "en-GB";
      const text =
        format === "short"
          ? now.toLocaleDateString(locale)
          : format === "long"
            ? now.toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long", year: "numeric" })
            : now.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
      exec(insertText(text));
    },
    page: setPage,
    pageInfo: page,
    marks,
    toggleMarks: () => setMarks((m) => !m),
    spellcheck,
    toggleSpellcheck: () => setSpellcheck((s) => !s),
    zoom,
    setZoom,
    print: () => void print(),
  };

  const counts = useMemo(() => (state ? countWords(state.doc) : { words: 0, characters: 0 }), [state]);
  const box = pageBox(page);
  const status = doc.recovered && dirty ? t("sheets.recovered") : dirty ? t("sheets.unsaved") : t("sheets.saved");
  const number = (n: number) => n.toLocaleString(language === "fr" ? "fr-FR" : "en-GB");
  const stem = doc.name.replace(/\.(docx|txt)$/i, "");

  return (
    <div className={`word${marks ? " word--marks" : ""}${painterActive ? " word--painter" : ""}`}>
      {/* Format de la page à l'impression : celui du document. */}
      <style>{`@page { size: ${box.width}mm ${box.height}mm; margin: ${page.margin_top_mm}mm ${page.margin_right_mm}mm ${page.margin_bottom_mm}mm ${page.margin_left_mm}mm; }`}</style>
      <header className="sheets__titlebar word__titlebar">
        <IconButton label={t("sheets.back")} onClick={() => void requestClose()}>
          <ArrowLeft size={18} aria-hidden />
        </IconButton>
        <span className="sheets__app word__app">
          <FileText size={16} aria-hidden /> Word
        </span>
        <h1 className="sheets__name">{doc.name}</h1>
        <span className={`sheets__status${dirty ? " sheets__status--dirty" : ""}`} role="status">
          {status}
        </span>
        <span className="sheets__spacer" />
        <IconButton label={t("sheets.undo")} disabled={!state || undoDepth(state) === 0} onClick={() => exec(undo)}>
          <Undo2 size={18} aria-hidden />
        </IconButton>
        <IconButton label={t("sheets.redo")} disabled={!state || redoDepth(state) === 0} onClick={() => exec(redo)}>
          <Redo2 size={18} aria-hidden />
        </IconButton>
        <IconButton label={w("exportTxt")} onClick={() => void saveCopy(`${stem}.txt`)}>
          <FileDown size={18} aria-hidden />
        </IconButton>
        <Button size="sm" icon={<CopyIcon size={14} aria-hidden />} onClick={() => setDialog("saveCopy")}>
          {w("saveCopy")}
        </Button>
        <Button size="sm" variant="primary" icon={<Save size={14} aria-hidden />} disabled={doc.lost.length > 0} title={doc.lost.length ? w("lostDesc") : undefined} onClick={() => void save()}>
          {t("sheets.save")}
        </Button>
      </header>

      {state && <WordRibbon w={w} tab={tab} onTab={setTab} state={state} actions={actions} language={language} />}

      {doc.lost.length > 0 && (
        <div className="word__notice" role="note">
          <strong>{w("lostTitle")} :</strong> {doc.lost.join(", ")}. {w("lostDesc")}
        </div>
      )}
      {doc.format === "txt" && <p className="sheets__note">{w("txtNote")}</p>}

      <div className="word__canvas" ref={canvas}>
        <div
          className="word__page"
          style={{
            width: `${box.width}mm`,
            minHeight: `${box.height}mm`,
            padding: `${page.margin_top_mm}mm ${page.margin_right_mm}mm ${page.margin_bottom_mm}mm ${page.margin_left_mm}mm`,
            zoom: zoom / 100,
          }}
        >
          <div ref={host} className="word__host" data-testid="word-editor" />
        </div>
      </div>

      <footer className="sheets__footer word__footer">
        <span>{w("status.words", { n: number(counts.words) })}</span>
        <span>{w("status.chars", { n: number(counts.characters) })}</span>
        <span className="word__footer-note">{w("status.continuous")}</span>
        <span>{w("status.zoom", { n: zoom })}</span>
      </footer>

      {dialog && state && (
        <WordDialog
          kind={dialog}
          w={w}
          state={() => view.current!.state}
          dispatch={(tr) => view.current?.dispatch(tr)}
          page={page}
          setPage={setPage}
          insertTable={(rows, columns) => exec(insertTable(rows, columns))}
          saveCopy={saveCopy}
          defaultCopyName={`${stem} - copie.docx`}
          notify={notify}
          onClose={() => {
            setDialog(null);
            view.current?.focus();
          }}
        />
      )}

      <Dialog
        open={closing}
        role="alertdialog"
        title={t("sheets.close.title", { name: doc.name })}
        description={t("sheets.close.desc")}
        onClose={() => setClosing(false)}
        actions={
          <>
            <Button onClick={() => setClosing(false)}>{t("dialog.cancel")}</Button>
            <Button onClick={() => void closeWith(false)}>{t("sheets.close.discard")}</Button>
            <Button variant="primary" onClick={() => void closeWith(true)}>
              {doc.lost.length > 0 ? w("saveCopy") : t("sheets.close.save")}
            </Button>
          </>
        }
      />
    </div>
  );
}
