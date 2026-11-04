"use client";

import { CodeWorkspace } from "../editor/code-workspace";

const DEMO = `ALGORITHME Moyenne
VARIABLES
  n, i : ENTIER
  note, somme : REEL
DEBUT
  LIRE(n)
  somme ← 0
  POUR i DE 1 A n FAIRE
    LIRE(note)
    somme ← somme + note
  FINPOUR
  ECRIRE("Moyenne : ", somme / n)
FIN
`;

export function EditorDemo() {
  return <CodeWorkspace initialLanguage="pseudocode" initialFiles={[{ name: "algorithme.algo", content: DEMO }]} initialStdin={"3\n12\n15.5\n9"} height="420px" />;
}
