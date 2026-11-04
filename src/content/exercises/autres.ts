import { makeExercise, type ExInput } from "../helpers";
import type { Exercise } from "../types";

const c = (input: ExInput) => makeExercise({ language: "c", courseSlug: "langage-c" }, input);
const js = (input: ExInput) => makeExercise({ language: "javascript", courseSlug: "javascript" }, input);
const java = (input: ExInput) => makeExercise({ language: "java", courseSlug: "java" }, input);

export const cExercises: Exercise[] = [
  c({
    slug: "c-bonjour",
    lessonSlug: "structure-programme",
    title: "Bonjour en C",
    difficulty: "debutant",
    type: "ecrire_programme",
    statement: "Affichez exactement **Bonjour UPL** suivi d'un retour à la ligne.",
    examples: [{ input: "", output: "Bonjour UPL" }],
    starterCode: `
      #include <stdio.h>

      int main(void) {
          // Votre code ici
          return 0;
      }
    `,
    hints: ["printf affiche du texte.", "\\n passe à la ligne : printf(\"Bonjour UPL\\n\");"],
    tests: [{ input: "", expected: "Bonjour UPL" }],
    solution: `
      #include <stdio.h>

      int main(void) {
          printf("Bonjour UPL\\n");
          return 0;
      }
    `,
    correction: "Une seule instruction printf ; n'oubliez pas le point-virgule ni le \\n final.",
    points: 5,
  }),
  c({
    slug: "c-somme",
    lessonSlug: "entrees-sorties",
    title: "Somme et moyenne",
    difficulty: "debutant",
    type: "ecrire_programme",
    statement: `
      Lisez deux entiers et affichez :

      ~~~text
      Somme : <a + b>
      Moyenne : <moyenne avec 1 décimale>
      ~~~
    `,
    examples: [{ input: "7 8", output: "Somme : 15\nMoyenne : 7.5" }],
    hints: ["scanf(\"%d %d\", &a, &b);", "Divisez par 2.0 pour obtenir un réel.", "%.1f affiche une décimale."],
    tests: [
      { input: "7 8", expected: "Somme : 15\nMoyenne : 7.5" },
      { input: "10 10", expected: "Somme : 20\nMoyenne : 10.0" },
      { input: "-3 4", expected: "Somme : 1\nMoyenne : 0.5", hidden: true },
    ],
    solution: `
      #include <stdio.h>

      int main(void) {
          int a, b;
          scanf("%d %d", &a, &b);
          printf("Somme : %d\\n", a + b);
          printf("Moyenne : %.1f\\n", (a + b) / 2.0);
          return 0;
      }
    `,
    correction: "(a + b) / 2 serait une division entière (7 au lieu de 7.5) : on divise par **2.0**.",
  }),
  c({
    slug: "c-pair-impair",
    lessonSlug: "conditions",
    title: "Pair ou impair",
    difficulty: "debutant",
    type: "ecrire_programme",
    statement: "Lisez un entier et affichez **pair** ou **impair**.",
    examples: [{ input: "8", output: "pair" }],
    hints: ["n % 2 == 0 pour un nombre pair."],
    tests: [
      { input: "8", expected: "pair" },
      { input: "13", expected: "impair" },
      { input: "-7", expected: "impair", hidden: true },
    ],
    solution: `
      #include <stdio.h>

      int main(void) {
          int n;
          scanf("%d", &n);
          if (n % 2 == 0) printf("pair\\n");
          else printf("impair\\n");
          return 0;
      }
    `,
    correction: "En C, -7 % 2 vaut -1 : tester == 0 fonctionne pour tous les signes.",
    points: 5,
  }),
  c({
    slug: "c-table",
    lessonSlug: "boucles",
    title: "Table de multiplication",
    difficulty: "debutant",
    type: "ecrire_programme",
    statement: "Lisez n et affichez sa table de 1 à 10 au format **n x i = résultat**.",
    examples: [{ input: "4", output: "4 x 1 = 4\n…\n4 x 10 = 40" }],
    hints: ["for (int i = 1; i <= 10; i++)"],
    tests: [
      { input: "4", expected: Array.from({ length: 10 }, (_, k) => `4 x ${k + 1} = ${4 * (k + 1)}`).join("\n") },
      { input: "11", expected: Array.from({ length: 10 }, (_, k) => `11 x ${k + 1} = ${11 * (k + 1)}`).join("\n"), hidden: true },
    ],
    solution: `
      #include <stdio.h>

      int main(void) {
          int n;
          scanf("%d", &n);
          for (int i = 1; i <= 10; i++) {
              printf("%d x %d = %d\\n", n, i, n * i);
          }
          return 0;
      }
    `,
    correction: "La boucle for regroupe initialisation, condition et incrémentation sur une ligne.",
  }),
  c({
    slug: "c-puissance",
    lessonSlug: "fonctions",
    title: "Fonction puissance",
    difficulty: "intermediaire",
    type: "ecrire_programme",
    statement: "Écrivez une fonction **long long puissance(int x, int n)** (boucle, sans pow). Lisez x et n (n ≥ 0) et affichez x^n.",
    examples: [{ input: "2 20", output: "1048576" }],
    constraints: ["Ne pas utiliser pow() de math.h."],
    hints: ["Initialisez le résultat à 1.", "Utilisez %lld pour afficher un long long."],
    tests: [
      { input: "2 20", expected: "1048576" },
      { input: "7 0", expected: "1" },
      { input: "3 30", expected: "205891132094649", hidden: true },
    ],
    solution: `
      #include <stdio.h>

      long long puissance(int x, int n) {
          long long r = 1;
          for (int i = 0; i < n; i++) r *= x;
          return r;
      }

      int main(void) {
          int x, n;
          scanf("%d %d", &x, &n);
          printf("%lld\\n", puissance(x, n));
          return 0;
      }
    `,
    correction: "Le type long long évite le dépassement de capacité d'un int (3^30 dépasse 2 milliards).",
  }),
  c({
    slug: "c-inverser-tableau",
    lessonSlug: "tableaux",
    title: "Inverser un tableau",
    difficulty: "intermediaire",
    type: "ecrire_programme",
    statement: "Lisez n (1 ≤ n ≤ 100) puis n entiers. Inversez le tableau **sur place** (en échangeant les éléments) puis affichez-le sur une ligne, séparé par des espaces.",
    examples: [{ input: "5\n1 2 3 4 5", output: "5 4 3 2 1" }],
    hints: ["Échangez t[i] et t[n - 1 - i] pour i allant de 0 à n/2 - 1.", "Attention à l'espace final : affichez l'espace avant chaque élément sauf le premier."],
    tests: [
      { input: "5\n1 2 3 4 5", expected: "5 4 3 2 1" },
      { input: "1\n9", expected: "9" },
      { input: "4\n10 -2 7 0", expected: "0 7 -2 10", hidden: true },
    ],
    solution: `
      #include <stdio.h>

      int main(void) {
          int n, t[100];
          scanf("%d", &n);
          for (int i = 0; i < n; i++) scanf("%d", &t[i]);
          for (int i = 0; i < n / 2; i++) {
              int tmp = t[i];
              t[i] = t[n - 1 - i];
              t[n - 1 - i] = tmp;
          }
          for (int i = 0; i < n; i++) printf(i ? " %d" : "%d", t[i]);
          printf("\\n");
          return 0;
      }
    `,
    correction: "On ne parcourt que la moitié du tableau ; sinon chaque paire serait échangée deux fois et le tableau retrouverait son ordre initial.",
  }),
  c({
    slug: "c-echange-pointeurs",
    lessonSlug: "pointeurs",
    title: "Échange par pointeurs",
    difficulty: "avance",
    type: "completer",
    statement: "Complétez la fonction **echanger** pour qu'elle échange les valeurs pointées par a et b.",
    examples: [{ input: "3 9", output: "9 3" }],
    starterCode: `
      #include <stdio.h>

      void echanger(int *a, int *b) {
          // À compléter
      }

      int main(void) {
          int x, y;
          scanf("%d %d", &x, &y);
          echanger(&x, &y);
          printf("%d %d\\n", x, y);
          return 0;
      }
    `,
    hints: ["*a désigne la valeur pointée par a.", "Utilisez une variable temporaire int t = *a;"],
    tests: [
      { input: "3 9", expected: "9 3" },
      { input: "0 0", expected: "0 0" },
      { input: "-5 12", expected: "12 -5", hidden: true },
    ],
    solution: `
      #include <stdio.h>

      void echanger(int *a, int *b) {
          int t = *a;
          *a = *b;
          *b = t;
      }

      int main(void) {
          int x, y;
          scanf("%d %d", &x, &y);
          echanger(&x, &y);
          printf("%d %d\\n", x, y);
          return 0;
      }
    `,
    correction: "La fonction reçoit les **adresses** de x et y : en modifiant *a et *b, elle modifie directement les variables de main.",
    isEvaluated: true,
  }),
];

export const javascriptExercises: Exercise[] = [
  js({
    slug: "js-bonjour",
    lessonSlug: "introduction",
    title: "Bonjour en JavaScript",
    difficulty: "debutant",
    type: "ecrire_programme",
    statement: "Lisez un prénom avec **lireLigne()** et affichez **Bonjour <prénom> !**",
    examples: [{ input: "Amani", output: "Bonjour Amani !" }],
    starterCode: `
      const prenom = lireLigne();
      // Affichez le message
    `,
    hints: ["console.log affiche une valeur.", "Concaténez avec + : \"Bonjour \" + prenom + \" !\""],
    tests: [
      { input: "Amani", expected: "Bonjour Amani !" },
      { input: "Josué", expected: "Bonjour Josué !", hidden: true },
    ],
    solution: `
      const prenom = lireLigne();
      console.log("Bonjour " + prenom + " !");
    `,
    correction: "lireLigne() renvoie la ligne suivante de l'entrée ; console.log l'affiche après concaténation.",
    points: 5,
  }),
  js({
    slug: "js-fizzbuzz",
    lessonSlug: "boucles",
    title: "FizzBuzz",
    difficulty: "debutant",
    type: "probleme",
    statement: `
      Lisez n et affichez les nombres de 1 à n, un par ligne, en remplaçant :

      - les multiples de 3 par **Fizz** ;
      - les multiples de 5 par **Buzz** ;
      - les multiples de 3 et de 5 par **FizzBuzz**.
    `,
    examples: [{ input: "5", output: "1\n2\nFizz\n4\nBuzz" }],
    hints: ["Testez d'abord le cas « multiple de 15 ».", "i % 3 === 0 teste un multiple de 3."],
    tests: [
      { input: "5", expected: "1\n2\nFizz\n4\nBuzz" },
      {
        input: "15",
        expected: "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz",
        hidden: true,
      },
    ],
    solution: `
      const n = Number(lireLigne());
      for (let i = 1; i <= n; i++) {
        if (i % 15 === 0) console.log("FizzBuzz");
        else if (i % 3 === 0) console.log("Fizz");
        else if (i % 5 === 0) console.log("Buzz");
        else console.log(i);
      }
    `,
    correction: "L'ordre des tests est essentiel : si l'on teste « multiple de 3 » en premier, 15 afficherait Fizz.",
  }),
  js({
    slug: "js-somme-tableau",
    lessonSlug: "tableaux-objets",
    title: "Statistiques avec reduce",
    difficulty: "intermediaire",
    type: "ecrire_programme",
    statement: `
      Lisez une ligne de nombres séparés par des espaces et affichez :

      ~~~text
      Somme : …
      Pairs : … (les nombres pairs, séparés par une virgule et un espace)
      ~~~
    `,
    examples: [{ input: "3 8 5 12 7", output: "Somme : 35\nPairs : 8, 12" }],
    hints: ["lireLigne().split(\" \").map(Number)", "reduce((s, x) => s + x, 0)", "filter puis join(\", \")"],
    tests: [
      { input: "3 8 5 12 7", expected: "Somme : 35\nPairs : 8, 12" },
      { input: "2 4", expected: "Somme : 6\nPairs : 2, 4" },
      { input: "1 3 5", expected: "Somme : 9\nPairs : ", hidden: true },
    ],
    solution: `
      const nombres = lireLigne().trim().split(/\\s+/).map(Number);
      const somme = nombres.reduce((s, x) => s + x, 0);
      const pairs = nombres.filter((x) => x % 2 === 0);
      console.log("Somme : " + somme);
      console.log("Pairs : " + pairs.join(", "));
    `,
    correction: "map convertit les chaînes en nombres, reduce les additionne, filter sélectionne les pairs et join les assemble.",
  }),
];

export const javaExercises: Exercise[] = [
  java({
    slug: "java-bonjour",
    lessonSlug: "presentation",
    title: "Bonjour en Java",
    difficulty: "debutant",
    type: "ecrire_programme",
    statement: "Affichez exactement **Bonjour UPL**.",
    examples: [{ input: "", output: "Bonjour UPL" }],
    starterCode: `
      public class Main {
          public static void main(String[] args) {
              // Votre code ici
          }
      }
    `,
    hints: ["System.out.println affiche une ligne."],
    tests: [{ input: "", expected: "Bonjour UPL" }],
    solution: `
      public class Main {
          public static void main(String[] args) {
              System.out.println("Bonjour UPL");
          }
      }
    `,
    correction: "System.out.println affiche le texte puis passe à la ligne.",
    points: 5,
  }),
  java({
    slug: "java-somme",
    lessonSlug: "variables-types",
    title: "Somme de deux entiers",
    difficulty: "debutant",
    type: "ecrire_programme",
    statement: "Lisez deux entiers avec Scanner et affichez **Somme : <a + b>**.",
    examples: [{ input: "4 6", output: "Somme : 10" }],
    hints: ["Scanner sc = new Scanner(System.in);", "Attention : \"Somme : \" + a + b concatène ! Mettez (a + b) entre parenthèses."],
    tests: [
      { input: "4 6", expected: "Somme : 10" },
      { input: "-8 3", expected: "Somme : -5", hidden: true },
    ],
    solution: `
      import java.util.Scanner;

      public class Main {
          public static void main(String[] args) {
              Scanner sc = new Scanner(System.in);
              int a = sc.nextInt();
              int b = sc.nextInt();
              System.out.println("Somme : " + (a + b));
          }
      }
    `,
    correction: "Sans parenthèses, \"Somme : \" + a + b produit \"Somme : 46\" : l'expression est évaluée de gauche à droite et la chaîne absorbe les nombres.",
  }),
  java({
    slug: "java-pair-impair",
    lessonSlug: "conditions-boucles",
    title: "Pair ou impair",
    difficulty: "debutant",
    type: "ecrire_programme",
    statement: "Lisez un entier et affichez **pair** ou **impair**.",
    examples: [{ input: "12", output: "pair" }],
    hints: ["n % 2 == 0"],
    tests: [
      { input: "12", expected: "pair" },
      { input: "5", expected: "impair" },
      { input: "-1", expected: "impair", hidden: true },
    ],
    solution: `
      import java.util.Scanner;

      public class Main {
          public static void main(String[] args) {
              int n = new Scanner(System.in).nextInt();
              System.out.println(n % 2 == 0 ? "pair" : "impair");
          }
      }
    `,
    correction: "L'opérateur ternaire choisit entre deux valeurs selon la condition.",
    points: 5,
  }),
  java({
    slug: "java-classe-compte",
    lessonSlug: "classes-objets",
    title: "Classe CompteBancaire",
    difficulty: "intermediaire",
    type: "ecrire_programme",
    statement: `
      Écrivez une classe **CompteBancaire** avec un solde privé, une méthode **deposer(double)**, une méthode **retirer(double)** qui renvoie false si le solde est insuffisant, et **getSolde()**.

      Entrée : une suite de lignes « D montant » (dépôt) ou « R montant » (retrait), terminée par « FIN ». Affichez **REFUS** pour chaque retrait impossible (texte sans accent), puis à la fin **Solde : <solde>** avec 2 décimales.
    `,
    examples: [{ input: "D 100\nR 30\nR 100\nFIN", output: "REFUS\nSolde : 70.00" }],
    hints: [
      "Lisez chaque ligne avec sc.next() pour l'opération puis sc.nextDouble() pour le montant.",
      "System.out.printf(\"Solde : %.2f%n\", c.getSolde());",
    ],
    tests: [
      { input: "D 100\nR 30\nR 100\nFIN", expected: "REFUS\nSolde : 70.00" },
      { input: "FIN", expected: "Solde : 0.00" },
      { input: "D 50.5\nD 49.5\nR 100\nR 1\nFIN", expected: "REFUS\nSolde : 0.00", hidden: true },
    ],
    solution: `
      import java.util.Locale;
      import java.util.Scanner;

      class CompteBancaire {
          private double solde;

          void deposer(double m) { solde += m; }

          boolean retirer(double m) {
              if (m > solde) return false;
              solde -= m;
              return true;
          }

          double getSolde() { return solde; }
      }

      public class Main {
          public static void main(String[] args) {
              Scanner sc = new Scanner(System.in).useLocale(Locale.US);
              CompteBancaire c = new CompteBancaire();
              while (sc.hasNext()) {
                  String op = sc.next();
                  if (op.equals("FIN")) break;
                  double m = sc.nextDouble();
                  if (op.equals("D")) c.deposer(m);
                  else if (!c.retirer(m)) System.out.println("REFUS");
              }
              System.out.println(String.format(Locale.US, "Solde : %.2f", c.getSolde()));
          }
      }
    `,
    correction: "Le solde est **private** : on ne peut le modifier qu'à travers deposer et retirer, qui garantissent qu'il ne devient jamais négatif. Locale.US garantit le point décimal.",
  }),
  java({
    slug: "java-moyenne-liste",
    lessonSlug: "collections",
    title: "Moyenne avec ArrayList",
    difficulty: "intermediaire",
    type: "ecrire_programme",
    statement: "Lisez des entiers jusqu'à la fin de l'entrée, stockez-les dans une **ArrayList<Integer>** et affichez **Nombre : n** puis **Moyenne : m** (2 décimales, point décimal).",
    examples: [{ input: "12 15 9", output: "Nombre : 3\nMoyenne : 12.00" }],
    hints: ["while (sc.hasNextInt()) liste.add(sc.nextInt());", "String.format(Locale.US, \"%.2f\", moyenne)"],
    tests: [
      { input: "12 15 9", expected: "Nombre : 3\nMoyenne : 12.00" },
      { input: "7", expected: "Nombre : 1\nMoyenne : 7.00" },
      { input: "10 11", expected: "Nombre : 2\nMoyenne : 10.50", hidden: true },
    ],
    solution: `
      import java.util.*;

      public class Main {
          public static void main(String[] args) {
              Scanner sc = new Scanner(System.in);
              List<Integer> notes = new ArrayList<>();
              while (sc.hasNextInt()) notes.add(sc.nextInt());
              double somme = 0;
              for (int n : notes) somme += n;
              System.out.println("Nombre : " + notes.size());
              System.out.println(String.format(Locale.US, "Moyenne : %.2f", somme / notes.size()));
          }
      }
    `,
    correction: "hasNextInt() permet de lire jusqu'à la fin de l'entrée. La somme est un double pour que la division soit réelle.",
  }),
];
