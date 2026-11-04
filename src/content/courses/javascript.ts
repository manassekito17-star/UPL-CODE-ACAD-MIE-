import { example, lesson, qcm, quiz, vraiFaux } from "../helpers";
import type { Course } from "../types";

const JS = "javascript" as const;

export const javascript: Course = {
  slug: "javascript",
  code: "Parcours D",
  language: "javascript",
  category: "web",
  title: "JavaScript",
  tagline: "Le langage qui fait vivre le web.",
  description:
    "JavaScript anime les pages web et fait aussi tourner des serveurs. Ce parcours va des variables et fonctions jusqu'au DOM, aux événements, à l'asynchronisme, aux promesses et aux API, avec des projets web pratiques.",
  level: "debutant",
  prerequisites: ["Parcours Algorithmique, modules 1 et 2."],
  objectives: [
    "Maîtriser la syntaxe moderne de JavaScript.",
    "Manipuler tableaux et objets.",
    "Interagir avec une page web via le DOM et les événements.",
    "Comprendre l'asynchronisme, les promesses et les API.",
  ],
  durationHours: 28,
  status: "publie",
  modules: [
    {
      slug: "langage",
      title: "Module 1 — Le langage",
      lessons: [
        lesson({
          slug: "introduction",
          title: "Introduction à JavaScript",
          durationMinutes: 20,
          objectives: ["Situer JavaScript dans l'écosystème web.", "Afficher avec console.log."],
          content: `
            ## Le langage du web

            Une page web repose sur trois technologies : **HTML** (structure), **CSS** (apparence) et **JavaScript** (comportement). JavaScript s'exécute dans tous les navigateurs, et aussi sur les serveurs grâce à **Node.js**.

            ## Afficher une valeur

            ~~~javascript
            console.log("Bonjour UPL !");
            console.log("2 + 3 =", 2 + 3);
            ~~~

            Sur la plateforme, console.log écrit dans la console de sortie de l'éditeur.

            ## Lire une entrée

            Dans les exercices, les données d'entrée sont accessibles ligne par ligne grâce à la fonction **lireLigne()** fournie par la plateforme (ou en lisant l'entrée standard avec Node.js).

            ## Syntaxe

            Les instructions se terminent par un point-virgule (recommandé) et les blocs sont délimités par des accolades.
          `,
          examples: [
            example(JS, "Premier programme", `
              console.log("Bonjour UPL !");
              const annee = new Date().getFullYear();
              console.log("Nous sommes en", annee);
            `),
          ],
          summary: ["HTML structure, CSS décore, JavaScript anime.", "console.log affiche dans la console.", "JavaScript fonctionne aussi côté serveur avec Node.js."],
          exerciseSlugs: ["js-bonjour"],
        }),
        lesson({
          slug: "variables-constantes",
          title: "Variables, constantes et types",
          durationMinutes: 25,
          objectives: ["Utiliser let et const.", "Connaître les types primitifs."],
          content: `
            ## let et const

            ~~~javascript
            let age = 20;          // peut changer
            const PI = 3.14159;    // ne peut pas être réaffectée
            ~~~

            Utilisez **const** par défaut, **let** si la valeur doit changer. Évitez l'ancien **var**.

            ## Types primitifs

            | Type | Exemple |
            |---|---|
            | number | 42, 3.14 (un seul type pour entiers et réels) |
            | string | "UPL", 'UPL' |
            | boolean | true, false |
            | undefined | variable sans valeur |
            | null | absence volontaire de valeur |

            **typeof x** donne le type.

            ## Conversions

            Number("42") → 42, String(10) → "10", parseInt("12px") → 12. Attention : "5" + 3 donne "53" (concaténation), alors que "5" * 3 donne 15.
          `,
          examples: [
            example(JS, "Types", `
              const nom = "Amani";
              let note = 14.5;
              console.log(typeof nom, typeof note, typeof true);
              console.log("5" + 3, "5" * 3, Number("5") + 3);
            `),
          ],
          summary: ["const par défaut, let si nécessaire.", "number regroupe entiers et réels.", "Attention aux conversions implicites avec +."],
        }),
        lesson({
          slug: "operateurs-conditions",
          title: "Opérateurs et conditions",
          durationMinutes: 25,
          objectives: ["Utiliser === et !==.", "Écrire if / else et switch."],
          content: `
            ## Comparer avec ===

            **===** compare valeur **et** type ; **==** convertit avant de comparer ("5" == 5 est vrai !). Utilisez toujours **===** et **!==**.

            ## Opérateurs

            Arithmétiques : + - * / % ** ; logiques : && (ET), || (OU), ! (NON). Division entière : **Math.floor(a / b)** ou **Math.trunc(a / b)**.

            ## Conditions

            ~~~javascript
            if (note >= 16) {
              console.log("Très bien");
            } else if (note >= 10) {
              console.log("Passable");
            } else {
              console.log("Ajourné");
            }
            const statut = note >= 10 ? "admis" : "ajourné";
            ~~~

            **switch** fonctionne comme en C (avec break).
          `,
          examples: [
            example(JS, "Comparaisons", `
              console.log("5" == 5, "5" === 5);
              const note = 13;
              console.log(note >= 10 ? "admis" : "ajourné");
              console.log(17 % 5, 2 ** 10, Math.floor(17 / 5));
            `),
          ],
          summary: ["Toujours === et !==.", "Math.floor pour la division entière.", "L'opérateur ternaire condition ? a : b."],
        }),
        lesson({
          slug: "boucles",
          title: "Boucles",
          durationMinutes: 20,
          objectives: ["Utiliser for, while, for…of."],
          content: `
            ## for, while, do … while

            ~~~javascript
            for (let i = 1; i <= 5; i++) console.log(i);
            let n = 0;
            while (n < 3) n++;
            ~~~

            ## for … of

            Parcourt les **valeurs** d'un tableau ou d'une chaîne :

            ~~~javascript
            for (const lettre of "UPL") console.log(lettre);
            ~~~

            ## for … in

            Parcourt les **clés** d'un objet (à éviter sur les tableaux).
          `,
          examples: [
            example(JS, "Table de multiplication", `
              const n = 7;
              for (let i = 1; i <= 10; i++) {
                console.log(n + " x " + i + " = " + n * i);
              }
            `),
          ],
          summary: ["for classique pour un compteur.", "for…of pour les valeurs.", "for…in pour les clés d'un objet."],
          exerciseSlugs: ["js-fizzbuzz"],
        }),
        lesson({
          slug: "fonctions",
          title: "Fonctions",
          durationMinutes: 30,
          objectives: ["Déclarer des fonctions classiques et fléchées.", "Utiliser des fonctions comme valeurs."],
          content: `
            ## Déclarations

            ~~~javascript
            function carre(x) {
              return x * x;
            }
            const cube = (x) => x * x * x;   // fonction fléchée
            ~~~

            ## Paramètres par défaut

            ~~~javascript
            function saluer(nom, message = "Bonjour") {
              return message + ", " + nom;
            }
            ~~~

            ## Fonctions d'ordre supérieur

            En JavaScript, une fonction est une **valeur** : on peut la passer en argument. C'est la base de map, filter et des gestionnaires d'événements.
          `,
          examples: [
            example(JS, "Fonctions", `
              function estPremier(n) {
                if (n < 2) return false;
                for (let d = 2; d * d <= n; d++) {
                  if (n % d === 0) return false;
                }
                return true;
              }
              const premiers = [];
              for (let k = 2; k < 40; k++) if (estPremier(k)) premiers.push(k);
              console.log(premiers.join(", "));
            `),
          ],
          summary: ["function ou fonction fléchée =>.", "Les fonctions sont des valeurs.", "Paramètres par défaut possibles."],
        }),
        lesson({
          slug: "tableaux-objets",
          title: "Tableaux et objets",
          durationMinutes: 35,
          objectives: ["Manipuler des tableaux avec map, filter, reduce.", "Créer et parcourir des objets."],
          content: `
            ## Tableaux

            ~~~javascript
            const notes = [12, 15, 9, 17];
            notes.push(11);
            console.log(notes.length, notes[0]);
            ~~~

            | Méthode | Rôle |
            |---|---|
            | map(f) | transforme chaque élément |
            | filter(f) | garde les éléments qui vérifient f |
            | reduce(f, init) | combine en une valeur |
            | find(f) | premier élément qui vérifie f |
            | sort((a, b) => a - b) | tri numérique |

            > sort() sans argument trie **comme des chaînes** : [10, 9, 1].sort() donne [1, 10, 9].

            ## Objets

            ~~~javascript
            const etudiant = { nom: "Amani", age: 20 };
            etudiant.moyenne = 14.2;
            for (const [cle, valeur] of Object.entries(etudiant)) console.log(cle, valeur);
            ~~~

            ## Déstructuration

            const { nom, age } = etudiant; et const [premier, ...reste] = notes;
          `,
          examples: [
            example(JS, "map, filter, reduce", `
              const promo = [
                { nom: "Amani", moyenne: 14.5 },
                { nom: "Grâce", moyenne: 17 },
                { nom: "Josué", moyenne: 8.5 },
              ];
              const admis = promo.filter((e) => e.moyenne >= 10).map((e) => e.nom);
              const moyenne = promo.reduce((s, e) => s + e.moyenne, 0) / promo.length;
              console.log("Admis :", admis.join(", "));
              console.log("Moyenne générale :", moyenne.toFixed(2));
            `),
          ],
          summary: ["map, filter, reduce évitent beaucoup de boucles.", "sort numérique : (a, b) => a - b.", "Les objets associent des clés à des valeurs."],
          exerciseSlugs: ["js-somme-tableau"],
        }),
      ],
    },
    {
      slug: "web",
      title: "Module 2 — JavaScript dans la page",
      lessons: [
        lesson({
          slug: "dom",
          title: "Le DOM",
          durationMinutes: 30,
          level: "intermediaire",
          objectives: ["Sélectionner et modifier des éléments HTML."],
          content: `
            ## Qu'est-ce que le DOM ?

            Le **DOM** (Document Object Model) est la représentation de la page HTML sous forme d'arbre d'objets que JavaScript peut lire et modifier.

            ## Sélectionner

            ~~~javascript
            const titre = document.querySelector("h1");
            const boutons = document.querySelectorAll(".btn");
            ~~~

            ## Modifier

            ~~~javascript
            titre.textContent = "Nouveau titre";
            titre.classList.add("important");
            titre.style.color = "navy";
            ~~~

            ## Créer des éléments

            ~~~javascript
            const li = document.createElement("li");
            li.textContent = "Python";
            document.querySelector("ul").append(li);
            ~~~

            Préférez **textContent** à innerHTML pour insérer du texte venant d'un utilisateur : innerHTML peut exécuter du code malveillant (faille XSS).

            > Les programmes de l'éditeur s'exécutent dans un environnement isolé sans page : testez le DOM dans un fichier HTML sur votre ordinateur.
          `,
          examples: [
            example(JS, "Exemple (à tester dans une page HTML)", `
              // Dans une page contenant <ul id="langages"></ul>
              const langages = ["Pseudocode", "Python", "C", "JavaScript", "Java"];
              if (typeof document !== "undefined") {
                const ul = document.querySelector("#langages");
                for (const l of langages) {
                  const li = document.createElement("li");
                  li.textContent = l;
                  ul.append(li);
                }
              } else {
                console.log("Pas de page ici : voici la liste qui serait affichée :");
                langages.forEach((l) => console.log("- " + l));
              }
            `),
          ],
          summary: ["Le DOM représente la page sous forme d'objets.", "querySelector sélectionne, textContent modifie.", "textContent est plus sûr qu'innerHTML."],
        }),
        lesson({
          slug: "evenements",
          title: "Événements",
          durationMinutes: 25,
          level: "intermediaire",
          objectives: ["Réagir aux actions de l'utilisateur avec addEventListener."],
          content: `
            ## addEventListener

            ~~~javascript
            const bouton = document.querySelector("#valider");
            bouton.addEventListener("click", () => {
              console.log("Bouton cliqué !");
            });
            ~~~

            ## Événements courants

            click, input, change, submit, keydown, load.

            ## L'objet événement

            ~~~javascript
            formulaire.addEventListener("submit", (event) => {
              event.preventDefault();   // empêche le rechargement de la page
              const nom = formulaire.elements.nom.value;
            });
            ~~~

            Toujours **valider** les données saisies avant de les utiliser.
          `,
          examples: [
            example(JS, "Simulation d'événements", `
              // Un mini système d'événements pour comprendre le principe
              const ecouteurs = {};
              function on(nom, f) {
                if (!ecouteurs[nom]) ecouteurs[nom] = [];
                ecouteurs[nom].push(f);
              }
              function emettre(nom, donnee) { (ecouteurs[nom] || []).forEach((f) => f(donnee)); }

              on("click", (d) => console.log("Clic sur", d));
              on("click", () => console.log("Deuxième écouteur"));
              emettre("click", "le bouton Valider");
            `),
          ],
          summary: ["addEventListener(type, fonction).", "event.preventDefault() bloque le comportement par défaut.", "Valider toujours les saisies."],
        }),
        lesson({
          slug: "asynchronisme-promesses",
          title: "Asynchronisme et promesses",
          durationMinutes: 35,
          level: "avance",
          objectives: ["Comprendre l'exécution asynchrone.", "Utiliser les promesses et async/await."],
          content: `
            ## Pourquoi l'asynchronisme ?

            Certaines opérations prennent du temps (télécharger des données, attendre un délai). JavaScript ne bloque pas : il continue l'exécution et traite le résultat **plus tard**.

            ~~~javascript
            console.log("A");
            setTimeout(() => console.log("B"), 0);
            console.log("C");   // affiche A, C, puis B
            ~~~

            ## Les promesses

            Une **promesse** représente un résultat futur : elle est **tenue** (resolve) ou **rompue** (reject).

            ~~~javascript
            const attendre = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
            attendre(500).then(() => console.log("Fini"));
            ~~~

            ## async / await

            ~~~javascript
            async function principal() {
              try {
                await attendre(500);
                console.log("Après 500 ms");
              } catch (e) {
                console.log("Erreur :", e.message);
              }
            }
            ~~~

            **await** suspend la fonction jusqu'au résultat, sans bloquer le reste du programme.
          `,
          examples: [
            example(JS, "Promesses et async/await", `
              const attendre = (ms, valeur) => new Promise((resolve) => setTimeout(() => resolve(valeur), ms));

              async function principal() {
                console.log("Début");
                const a = await attendre(200, "données A");
                console.log("Reçu :", a);
                const [b, c] = await Promise.all([attendre(100, "B"), attendre(150, "C")]);
                console.log("En parallèle :", b, c);
                console.log("Fin");
              }
              principal();
            `),
          ],
          summary: ["Le code asynchrone s'exécute plus tard.", "Une promesse est tenue ou rompue.", "async/await rend le code asynchrone lisible."],
          quiz: quiz("js-async-quiz", "Asynchronisme", [
            qcm("Dans quel ordre s'affichent A, B, C ? console.log('A'); setTimeout(() => console.log('B'), 0); console.log('C');", ["A B C", "A C B", "B A C", "C A B"], 1),
          ]),
        }),
        lesson({
          slug: "api",
          title: "Consommer une API",
          durationMinutes: 30,
          level: "avance",
          objectives: ["Appeler une API web avec fetch.", "Traiter une réponse JSON."],
          content: `
            ## fetch

            ~~~javascript
            async function chargerUtilisateurs() {
              const reponse = await fetch("https://exemple.org/api/utilisateurs");
              if (!reponse.ok) throw new Error("Erreur HTTP " + reponse.status);
              const donnees = await reponse.json();
              return donnees;
            }
            ~~~

            ## JSON

            **JSON** est le format d'échange de données du web. **JSON.parse(texte)** le transforme en objet, **JSON.stringify(objet)** en texte.

            ## Bonnes pratiques

            - Vérifier **reponse.ok** avant de lire les données.
            - Gérer les erreurs réseau avec try/catch.
            - Ne jamais placer une **clé secrète** d'API dans le code du navigateur : elle serait visible de tous.

            > Pour des raisons de sécurité, les programmes de l'éditeur n'ont pas accès au réseau.
          `,
          examples: [
            example(JS, "JSON", `
              const texte = '{"cours": "JavaScript", "lecons": 10, "langages": ["fr", "en"]}';
              const objet = JSON.parse(texte);
              console.log(objet.cours, "-", objet.lecons, "leçons");
              objet.niveau = "débutant";
              console.log(JSON.stringify(objet));
            `),
          ],
          summary: ["fetch renvoie une promesse.", "JSON.parse / JSON.stringify.", "Aucune clé secrète dans le navigateur."],
        }),
        lesson({
          slug: "projets-web",
          title: "Projets web pratiques",
          durationMinutes: 60,
          level: "avance",
          objectives: ["Réaliser un petit projet complet : gestionnaire de tâches."],
          content: `
            ## Projet : liste de tâches

            Objectif : une page où l'on ajoute, coche et supprime des tâches, avec sauvegarde dans le navigateur.

            ### Étapes

            1. **HTML** : un champ texte, un bouton, une liste ul.
            2. **Modèle** : un tableau d'objets { id, texte, faite }.
            3. **Affichage** : une fonction afficher() qui reconstruit la liste à partir du modèle.
            4. **Événements** : ajout (submit), basculer (click sur une case), suppression.
            5. **Persistance** : localStorage.setItem("taches", JSON.stringify(taches)).

            ### Séparer la logique de l'affichage

            La logique (ajouter, basculer, supprimer) se teste sans page : c'est ce que fait l'exemple ci-dessous. L'affichage n'est qu'une traduction du modèle en HTML.

            ## Autres idées de projets

            - Calculatrice de moyenne pondérée.
            - Quiz interactif avec score.
            - Convertisseur de devises (avec une API).
          `,
          examples: [
            example(JS, "Logique du gestionnaire de tâches", `
              let taches = [];
              let prochainId = 1;

              function ajouter(texte) {
                if (!texte.trim()) throw new Error("Tâche vide");
                taches.push({ id: prochainId++, texte: texte.trim(), faite: false });
              }
              function basculer(id) {
                taches = taches.map((t) => (t.id === id ? { ...t, faite: !t.faite } : t));
              }
              function supprimer(id) {
                taches = taches.filter((t) => t.id !== id);
              }
              function afficher() {
                taches.forEach((t) => console.log((t.faite ? "[x] " : "[ ] ") + t.texte));
                console.log("---");
              }

              ajouter("Réviser les boucles");
              ajouter("Faire l'exercice FizzBuzz");
              ajouter("Lire la leçon sur les promesses");
              basculer(2);
              afficher();
              supprimer(1);
              afficher();
            `),
          ],
          summary: ["Séparer modèle, logique et affichage.", "localStorage conserve les données dans le navigateur.", "Tester la logique indépendamment de la page."],
        }),
      ],
    },
  ],
  finalQuiz: quiz("javascript-evaluation-finale", "Évaluation finale — JavaScript", [
    qcm("Que vaut \"3\" + 4 en JavaScript ?", ["7", "\"34\"", "Erreur", "NaN"], 1),
    qcm("Quel mot-clé déclare une variable non réaffectable ?", ["var", "let", "const", "static"], 2),
    vraiFaux("=== compare la valeur et le type.", true),
    qcm("Quelle méthode garde les éléments vérifiant une condition ?", ["map", "filter", "reduce", "forEach"], 1),
  ], 70),
};
