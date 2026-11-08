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
 * - appui long : le mot touché est sélectionné.
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
  focus(): void;
}

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

export function letPageScrollOverEditor(editor: TouchEditor): () => void {
  const node = editor.getContainerDomNode();
  let start: { x: number; y: number; t: number; top: number } | null = null;
  let mode: ScrollTarget | "tap" | null = null;
  let lastY = 0;

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
  };
  const onMove = (e: TouchEvent) => {
    if (!start || e.touches.length !== 1) return;
    e.stopPropagation();
    const t = e.touches[0];
    const dy = t.clientY - start.y;
    const dx = t.clientX - start.x;
    if (mode === null && Math.hypot(dx, dy) > TAP_MOVE) {
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
    if (!start) return;
    e.stopPropagation();
    if (mode === null) {
      const hit = editor.getTargetAtClientPoint(start.x, start.y);
      if (hit?.position) {
        const pos = hit.position;
        const word = Date.now() - start.t >= LONG_PRESS ? editor.getModel()?.getWordAtPosition(pos) : null;
        if (word) editor.setSelection({ startLineNumber: pos.lineNumber, startColumn: word.startColumn, endLineNumber: pos.lineNumber, endColumn: word.endColumn });
        else editor.setPosition(pos);
      }
      editor.focus();
      if (e.cancelable) e.preventDefault(); // pas de clic simulé ensuite
    }
    start = null;
    mode = null;
  };

  node.addEventListener("touchstart", onStart, { capture: true, passive: true });
  node.addEventListener("touchmove", onMove, { capture: true, passive: false });
  node.addEventListener("touchend", onEnd, { capture: true, passive: false });
  node.addEventListener("touchcancel", onEnd, { capture: true, passive: false });
  return () => {
    node.removeEventListener("touchstart", onStart, { capture: true });
    node.removeEventListener("touchmove", onMove, { capture: true });
    node.removeEventListener("touchend", onEnd, { capture: true });
    node.removeEventListener("touchcancel", onEnd, { capture: true });
  };
}
