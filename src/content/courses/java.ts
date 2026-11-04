import { example, lesson, qcm, quiz, vraiFaux } from "../helpers";
import type { Course } from "../types";

const J = "java" as const;

export const java: Course = {
  slug: "java",
  code: "Parcours E",
  language: "java",
  category: "programmation",
  title: "Java",
  tagline: "La programmation orientée objet, rigoureuse et portable.",
  description:
    "Java est utilisé dans les applications d'entreprise, Android et les systèmes distribués. Ce parcours présente la syntaxe, les méthodes, puis approfondit la programmation orientée objet : classes, constructeurs, encapsulation, héritage, polymorphisme, interfaces, collections, exceptions, fichiers et structures de données.",
  level: "intermediaire",
  prerequisites: ["Parcours Algorithmique, modules 1 à 4.", "Notions d'objets (parcours Python, leçon POO) recommandées."],
  objectives: [
    "Écrire des programmes Java structurés.",
    "Concevoir des classes selon les principes de la POO.",
    "Utiliser les collections et gérer les exceptions.",
    "Implémenter des structures de données.",
  ],
  durationHours: 32,
  status: "publie",
  modules: [
    {
      slug: "bases",
      title: "Module 1 — Les bases",
      lessons: [
        lesson({
          slug: "presentation",
          title: "Présentation de Java",
          durationMinutes: 20,
          objectives: ["Comprendre la compilation en bytecode.", "Écrire la classe Main."],
          content: `
            ## Compiler une fois, exécuter partout

            Le code Java est compilé en **bytecode**, exécuté par la **machine virtuelle Java (JVM)**. Le même programme fonctionne sur Windows, Linux, macOS ou Android.

            ## Premier programme

            ~~~java
            public class Main {
                public static void main(String[] args) {
                    System.out.println("Bonjour UPL !");
                }
            }
            ~~~

            - Tout code Java est placé dans une **classe**.
            - L'exécution commence par la méthode **main**.
            - Sur la plateforme, la classe principale doit s'appeler **Main**.

            ## Lire au clavier

            ~~~java
            import java.util.Scanner;
            Scanner sc = new Scanner(System.in);
            int n = sc.nextInt();
            String ligne = sc.nextLine();
            ~~~
          `,
          examples: [
            example(J, "Bonjour", `
              public class Main {
                  public static void main(String[] args) {
                      System.out.println("Bonjour UPL !");
                      System.out.println("Java a été créé en " + 1995);
                  }
              }
            `),
          ],
          summary: ["Java est compilé en bytecode exécuté par la JVM.", "Tout est dans une classe ; main est le point d'entrée.", "Scanner lit les entrées."],
          exerciseSlugs: ["java-bonjour"],
        }),
        lesson({
          slug: "variables-types",
          title: "Variables et types",
          durationMinutes: 25,
          objectives: ["Déclarer des variables typées.", "Distinguer types primitifs et String."],
          content: `
            ## Types primitifs

            | Type | Contenu |
            |---|---|
            | int, long | entiers |
            | double | réels |
            | boolean | true / false |
            | char | un caractère |

            ~~~java
            int age = 20;
            double moyenne = 13.5;
            final double PI = 3.14159;   // constante
            String nom = "Amani";        // objet, pas un primitif
            ~~~

            ## Division

            7 / 2 vaut 3 (division entière) ; 7 / 2.0 vaut 3.5. Le reste s'obtient avec %.

            ## Comparer des chaînes

            Utilisez **a.equals(b)** et non ==, qui compare les références.

            ## var

            Depuis Java 10, **var** laisse le compilateur déduire le type : var total = 0;
          `,
          examples: [
            example(J, "Types", `
              public class Main {
                  public static void main(String[] args) {
                      int a = 7, b = 2;
                      System.out.println(a / b + " " + (double) a / b + " " + a % b);
                      String s1 = "UPL";
                      String s2 = new String("UPL");
                      System.out.println(s1 == s2);
                      System.out.println(s1.equals(s2));
                  }
              }
            `),
          ],
          summary: ["Types primitifs : int, double, boolean, char.", "final déclare une constante.", "equals compare le contenu des chaînes."],
          exerciseSlugs: ["java-somme"],
        }),
        lesson({
          slug: "conditions-boucles",
          title: "Conditions et boucles",
          durationMinutes: 30,
          objectives: ["Utiliser if, switch, for, while et for-each."],
          content: `
            ## Conditions

            ~~~java
            if (note >= 10) {
                System.out.println("Admis");
            } else {
                System.out.println("Ajourné");
            }
            ~~~

            Le **switch** moderne (Java 14 et plus) :

            ~~~java
            String type = switch (jour) {
                case 6, 7 -> "Week-end";
                default -> "Semaine";
            };
            ~~~

            ## Boucles

            ~~~java
            for (int i = 1; i <= 10; i++) { ... }
            while (condition) { ... }
            do { ... } while (condition);
            for (int note : notes) { ... }   // for-each
            ~~~
          `,
          examples: [
            example(J, "Table de multiplication", `
              import java.util.Scanner;

              public class Main {
                  public static void main(String[] args) {
                      Scanner sc = new Scanner(System.in);
                      int n = sc.nextInt();
                      for (int i = 1; i <= 10; i++) {
                          System.out.println(n + " x " + i + " = " + (n * i));
                      }
                  }
              }
            `, { stdin: "6" }),
          ],
          summary: ["if / else, switch avec ->.", "for, while, do…while, for-each.", "Attention aux parenthèses dans les concaténations."],
          exerciseSlugs: ["java-pair-impair"],
        }),
        lesson({
          slug: "methodes",
          title: "Méthodes",
          durationMinutes: 25,
          objectives: ["Écrire des méthodes statiques.", "Utiliser la surcharge."],
          content: `
            ## Méthodes statiques

            ~~~java
            static int carre(int x) {
                return x * x;
            }
            ~~~

            **static** signifie que la méthode appartient à la classe et non à un objet.

            ## Surcharge

            Plusieurs méthodes peuvent porter le même nom si leurs paramètres diffèrent :

            ~~~java
            static double aire(double r) { return Math.PI * r * r; }
            static double aire(double l, double h) { return l * h; }
            ~~~

            ## Passage des paramètres

            Java passe toujours **une copie** : copie de la valeur pour les primitifs, copie de la **référence** pour les objets (l'objet lui-même peut donc être modifié).
          `,
          examples: [
            example(J, "Méthodes", `
              public class Main {
                  static boolean estPremier(int n) {
                      if (n < 2) return false;
                      for (int d = 2; d * d <= n; d++) {
                          if (n % d == 0) return false;
                      }
                      return true;
                  }

                  public static void main(String[] args) {
                      StringBuilder sb = new StringBuilder();
                      for (int k = 2; k < 40; k++) {
                          if (estPremier(k)) sb.append(k).append(" ");
                      }
                      System.out.println(sb.toString().trim());
                  }
              }
            `),
          ],
          summary: ["static : méthode de classe.", "La surcharge varie les paramètres.", "Les arguments sont des copies (valeurs ou références)."],
        }),
      ],
    },
    {
      slug: "objets",
      title: "Module 2 — Programmation orientée objet",
      lessons: [
        lesson({
          slug: "classes-objets",
          title: "Classes, objets et constructeurs",
          durationMinutes: 35,
          level: "intermediaire",
          objectives: ["Définir une classe avec attributs, constructeur et méthodes.", "Créer des objets avec new."],
          content: `
            ## Une classe

            ~~~java
            class Etudiant {
                String nom;
                double moyenne;

                Etudiant(String nom, double moyenne) {   // constructeur
                    this.nom = nom;
                    this.moyenne = moyenne;
                }

                boolean estAdmis() {
                    return moyenne >= 10;
                }
            }

            Etudiant e = new Etudiant("Amani", 14.5);
            ~~~

            - Le **constructeur** porte le nom de la classe et n'a pas de type de retour.
            - **this** désigne l'objet courant.
            - **new** crée un objet.

            ## toString

            Redéfinir **toString()** permet d'afficher un objet lisiblement avec System.out.println.
          `,
          examples: [
            example(J, "Classe Etudiant", `
              class Etudiant {
                  String nom;
                  double moyenne;

                  Etudiant(String nom, double moyenne) {
                      this.nom = nom;
                      this.moyenne = moyenne;
                  }

                  boolean estAdmis() {
                      return moyenne >= 10;
                  }

                  @Override
                  public String toString() {
                      return nom + " (" + moyenne + ")" + (estAdmis() ? " admis" : " ajourné");
                  }
              }

              public class Main {
                  public static void main(String[] args) {
                      Etudiant[] promo = { new Etudiant("Amani", 14.5), new Etudiant("Josué", 8.75) };
                      for (Etudiant e : promo) System.out.println(e);
                  }
              }
            `),
          ],
          summary: ["Une classe regroupe attributs et méthodes.", "Le constructeur initialise l'objet.", "toString définit l'affichage."],
          exerciseSlugs: ["java-classe-compte"],
        }),
        lesson({
          slug: "encapsulation",
          title: "Encapsulation",
          durationMinutes: 25,
          level: "intermediaire",
          objectives: ["Protéger les attributs avec private.", "Écrire des accesseurs qui valident les données."],
          content: `
            ## Cacher l'état interne

            ~~~java
            class Compte {
                private double solde;

                public double getSolde() { return solde; }

                public void deposer(double montant) {
                    if (montant <= 0) throw new IllegalArgumentException("Montant invalide");
                    solde += montant;
                }
            }
            ~~~

            Les attributs **private** ne sont accessibles que depuis la classe. L'extérieur passe par des **méthodes publiques** qui garantissent la cohérence des données (pas de solde négatif, par exemple).

            ## Modificateurs d'accès

            | Mot-clé | Accès |
            |---|---|
            | private | la classe seulement |
            | (aucun) | le paquetage |
            | protected | paquetage et sous-classes |
            | public | tout le monde |
          `,
          examples: [
            example(J, "Compte encapsulé", `
              class Compte {
                  private final String titulaire;
                  private double solde;

                  Compte(String titulaire) { this.titulaire = titulaire; }

                  public double getSolde() { return solde; }

                  public void deposer(double m) {
                      if (m <= 0) throw new IllegalArgumentException("Montant invalide");
                      solde += m;
                  }

                  public void retirer(double m) {
                      if (m > solde) throw new IllegalStateException("Solde insuffisant");
                      solde -= m;
                  }
              }

              public class Main {
                  public static void main(String[] args) {
                      Compte c = new Compte("Amani");
                      c.deposer(5000);
                      c.retirer(1200);
                      System.out.println("Solde : " + c.getSolde());
                      try {
                          c.retirer(99999);
                      } catch (IllegalStateException e) {
                          System.out.println("Refusé : " + e.getMessage());
                      }
                  }
              }
            `),
          ],
          summary: ["private protège les attributs.", "Les méthodes publiques valident les modifications.", "final empêche la réaffectation."],
        }),
        lesson({
          slug: "heritage-polymorphisme",
          title: "Héritage et polymorphisme",
          durationMinutes: 40,
          level: "avance",
          objectives: ["Créer une sous-classe avec extends.", "Redéfinir une méthode.", "Exploiter le polymorphisme."],
          content: `
            ## Héritage

            ~~~java
            class Forme {
                double aire() { return 0; }
            }
            class Cercle extends Forme {
                private final double r;
                Cercle(double r) { this.r = r; }
                @Override
                double aire() { return Math.PI * r * r; }
            }
            ~~~

            La sous-classe hérite des attributs et méthodes de la classe mère ; **super(...)** appelle le constructeur parent.

            ## Polymorphisme

            Une variable de type **Forme** peut désigner un Cercle ou un Rectangle : la méthode appelée est celle de **l'objet réel**.

            ~~~java
            Forme[] formes = { new Cercle(1), new Rectangle(2, 3) };
            for (Forme f : formes) System.out.println(f.aire());
            ~~~

            ## Classes abstraites

            Une classe **abstract** ne peut pas être instanciée et peut déclarer des méthodes sans corps, que les sous-classes doivent définir.
          `,
          examples: [
            example(J, "Formes", `
              abstract class Forme {
                  abstract double aire();
                  String nom() { return getClass().getSimpleName(); }
              }

              class Cercle extends Forme {
                  private final double r;
                  Cercle(double r) { this.r = r; }
                  double aire() { return Math.PI * r * r; }
              }

              class Rectangle extends Forme {
                  private final double l, h;
                  Rectangle(double l, double h) { this.l = l; this.h = h; }
                  double aire() { return l * h; }
              }

              public class Main {
                  public static void main(String[] args) {
                      Forme[] formes = { new Cercle(1), new Rectangle(2, 3), new Cercle(2.5) };
                      for (Forme f : formes) {
                          System.out.printf("%s : %.2f%n", f.nom(), f.aire());
                      }
                  }
              }
            `),
          ],
          summary: ["extends crée une sous-classe.", "@Override redéfinit une méthode.", "Le polymorphisme appelle la méthode de l'objet réel."],
          quiz: quiz("java-heritage-quiz", "Héritage", [
            vraiFaux("On peut créer un objet d'une classe abstraite avec new.", false),
          ]),
        }),
        lesson({
          slug: "interfaces",
          title: "Interfaces",
          durationMinutes: 25,
          level: "avance",
          objectives: ["Définir et implémenter une interface."],
          content: `
            ## Un contrat

            Une **interface** décrit ce qu'une classe sait faire, sans dire comment :

            ~~~java
            interface Evaluable {
                double note();
                default boolean reussi() { return note() >= 10; }
            }

            class Examen implements Evaluable {
                public double note() { return 14; }
            }
            ~~~

            Une classe n'hérite que d'une seule classe, mais peut **implémenter plusieurs interfaces**.

            ## Interfaces utiles

            **Comparable<T>** (ordre naturel), **Comparator<T>** (ordre personnalisé), **Runnable**.
          `,
          examples: [
            example(J, "Comparable", `
              import java.util.Arrays;

              class Etudiant implements Comparable<Etudiant> {
                  final String nom;
                  final double moyenne;
                  Etudiant(String nom, double moyenne) { this.nom = nom; this.moyenne = moyenne; }
                  public int compareTo(Etudiant autre) { return Double.compare(autre.moyenne, moyenne); }
                  public String toString() { return nom + " " + moyenne; }
              }

              public class Main {
                  public static void main(String[] args) {
                      Etudiant[] promo = { new Etudiant("Amani", 14.5), new Etudiant("Grâce", 17), new Etudiant("Josué", 11) };
                      Arrays.sort(promo);
                      System.out.println(Arrays.toString(promo));
                  }
              }
            `),
          ],
          summary: ["Une interface est un contrat.", "implements, éventuellement plusieurs.", "Comparable définit l'ordre naturel."],
        }),
      ],
    },
    {
      slug: "outils",
      title: "Module 3 — Collections, exceptions et données",
      lessons: [
        lesson({
          slug: "collections",
          title: "Collections",
          durationMinutes: 35,
          level: "intermediaire",
          objectives: ["Utiliser ArrayList, HashMap et HashSet."],
          content: `
            ## ArrayList

            ~~~java
            List<Integer> notes = new ArrayList<>();
            notes.add(12);
            notes.get(0);
            notes.size();
            ~~~

            ## HashMap

            ~~~java
            Map<String, Integer> compte = new HashMap<>();
            compte.put("python", 3);
            compte.merge("python", 1, Integer::sum);
            compte.getOrDefault("java", 0);
            ~~~

            ## HashSet

            Ensemble sans doublons, recherche rapide avec **contains**.

            ## Génériques

            Le type entre chevrons (**<Integer>**) indique ce que contient la collection. Les collections contiennent des objets : on écrit Integer et non int.
          `,
          examples: [
            example(J, "Compter des mots", `
              import java.util.*;

              public class Main {
                  public static void main(String[] args) {
                      String texte = "le code le plus simple est le meilleur code";
                      Map<String, Integer> compte = new TreeMap<>();
                      for (String mot : texte.split(" ")) {
                          compte.merge(mot, 1, Integer::sum);
                      }
                      for (Map.Entry<String, Integer> e : compte.entrySet()) {
                          System.out.println(e.getKey() + " " + e.getValue());
                      }
                      System.out.println("Distincts : " + new HashSet<>(Arrays.asList(texte.split(" "))).size());
                  }
              }
            `),
          ],
          summary: ["ArrayList : liste dynamique.", "HashMap / TreeMap : clé → valeur.", "HashSet : unicité."],
          exerciseSlugs: ["java-moyenne-liste"],
        }),
        lesson({
          slug: "exceptions",
          title: "Exceptions",
          durationMinutes: 25,
          level: "intermediaire",
          objectives: ["Intercepter et lever des exceptions."],
          content: `
            ## try / catch / finally

            ~~~java
            try {
                int n = Integer.parseInt(texte);
            } catch (NumberFormatException e) {
                System.out.println("Nombre invalide");
            } finally {
                System.out.println("Toujours exécuté");
            }
            ~~~

            ## Exceptions vérifiées

            Certaines exceptions (comme **IOException**) doivent être soit interceptées, soit déclarées avec **throws** dans la signature de la méthode : le compilateur l'exige.

            ## Lever une exception

            **throw new IllegalArgumentException("message");**
          `,
          examples: [
            example(J, "Conversion sécurisée", `
              public class Main {
                  public static void main(String[] args) {
                      String[] valeurs = { "12", "abc", "0" };
                      for (String v : valeurs) {
                          try {
                              int n = Integer.parseInt(v);
                              System.out.println("100 / " + n + " = " + (100 / n));
                          } catch (NumberFormatException e) {
                              System.out.println("'" + v + "' n'est pas un entier");
                          } catch (ArithmeticException e) {
                              System.out.println("Division par zéro");
                          }
                      }
                  }
              }
            `),
          ],
          summary: ["try / catch / finally.", "Les exceptions vérifiées doivent être traitées ou déclarées.", "throw lève une exception."],
        }),
        lesson({
          slug: "fichiers",
          title: "Fichiers",
          durationMinutes: 25,
          level: "intermediaire",
          objectives: ["Lire et écrire des fichiers avec java.nio.file."],
          content: `
            ## Écrire et lire

            ~~~java
            Path chemin = Path.of("notes.txt");
            Files.writeString(chemin, "Amani;15\\nGrace;17\\n");
            List<String> lignes = Files.readAllLines(chemin);
            ~~~

            ## try-with-resources

            ~~~java
            try (BufferedReader r = Files.newBufferedReader(chemin)) {
                String ligne;
                while ((ligne = r.readLine()) != null) { ... }
            }
            ~~~

            La ressource est fermée automatiquement, même en cas d'erreur.
          `,
          examples: [
            example(J, "Fichier de notes", `
              import java.io.IOException;
              import java.nio.file.*;
              import java.util.List;

              public class Main {
                  public static void main(String[] args) throws IOException {
                      Path p = Paths.get("notes.txt");
                      Files.write(p, List.of("Amani;15", "Grace;17", "Josue;9"));
                      for (String ligne : Files.readAllLines(p)) {
                          String[] parties = ligne.split(";");
                          int note = Integer.parseInt(parties[1]);
                          System.out.println(parties[0] + " : " + (note >= 10 ? "admis" : "ajourné"));
                      }
                  }
              }
            `),
          ],
          summary: ["Files et Path simplifient les fichiers.", "try-with-resources ferme automatiquement.", "IOException est vérifiée."],
        }),
        lesson({
          slug: "structures-donnees",
          title: "Structures de données",
          durationMinutes: 40,
          level: "avance",
          objectives: ["Implémenter une pile générique.", "Utiliser Deque et PriorityQueue."],
          content: `
            ## Une pile générique

            On peut écrire ses propres structures avec les génériques : **class Pile<T>**.

            ## Les structures de la bibliothèque

            | Besoin | Classe |
            |---|---|
            | Pile / file | ArrayDeque |
            | File de priorité | PriorityQueue |
            | Liste chaînée | LinkedList |
            | Arbre ordonné | TreeMap, TreeSet |

            ## Complexités

            ArrayDeque : ajout/retrait aux extrémités en O(1). PriorityQueue : ajout et retrait du minimum en O(log n). TreeMap : opérations en O(log n).
          `,
          examples: [
            example(J, "Pile générique", `
              import java.util.ArrayList;
              import java.util.PriorityQueue;

              class Pile<T> {
                  private final ArrayList<T> elements = new ArrayList<>();
                  void empiler(T x) { elements.add(x); }
                  T depiler() {
                      if (elements.isEmpty()) throw new IllegalStateException("Pile vide");
                      return elements.remove(elements.size() - 1);
                  }
                  boolean estVide() { return elements.isEmpty(); }
              }

              public class Main {
                  public static void main(String[] args) {
                      Pile<String> pile = new Pile<>();
                      for (String s : new String[] { "a", "b", "c" }) pile.empiler(s);
                      StringBuilder sb = new StringBuilder();
                      while (!pile.estVide()) sb.append(pile.depiler());
                      System.out.println("Dépilé : " + sb);

                      PriorityQueue<Integer> pq = new PriorityQueue<>();
                      for (int x : new int[] { 42, 7, 19, 3 }) pq.add(x);
                      System.out.print("Par priorité :");
                      while (!pq.isEmpty()) System.out.print(" " + pq.poll());
                      System.out.println();
                  }
              }
            `),
          ],
          summary: ["Les génériques rendent les structures réutilisables.", "ArrayDeque, PriorityQueue, TreeMap couvrent la plupart des besoins.", "Connaître les complexités guide le choix."],
        }),
      ],
    },
  ],
  finalQuiz: quiz("java-evaluation-finale", "Évaluation finale — Java", [
    qcm("Comment compare-t-on le contenu de deux String ?", ["==", "equals", "compare", "="], 1),
    qcm("Quel mot-clé crée une sous-classe ?", ["implements", "extends", "inherits", "super"], 1),
    vraiFaux("Une classe Java peut implémenter plusieurs interfaces.", true),
    qcm("Quelle collection garantit l'unicité ?", ["ArrayList", "HashSet", "LinkedList", "ArrayDeque"], 1),
  ], 70),
};
