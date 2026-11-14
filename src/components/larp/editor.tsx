"use client";

/**
 * Éditeur textuel classique : marge à numéros de ligne, fond vert pour les
 * modules (blanc pour les tampons), mots réservés en gras, commentaires en
 * italique. Zone de saisie native (fonctionne au doigt, au clavier mobile et
 * dans une interface mise à l'échelle).
 */
import { forwardRef, useImperativeHandle, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { KEYWORDS, norm } from "@/lib/larp/lexer";

export const LH = 17;
const FONT = "13px 'Courier New', Courier, monospace";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Coloration d'une ligne (tolérante : une chaîne non fermée colore jusqu'au bout). */
export function highlightLine(line: string): string {
  let out = "";
  let i = 0;
  while (i < line.length) {
    const c = line[i];
    if (c === "\\" && line[i + 1] === "\\") {
      out += `<span style="color:#7b1fa2;font-style:italic">${esc(line.slice(i))}</span>`;
      break;
    }
    if (c === '"' || c === "'") {
      let j = i + 1;
      while (j < line.length && line[j] !== c) j += line[j] === "\\" ? 2 : 1;
      out += `<span style="color:#b00020">${esc(line.slice(i, j + 1))}</span>`;
      i = j + 1;
      continue;
    }
    const m = /^[A-Za-z_À-ɏ][A-Za-z0-9_À-ɏ]*(?:['’][aAàÀ])?/.exec(line.slice(i));
    if (m) {
      const w = m[0];
      const k = norm(w).replace(/['’]/g, "");
      out += KEYWORDS.has(k) || k === "TANT" || k === "QUE" ? `<b>${esc(w)}</b>` : esc(w);
      i += w.length;
      continue;
    }
    out += esc(c);
    i++;
  }
  return out;
}

export interface EditorHandle {
  textarea: HTMLTextAreaElement | null;
  /** Insère du texte au curseur (annulable avec Ctrl+Z) et sélectionne le premier « {…} ». */
  insert: (text: string) => void;
  goto: (line: number, col?: number) => void;
  indent: (dir: 1 | -1) => void;
}

interface Props {
  value: string;
  onChange: (v: string) => void;
  kind: "module" | "tampon";
  activeLine?: number;
  errorLine?: number;
  breakpoints?: Set<number>;
  onToggleBreakpoint?: (line: number) => void;
  onCursor?: (line: number, col: number) => void;
  readOnly?: boolean;
  bg?: string;
  testId?: string;
}

export const LarpEditor = forwardRef<EditorHandle, Props>(function LarpEditor(
  { value, onChange, kind, activeLine, errorLine, breakpoints, onToggleBreakpoint, onCursor, readOnly, bg, testId },
  ref,
) {
  const ta = useRef<HTMLTextAreaElement>(null);
  const [scroll, setScroll] = useState({ top: 0, left: 0 });
  const lines = useMemo(() => value.split("\n"), [value]);
  const html = useMemo(() => (kind === "module" ? lines.map(highlightLine) : lines.map(esc)), [lines, kind]);

  const cursor = () => {
    const t = ta.current;
    if (!t) return;
    const before = t.value.slice(0, t.selectionStart);
    const l = before.split("\n");
    onCursor?.(l.length, l[l.length - 1].length + 1);
  };

  const replaceRange = (start: number, end: number, text: string) => {
    const t = ta.current!;
    t.focus();
    t.setSelectionRange(start, end);
    // execCommand conserve l'historique d'annulation du navigateur.
    const ok = typeof document.execCommand === "function" && document.execCommand("insertText", false, text);
    if (!ok) {
      t.setRangeText(text, start, end, "end");
      onChange(t.value);
    }
  };

  const doIndent = (dir: 1 | -1) => {
    const t = ta.current;
    if (!t || readOnly) return;
    const v = t.value;
    const s = v.lastIndexOf("\n", t.selectionStart - 1) + 1;
    let e = v.indexOf("\n", Math.max(t.selectionEnd - (t.selectionEnd > t.selectionStart && v[t.selectionEnd - 1] === "\n" ? 1 : 0), t.selectionStart));
    if (e < 0) e = v.length;
    const block = v.slice(s, e);
    const next = block
      .split("\n")
      .map((l) => (dir > 0 ? "  " + l : l.replace(/^( {1,2}|\t)/, "")))
      .join("\n");
    replaceRange(s, e, next);
    t.setSelectionRange(s, s + next.length);
  };

  useImperativeHandle(ref, () => ({
    get textarea() {
      return ta.current;
    },
    insert(text: string) {
      const t = ta.current;
      if (!t || readOnly) return;
      const start = t.selectionStart;
      const lineStart = t.value.lastIndexOf("\n", start - 1) + 1;
      const indent = /^[ \t]*/.exec(t.value.slice(lineStart))![0];
      const onBlank = t.value.slice(lineStart, t.value.indexOf("\n", start) < 0 ? undefined : t.value.indexOf("\n", start)).trim() === "";
      const body = text.split("\n").join("\n" + indent);
      const ins = onBlank ? body : "\n" + indent + body;
      const from = onBlank ? lineStart + indent.length : t.value.indexOf("\n", start) < 0 ? t.value.length : t.value.indexOf("\n", start);
      const to = onBlank ? (t.value.indexOf("\n", start) < 0 ? t.value.length : t.value.indexOf("\n", start)) : from;
      replaceRange(from, to, ins);
      const ph = t.value.indexOf("{", from);
      const phEnd = ph >= 0 ? t.value.indexOf("}", ph) : -1;
      if (ph >= 0 && phEnd > ph && ph < from + ins.length) t.setSelectionRange(ph, phEnd + 1);
      cursor();
    },
    goto(line: number, col = 1) {
      const t = ta.current;
      if (!t) return;
      const ls = t.value.split("\n");
      let pos = 0;
      for (let i = 0; i < Math.min(line - 1, ls.length); i++) pos += ls[i].length + 1;
      pos += Math.min(col - 1, (ls[line - 1] ?? "").length);
      t.focus();
      t.setSelectionRange(pos, pos);
      const top = Math.max(0, (line - 4) * LH);
      if (t.scrollTop > (line - 1) * LH || t.scrollTop + t.clientHeight < line * LH + 4) t.scrollTop = top;
      cursor();
    },
    indent: doIndent,
  }));

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    const t = e.currentTarget;
    if (e.key === "Tab") {
      e.preventDefault();
      if (t.selectionStart !== t.selectionEnd && t.value.slice(t.selectionStart, t.selectionEnd).includes("\n")) {
        doIndent(e.shiftKey ? -1 : 1);
        return;
      }
      if (!e.shiftKey) replaceRange(t.selectionStart, t.selectionEnd, "  ");
      return;
    }
    if (e.key === "Enter" && !e.altKey && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      const lineStart = t.value.lastIndexOf("\n", t.selectionStart - 1) + 1;
      const indent = /^[ \t]*/.exec(t.value.slice(lineStart))![0];
      const cur = t.value.slice(lineStart, t.selectionStart).trim();
      const opens = /^(SI|SINON|TANTQUE|TANT QUE|POUR|R[ÉE]P[ÉE]TER|S[ÉE]LECTIONNER|D[ÉE]BUT|ENTRER)\b/i.test(cur) && !/\b(FINSI|FINTANTQUE|FINPOUR)\s*$/i.test(cur);
      replaceRange(t.selectionStart, t.selectionEnd, "\n" + indent + (opens ? "  " : ""));
    }
  };

  const gutterW = 38;
  return (
    <div className="relative h-full w-full overflow-hidden" style={{ background: bg ?? (kind === "module" ? "#b9d3b1" : "#ffffff") }} data-testid={testId}>
      {/* Marge : numéros de ligne et points d'arrêt */}
      <div className="absolute inset-y-0 left-0 overflow-hidden border-r border-[#3f7d7d]" style={{ width: gutterW, background: "#5f9ea0" }}>
        <div style={{ transform: `translateY(${-scroll.top}px)`, paddingTop: 2 }}>
          {lines.map((_, i) => {
            const n = i + 1;
            const bp = breakpoints?.has(n);
            return (
              <div
                key={n}
                onClick={() => onToggleBreakpoint?.(n)}
                className="relative cursor-pointer select-none pr-1 text-right text-[11px] text-[#0b2b2b]"
                style={{ height: LH, lineHeight: `${LH}px`, font: "11px Tahoma, Verdana, sans-serif" }}
                data-testid={bp ? "marge-arret" : undefined}
                title="Point d'arrêt (F8)"
              >
                {bp && <span className="absolute left-1 top-[4px] h-[9px] w-[9px] rounded-full border border-white bg-[#d00]" />}
                {n === activeLine && <span className="absolute left-[1px] top-[3px] text-[10px] leading-none text-[#ffe600]">▶</span>}
                {n}
              </div>
            );
          })}
        </div>
      </div>
      <div className="absolute inset-y-0 right-0 overflow-hidden" style={{ left: gutterW }}>
        {activeLine && (
          <div className="pointer-events-none absolute inset-x-0" style={{ top: 2 + (activeLine - 1) * LH - scroll.top, height: LH, background: "#1d4ed8" }} data-testid="ligne-active" />
        )}
        {errorLine && <div className="pointer-events-none absolute inset-x-0" style={{ top: 2 + (errorLine - 1) * LH - scroll.top, height: LH, background: "rgba(220,38,38,.35)" }} />}
        <pre
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 m-0 whitespace-pre"
          style={{ font: FONT, lineHeight: `${LH}px`, padding: "2px 4px", transform: `translate(${-scroll.left}px, ${-scroll.top}px)`, color: "#000" }}
        >
          {html.map((h, i) => (
            <div key={i} style={{ height: LH, color: i + 1 === activeLine ? "#fff" : undefined }} dangerouslySetInnerHTML={{ __html: h || " " }} />
          ))}
        </pre>
        <textarea
          ref={ta}
          value={value}
          readOnly={readOnly}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          autoComplete="off"
          wrap="off"
          aria-label={kind === "module" ? "Éditeur de pseudo-code" : "Contenu du tampon"}
          data-testid="zone-code"
          onChange={(e) => {
            onChange(e.target.value);
            cursor();
          }}
          onKeyDown={onKeyDown}
          onKeyUp={cursor}
          onClick={cursor}
          onSelect={cursor}
          onScroll={(e) => setScroll({ top: e.currentTarget.scrollTop, left: e.currentTarget.scrollLeft })}
          className="absolute inset-0 m-0 h-full w-full resize-none overflow-auto border-0 bg-transparent outline-none"
          style={{ font: FONT, lineHeight: `${LH}px`, padding: "2px 4px", color: "transparent", caretColor: "#000", whiteSpace: "pre", tabSize: 2 }}
        />
      </div>
    </div>
  );
});
