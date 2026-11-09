/**
 * Éditeur de code intégré dans une page (accueil, éditeur, leçons, exercices), sur écran tactile.
 *
 * Problème : Monaco annule le défilement du navigateur dès le premier contact du doigt
 * (preventDefault sur « touchstart »). Un balayage qui commence sur l'éditeur ne fait donc
 * jamais défiler la page, même quand le code est court ou déjà en haut : la page « cale ».
 *
 * Solution : les gestes tactiles sur ces éditeurs sont gérés ici (Monaco ne les reçoit pas) :
 * - balayage vertical : le code défile tant que c'est possible, sinon la page défile normalement ;
 * - toucher bref : le curseur se place à cet endroit et le clavier s'ouvre ;
 * - appui long : le mot touché est sélectionné ; en gardant le doigt et en le faisant glisser,
 *   la sélection s'étend jusqu'au doigt (comme sur Android) ;
 * - toucher bref pendant qu'une sélection est active (option `extendOnTap`) : la sélection s'étend jusque-là.
 * UPL IDE (plein écran, rien à faire défiler derrière) garde le comportement de Monaco.
 */
interface Position {
  lineNumber: number;
  column: number;
}
interface TouchEditor {
  getContainerDomNode(): HTMLElement;
  getScrollTop(): number;
  setScrollTop(top: number): void;
  getScrollHeight(): number;
  getLayoutInfo(): { height: number };
  getTargetAtClientPoint(x: number, y: number): { position: Position | null } | null;
  setPosition(p: Position): void;
  setSelection(r: { startLineNumber: number; startColumn: number; endLineNumber: number; endColumn: number }): void;
  getModel(): { getWordAtPosition(p: Position): { startColumn: number; endColumn: number } | null } | null;
  getSelection(): { startLineNumber: number; startColumn: number; endLineNumber: number; endColumn: number; isEmpty(): boolean } | null;
  focus(): void;
}

export interface TouchOptions {
  /** Toucher bref : étendre la sélection en cours au lieu de déplacer le curseur. */
  extendOnTap?: () => boolean;
}

const before = (a: Position, b: Position) => a.lineNumber < b.lineNumber || (a.lineNumber === b.lineNumber && a.column < b.column);

export type ScrollTarget = "editeur" | "page";

/** Qui doit défiler pour un déplacement vertical du doigt de `dy` pixels (positif = vers le bas). */
export function scrollTargetFor(dy: number, scrollTop: number, scrollHeight: number, viewHeight: number): ScrollTarget {
  const max = Math.max(0, scrollHeight - viewHeight);
  // Doigt vers le bas : le contenu remonte (possible si on n'est pas déjà en haut), et inversement.
  const canScroll = dy > 0 ? scrollTop > 0.5 : scrollTop < max - 0.5;
  return canScroll ? "editeur" : "page";
}

const TAP_MOVE = 8; // px
const LONG_PRESS = 500; // ms

export function letPageScrollOverEditor(editor: TouchEditor, options: TouchOptions = {}): () => void {
  const node = editor.getContainerDomNode();
  let start: { x: number; y: number; t: number; top: number } | null = null;
  let mode: ScrollTarget | "tap" | "selection" | null = null;
  let lastY = 0;
  let timer: ReturnType<typeof setTimeout> | null = null;
  // Bornes du mot sélectionné par l'appui long : point fixe de la sélection glissée.
  let anchor: { from: Position; to: Position } | null = null;

  const posAt = (x: number, y: number) => editor.getTargetAtClientPoint(x, y)?.position ?? null;
  const selectBetween = (a: Position, b: Position) =>
    editor.setSelection({ startLineNumber: a.lineNumber, startColumn: a.column, endLineNumber: b.lineNumber, endColumn: b.column });
  const extendTo = (p: Position) => {
    if (!anchor) return;
    if (before(p, anchor.from)) selectBetween(p, anchor.to);
    else selectBetween(anchor.from, before(anchor.to, p) ? p : anchor.to);
  };
  const clearTimer = () => {
    if (timer) clearTimeout(timer);
    timer = null;
  };

  const onStart = (e: TouchEvent) => {
    if (e.touches.length !== 1) {
      start = null;
      return;
    }
    // Monaco ne reçoit pas ce geste : il ne peut plus bloquer le défilement de la page.
    e.stopPropagation();
    const t = e.touches[0];
    start = { x: t.clientX, y: t.clientY, t: Date.now(), top: editor.getScrollTop() };
    lastY = t.clientY;
    mode = null;
    clearTimer();
    // Appui long immobile : sélection du mot, puis le doigt peut glisser pour étendre la sélection.
    timer = setTimeout(() => {
      if (!start || mode !== null) return;
      const pos = posAt(start.x, start.y);
      if (!pos) return;
      const word = editor.getModel()?.getWordAtPosition(pos);
      anchor = word
        ? { from: { lineNumber: pos.lineNumber, column: word.startColumn }, to: { lineNumber: pos.lineNumber, column: word.endColumn } }
        : { from: pos, to: pos };
      selectBetween(anchor.from, anchor.to);
      mode = "selection";
      navigator.vibrate?.(15);
    }, LONG_PRESS);
  };
  const onMove = (e: TouchEvent) => {
    if (!start || e.touches.length !== 1) return;
    e.stopPropagation();
    const t = e.touches[0];
    const dy = t.clientY - start.y;
    const dx = t.clientX - start.x;
    if (mode === "selection") {
      e.preventDefault();
      const pos = posAt(t.clientX, t.clientY);
      if (pos) extendTo(pos);
      return;
    }
    if (mode === null && Math.hypot(dx, dy) > TAP_MOVE) {
      clearTimer();
      mode = Math.abs(dy) >= Math.abs(dx) ? scrollTargetFor(dy, editor.getScrollTop(), editor.getScrollHeight(), editor.getLayoutInfo().height) : "page";
    }
    if (mode === "editeur") {
      // Le code défile sous le doigt ; arrivé en butée, il ne bouge plus (le geste suivant fera défiler la page).
      e.preventDefault();
      editor.setScrollTop(editor.getScrollTop() - (t.clientY - lastY));
    }
    lastY = t.clientY;
  };
  const onEnd = (e: TouchEvent) => {
    clearTimer();
    if (!start) return;
    e.stopPropagation();
    if (mode === "selection") {
      editor.focus();
      if (e.cancelable) e.preventDefault();
    } else if (mode === null) {
      const pos = posAt(start.x, start.y);
      const sel = editor.getSelection();
      if (pos && options.extendOnTap?.() && sel && !sel.isEmpty()) {
        // Sélection active : le toucher déplace la borne la plus proche (début ou fin).
        anchor = { from: { lineNumber: sel.startLineNumber, column: sel.startColumn }, to: { lineNumber: sel.endLineNumber, column: sel.endColumn } };
        if (before(pos, anchor.from)) selectBetween(pos, anchor.to);
        else selectBetween(anchor.from, pos);
      } else if (pos) {
        const word = Date.now() - start.t >= LONG_PRESS ? editor.getModel()?.getWordAtPosition(pos) : null;
        if (word) editor.setSelection({ startLineNumber: pos.lineNumber, startColumn: word.startColumn, endLineNumber: pos.lineNumber, endColumn: word.endColumn });
        else editor.setPosition(pos);
      }
      editor.focus();
      if (e.cancelable) e.preventDefault(); // pas de clic simulé ensuite
    }
    start = null;
    mode = null;
    anchor = null;
  };

  node.addEventListener("touchstart", onStart, { capture: true, passive: true });
  node.addEventListener("touchmove", onMove, { capture: true, passive: false });
  node.addEventListener("touchend", onEnd, { capture: true, passive: false });
  node.addEventListener("touchcancel", onEnd, { capture: true, passive: false });
  return () => {
    clearTimer();
    node.removeEventListener("touchstart", onStart, { capture: true });
    node.removeEventListener("touchmove", onMove, { capture: true });
    node.removeEventListener("touchend", onEnd, { capture: true });
    node.removeEventListener("touchcancel", onEnd, { capture: true });
  };
}
