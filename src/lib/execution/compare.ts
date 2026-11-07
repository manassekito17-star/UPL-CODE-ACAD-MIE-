/**
 * Comparaison tolérante des sorties : on ignore les espaces en fin de ligne,
 * les lignes vides finales et les différences de fin de ligne (CRLF / LF).
 */
export function normalizeOutput(text: string): string {
  return text
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((l) => l.replace(/[ \t]+$/, ""))
    .join("\n")
    .replace(/\n+$/, "");
}

export function outputsMatch(actual: string, expected: string): boolean {
  return normalizeOutput(actual) === normalizeOutput(expected);
}

/** Première ligne qui diffère, pour expliquer l'échec à l'étudiant. */
export function firstDifference(actual: string, expected: string): { line: number; got: string; want: string } | null {
  const a = normalizeOutput(actual).split("\n");
  const e = normalizeOutput(expected).split("\n");
  const n = Math.max(a.length, e.length);
  for (let i = 0; i < n; i++) {
    if (a[i] !== e[i]) return { line: i + 1, got: a[i] ?? "(rien)", want: e[i] ?? "(rien)" };
  }
  return null;
}
