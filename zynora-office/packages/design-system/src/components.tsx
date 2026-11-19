import { useRef, type ButtonHTMLAttributes, type HTMLAttributes, type KeyboardEvent, type ReactNode } from "react";

function cx(...parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: "md" | "sm";
  icon?: ReactNode;
}

export function Button({ variant = "secondary", size = "md", icon, className, children, type, ...rest }: ButtonProps) {
  return (
    <button
      type={type ?? "button"}
      className={cx("z-button", `z-button--${variant}`, size === "sm" && "z-button--sm", className)}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}

export function Card({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cx("z-card", className)} {...rest} />;
}

export type BadgeTone = "neutral" | "info" | "success" | "warning";

export function Badge({ tone = "neutral", children }: { tone?: BadgeTone; children: ReactNode }) {
  return <span className={cx("z-badge", tone !== "neutral" && `z-badge--${tone}`)}>{children}</span>;
}

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  icon?: ReactNode;
}

export interface SegmentedControlProps<T extends string> {
  label: string;
  value: T;
  options: ReadonlyArray<SegmentedOption<T>>;
  onChange: (value: T) => void;
  disabled?: boolean;
}

/**
 * Groupe de boutons radio (motif ARIA « radiogroup ») :
 * Tab entre dans le groupe sur l'option choisie, les flèches changent de choix.
 */
export function SegmentedControl<T extends string>({ label, value, options, onChange, disabled }: SegmentedControlProps<T>) {
  const refs = useRef<Array<HTMLButtonElement | null>>([]);

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
    if (step === undefined || disabled) return;
    event.preventDefault();
    const current = options.findIndex((o) => o.value === value);
    const next = (current + step + options.length) % options.length;
    const option = options[next];
    if (!option) return;
    onChange(option.value);
    refs.current[next]?.focus();
  }

  return (
    <div className="z-segmented" role="radiogroup" aria-label={label} onKeyDown={onKeyDown}>
      {options.map((option, index) => {
        const checked = option.value === value;
        return (
          <button
            key={option.value}
            ref={(el) => {
              refs.current[index] = el;
            }}
            type="button"
            role="radio"
            aria-checked={checked}
            tabIndex={checked ? 0 : -1}
            disabled={disabled}
            className="z-segmented__option"
            onClick={() => !checked && onChange(option.value)}
          >
            {option.icon}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export interface NavItemProps {
  icon: ReactNode;
  label: string;
  current?: boolean;
  disabled?: boolean;
  trailing?: ReactNode;
  onSelect?: () => void;
  title?: string;
}

export function NavItem({ icon, label, current = false, disabled = false, trailing, onSelect, title }: NavItemProps) {
  return (
    <button
      type="button"
      className="z-nav-item"
      aria-current={current ? "page" : undefined}
      disabled={disabled}
      onClick={onSelect}
      title={title}
    >
      {icon}
      <span className="z-nav-item__label">{label}</span>
      {trailing}
    </button>
  );
}

/** Emblème ZYNORA : un « Z » formé de deux pages décalées, dans un carré arrondi. */
export function ZynoraMark({ size = 28, title = "ZYNORA" }: { size?: number; title?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" role="img" aria-label={title}>
      <rect x="0.5" y="0.5" width="63" height="63" rx="15.5" fill="#16132E" stroke="#FFFFFF" strokeOpacity={0.14} />
      <path d="M18 18h28L26 40h20" fill="none" stroke="#8F84FF" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18 46h28" fill="none" stroke="#F2A541" strokeWidth="6" strokeLinecap="round" />
    </svg>
  );
}

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Nom accessible (obligatoire : le bouton n'a pas de texte visible). */
  label: string;
  children: ReactNode;
}

export function IconButton({ label, className, children, type, ...rest }: IconButtonProps) {
  return (
    <button type={type ?? "button"} className={cx("z-icon-button", className)} aria-label={label} title={label} {...rest}>
      {children}
    </button>
  );
}
