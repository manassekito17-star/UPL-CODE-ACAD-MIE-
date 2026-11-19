// Contrôles de ruban partagés par ZYNORA Sheets et ZYNORA Word (accessibles au clavier).
import { ChevronDown, MoveDownRight } from "lucide-react";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

/**
 * Groupe du ruban : outils au-dessus, nom en dessous. `onLaunch` ajoute le bouton qui ouvre le
 * dialogue complet du groupe (uniquement quand ce dialogue existe réellement).
 */
export function Group({ label, children, onLaunch, launchLabel }: { label: string; children: ReactNode; onLaunch?: () => void; launchLabel?: string }) {
  return (
    <div className="ribbon__group" role="group" aria-label={label}>
      <div className="ribbon__tools">{children}</div>
      <div className="ribbon__label">
        <span>{label}</span>
        {onLaunch && (
          <button type="button" className="ribbon__launcher" aria-label={launchLabel ?? label} title={launchLabel ?? label} onClick={onLaunch}>
            <MoveDownRight size={10} aria-hidden />
          </button>
        )}
      </div>
    </div>
  );
}

/** Outils disposés sur plusieurs lignes dans un même groupe (disposition habituelle des rubans). */
export function Rows({ children }: { children: ReactNode }) {
  return <div className="ribbon__rows">{children}</div>;
}

export function Row({ children }: { children: ReactNode }) {
  return <div className="ribbon__row">{children}</div>;
}

export function Tool({
  label,
  icon,
  onClick,
  pressed,
  disabled,
  wide,
  big,
  text,
}: {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  pressed?: boolean;
  disabled?: boolean;
  wide?: boolean;
  /** Libellé affiché, plus court que le nom accessible (`label`, aussi en infobulle). */
  text?: string;
  /** Grand bouton : icône au-dessus du libellé, sur toute la hauteur du groupe. */
  big?: boolean;
}) {
  if (big) wide = true;
  return (
    <button
      type="button"
      className={`tool${big ? " tool--big" : wide ? " tool--wide" : ""}`}
      aria-label={wide && !text ? undefined : label}
      title={label}
      aria-pressed={pressed === undefined ? undefined : pressed}
      disabled={disabled}
      onClick={onClick}
    >
      {icon && <span aria-hidden>{icon}</span>}
      {wide && <span>{text ?? label}</span>}
    </button>
  );
}

export function ColorTool({ label, icon, value, onPick }: { label: string; icon: ReactNode; value: string; onPick: (color: string) => void }) {
  return (
    <label className="tool tool--color" title={label}>
      <span aria-hidden>{icon}</span>
      <span className="tool__swatch" style={{ background: value }} aria-hidden />
      <input type="color" aria-label={label} value={value} onChange={(e) => onPick(e.target.value)} />
    </label>
  );
}

export function Select({
  label,
  value,
  options,
  onChange,
  wide,
  placeholder,
}: {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
  wide?: boolean;
  placeholder?: string;
}) {
  const id = useId();
  const known = options.some((o) => o.value === value);
  return (
    <>
      <label className="z-visually-hidden" htmlFor={id}>
        {label}
      </label>
      <select id={id} className={`ribbon__select${wide ? " ribbon__select--wide" : ""}`} title={label} value={known ? value : ""} onChange={(e) => e.target.value && onChange(e.target.value)}>
        {!known && (
          <option value="" disabled>
            {placeholder ?? value}
          </option>
        )}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </>
  );
}

export function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="ribbon__check">
      <input type="checkbox" checked={checked} onChange={onChange} />
      {label}
    </label>
  );
}

export interface MenuItem {
  label: string;
  run: () => void;
  disabled?: boolean;
}

/**
 * Menu déroulant accessible (bouton « menu », flèches, Échap, clic extérieur). La liste est
 * rendue au-dessus de la page, sous son bouton : le ruban, qui défile, ne peut pas la rogner.
 */
export function Menu({ label, icon, items, text, big, shortLabel }: { label: string; icon?: ReactNode; items: MenuItem[]; text?: boolean; big?: boolean; shortLabel?: string }) {
  if (big) text = true;
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const root = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    list.current?.querySelector<HTMLButtonElement>("[role=menuitem]:not(:disabled)")?.focus();
    const onDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!root.current?.contains(target) && !list.current?.contains(target)) setOpen(false);
    };
    const close = () => setOpen(false);
    document.addEventListener("mousedown", onDown);
    window.addEventListener("resize", close);
    return () => {
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("resize", close);
    };
  }, [open]);

  function toggle() {
    const rect = button.current?.getBoundingClientRect();
    if (rect) {
      // Le menu reste dans la fenêtre, même près du bord droit.
      const left = Math.max(8, Math.min(rect.left, window.innerWidth - 240));
      setPosition({ top: rect.bottom + 4, left });
    }
    setOpen((o) => !o);
  }

  function onKey(event: React.KeyboardEvent<HTMLDivElement>) {
    const entries = Array.from(list.current?.querySelectorAll<HTMLButtonElement>("[role=menuitem]:not(:disabled)") ?? []);
    const index = entries.indexOf(document.activeElement as HTMLButtonElement);
    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      button.current?.focus();
    } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const step = event.key === "ArrowDown" ? 1 : -1;
      entries[(index + step + entries.length) % entries.length]?.focus();
    }
  }

  return (
    <div className="menu" ref={root}>
      <button
        ref={button}
        type="button"
        className={`tool${big ? " tool--big" : text ? " tool--wide" : ""}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={text && !shortLabel ? undefined : label}
        title={label}
        onClick={toggle}
      >
        {icon && <span aria-hidden>{icon}</span>}
        {text && <span>{shortLabel ?? label}</span>}
        <ChevronDown size={12} aria-hidden />
      </button>
      {open &&
        createPortal(
        <div ref={list} className="menu__list" role="menu" id={menuId} aria-label={label} style={position} onKeyDown={onKey}>
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              disabled={item.disabled}
              className="menu__item"
              onClick={() => {
                setOpen(false);
                item.run();
              }}
            >
              {item.label}
            </button>
          ))}
        </div>,
          document.body,
        )}
    </div>
  );
}
