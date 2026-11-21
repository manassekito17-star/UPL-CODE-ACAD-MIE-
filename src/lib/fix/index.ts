import { autoFix as autoFixLarp } from "@/lib/larp/autofix";
import type { FixResult } from "./common";
import { autoFixJavaScript } from "./javascript";
import { autoFixPseudocode } from "./pseudocode";
import { autoFixPython } from "./python";

export type { Change, FixResult } from "./common";
export { autoFixJavaScript, autoFixPseudocode, autoFixPython, autoFixLarp };

/** « Corriger le code » pour un langage de ZENTECH (null : rien à corriger à coup sûr). */
export function autoFixCode(language: string, code: string, error?: { message: string; line: number }): FixResult | null {
  switch (language) {
    case "pseudocode":
      return autoFixPseudocode(code, error);
    case "python":
      return autoFixPython(code, error);
    case "javascript":
      return autoFixJavaScript(code, error);
    default:
      return null;
  }
}
