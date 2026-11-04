import type { LanguageId } from "@/content/types";

export interface LanguageConfig {
  id: LanguageId;
  label: string;
  shortLabel: string;
  monaco: string;
  extension: string;
  mainFile: string;
  /** Exécution possible dans le navigateur quand le serveur d'exécution n'est pas configuré. */
  browserFallback: boolean;
  /** Gestion de plusieurs fichiers. */
  multiFile: boolean;
  template: string;
  /** Squelette neutre proposé pour un exercice sans code de départ. */
  exerciseTemplate: string;
}

export const LANGUAGES: Record<LanguageId, LanguageConfig> = {
  pseudocode: {
    id: "pseudocode",
    exerciseTemplate: `ALGORITHME Exercice
VARIABLES
  // vos déclarations
DEBUT
  // votre algorithme
FIN
`,
    label: "Algorithmique (pseudocode)",
    shortLabel: "Pseudocode",
    monaco: "pseudocode",
    extension: "algo",
    mainFile: "algorithme.algo",
    browserFallback: true,
    multiFile: false,
    template: `ALGORITHME MonAlgorithme
VARIABLES
  nom : CHAINE
DEBUT
  ECRIRE("Quel est votre nom ?")
  LIRE(nom)
  ECRIRE("Bonjour ", nom, " !")
FIN
`,
  },
  python: {
    id: "python",
    exerciseTemplate: `# Écrivez votre programme ici
`,
    label: "Python",
    shortLabel: "Python",
    monaco: "python",
    extension: "py",
    mainFile: "main.py",
    browserFallback: true,
    multiFile: true,
    template: `nom = input("Quel est votre nom ? ")
print(f"Bonjour {nom} !")
`,
  },
  c: {
    id: "c",
    exerciseTemplate: `#include <stdio.h>

int main(void) {
    // Votre code ici
    return 0;
}
`,
    label: "Langage C",
    shortLabel: "C",
    monaco: "c",
    extension: "c",
    mainFile: "main.c",
    browserFallback: false,
    multiFile: false,
    template: `#include <stdio.h>

int main(void) {
    char nom[50];
    printf("Quel est votre nom ? ");
    scanf("%49s", nom);
    printf("Bonjour %s !\\n", nom);
    return 0;
}
`,
  },
  javascript: {
    id: "javascript",
    exerciseTemplate: `// lireLigne() lit la ligne suivante de l'entrée
`,
    label: "JavaScript",
    shortLabel: "JavaScript",
    monaco: "javascript",
    extension: "js",
    mainFile: "main.js",
    browserFallback: true,
    multiFile: false,
    template: `// lireLigne() lit la ligne suivante de la zone « Entrée »
const nom = lireLigne();
console.log("Bonjour " + nom + " !");
`,
  },
  java: {
    id: "java",
    exerciseTemplate: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        // Votre code ici
    }
}
`,
    label: "Java",
    shortLabel: "Java",
    monaco: "java",
    extension: "java",
    mainFile: "Main.java",
    browserFallback: false,
    multiFile: false,
    template: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.print("Quel est votre nom ? ");
        String nom = sc.nextLine();
        System.out.println("Bonjour " + nom + " !");
    }
}
`,
  },
};

export const LANGUAGE_IDS = Object.keys(LANGUAGES) as LanguageId[];

export function isLanguageId(value: unknown): value is LanguageId {
  return typeof value === "string" && value in LANGUAGES;
}

/** Limites appliquées à tout programme étudiant. */
export const EXECUTION_LIMITS = {
  maxSourceChars: 100_000,
  maxStdinChars: 20_000,
  maxFiles: 10,
  maxOutputChars: 64_000,
  cpuTimeLimitSeconds: 5,
  wallTimeLimitSeconds: 10,
  memoryLimitKb: 128_000,
  pseudocodeMaxSteps: 2_000_000,
};
