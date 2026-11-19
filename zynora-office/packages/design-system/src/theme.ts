export type ThemePreference = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

const DARK_QUERY = "(prefers-color-scheme: dark)";

export function resolveTheme(preference: ThemePreference, prefersDark: boolean): ResolvedTheme {
  if (preference === "system") return prefersDark ? "dark" : "light";
  return preference;
}

/**
 * Applique le thème à la racine du document et suit le thème du système quand la
 * préférence est « system ». Renvoie une fonction qui arrête ce suivi.
 */
export function applyTheme(preference: ThemePreference, root: HTMLElement = document.documentElement): () => void {
  const media = typeof window.matchMedia === "function" ? window.matchMedia(DARK_QUERY) : undefined;
  const update = () => {
    root.dataset.theme = resolveTheme(preference, media?.matches ?? false);
  };
  update();
  if (preference !== "system" || !media) return () => {};
  media.addEventListener("change", update);
  return () => media.removeEventListener("change", update);
}
