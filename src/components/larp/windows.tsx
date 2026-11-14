"use client";

/** Fenêtres de style bureau classique : cadre déplaçable, boutons, champs. */
import { useRef, type CSSProperties, type ReactNode } from "react";

export const UI_FONT = "11px Tahoma, Verdana, 'Segoe UI', sans-serif";
export const FACE = "#ece9d8";

export function TitleBar({ title, icon, onClose, onDragStart, active = true }: { title: string; icon?: ReactNode; onClose?: () => void; onDragStart?: (e: React.PointerEvent) => void; active?: boolean }) {
  return (
    <div
      className="flex h-[22px] shrink-0 select-none items-center gap-1 rounded-t-[6px] pl-1.5 pr-0.5 text-white"
      style={{ background: active ? "linear-gradient(180deg,#0a6cff 0%,#0054e3 45%,#0043b8 100%)" : "linear-gradient(180deg,#7a96df,#6a85cf)", font: "bold 11px Tahoma, Verdana, sans-serif", touchAction: "none" }}
      onPointerDown={onDragStart}
    >
      {icon}
      <span className="min-w-0 flex-1 truncate" style={{ textShadow: "1px 1px #0b2a7a" }}>
        {title}
      </span>
      {onClose && (
        <button
          type="button"
          aria-label="Fermer"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={onClose}
          className="grid h-[18px] w-[18px] place-items-center rounded-[3px] border border-white text-[11px] font-bold leading-none text-white"
          style={{ background: "linear-gradient(180deg,#e88b6d,#c9401c)" }}
        >
          ✕
        </button>
      )}
    </div>
  );
}

/** Déplacement d'une fenêtre (corrigé par l'échelle d'affichage). */
export function useDrag(pos: { x: number; y: number }, setPos: (p: { x: number; y: number }) => void, scale: number) {
  const start = useRef<{ px: number; py: number; x: number; y: number } | null>(null);
  return (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    start.current = { px: e.clientX, py: e.clientY, x: pos.x, y: pos.y };
    const el = e.currentTarget as HTMLElement;
    el.setPointerCapture(e.pointerId);
    const move = (ev: PointerEvent) => {
      if (!start.current) return;
      setPos({ x: start.current.x + (ev.clientX - start.current.px) / scale, y: Math.max(0, start.current.y + (ev.clientY - start.current.py) / scale) });
    };
    const up = () => {
      start.current = null;
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
  };
}

export function Win({ title, icon, onClose, children, style, onDragStart, testId, className = "" }: { title: string; icon?: ReactNode; onClose?: () => void; children: ReactNode; style?: CSSProperties; onDragStart?: (e: React.PointerEvent) => void; testId?: string; className?: string }) {
  return (
    <div
      className={`absolute flex flex-col rounded-t-[7px] border border-[#0831d9] shadow-[2px_3px_8px_rgba(0,0,0,.45)] ${className}`}
      style={{ background: FACE, font: UI_FONT, ...style }}
      data-testid={testId}
      role="dialog"
      aria-label={title}
      onClick={(e) => e.stopPropagation()}
    >
      <TitleBar title={title} icon={icon} onClose={onClose} onDragStart={onDragStart} />
      {children}
    </div>
  );
}

export function XpButton({ children, onClick, disabled, testId, className = "", type = "button", autoFocus }: { children: ReactNode; onClick?: () => void; disabled?: boolean; testId?: string; className?: string; type?: "button" | "submit"; autoFocus?: boolean }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      data-testid={testId}
      autoFocus={autoFocus}
      className={`min-w-[75px] rounded-[3px] border border-[#003c74] px-2 py-[3px] text-black enabled:hover:shadow-[inset_0_0_0_2px_#f8b636] disabled:text-[#a0a0a0] ${className}`}
      style={{ background: "linear-gradient(180deg,#fff 0%,#ecebe6 85%,#d6d0c5 100%)", font: UI_FONT }}
    >
      {children}
    </button>
  );
}

export const fieldClass = "w-full border border-[#7f9db9] bg-white px-1 py-[2px] text-black outline-none focus:border-[#316ac5]";

export function GroupBox({ label, children, disabled }: { label: string; children: ReactNode; disabled?: boolean }) {
  return (
    <fieldset className={`mb-2 border border-[#d0d0bf] px-2 pb-2 pt-0 ${disabled ? "text-[#a0a0a0]" : ""}`} disabled={disabled}>
      <legend className="px-1 text-[#0046d5]">{label}</legend>
      {children}
    </fieldset>
  );
}
