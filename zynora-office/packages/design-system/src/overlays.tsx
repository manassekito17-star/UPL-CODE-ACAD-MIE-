import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type InputHTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from "react";

const FOCUSABLE = 'button:not([disabled]), input:not([disabled]), select, textarea, a[href], [tabindex]:not([tabindex="-1"])';

export interface DialogProps {
  open: boolean;
  title: string;
  description?: ReactNode;
  /** `alertdialog` pour une confirmation d'action destructrice. */
  role?: "dialog" | "alertdialog";
  onClose: () => void;
  children?: ReactNode;
  actions: ReactNode;
}

/**
 * Fenêtre modale accessible : focus placé à l'intérieur à l'ouverture, Tab confiné,
 * Échap pour fermer, focus rendu à l'élément d'origine à la fermeture.
 */
export function Dialog({ open, title, description, role = "dialog", onClose, children, actions }: DialogProps) {
  const panel = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const first = panel.current?.querySelector<HTMLElement>("[data-autofocus]") ?? panel.current?.querySelector<HTMLElement>(FOCUSABLE);
    first?.focus();
    return () => previous?.focus?.();
  }, [open]);

  if (!open) return null;

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.stopPropagation();
      onClose();
      return;
    }
    if (event.key !== "Tab" || !panel.current) return;
    const items = Array.from(panel.current.querySelectorAll<HTMLElement>(FOCUSABLE));
    const first = items[0];
    const last = items[items.length - 1];
    if (!first || !last) return;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return (
    <div className="z-dialog__backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        ref={panel}
        className="z-dialog"
        role={role}
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        onKeyDown={onKeyDown}
      >
        <h2 id={titleId} className="z-dialog__title">
          {title}
        </h2>
        {description && (
          <div id={descriptionId} className="z-dialog__description">
            {description}
          </div>
        )}
        {children}
        <div className="z-dialog__actions">{actions}</div>
      </div>
    </div>
  );
}

export interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label: string;
  hideLabel?: boolean;
  error?: string | null | undefined;
}

export function TextField({ label, hideLabel, error, id, className, ...rest }: TextFieldProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const errorId = `${inputId}-error`;
  return (
    <div className={["z-field", className].filter(Boolean).join(" ")}>
      <label htmlFor={inputId} className={hideLabel ? "z-visually-hidden" : "z-field__label"}>
        {label}
      </label>
      <input
        id={inputId}
        className="z-field__input"
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        {...rest}
      />
      {error && (
        <p id={errorId} className="z-field__error">
          {error}
        </p>
      )}
    </div>
  );
}

export type ToastTone = "info" | "success" | "error";

export interface ToastInput {
  tone?: ToastTone;
  message: string;
  action?: { label: string; onAction: () => void };
  /** Durée d'affichage en millisecondes (défaut 6 s ; les erreurs restent 10 s). */
  duration?: number;
}

interface Toast extends ToastInput {
  id: number;
}

const ToastContext = createContext<((toast: ToastInput) => void) | null>(null);

export function useToasts(): (toast: ToastInput) => void {
  const push = useContext(ToastContext);
  if (!push) throw new Error("useToasts doit être utilisé dans un ToastProvider");
  return push;
}

/** Notifications non bloquantes, annoncées par les lecteurs d'écran (région « polite »). */
export function ToastProvider({ children, closeLabel = "Fermer" }: { children: ReactNode; closeLabel?: string }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  const dismiss = useCallback((id: number) => {
    setToasts((list) => list.filter((t) => t.id !== id));
    clearTimeout(timers.current.get(id));
    timers.current.delete(id);
  }, []);

  const push = useCallback(
    (toast: ToastInput) => {
      const id = nextId.current++;
      setToasts((list) => [...list.slice(-3), { ...toast, id }]);
      const duration = toast.duration ?? (toast.tone === "error" ? 10_000 : 6_000);
      timers.current.set(
        id,
        setTimeout(() => dismiss(id), duration),
      );
    },
    [dismiss],
  );

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((timer) => clearTimeout(timer));
  }, []);

  const value = useMemo(() => push, [push]);
  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="z-toasts" role="status" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className={`z-toast z-toast--${toast.tone ?? "info"}`}>
            <span className="z-toast__message">{toast.message}</span>
            {toast.action && (
              <button
                type="button"
                className="z-toast__action"
                onClick={() => {
                  toast.action?.onAction();
                  dismiss(toast.id);
                }}
              >
                {toast.action.label}
              </button>
            )}
            <button type="button" className="z-toast__close" aria-label={closeLabel} onClick={() => dismiss(toast.id)}>
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
