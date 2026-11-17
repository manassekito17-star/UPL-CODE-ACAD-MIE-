/**
 * Menu « Coller · Copier · Couper · Tout » à l'appui long sur un éditeur de code (écran tactile),
 * comme dans les applications du téléphone (WhatsApp, Notes…).
 *
 * Pourquoi : l'éditeur de code (Monaco, le moteur de VS Code) n'est pas un champ de texte du
 * navigateur. L'appui long n'y ouvre donc pas le menu « Coller » de l'iPhone ou d'Android.
 * Ce module affiche le même menu, au-dessus du doigt, pour tous les éditeurs de la plateforme.
 * « Coller » lit le presse-papiers du téléphone (l'iPhone affiche alors sa bulle « Coller » à
 * confirmer) ; si le navigateur refuse, une fenêtre permet de coller avec le menu du téléphone.
 */

interface Pos {
  lineNumber: number;
  column: number;
}
interface Range {
  startLineNumber: number;
  startColumn: number;
  endLineNumber: number;
  endColumn: number;
}
interface Sel extends Range {
  isEmpty(): boolean;
  containsPosition(p: Pos): boolean;
}
export interface MenuEditor {
  getContainerDomNode(): HTMLElement;
  getTargetAtClientPoint(x: number, y: number): { position: Pos | null } | null;
  getSelection(): Sel | null;
  setSelection(r: Range): void;
  setPosition(p: Pos): void;
  getModel(): { getValueInRange(r: Range): string; getFullModelRange(): Range; getLineMaxColumn(line: number): number; getLineCount(): number } | null;
  executeEdits(source: string, edits: Array<{ range: Range; text: string; forceMoveMarkers?: boolean }>): boolean;
  pushUndoStop(): boolean;
  focus(): void;
  getOption?(id: number): unknown;
  getRawOptions?(): { readOnly?: boolean };
  onDidDispose(listener: () => void): { dispose(): void };
}

const LONG_PRESS = 500; // ms
const MOVE = 10; // px

let openMenu: HTMLElement | null = null;
const closeMenu = () => {
  openMenu?.remove();
  openMenu = null;
};

function readOnly(ed: MenuEditor) {
  return Boolean(ed.getRawOptions?.().readOnly);
}

function insert(ed: MenuEditor, text: string) {
  const sel = ed.getSelection();
  if (!sel) return;
  ed.pushUndoStop();
  ed.executeEdits("coller", [{ range: sel, text, forceMoveMarkers: true }]);
  ed.pushUndoStop();
  ed.focus();
}

/** Texte sélectionné, ou la ligne du curseur si rien n'est sélectionné (comme dans les éditeurs de bureau). */
function selectionOrLine(ed: MenuEditor): { text: string; range: Range; whole: boolean } | null {
  const model = ed.getModel();
  const sel = ed.getSelection();
  if (!model || !sel) return null;
  if (!sel.isEmpty()) return { text: model.getValueInRange(sel), range: sel, whole: false };
  const line = sel.startLineNumber;
  const lineRange = { startLineNumber: line, startColumn: 1, endLineNumber: line, endColumn: model.getLineMaxColumn(line) };
  const cut = line < model.getLineCount() ? { startLineNumber: line, startColumn: 1, endLineNumber: line + 1, endColumn: 1 } : lineRange;
  return { text: model.getValueInRange(lineRange) + "\n", range: cut, whole: true };
}

/** Fenêtre de secours : coller avec le menu du téléphone dans un vrai champ de texte. */
function pasteDialog(ed: MenuEditor) {
  const back = document.createElement("div");
  back.setAttribute("role", "dialog");
  back.setAttribute("aria-modal", "true");
  back.setAttribute("aria-label", "Coller du code");
  back.dataset.testid = "fenetre-coller";
  back.style.cssText = "position:fixed;inset:0;z-index:2147483001;background:rgba(0,0,0,.6);display:grid;place-items:center;padding:12px";
  back.innerHTML = `<div style="width:100%;max-width:480px;background:#252526;color:#e5e5e5;border-radius:12px;padding:16px;font:14px system-ui,sans-serif;box-shadow:0 10px 40px rgba(0,0,0,.5)">
<p style="margin:0;font-weight:600;font-size:16px">Coller du code</p>
<p style="margin:6px 0 0;font-size:13px;color:#aaa">Faites un appui long dans la zone ci-dessous, puis touchez <b>Coller</b>.</p>
<textarea data-testid="zone-coller-tactile" rows="7" style="margin-top:10px;width:100%;box-sizing:border-box;font:16px ui-monospace,monospace;background:#1e1e1e;color:#fff;border:1px solid #444;border-radius:8px;padding:8px"></textarea>
<div style="margin-top:10px;display:flex;justify-content:flex-end;gap:8px">
<button type="button" data-a="annuler" style="padding:8px 14px;border:0;border-radius:8px;background:transparent;color:#ccc;font-size:15px">Annuler</button>
<button type="button" data-a="inserer" style="padding:8px 14px;border:0;border-radius:8px;background:#1677ff;color:#fff;font-weight:600;font-size:15px">Insérer</button>
</div></div>`;
  const area = back.querySelector("textarea")!;
  const close = () => back.remove();
  back.addEventListener("click", (e) => {
    const a = (e.target as HTMLElement).closest("button")?.dataset.a;
    if (e.target === back || a === "annuler") close();
    if (a === "inserer" && area.value) {
      close();
      insert(ed, area.value);
    }
  });
  document.body.appendChild(back);
  area.focus();
}

export async function pasteInto(ed: MenuEditor) {
  try {
    const text = await navigator.clipboard.readText();
    if (!text) throw new Error("vide");
    insert(ed, text);
  } catch {
    pasteDialog(ed);
  }
}

async function copyFrom(ed: MenuEditor, cut: boolean) {
  const part = selectionOrLine(ed);
  if (!part) return;
  try {
    await navigator.clipboard.writeText(part.text);
  } catch {
    // Écriture refusée : ancienne méthode du navigateur (champ temporaire).
    const t = document.createElement("textarea");
    t.value = part.text;
    t.style.cssText = "position:fixed;top:0;left:0;opacity:0";
    document.body.appendChild(t);
    t.select();
    document.execCommand("copy");
    t.remove();
  }
  if (cut && !readOnly(ed)) {
    ed.pushUndoStop();
    ed.executeEdits("couper", [{ range: part.range, text: "" }]);
    ed.pushUndoStop();
  }
  ed.focus();
}

function showMenu(ed: MenuEditor, x: number, y: number) {
  closeMenu();
  const ro = readOnly(ed);
  const items: Array<[string, string, () => void]> = [
    ...(ro ? [] : ([["coller", "Coller", () => void pasteInto(ed)]] as Array<[string, string, () => void]>)),
    ["copier", "Copier", () => void copyFrom(ed, false)],
    ...(ro ? [] : ([["couper", "Couper", () => void copyFrom(ed, true)]] as Array<[string, string, () => void]>)),
    [
      "tout",
      "Tout",
      () => {
        const m = ed.getModel();
        if (m) ed.setSelection(m.getFullModelRange());
        ed.focus();
      },
    ],
  ];
  const menu = document.createElement("div");
  menu.setAttribute("role", "menu");
  menu.setAttribute("aria-label", "Édition");
  menu.dataset.testid = "menu-edition-tactile";
  menu.style.cssText =
    "position:fixed;z-index:2147483000;display:flex;background:#1c1c1e;border-radius:10px;box-shadow:0 6px 24px rgba(0,0,0,.45);overflow:hidden;font:15px system-ui,-apple-system,sans-serif;visibility:hidden";
  for (const [id, label, run] of items) {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = label;
    b.setAttribute("role", "menuitem");
    b.dataset.action = id;
    b.style.cssText = "padding:10px 14px;border:0;background:transparent;color:#fff;white-space:nowrap;border-right:1px solid #3a3a3c";
    // Le bouton ne prend pas le focus : l'éditeur garde le sien.
    b.addEventListener("pointerdown", (e) => e.preventDefault());
    b.addEventListener("mousedown", (e) => e.preventDefault());
    b.addEventListener("click", (e) => {
      e.stopPropagation();
      closeMenu();
      run();
    });
    menu.appendChild(b);
  }
  (menu.lastElementChild as HTMLElement).style.borderRight = "0";
  document.body.appendChild(menu);
  // Au-dessus du doigt (en dessous s'il n'y a pas la place), sans sortir de l'écran.
  const w = menu.offsetWidth;
  const h = menu.offsetHeight;
  const vw = window.visualViewport?.width ?? window.innerWidth;
  const left = Math.max(8, Math.min(vw - w - 8, x - w / 2));
  const top = y - h - 24 > 8 ? y - h - 24 : y + 28;
  menu.style.left = `${left}px`;
  menu.style.top = `${top}px`;
  menu.style.visibility = "visible";
  openMenu = menu;
}

/** Ajoute le menu d'édition à l'appui long sur cet éditeur (écrans tactiles seulement). Retourne la fonction de retrait. */
export function attachTouchEditMenu(ed: MenuEditor): () => void {
  if (typeof window === "undefined") return () => undefined;
  const node = ed.getContainerDomNode();
  let start: { x: number; y: number } | null = null;
  let fired = false;
  let timer: ReturnType<typeof setTimeout> | null = null;
  const clear = () => {
    if (timer) clearTimeout(timer);
    timer = null;
  };

  const onStart = (e: TouchEvent) => {
    if (openMenu && !openMenu.contains(e.target as Node)) closeMenu();
    clear();
    fired = false;
    if (e.touches.length !== 1) {
      start = null;
      return;
    }
    const t = e.touches[0];
    start = { x: t.clientX, y: t.clientY };
    timer = setTimeout(() => {
      if (!start) return;
      fired = true;
      // Curseur à l'endroit touché, sauf si le doigt est dans la sélection (elle est gardée pour Copier / Couper).
      const pos = ed.getTargetAtClientPoint(start.x, start.y)?.position;
      const sel = ed.getSelection();
      if (pos && !(sel && !sel.isEmpty() && sel.containsPosition(pos))) ed.setPosition(pos);
      navigator.vibrate?.(12);
    }, LONG_PRESS);
  };
  const onMove = (e: TouchEvent) => {
    if (!start || fired) return;
    const t = e.touches[0];
    if (t && Math.hypot(t.clientX - start.x, t.clientY - start.y) > MOVE) {
      clear();
      start = null;
    }
  };
  const onEnd = () => {
    clear();
    if (start && fired) {
      const { x, y } = start;
      // Après le traitement du geste par l'éditeur (sélection du mot éventuelle).
      setTimeout(() => showMenu(ed, x, y), 0);
    }
    start = null;
  };
  const onScroll = () => closeMenu();

  node.addEventListener("touchstart", onStart, { capture: true, passive: true });
  node.addEventListener("touchmove", onMove, { capture: true, passive: true });
  node.addEventListener("touchend", onEnd, { capture: true, passive: true });
  node.addEventListener("touchcancel", onEnd, { capture: true, passive: true });
  window.addEventListener("scroll", onScroll, { passive: true });
  const outside = (e: Event) => {
    if (openMenu && !openMenu.contains(e.target as Node) && !node.contains(e.target as Node)) closeMenu();
  };
  document.addEventListener("pointerdown", outside, true);
  const detach = () => {
    clear();
    closeMenu();
    node.removeEventListener("touchstart", onStart, { capture: true });
    node.removeEventListener("touchmove", onMove, { capture: true });
    node.removeEventListener("touchend", onEnd, { capture: true });
    node.removeEventListener("touchcancel", onEnd, { capture: true });
    window.removeEventListener("scroll", onScroll);
    document.removeEventListener("pointerdown", outside, true);
  };
  ed.onDidDispose(detach);
  return detach;
}
