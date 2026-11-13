import { example, lesson, qcm, quiz, vraiFaux } from "../helpers";
import type { Course } from "../types";

const K = "kplus" as const;

/**
 * Parcours K+ : le langage de programmation en français
 * (https://github.com/manassekito17-star/K-). Les exemples et les solutions
 * sont exécutés par le vrai moteur K+ dans les tests de contenu.
 */
export const kplus: Course = {
  slug: "kplus",
  code: "Parcours F",
  language: "kplus",
  category: "programmation",
  title: "K+ — programmer en français",
  tagline: "Programmer en français, jusqu'aux sites web dynamiques.",
  description:
    "K+ est un langage de programmation dont les mots-clés sont en français (si … alors … fin, afficher, demander). Ce parcours commence par les bases de la programmation, puis apprend à créer de vrais sites web dynamiques : boutons, champs de saisie, listes qui se remplissent, minuteries, et publication du site.",
  level: "debutant",
  prerequisites: ["Aucun : le parcours commence au tout début."],
  objectives: [
    "Écrire des programmes K+ : variables, calculs, conditions, boucles et fonctions.",
    "Comprendre et corriger les messages d'erreur.",
    "Créer des pages web qui réagissent aux actions du visiteur.",
    "Publier un site créé avec K+.",
  ],
  durationHours: 16,
  status: "publie",
  modules: [
    {
      slug: "bases",
      title: "Les bases du langage K+",
      lessons: [
        lesson({
          slug: "kplus-introduction",
          title: "Découvrir K+",
          durationMinutes: 20,
          objectives: ["Savoir ce qu'est K+ et à quoi il sert.", "Écrire et exécuter un premier programme avec afficher.", "Écrire des commentaires."],
          content: `
            ## Un langage de programmation en français

            **K+** est un langage de programmation dont les mots-clés sont en français. Un programme K+ se lit presque comme une phrase :

            ~~~kplus
            si age >= 18 alors
                afficher("Tu es majeur")
            fin
            ~~~

            Les fichiers K+ portent l'extension **.kplus**. Sur la plateforme, le vrai moteur K+ tourne dans votre navigateur : vos programmes s'exécutent même sans Internet une fois l'éditeur préparé.

            ## Afficher

            **afficher(…)** écrit une ou plusieurs valeurs, séparées par une espace, puis passe à la ligne :

            ~~~kplus
            afficher("Bienvenue dans K+")
            afficher("2 + 3 =", 2 + 3)
            ~~~

            ## Commentaires

            Un commentaire est ignoré par le moteur : il sert à expliquer le programme aux humains.

            - **#** commente jusqu'à la fin de la ligne ;
            - **/* … */** commente plusieurs lignes.

            ## Une instruction par ligne

            En K+, chaque instruction occupe sa propre ligne : il n'y a pas de point-virgule. Les blocs (si, boucles, fonctions) se terminent par le mot-clé **fin**.
          `,
          examples: [
            example(K, "Premier programme", `
              # Mon premier programme K+
              afficher("Bienvenue dans K+")
              afficher("2 + 3 =", 2 + 3)
              afficher()          # ligne vide
              afficher("À bientôt !")
            `, { explanation: "afficher() sans argument écrit une ligne vide." }),
          ],
          summary: ["afficher(…) écrit des valeurs puis passe à la ligne.", "# et /* … */ écrivent des commentaires.", "Une instruction par ligne ; les blocs se terminent par fin."],
          quiz: quiz("kplus-introduction-quiz", "Découvrir K+", [
            qcm("Quelle est l'extension des fichiers K+ ?", [".kp", ".kplus", ".k", ".txt"], 1),
            qcm("Qu'affiche afficher(\"A\", 1 + 1) ?", ["A 2", "A1+1", "A2", "\"A\" 2"], 0),
            vraiFaux("En K+, chaque instruction se termine par un point-virgule.", false, "Une instruction par ligne, sans point-virgule."),
          ]),
          exerciseSlugs: ["kplus-bonjour"],
        }),
        lesson({
          slug: "kplus-variables",
          title: "Variables, constantes et types",
          durationMinutes: 30,
          objectives: ["Déclarer une variable et une constante.", "Connaître les types de K+.", "Lire une saisie avec demander et la convertir."],
          content: `
            ## Déclarer une variable

            Une variable est une boîte qui porte un nom et contient une valeur. On la **déclare** avec le mot-clé **variable**, puis on peut changer sa valeur :

            ~~~kplus
            variable age = 20
            age = age + 1
            ~~~

            Utiliser une variable non déclarée provoque une **Erreur de nom** : K+ refuse de deviner.

            ## Constantes

            Une **constante** ne change jamais : \`constante PI = 3.14159\`. La modifier provoque une **Erreur de constante**.

            ## Les types

            | Type | Exemples |
            |---|---|
            | entier | 0, 42, -7, 1_000_000 |
            | décimal | 3.14, 2.0 (avec un point, pas une virgule) |
            | texte | "Bonjour" |
            | booléen | vrai, faux |
            | nul | nul (absence de valeur) |
            | liste | [1, 2, 3] |

            **type(x)** donne le type d'une valeur.

            ## Lire une saisie

            **demander("question")** lit une ligne tapée par l'utilisateur et la renvoie **sous forme de texte**. Pour calculer, on la convertit avec **entier(…)** ou **decimal(…)** :

            ~~~kplus
            variable age = entier(demander("Votre âge ? "))
            ~~~

            Sur la plateforme, les réponses se tapent dans la zone **Entrées**, une par ligne.
          `,
          examples: [
            example(K, "Variables et types", `
              variable nom = "Awa"
              variable age = 20
              constante PI = 3.14159
              afficher(nom, "a", age, "ans")
              afficher(type(nom), type(age), type(PI), type(vrai))
            `),
            example(K, "Lire et convertir une saisie", `
              variable nom = demander("Votre nom ? ")
              variable age = entier(demander("Votre âge ? "))
              afficher("Bonjour", nom, "- l'an prochain vous aurez", age + 1, "ans.")
            `, { stdin: "Awa\n20\n", explanation: "demander renvoie un texte : entier(…) le convertit pour pouvoir calculer." }),
          ],
          summary: ["variable crée une variable ; constante une valeur fixe.", "Types : entier, décimal, texte, booléen, nul, liste.", "demander renvoie toujours un texte : convertir avec entier ou decimal."],
          quiz: quiz("kplus-variables-quiz", "Variables et types", [
            qcm("Que renvoie demander(…) ?", ["un entier", "un texte", "un décimal", "ça dépend de la saisie"], 1),
            qcm("Comment écrit-on trois et demi en K+ ?", ["3,5", "3.5", "3½", "\"3.5\""], 1),
            vraiFaux("On peut changer la valeur d'une constante.", false),
          ]),
          exerciseSlugs: ["kplus-presentation"],
        }),
        lesson({
          slug: "kplus-calculs",
          title: "Calculs et textes",
          durationMinutes: 30,
          objectives: ["Utiliser les opérateurs et leurs priorités.", "Distinguer division, modulo et puissance.", "Assembler des textes."],
          content: `
            ## Les opérateurs

            | Opérateur | Rôle | Exemple |
            |---|---|---|
            | + - * | addition, soustraction, multiplication | 2 + 3 * 4 vaut 14 |
            | / | division (résultat décimal) | 7 / 2 vaut 3.5 ; 10 / 2 vaut 5.0 |
            | % | reste de la division | 17 % 5 vaut 2 |
            | ^ | puissance | 2 ^ 10 vaut 1024 |

            La multiplication et la division passent avant l'addition ; les parenthèses changent l'ordre : (2 + 3) * 4 vaut 20.

            Pour une division entière, on garde la partie entière : **entier(17 / 5)** vaut 3. Diviser par zéro provoque une **Erreur de division par zéro**.

            ## Les textes

            Le signe **+** assemble deux textes : "Bon" + "jour" donne "Bonjour". Pour assembler un texte et un nombre, on convertit le nombre avec **texte(…)** : K+ refuse "Âge : " + 20, pour éviter les surprises.

            Fonctions utiles : **longueur(t)**, **arrondir(x, n)**, **racine(x)**, **absolu(x)**.
          `,
          examples: [
            example(K, "Opérateurs", `
              afficher(2 + 3 * 4, (2 + 3) * 4)
              afficher(7 / 2, 10 / 2, 17 % 5, 2 ^ 10)
              afficher(entier(17 / 5), arrondir(3.14159, 2))
            `),
            example(K, "Assembler des textes", `
              variable prenom = "Awa"
              variable note = 15
              afficher("Élève : " + prenom)
              afficher("Note : " + texte(note) + "/20")
              afficher("Le prénom a", longueur(prenom), "lettres")
            `),
          ],
          summary: ["/ donne toujours un décimal ; % donne le reste ; ^ la puissance.", "+ assemble deux textes ; texte(…) convertit un nombre.", "entier(a / b) donne la partie entière."],
          exerciseSlugs: ["kplus-moyenne"],
        }),
        lesson({
          slug: "kplus-conditions",
          title: "Conditions",
          durationMinutes: 30,
          objectives: ["Écrire si … alors … sinon … fin.", "Enchaîner plusieurs cas avec sinon si.", "Combiner des conditions avec et, ou, non."],
          content: `
            ## si … alors … fin

            ~~~kplus
            si note >= 10 alors
                afficher("Admis")
            sinon
                afficher("Ajourné")
            fin
            ~~~

            Un seul **fin** termine tout le bloc. Pour plusieurs cas, on écrit **sinon si** :

            ~~~kplus
            si note >= 16 alors
                afficher("Très bien")
            sinon si note >= 10 alors
                afficher("Admis")
            sinon
                afficher("Ajourné")
            fin
            ~~~

            ## Comparer et combiner

            Comparaisons : == (égal), != (différent), <, <=, >, >=. Pour comparer, on écrit **==** : un seul = sert à donner une valeur.

            Combinaisons : **et**, **ou**, **non** — par exemple \`si age >= 18 et age < 65 alors\`.

            K+ exige une vraie condition (vrai ou faux) : \`si 1 alors\` est une erreur.
          `,
          examples: [
            example(K, "Mention", `
              variable note = entier(demander())
              si note >= 16 alors
                  afficher("Très bien")
              sinon si note >= 14 alors
                  afficher("Bien")
              sinon si note >= 10 alors
                  afficher("Admis")
              sinon
                  afficher("Ajourné")
              fin
            `, { stdin: "15\n" }),
          ],
          summary: ["si … alors … sinon si … sinon … fin.", "== compare, = donne une valeur.", "et, ou, non combinent des conditions."],
          quiz: quiz("kplus-conditions-quiz", "Conditions", [
            qcm("Combien de « fin » faut-il pour si … sinon si … sinon ?", ["1", "2", "3", "aucun"], 0),
            qcm("Quel opérateur teste l'égalité ?", ["=", "==", "===", "egal"], 1),
            vraiFaux("« si 1 alors » est accepté par K+.", false, "La condition doit valoir vrai ou faux."),
          ]),
          exerciseSlugs: ["kplus-mention"],
        }),
        lesson({
          slug: "kplus-boucles",
          title: "Boucles",
          durationMinutes: 35,
          objectives: ["Répéter avec tant que.", "Compter avec pour … de … à.", "Parcourir une liste avec pour chaque."],
          content: `
            ## tant que

            ~~~kplus
            variable i = 1
            tant que i <= 3 faire
                afficher(i)
                i = i + 1
            fin
            ~~~

            ## pour (compteur)

            \`pour i de 1 à 5 faire … fin\` : les deux bornes sont incluses. On peut ajouter un **pas** : \`pour i de 10 à 0 pas -2 faire\`. Attention : le mot-clé **à** prend un accent.

            ## pour chaque

            \`pour chaque fruit dans ["pomme", "kiwi"] faire … fin\` parcourt une liste (ou les lettres d'un texte).

            ## arreter et continuer

            **arreter** quitte la boucle ; **continuer** passe au tour suivant.
          `,
          examples: [
            example(K, "Les trois boucles", `
              pour i de 1 à 3 faire
                  afficher("tour", i)
              fin
              pour chaque fruit dans ["pomme", "kiwi"] faire
                  afficher(fruit)
              fin
              variable n = 0
              tant que n < 10 faire
                  n = n + 4
              fin
              afficher("n =", n)
            `),
          ],
          summary: ["tant que répète tant que la condition est vraie.", "pour i de a à b [pas p] : bornes incluses.", "pour chaque parcourt une liste ou un texte."],
          exerciseSlugs: ["kplus-table"],
        }),
        lesson({
          slug: "kplus-fonctions-listes",
          title: "Fonctions, listes et erreurs",
          durationMinutes: 40,
          objectives: ["Écrire et appeler une fonction.", "Manipuler une liste.", "Gérer une erreur avec essayer … attraper."],
          content: `
            ## Fonctions

            ~~~kplus
            fonction carre(x)
                retourner x * x
            fin
            afficher(carre(7))
            ~~~

            Une fonction se déclare **avant** d'être appelée. Sans **retourner**, elle renvoie nul.

            ## Listes

            \`variable notes = [12, 15, 9]\` ; \`notes[0]\` est le **premier** élément (on compte à partir de 0) ; **longueur(notes)** ; **ajouter(notes, 18)** ajoute à la fin.

            ## Gérer les erreurs

            ~~~kplus
            essayer
                afficher(10 / 0)
            attraper erreur
                afficher("Problème :", erreur)
            fin
            ~~~

            **lever "message"** déclenche sa propre erreur, par exemple quand une donnée est invalide.
          `,
          examples: [
            example(K, "Maximum d'une liste", `
              fonction maximum(liste)
                  variable max = liste[0]
                  pour chaque x dans liste faire
                      si x > max alors
                          max = x
                      fin
                  fin
                  retourner max
              fin
              variable notes = [12, 15, 9]
              ajouter(notes, 18)
              afficher("Notes :", notes)
              afficher("Maximum :", maximum(notes))
            `),
            example(K, "Erreur attrapée", `
              essayer
                  afficher(entier("douze"))
              attraper erreur
                  afficher("Saisie invalide :", erreur)
              fin
            `),
          ],
          summary: ["fonction nom(paramètres) … retourner … fin.", "Les listes commencent à l'indice 0.", "essayer … attraper gère une erreur ; lever en déclenche une."],
          exerciseSlugs: ["kplus-maximum"],
        }),
      ],
    },
    {
      slug: "sites-web",
      title: "Sites web dynamiques avec K+",
      lessons: [
        lesson({
          slug: "kplus-web-premiere-page",
          title: "Ma première page web",
          durationMinutes: 35,
          objectives: ["Activer la bibliothèque web avec utiliser web.", "Construire une page : titres, paragraphes, listes, images, liens.", "Publier un site."],
          content: `
            ## utiliser web

            Un programme qui commence par **utiliser web** construit une **page web**. Chaque élément créé s'ajoute à la fin de la page, dans l'ordre du programme :

            ~~~kplus
            utiliser web

            titre_page("Mon site")
            titre("Bienvenue")
            paragraphe("Ce site est écrit en K+.")
            variable langages = liste()
            ajouter_ligne(langages, "HTML")
            ajouter_ligne(langages, "K+")
            lien("Le langage K+", "https://manassekito17-star.github.io/K-/")
            ~~~

            Sur la plateforme, le bouton **Exécuter** affiche la page sous le code.

            ## Les éléments

            | Fonction | Crée |
            |---|---|
            | titre(t), sous_titre(t) | un grand titre, un titre de section |
            | paragraphe(t) | un paragraphe |
            | liste() puis ajouter_ligne(liste, t) | une liste à puces |
            | image(adresse, description) | une image (la description est lue aux personnes aveugles) |
            | lien(t, adresse) | un lien |
            | titre_page(t) | le titre de l'onglet du navigateur |

            Les textes sont toujours affichés **tels quels** : un texte qui contient du HTML ne peut pas abîmer la page (sécurité).

            ## Publier

            Avec K+ Studio (https://manassekito17-star.github.io/K-/), l'onglet **Page** montre le site ; sur un ordinateur, \`kplus --site mon_site.kplus\` crée un dossier publiable chez un hébergeur gratuit (GitHub Pages, Netlify…).
          `,
          examples: [
            example(K, "Une page de présentation", `
              utiliser web

              titre_page("Mon site")
              titre("Bienvenue")
              paragraphe("Ce site est écrit en K+.")
              sous_titre("Ce que j'apprends")
              variable langages = liste()
              ajouter_ligne(langages, "Algorithmique")
              ajouter_ligne(langages, "K+")
              lien("Le langage K+", "https://manassekito17-star.github.io/K-/")
            `, { explanation: "La page s'affiche sous le code ; titre_page change le titre de l'onglet." }),
          ],
          summary: ["utiliser web active les fonctions de page.", "Les éléments s'ajoutent dans l'ordre du programme.", "kplus --site crée un site publiable."],
          quiz: quiz("kplus-web-premiere-page-quiz", "Ma première page", [
            qcm("Par quoi commence un programme qui construit une page ?", ["page web", "utiliser web", "importer web", "html"], 1),
            qcm("Comment ajoute-t-on une ligne à une liste de la page ?", ["ajouter(liste, t)", "ajouter_ligne(liste, t)", "ligne(t)", "liste(t)"], 1),
            vraiFaux("Un paragraphe contenant <b>gras</b> affiche du texte en gras.", false, "Les textes sont affichés tels quels, pour la sécurité."),
          ]),
          exerciseSlugs: ["kplus-web-page"],
        }),
        lesson({
          slug: "kplus-web-interactions",
          title: "Boutons et champs de saisie",
          durationMinutes: 40,
          objectives: ["Créer un bouton qui appelle une fonction.", "Lire un champ de saisie.", "Modifier la page en réponse au visiteur."],
          content: `
            ## Un bouton appelle une fonction

            \`bouton("Calculer", calculer)\` crée un bouton ; **à chaque clic**, la fonction **calculer** est appelée. On donne le nom de la fonction, **sans parenthèses**.

            ## Lire et modifier

            | Fonction | Rôle |
            |---|---|
            | champ(étiquette) | une zone de saisie |
            | valeur(champ) | le texte tapé (toujours un texte) |
            | changer_texte(élément, t) | remplace le texte d'un paragraphe, d'un titre… |
            | changer_valeur(champ, t) | remplace le texte d'un champ |
            | quand_change(champ, f) | appelle f à chaque touche tapée |

            ## Le programme reste vivant

            Le programme s'exécute une fois pour construire la page ; ensuite, ses variables **restent en mémoire** : chaque clic peut les lire et les modifier.
          `,
          examples: [
            example(K, "Calculatrice du double", `
              utiliser web

              titre("Calculatrice du double")
              variable saisie = champ("Votre nombre")
              variable resultat = paragraphe("")

              fonction calculer()
                  essayer
                      variable n = decimal(valeur(saisie))
                      changer_texte(resultat, "Le double est " + texte(n * 2))
                  attraper
                      changer_texte(resultat, "Écrivez un nombre, par exemple 3.5")
                  fin
              fin

              bouton("Calculer", calculer)
            `, { explanation: "Tapez un nombre dans la page, puis cliquez sur Calculer." }),
          ],
          summary: ["bouton(texte, fonction) : la fonction est appelée à chaque clic.", "valeur(champ) lit la saisie ; changer_texte modifie la page.", "Les variables du programme restent en mémoire entre deux clics."],
          exerciseSlugs: ["kplus-web-salutation"],
        }),
        lesson({
          slug: "kplus-web-listes",
          title: "Listes dynamiques",
          durationMinutes: 40,
          objectives: ["Ajouter et supprimer des éléments pendant la visite.", "Réagir au clic sur n'importe quel élément.", "Tenir un compteur à jour."],
          content: `
            ## Ajouter pendant la visite

            **ajouter_ligne(liste, t)** renvoie la ligne créée : on peut la garder dans une variable et lui associer une action avec **quand_clic(ligne, fonction)**.

            Quand la fonction a **un paramètre**, elle reçoit l'élément cliqué :

            ~~~kplus
            fonction terminer(ligne)
                supprimer(ligne)
            fin
            ~~~

            ## Retirer

            **supprimer(élément)** retire un élément ; **vider(liste)** retire toutes ses lignes.
          `,
          examples: [
            example(K, "Liste de tâches", `
              utiliser web

              titre("Mes tâches")
              variable nouvelle = champ("Nouvelle tâche")
              variable taches = liste()
              variable compteur = paragraphe("0 tâche")
              variable nombre = 0

              fonction terminer(ligne)
                  supprimer(ligne)
                  nombre = nombre - 1
                  changer_texte(compteur, texte(nombre) + " tâche(s)")
              fin

              fonction ajouter_tache()
                  si valeur(nouvelle) == "" alors
                      retourner
                  fin
                  variable ligne = ajouter_ligne(taches, valeur(nouvelle))
                  quand_clic(ligne, terminer)
                  changer_valeur(nouvelle, "")
                  nombre = nombre + 1
                  changer_texte(compteur, texte(nombre) + " tâche(s)")
              fin

              bouton("Ajouter", ajouter_tache)
            `, { explanation: "Ajoutez des tâches, puis cliquez sur une tâche pour la supprimer." }),
          ],
          summary: ["ajouter_ligne renvoie la ligne créée.", "quand_clic(élément, f) : f peut recevoir l'élément cliqué.", "supprimer et vider retirent des éléments."],
          exerciseSlugs: ["kplus-web-compteur"],
        }),
        lesson({
          slug: "kplus-web-minuteries",
          title: "Mise en forme et minuteries",
          durationMinutes: 40,
          objectives: ["Colorer, regrouper, cacher des éléments.", "Faire évoluer une page dans le temps avec toutes_les.", "Arrêter une minuterie."],
          content: `
            ## Mettre en forme

            - **couleur(élément, c)** et **couleur_fond(élément, c)** : rouge, vert, bleu, jaune, orange, violet, rose, noir, blanc, gris, ou un code #rrggbb ;
            - **zone()** crée un cadre et **placer(élément, zone)** y range un élément ;
            - **cacher(élément)** et **montrer(élément)**.

            ## Minuteries

            **toutes_les(millisecondes, fonction)** appelle la fonction régulièrement (au moins toutes les 100 ms) et renvoie la minuterie ; **arreter_minuterie(m)** l'arrête. C'est ainsi qu'on fait une horloge, un compte à rebours ou une animation simple.
          `,
          examples: [
            example(K, "Compte à rebours", `
              utiliser web

              titre("Compte à rebours")
              variable affichage = paragraphe("5")
              variable reste = 5
              variable minuterie = nul

              fonction tic()
                  reste = reste - 1
                  changer_texte(affichage, texte(reste))
                  si reste == 0 alors
                      arreter_minuterie(minuterie)
                      changer_texte(affichage, "Décollage !")
                      couleur(affichage, "rouge")
                  fin
              fin

              fonction lancer()
                  si minuterie == nul alors
                      minuterie = toutes_les(1000, tic)
                  fin
              fin

              bouton("Lancer", lancer)
            `, { explanation: "Cliquez sur Lancer : le nombre diminue chaque seconde." }),
          ],
          summary: ["couleur, couleur_fond, zone, placer, cacher, montrer.", "toutes_les(ms, f) répète f ; arreter_minuterie l'arrête."],
          quiz: quiz("kplus-web-minuteries-quiz", "Minuteries", [
            qcm("Quel est l'intervalle minimal de toutes_les ?", ["1 ms", "10 ms", "100 ms", "1000 ms"], 2),
            qcm("Que renvoie toutes_les(1000, tic) ?", ["rien", "la minuterie, pour pouvoir l'arrêter", "le nombre de tours", "un texte"], 1),
          ]),
          exerciseSlugs: ["kplus-web-minuteur"],
        }),
      ],
    },
  ],
};
