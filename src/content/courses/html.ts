import { annotated, chapterEvaluation, commonError, example, interrogation, lesson, qcm, solved, vraiFaux } from "../helpers";
import type { Course } from "../types";

const H = "html" as const;

/** Parcours HTML. Niveau 1 rédigé ; niveaux 2 à 4 au programme (voir src/content/levels). */
export const html: Course = {
  slug: "html",
  code: "Parcours HTML",
  language: "html",
  category: "web",
  title: "HTML",
  tagline: "Structurer le contenu des pages web.",
  description:
    "HTML est le langage qui décrit la structure et le sens du contenu d'une page web : titres, paragraphes, listes, liens, images, tableaux, formulaires. Ce parcours part de zéro et mène jusqu'à des pages accessibles, sémantiques et prêtes pour la production. Chaque exemple s'affiche en direct dans UPL IDE.",
  level: "debutant",
  prerequisites: ["Savoir utiliser un navigateur web. Aucune connaissance en programmation n'est nécessaire."],
  objectives: [
    "Écrire des documents HTML valides et bien structurés.",
    "Utiliser les éléments adaptés au sens du contenu (sémantique).",
    "Créer des liens, insérer des images, des tableaux et des formulaires.",
    "Produire des pages accessibles à tous les utilisateurs.",
  ],
  durationHours: 30,
  status: "publie",
  levels: [],
  modules: [
    {
      slug: "premiers-pas",
      title: "Premiers pas en HTML",
      lessons: [
        // ===============================================================
        lesson({
          slug: "html-introduction-web",
          title: "Le web et le langage HTML",
          durationMinutes: 75,
          objectives: [
            "Expliquer le rôle du navigateur, du serveur et d'une URL.",
            "Distinguer les rôles de HTML, CSS et JavaScript.",
            "Reconnaître une balise, un élément et un attribut.",
            "Écrire et afficher une première page.",
          ],
          prerequisites: ["Savoir ouvrir une page web dans un navigateur."],
          content: `
            ## 1. Comment fonctionne le web ?

            Quand vous tapez une adresse comme **https://www.exemple.cd/cours.html** dans votre navigateur (Chrome, Firefox, Safari…), celui-ci envoie une **requête** à un ordinateur distant appelé **serveur**. Le serveur répond en envoyant un **fichier texte** écrit en HTML. Le navigateur lit ce fichier et le **dessine** à l'écran : c'est le **rendu**.

            - **Client** : votre navigateur, qui demande et affiche les pages.
            - **Serveur** : l'ordinateur qui stocke et envoie les pages.
            - **URL** (adresse) : elle indique le protocole (**https**), le nom du site (**www.exemple.cd**) et le chemin du fichier (**/cours.html**).

            ## 2. Trois langages, trois rôles

            | Langage | Rôle | Image |
            |---|---|---|
            | HTML | la **structure** et le sens du contenu | le squelette d'une maison |
            | CSS | la **présentation** : couleurs, tailles, mise en page | la peinture et la décoration |
            | JavaScript | le **comportement** : réactions aux clics, calculs | l'électricité qui fait fonctionner les appareils |

            HTML n'est pas un langage de programmation : il ne calcule rien, il **décrit**. C'est un **langage de balisage** (HyperText Markup Language).

            ## 3. Balises, éléments et attributs

            HTML entoure le contenu de **balises** écrites entre chevrons :

            ~~~html
            <p>Bienvenue à UPL Code Academy</p>
            ~~~

            - **<p>** est la balise **ouvrante**, **</p>** la balise **fermante** (avec une barre oblique).
            - L'ensemble balise ouvrante + contenu + balise fermante forme un **élément** : ici un paragraphe.
            - Certains éléments sont **vides** et n'ont pas de balise fermante : **<br>** (retour à la ligne), **<img>** (image).

            Une balise ouvrante peut porter des **attributs**, qui précisent l'élément. Ils s'écrivent **nom="valeur"** :

            ~~~html
            <a href="https://www.upl-univ.ac">Site de l'université</a>
            ~~~

            Ici, l'attribut **href** indique la destination du lien.

            ## 4. L'imbrication

            Les éléments peuvent contenir d'autres éléments : on dit qu'ils sont **imbriqués**. La règle d'or : **le dernier ouvert est le premier fermé**.

            ~~~html
            <p>Le HTML est <strong>indispensable</strong>.</p>   <!-- correct -->
            <p>Le HTML est <strong>indispensable.</p></strong>   <!-- incorrect -->
            ~~~

            Le navigateur essaie de corriger les erreurs, mais le résultat devient imprévisible. On écrit donc toujours un HTML **bien formé**.

            ## 5. Votre première page

            Une page HTML est un simple fichier texte, souvent nommé **index.html**. Dans UPL IDE, choisissez le langage **HTML** : l'aperçu se met à jour pendant que vous tapez. Le chapitre suivant détaille la structure complète d'un document ; pour l'instant, retenez qu'une page commence par **<!DOCTYPE html>** et que le contenu visible se place dans **<body>**.

            ## 6. Les commentaires

            Un commentaire HTML s'écrit **<!-- ainsi -->**. Il n'est pas affiché par le navigateur, mais il reste visible pour quiconque consulte le code source de la page : n'y mettez jamais d'information confidentielle.

            ## 7. Inspecter une page réelle

            Tous les navigateurs permettent de lire le HTML d'une page : clic droit puis **Afficher le code source**, ou la touche **F12** pour ouvrir les **outils de développement**. L'onglet **Éléments** (ou **Inspecteur**) montre l'arbre des éléments tel que le navigateur l'a compris, après correction d'éventuelles erreurs. Prenez l'habitude de comparer votre code à cet arbre : un élément mal fermé y apparaît souvent à un endroit inattendu.

            **Méthode de travail recommandée :**
            1. écrire quelques lignes ;
            2. regarder l'aperçu ;
            3. corriger avant d'aller plus loin.

            Avancer par petites étapes évite d'avoir à chercher une erreur dans cent lignes.
          `,
          examples: [
            example(H, "Première page", `
              <!DOCTYPE html>
              <html lang="fr">
              <head>
                <meta charset="utf-8">
                <title>Ma première page</title>
              </head>
              <body>
                <h1>Bonjour UPL !</h1>
                <p>Ceci est ma <strong>première</strong> page web.</p>
                <p>Visitez le <a href="https://developer.mozilla.org/fr/">site de référence MDN</a>.</p>
              </body>
              </html>
            `, { explanation: "Modifiez le texte dans l'éditeur : l'aperçu se met à jour automatiquement." }),
          ],
          summary: [
            "Le navigateur (client) demande une page au serveur et dessine le HTML reçu.",
            "HTML structure, CSS présente, JavaScript fait agir.",
            "Un élément = balise ouvrante + contenu + balise fermante ; certains éléments sont vides.",
            "Les attributs (nom=\"valeur\") précisent un élément.",
            "Le dernier élément ouvert est le premier fermé.",
          ],
          exerciseSlugs: ["html-premier-paragraphe"],
          pedagogy: {
            competences: ["Expliquer le fonctionnement client / serveur", "Reconnaître balises, éléments et attributs", "Écrire du HTML bien imbriqué"],
            definitions: [
              { term: "HTML", definition: "HyperText Markup Language : langage de balisage qui décrit la structure et le sens du contenu d'une page web." },
              { term: "Balise", definition: "Marque entre chevrons (**<p>**, **</p>**) qui délimite un élément." },
              { term: "Élément", definition: "Ensemble formé d'une balise ouvrante, d'un contenu et d'une balise fermante (ou d'une seule balise pour un élément vide)." },
              { term: "Attribut", definition: "Information supplémentaire placée dans la balise ouvrante sous la forme nom=\"valeur\"." },
              { term: "Navigateur", definition: "Logiciel qui demande les pages aux serveurs et les affiche (rendu)." },
            ],
            commentedAlgorithms: [
              annotated(
                "Anatomie d'une page minimale",
                [
                  ["<!DOCTYPE html>", "Indique au navigateur qu'il s'agit d'un document HTML moderne."],
                  ["<html lang=\"fr\">", "Élément racine ; l'attribut lang annonce le français (lecteurs d'écran, traduction)."],
                  ["<head>", "En-tête : informations sur la page, non affichées dans le contenu."],
                  ["  <meta charset=\"utf-8\">", "Encodage : les accents s'affichent correctement."],
                  ["  <title>Accueil</title>", "Titre affiché dans l'onglet du navigateur."],
                  ["</head>"],
                  ["<body>", "Corps : tout le contenu visible."],
                  ["  <h1>UPL Code Academy</h1>", "Titre principal de la page."],
                  ["  <p>Apprendre à coder, pas à pas.</p>", "Un paragraphe."],
                  ["</body>", "Fermeture du corps…"],
                  ["</html>", "… puis de la racine : le dernier ouvert est le premier fermé."],
                ],
                { language: H, showPreview: true },
              ),
            ],
            commonErrors: [
              commonError("Oublier la barre oblique de la balise fermante", "<p>Bonjour<p>", "<p>Bonjour</p>", "Sans **</p>**, le navigateur ouvre un second paragraphe vide au lieu de fermer le premier."),
              commonError("Mal imbriquer les éléments", "<p><strong>Important</p></strong>", "<p><strong>Important</strong></p>", "Le dernier élément ouvert (**strong**) doit être fermé en premier."),
            ],
            solvedExercises: [
              solved("Repérer les composants", "Dans **<a href=\"contact.html\">Nous écrire</a>**, nommez la balise ouvrante, l'attribut, sa valeur et le contenu.", "Balise ouvrante : <a href=\"contact.html\">\nAttribut : href\nValeur : contact.html\nContenu : Nous écrire\nBalise fermante : </a>", "L'élément **a** (ancre) crée un lien ; **href** indique sa destination."),
              solved("Corriger un code", "Corrigez : **<h1>Mon site<h1> <p>Texte <em>important</p></em>**", "<h1>Mon site</h1>\n<p>Texte <em>important</em></p>", "La première balise h1 n'était pas fermée ; **em** doit être fermé avant **p**."),
            ],
            td: { title: "TD 1 — Premiers éléments", instructions: "Écrivez le code dans l'éditeur et observez l'aperçu avant de soumettre. La correction vérifie la structure du document.", exerciseSlugs: ["html-titre-et-texte", "html-lien-mdn"] },
            interrogation: interrogation("html-introduction-interrogation", "Interrogation — Le web et HTML", [
              qcm("Quel langage décrit la structure d'une page ?", ["CSS", "HTML", "JavaScript", "Python"], 1),
              qcm("Dans <img src=\"logo.png\">, src est…", ["une balise", "un attribut", "un élément fermant", "un commentaire"], 1),
              vraiFaux("<br> a besoin d'une balise fermante </br>.", false),
              qcm("Quelle imbrication est correcte ?", ["<p><em>a</p></em>", "<p><em>a</em></p>", "<em><p>a</em></p>", "<p>a<em></p>"], 1),
            ], 8),
            evaluation: chapterEvaluation("html-introduction-evaluation", "Évaluation — Le web et HTML", [
              qcm("Que fait le navigateur ?", ["Il stocke les sites", "Il demande les pages et les affiche", "Il écrit le HTML", "Il compile le code"], 1),
              qcm("Dans https://www.exemple.cd/cours.html, quel est le chemin du fichier ?", ["https", "www.exemple.cd", "/cours.html", "cd"], 2),
              qcm("Quel rôle joue CSS ?", ["La structure", "La présentation", "Le comportement", "Le stockage"], 1),
              qcm("Comment s'écrit un attribut ?", ["nom:valeur", "nom=\"valeur\"", "(nom valeur)", "nom->valeur"], 1),
              vraiFaux("HTML est un langage de programmation qui effectue des calculs.", false),
              qcm("Comment écrit-on un commentaire HTML ?", ["// commentaire", "/* commentaire */", "<!-- commentaire -->", "# commentaire"], 2),
              qcm("Quel élément est vide (sans balise fermante) ?", ["<p>", "<img>", "<h1>", "<a>"], 1),
            ]),
          },
        }),
        // ===============================================================
        lesson({
          slug: "html-structure-document",
          title: "Structure d'un document HTML",
          durationMinutes: 75,
          objectives: [
            "Écrire le squelette complet d'un document HTML.",
            "Expliquer le rôle du DOCTYPE, de head et de body.",
            "Renseigner la langue, l'encodage, le titre et le viewport.",
            "Organiser son code (indentation, commentaires).",
          ],
          prerequisites: ["Chapitre 1 — Le web et le langage HTML."],
          content: `
            ## 1. Le squelette d'une page

            Tout document HTML suit la même structure :

            ~~~html
            <!DOCTYPE html>
            <html lang="fr">
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <title>Titre de la page</title>
            </head>
            <body>
              <!-- contenu visible -->
            </body>
            </html>
            ~~~

            ## 2. Le DOCTYPE

            **<!DOCTYPE html>** est la toute première ligne. Ce n'est pas une balise : c'est une **déclaration** qui indique au navigateur d'utiliser le mode standard (HTML5). Sans elle, les navigateurs passent en mode « quirks » (compatibilité avec de très vieux sites) et certains rendus changent.

            ## 3. L'élément html et la langue

            **<html>** est l'élément **racine** : il contient tout le document. Son attribut **lang** indique la langue principale : **lang="fr"** pour le français. Cette information est utilisée par les lecteurs d'écran (pour prononcer correctement), les moteurs de recherche et les outils de traduction.

            ## 4. L'en-tête : head

            **<head>** contient des **métadonnées**, c'est-à-dire des informations sur la page, qui ne sont pas affichées dans son contenu :

            | Élément | Rôle |
            |---|---|
            | <meta charset="utf-8"> | encodage des caractères : indispensable pour les accents |
            | <meta name="viewport" …> | adaptation à la largeur des téléphones |
            | <title> | titre de l'onglet, des favoris et des résultats de recherche |
            | <link rel="stylesheet" href="style.css"> | feuille de style CSS (parcours CSS) |

            Le **title** est obligatoire et doit décrire précisément la page : « Inscription — UPL Code Academy » plutôt que « Page ».

            ## 5. Le corps : body

            **<body>** contient **tout le contenu visible** : textes, images, liens, formulaires. Il n'y a qu'un seul body par document. Plus tard, on y placera aussi les éléments de structure **header**, **main** et **footer**.

            ## 6. Écrire un code lisible

            - **Indentez** : décalez de deux espaces le contenu d'un élément. L'indentation ne change pas l'affichage, mais rend l'imbrication visible.
            - **Écrivez les balises en minuscules** et les valeurs d'attributs entre guillemets.
            - **Validez** votre page avec le validateur du W3C (validator.w3.org) : il signale les balises non fermées et les attributs inconnus.
            - Les espaces et retours à la ligne multiples dans le texte sont réduits à **un seul espace** à l'affichage : pour changer de paragraphe, on utilise un nouvel élément **p**, pas des lignes vides.

            ## 7. Vérifier la validité d'un document

            Le **validateur du W3C** (validator.w3.org) analyse une page et signale les erreurs : balise non fermée, attribut inconnu, élément obligatoire manquant. Un document **valide** s'affiche de la même façon dans tous les navigateurs et reste lisible par les moteurs de recherche et les lecteurs d'écran.

            Les trois oublis les plus fréquents en début de formation :
            - l'absence de **<!DOCTYPE html>**, qui fait passer le navigateur en mode de compatibilité (« quirks mode ») ;
            - l'absence de **<meta charset="utf-8">**, qui produit des caractères accentués illisibles ;
            - un **<title>** vide, qui laisse l'onglet du navigateur sans nom.

            Dans UPL, la correction automatique vérifie la présence et la place de ces éléments.
          `,
          examples: [
            example(H, "Squelette complet", `
              <!DOCTYPE html>
              <html lang="fr">
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <title>Inscription — UPL Code Academy</title>
              </head>
              <body>
                <h1>Inscription</h1>
                <p>Les espaces    multiples     sont réduits à un seul.</p>
                <p>Un nouveau paragraphe commence ici.</p>
              </body>
              </html>
            `),
          ],
          summary: [
            "Un document commence par <!DOCTYPE html> puis l'élément racine <html lang=\"fr\">.",
            "head contient les métadonnées : charset, viewport, title ; body contient le contenu visible.",
            "Le titre (title) apparaît dans l'onglet et dans les moteurs de recherche.",
            "Indenter et valider son code évite les erreurs d'imbrication.",
          ],
          exerciseSlugs: ["html-squelette"],
          pedagogy: {
            competences: ["Écrire le squelette d'un document", "Renseigner les métadonnées essentielles", "Écrire un code lisible et valide"],
            definitions: [
              { term: "DOCTYPE", definition: "Déclaration placée en première ligne qui active le mode standard du navigateur." },
              { term: "Élément racine", definition: "L'élément **html**, qui contient tout le document." },
              { term: "Métadonnées", definition: "Informations sur la page (encodage, titre, viewport…) placées dans **head** et non affichées dans le contenu." },
              { term: "Encodage (charset)", definition: "Manière de représenter les caractères ; UTF-8 permet d'afficher les accents et tous les alphabets." },
            ],
            commentedAlgorithms: [
              annotated(
                "Une page d'accueil complète",
                [
                  ["<!DOCTYPE html>", "Mode standard."],
                  ["<html lang=\"fr\">", "Langue : français."],
                  ["<head>"],
                  ["  <meta charset=\"utf-8\">", "Sans cette ligne, « é » peut s'afficher « Ã© »."],
                  ["  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">", "Sur téléphone, la page prend la largeur de l'écran au lieu d'être réduite."],
                  ["  <title>Accueil — Club informatique</title>", "Titre précis : page et site."],
                  ["</head>"],
                  ["<body>", "Début du contenu visible."],
                  ["  <!-- En-tête de la page -->", "Commentaire : invisible dans le rendu."],
                  ["  <h1>Club informatique de l'UPL</h1>"],
                  ["  <p>Réunion chaque vendredi à 14 h.</p>"],
                  ["</body>"],
                  ["</html>", "Fin du document."],
                ],
                { language: H, showPreview: true },
              ),
            ],
            commonErrors: [
              commonError("Mettre du contenu visible dans head", "<head>\n  <h1>Bienvenue</h1>\n</head>", "<head>\n  <title>Bienvenue</title>\n</head>\n<body>\n  <h1>Bienvenue</h1>\n</body>", "head ne contient que des métadonnées. Le contenu visible va dans **body**."),
              commonError("Oublier l'encodage", "<head>\n  <title>Résumé</title>\n</head>", "<head>\n  <meta charset=\"utf-8\">\n  <title>Résumé</title>\n</head>", "Sans **charset=\"utf-8\"**, les accents peuvent être mal affichés selon le serveur."),
            ],
            solvedExercises: [
              solved("Ordonner un squelette", "Remettez dans l'ordre : </body>, <head>, <!DOCTYPE html>, </html>, <body>, <html lang=\"fr\">, </head>, <title>T</title>.", "<!DOCTYPE html>\n<html lang=\"fr\">\n<head>\n  <title>T</title>\n</head>\n<body>\n</body>\n</html>", "DOCTYPE d'abord ; html contient head puis body ; chaque élément est fermé dans l'ordre inverse de son ouverture."),
              solved("Choisir un bon titre", "Proposez un title pour la page des horaires de la bibliothèque du site UPL Code Academy.", "<title>Horaires de la bibliothèque — UPL Code Academy</title>", "Un bon titre décrit la page puis le site : il est lisible dans un onglet et utile dans les résultats de recherche."),
            ],
            td: { title: "TD 2 — Squelettes de documents", instructions: "Chaque page doit être un document complet et valide.", exerciseSlugs: ["html-meta-viewport", "html-commentaire-titre"] },
            interrogation: interrogation("html-structure-interrogation", "Interrogation — Structure d'un document", [
              qcm("Quelle est la première ligne d'un document HTML5 ?", ["<html>", "<!DOCTYPE html>", "<head>", "<meta charset=\"utf-8\">"], 1),
              qcm("Où place-t-on le titre de l'onglet ?", ["dans body", "dans un h1", "dans head, avec title", "dans le DOCTYPE"], 2),
              vraiFaux("Un document peut contenir plusieurs éléments body.", false),
              qcm("À quoi sert lang=\"fr\" ?", ["À traduire la page", "À indiquer la langue du contenu", "À changer la police", "À rien"], 1),
            ], 8),
            evaluation: chapterEvaluation("html-structure-evaluation", "Évaluation — Structure d'un document", [
              qcm("Quel élément contient tout le document ?", ["body", "head", "html", "main"], 2),
              qcm("Que contient head ?", ["Le contenu visible", "Des métadonnées", "Les images", "Les liens du menu"], 1),
              qcm("Quel encodage recommande-t-on ?", ["ASCII", "UTF-8", "Latin-1", "Base64"], 1),
              qcm("Que fait la meta viewport ?", ["Elle ajoute une image", "Elle adapte la page à la largeur des téléphones", "Elle définit la langue", "Elle cache la page"], 1),
              vraiFaux("Plusieurs espaces dans un paragraphe s'affichent comme un seul.", true),
              qcm("Quel outil vérifie la validité d'une page ?", ["Le validateur du W3C", "Un antivirus", "Le gestionnaire de tâches", "Un tableur"], 0),
              qcm("Que se passe-t-il sans DOCTYPE ?", ["La page ne s'affiche pas", "Le navigateur passe en mode de compatibilité « quirks »", "Les images disparaissent", "Rien du tout"], 1),
            ]),
          },
        }),
        // ===============================================================
        lesson({
          slug: "html-textes-listes",
          title: "Titres, paragraphes et listes",
          durationMinutes: 90,
          objectives: [
            "Hiérarchiser un contenu avec les titres h1 à h6.",
            "Structurer un texte en paragraphes et mettre en valeur avec strong et em.",
            "Créer des listes à puces, numérotées et imbriquées.",
          ],
          prerequisites: ["Chapitre 2 — Structure d'un document HTML."],
          content: `
            ## 1. Les titres : h1 à h6

            HTML propose six niveaux de titres, du plus important (**h1**) au moins important (**h6**). Ils forment le **plan** de la page, comme les titres d'un mémoire :

            ~~~html
            <h1>Cours d'algorithmique</h1>
              <h2>Chapitre 1 — Introduction</h2>
                <h3>1.1 Définitions</h3>
            ~~~

            Règles :

            - un seul **h1** par page, qui résume son sujet ;
            - on ne **saute pas** de niveau (pas de h4 directement sous un h2) ;
            - on choisit un titre pour son **rang dans le plan**, jamais pour sa taille : la taille se règle en CSS.

            Les lecteurs d'écran utilisés par les personnes aveugles permettent de naviguer de titre en titre : une hiérarchie correcte rend la page **accessible**.

            ## 2. Les paragraphes et le texte

            - **p** : un paragraphe.
            - **br** : un retour à la ligne à l'intérieur d'un paragraphe (adresse, poème) ; à ne pas utiliser pour espacer des blocs.
            - **strong** : texte **important** (affiché en gras par défaut).
            - **em** : texte **accentué**, sur lequel on insiste à l'oral (en italique par défaut).

            strong et em expriment un **sens** ; si l'on veut seulement du gras pour la décoration, on utilise CSS.

            ## 3. Les listes à puces : ul

            Une liste **non ordonnée** (unordered list) regroupe des éléments sans ordre particulier ; chaque élément est un **li** (list item) :

            ~~~html
            <ul>
              <li>Python</li>
              <li>C</li>
              <li>Java</li>
            </ul>
            ~~~

            ## 4. Les listes numérotées : ol

            Une liste **ordonnée** (ordered list) est utilisée quand l'ordre compte : étapes d'une recette, classement. Les numéros sont générés automatiquement. L'attribut **start** change le premier numéro, **reversed** inverse l'ordre.

            ## 5. Les listes imbriquées

            Une liste peut contenir une autre liste, **à l'intérieur d'un li** :

            ~~~html
            <ul>
              <li>Langages
                <ul>
                  <li>Python</li>
                  <li>Java</li>
                </ul>
              </li>
              <li>Outils</li>
            </ul>
            ~~~

            Un **ul** ou un **ol** ne doit contenir **que des li** : placer du texte ou un autre élément directement dans ul est une erreur.

            ## 6. Bien choisir son élément

            | Besoin | Élément |
            |---|---|
            | Titre de section | h2, h3… |
            | Bloc de texte | p |
            | Énumération sans ordre | ul + li |
            | Étapes, classement | ol + li |
            | Mot important | strong |
            | Insistance | em |

            ## 7. Le texte et l'accessibilité

            Les personnes aveugles ou malvoyantes utilisent un **lecteur d'écran**, qui lit la page à voix haute. Ce logiciel permet de sauter de titre en titre ou de compter les éléments d'une liste : il s'appuie entièrement sur la **structure HTML**.

            Une page dont les titres sont de simples paragraphes en gras est donc illisible pour lui. Les mêmes règles profitent aussi aux moteurs de recherche, qui utilisent les titres pour comprendre le sujet de la page.

            **Règle pratique :** si vous retirez tout le style, la page doit rester compréhensible. C'est exactement ce que montre l'aperçu sans CSS d'UPL IDE.

            ## 8. Citations et extraits de code

            - **<blockquote>** encadre une citation longue ; son attribut **cite** peut indiquer l'adresse de la source.
            - **<q>** marque une courte citation à l'intérieur d'une phrase ; le navigateur ajoute les guillemets.
            - **<code>** signale un fragment de code dans le texte. Associé à **<pre>**, qui conserve les espaces et les retours à la ligne, il permet d'afficher un programme entier.
          `,
          examples: [
            example(H, "Fiche de cours structurée", `
              <!DOCTYPE html>
              <html lang="fr">
              <head>
                <meta charset="utf-8">
                <title>Fiche de cours</title>
              </head>
              <body>
                <h1>Algorithmique — Fiche de révision</h1>
                <h2>Les boucles</h2>
                <p>Une boucle répète des instructions. Il est <strong>indispensable</strong> de vérifier qu'elle se termine.</p>
                <h3>Les trois boucles</h3>
                <ul>
                  <li>POUR</li>
                  <li>TANT QUE</li>
                  <li>RÉPÉTER … JUSQU'À</li>
                </ul>
                <h2>Méthode de résolution</h2>
                <ol>
                  <li>Comprendre l'énoncé</li>
                  <li>Décomposer</li>
                  <li>Tester</li>
                </ol>
              </body>
              </html>
            `),
          ],
          summary: [
            "h1 à h6 forment le plan de la page : un seul h1, pas de saut de niveau.",
            "p pour les paragraphes ; strong pour l'importance, em pour l'insistance.",
            "ul pour une liste sans ordre, ol quand l'ordre compte ; chaque élément est un li.",
            "Une sous-liste se place à l'intérieur d'un li.",
          ],
          exerciseSlugs: ["html-liste-langages"],
          pedagogy: {
            competences: ["Hiérarchiser une page avec des titres", "Choisir entre ul et ol", "Imbriquer correctement des listes"],
            definitions: [
              { term: "Titre (h1 à h6)", definition: "Élément qui introduit une section ; son numéro indique son rang dans le plan de la page." },
              { term: "Liste non ordonnée (ul)", definition: "Liste dont l'ordre des éléments n'a pas d'importance, affichée avec des puces." },
              { term: "Liste ordonnée (ol)", definition: "Liste dont l'ordre compte, numérotée automatiquement." },
              { term: "Élément de liste (li)", definition: "Élément qui représente un item d'une liste ul ou ol." },
              { term: "Accessibilité", definition: "Qualité d'une page utilisable par tous, y compris avec un lecteur d'écran ou sans souris." },
            ],
            commentedAlgorithms: [
              annotated(
                "Programme d'une journée de formation",
                [
                  ["<h1>Journée découverte du code</h1>", "Un seul h1 : le sujet de la page."],
                  ["<h2>Matin</h2>", "Section de premier niveau."],
                  ["<ol>", "L'ordre des activités compte : liste ordonnée."],
                  ["  <li>Accueil des participants</li>", "Chaque activité est un li."],
                  ["  <li>Atelier pseudocode</li>"],
                  ["</ol>"],
                  ["<h2>Après-midi</h2>", "Même niveau que « Matin »."],
                  ["<ul>", "Ateliers au choix : sans ordre, liste à puces."],
                  ["  <li>Python", "Le li reste ouvert : il va contenir une sous-liste."],
                  ["    <ul>", "Sous-liste à l'intérieur du li."],
                  ["      <li>Variables</li>"],
                  ["      <li>Boucles</li>"],
                  ["    </ul>"],
                  ["  </li>", "On ferme le li après sa sous-liste."],
                  ["  <li>HTML et CSS</li>"],
                  ["</ul>"],
                  ["<p>Inscription <strong>obligatoire</strong> avant jeudi.</p>", "strong : information importante."],
                ],
                { language: H, showPreview: true },
              ),
            ],
            commonErrors: [
              commonError("Choisir un titre pour sa taille", "<h4>Bienvenue sur mon site</h4>", "<h1>Bienvenue sur mon site</h1>", "Le niveau d'un titre exprime son rang dans le plan. Pour changer la taille, on utilise CSS."),
              commonError("Mettre une sous-liste hors d'un li", "<ul>\n  <li>Langages</li>\n  <ul>\n    <li>Python</li>\n  </ul>\n</ul>", "<ul>\n  <li>Langages\n    <ul>\n      <li>Python</li>\n    </ul>\n  </li>\n</ul>", "Un ul ne peut contenir que des li : la sous-liste doit être placée dans le li qu'elle détaille."),
            ],
            solvedExercises: [
              solved("ul ou ol ?", "Quelle liste utiliser pour : (a) les ingrédients d'une recette, (b) les étapes de la recette, (c) le classement d'un concours ?", "(a) ul  (b) ol  (c) ol", "On utilise ol dès que l'ordre a un sens (étapes, rang)."),
              solved("Construire un plan", "Écrivez les titres d'une page « Guide de l'étudiant » avec deux parties (Inscription, Examens), la partie Examens ayant deux sous-parties (Calendrier, Règlement).", "<h1>Guide de l'étudiant</h1>\n<h2>Inscription</h2>\n<h2>Examens</h2>\n<h3>Calendrier</h3>\n<h3>Règlement</h3>", "Un h1 pour la page, des h2 pour les parties, des h3 pour les sous-parties : aucun niveau n'est sauté."),
            ],
            td: { title: "TD 3 — Hiérarchie et listes", instructions: "Respectez la hiérarchie des titres et la structure des listes demandées.", exerciseSlugs: ["html-recette", "html-liste-imbriquee"] },
            interrogation: interrogation("html-textes-interrogation", "Interrogation — Titres et listes", [
              qcm("Combien de h1 recommande-t-on par page ?", ["Aucun", "Un seul", "Deux", "Autant que de sections"], 1),
              qcm("Quelle liste pour les étapes d'une installation ?", ["ul", "ol", "li", "dl"], 1),
              qcm("Que peut contenir directement un ul ?", ["du texte", "des li uniquement", "des p", "des h2"], 1),
              vraiFaux("strong sert à mettre un mot important en valeur.", true),
            ], 8),
            evaluation: chapterEvaluation("html-textes-evaluation", "Évaluation — Titres, paragraphes et listes", [
              qcm("Sous un h2, quel est le titre suivant dans la hiérarchie ?", ["h1", "h3", "h4", "h6"], 1),
              qcm("Pourquoi respecter la hiérarchie des titres ?", ["Pour la taille du texte", "Pour le plan de la page et l'accessibilité", "Pour la vitesse", "Ce n'est pas utile"], 1),
              qcm("Quel élément pour un retour à la ligne dans une adresse ?", ["<p>", "<br>", "<hr>", "<li>"], 1),
              qcm("Où placer une sous-liste ?", ["Directement dans ul", "Dans un li", "Après </ul>", "Dans head"], 1),
              qcm("Quel attribut fait commencer une liste ol au numéro 5 ?", ["begin=\"5\"", "start=\"5\"", "first=\"5\"", "value=\"5\""], 1),
              vraiFaux("em et strong servent uniquement à la décoration.", false),
              qcm("Quel élément pour chaque élément d'une liste ?", ["<item>", "<li>", "<el>", "<ul>"], 1),
            ]),
          },
        }),
        // ===============================================================
        lesson({
          slug: "html-liens-images",
          title: "Liens et images",
          durationMinutes: 90,
          objectives: [
            "Créer des liens vers d'autres sites, d'autres pages et des sections.",
            "Distinguer chemins absolus et relatifs.",
            "Insérer des images accessibles avec un texte alternatif.",
          ],
          prerequisites: ["Chapitre 3 — Titres, paragraphes et listes."],
          content: `
            ## 1. Les liens : l'élément a

            Les liens (hyperliens) font du web une « toile ». On les crée avec l'élément **a** (ancre) et son attribut **href** :

            ~~~html
            <a href="https://developer.mozilla.org/fr/">Documentation MDN</a>
            ~~~

            Le **texte du lien** doit indiquer clairement la destination : « Télécharger le règlement des examens » plutôt que « cliquez ici ». C'est essentiel pour l'accessibilité : les lecteurs d'écran peuvent lister tous les liens d'une page.

            ## 2. Chemins absolus et relatifs

            | Type | Exemple | Quand l'utiliser |
            |---|---|---|
            | URL absolue | https://www.exemple.cd/cours.html | vers un autre site |
            | chemin relatif | contact.html | page du même dossier |
            | chemin relatif | cours/python.html | page d'un sous-dossier |
            | chemin relatif | ../index.html | page du dossier parent |
            | ancre | #examens | section de la même page (élément ayant id="examens") |

            Les chemins relatifs fonctionnent encore si le site est déplacé vers une autre adresse.

            Autres liens utiles : **mailto:adresse@exemple.cd** ouvre la messagerie, **tel:+243…** lance un appel sur téléphone.

            ## 3. Ouvrir dans un nouvel onglet

            **target="_blank"** ouvre le lien dans un nouvel onglet. À utiliser avec modération (l'utilisateur perd le bouton « Précédent ») et en ajoutant **rel="noopener"**, qui empêche la page ouverte de contrôler la vôtre (protection de sécurité).

            ## 4. Les images : l'élément img

            ~~~html
            <img src="images/campus.jpg" alt="Bâtiment principal du campus de l'UPL" width="600" height="400">
            ~~~

            - **src** : chemin de l'image (relatif ou absolu).
            - **alt** : **texte alternatif**, lu par les lecteurs d'écran et affiché si l'image ne se charge pas. Il est **obligatoire**. Pour une image purement décorative, on écrit **alt=""** (vide) afin qu'elle soit ignorée.
            - **width** et **height** : dimensions en pixels ; les indiquer évite que la page « saute » pendant le chargement.

            img est un élément **vide** : pas de balise fermante.

            ## 5. Formats d'image

            | Format | Usage |
            |---|---|
            | JPEG (.jpg) | photographies |
            | PNG (.png) | logos, captures avec transparence |
            | SVG (.svg) | icônes et schémas vectoriels (nets à toute taille) |
            | WebP (.webp) | photos et images légères pour le web |

            Une image trop lourde ralentit la page, surtout sur une connexion mobile : redimensionnez et compressez vos images avant de les publier.

            ## 6. Une image cliquable

            On peut placer une image dans un lien : le texte alternatif décrit alors la **destination** du lien.

            ~~~html
            <a href="index.html"><img src="logo.png" alt="Accueil d'UPL Code Academy"></a>
            ~~~

            ## 7. Bonnes pratiques pour les liens et les images

            - Le texte d'un lien doit annoncer sa destination : « Consulter le programme de L1 » plutôt que « cliquez ici ». Un lecteur d'écran peut lister tous les liens d'une page hors de leur contexte.
            - Une image **décorative** reçoit un **alt** vide (**alt=""**) : le lecteur d'écran l'ignore. Une image **informative** reçoit une description de ce qu'elle apporte, pas de son apparence.
            - Préciser **width** et **height** sur une image réserve sa place avant son chargement et évite que le texte « saute » pendant l'affichage.
            - Un nom de fichier sans espace ni accent (**photo-campus.jpg**) évite les liens cassés sur les serveurs, qui distinguent souvent les majuscules des minuscules.
          `,
          examples: [
            example(H, "Liens et image accessible", `
              <!DOCTYPE html>
              <html lang="fr">
              <head>
                <meta charset="utf-8">
                <title>Liens et images</title>
              </head>
              <body>
                <h1>Ressources</h1>
                <p><a href="#contact">Aller à la section Contact</a></p>
                <p><a href="https://developer.mozilla.org/fr/docs/Web/HTML" target="_blank" rel="noopener">Documentation HTML de MDN</a></p>
                <img src="https://upload.wikimedia.org/wikipedia/commons/6/61/HTML5_logo_and_wordmark.svg" alt="Logo HTML5" width="120" height="120">
                <h2 id="contact">Contact</h2>
                <p><a href="mailto:contact@exemple.cd">Écrire au club informatique</a></p>
              </body>
              </html>
            `),
          ],
          summary: [
            "a + href crée un lien ; son texte doit décrire la destination.",
            "Chemin absolu vers un autre site ; chemin relatif dans son propre site ; #id vers une section.",
            "target=\"_blank\" s'accompagne de rel=\"noopener\".",
            "img a besoin de src et d'un alt pertinent (vide si décorative) ; c'est un élément vide.",
          ],
          exerciseSlugs: ["html-image-alt"],
          pedagogy: {
            competences: ["Créer des liens absolus, relatifs et internes", "Insérer des images accessibles", "Choisir un format d'image adapté"],
            definitions: [
              { term: "Hyperlien", definition: "Élément **a** qui permet d'aller vers une autre ressource indiquée par son attribut **href**." },
              { term: "Chemin relatif", definition: "Adresse exprimée à partir de l'emplacement de la page courante (ex. cours/python.html)." },
              { term: "URL absolue", definition: "Adresse complète, avec protocole et nom de domaine (ex. https://www.exemple.cd/)." },
              { term: "Texte alternatif (alt)", definition: "Description textuelle d'une image, lue par les lecteurs d'écran et affichée si l'image est absente." },
            ],
            commentedAlgorithms: [
              annotated(
                "Menu de navigation d'un petit site",
                [
                  ["<nav>", "nav regroupe les liens de navigation principaux."],
                  ["  <a href=\"index.html\">Accueil</a>", "Chemin relatif : page du même dossier."],
                  ["  <a href=\"cours/html.html\">Cours HTML</a>", "Chemin relatif vers un sous-dossier."],
                  ["  <a href=\"#horaires\">Horaires</a>", "Ancre : section de cette page ayant id=\"horaires\"."],
                  ["  <a href=\"https://developer.mozilla.org/fr/\" target=\"_blank\" rel=\"noopener\">MDN</a>", "Site externe ouvert dans un nouvel onglet, protégé par rel=\"noopener\"."],
                  ["</nav>"],
                  ["<img src=\"https://upload.wikimedia.org/wikipedia/commons/6/61/HTML5_logo_and_wordmark.svg\" alt=\"Logo HTML5\" width=\"80\" height=\"80\">", "Image : src, alt descriptif, dimensions."],
                  ["<h2 id=\"horaires\">Horaires</h2>", "Cible de l'ancre #horaires."],
                  ["<p>Du lundi au vendredi, de 8 h à 16 h.</p>"],
                ],
                { language: H, showPreview: true },
              ),
            ],
            commonErrors: [
              commonError("Oublier le texte alternatif", "<img src=\"campus.jpg\">", "<img src=\"campus.jpg\" alt=\"Entrée principale du campus\">", "Sans alt, un lecteur d'écran lit le nom du fichier, ou rien. Le texte alternatif est obligatoire."),
              commonError("Écrire « cliquez ici »", "<a href=\"reglement.pdf\">Cliquez ici</a> pour le règlement.", "<a href=\"reglement.pdf\">Télécharger le règlement des examens (PDF)</a>", "Le texte d'un lien doit avoir du sens hors contexte : les lecteurs d'écran listent les liens sans le texte qui les entoure."),
            ],
            solvedExercises: [
              solved("Écrire des chemins", "La page actuelle est **site/cours/index.html**. Écrivez les chemins relatifs vers (a) site/cours/python.html, (b) site/index.html, (c) site/images/logo.png.", "(a) python.html\n(b) ../index.html\n(c) ../images/logo.png", "« .. » remonte d'un dossier ; un nom seul désigne un fichier du dossier courant."),
              solved("Rédiger des textes alternatifs", "Proposez un alt pour : (a) la photo d'un étudiant devant un ordinateur, (b) un trait décoratif, (c) un logo qui renvoie à l'accueil.", "(a) alt=\"Étudiant programmant sur un ordinateur portable\"\n(b) alt=\"\"\n(c) alt=\"Accueil d'UPL Code Academy\"", "Une image décorative reçoit un alt vide ; une image cliquable décrit la destination du lien."),
            ],
            td: { title: "TD 4 — Navigation et images", instructions: "Vérifiez chaque lien et chaque image dans l'aperçu avant de soumettre.", exerciseSlugs: ["html-menu-navigation", "html-ancre-section"] },
            project: {
              title: "Page de présentation du club informatique",
              context: "Le club informatique de l'université veut une page de présentation simple, accessible et bien structurée.",
              steps: [
                "Écrire le squelette complet (langue, encodage, titre).",
                "Ajouter un titre principal, une présentation et la liste des activités.",
                "Ajouter un menu de liens et une image avec un texte alternatif.",
                "Vérifier la hiérarchie des titres et l'accessibilité, puis soumettre.",
              ],
              deliverables: ["Une page index.html complète validée par les tests automatiques."],
              exerciseSlug: "html-projet-club",
            },
            interrogation: interrogation("html-liens-interrogation", "Interrogation — Liens et images", [
              qcm("Quel attribut indique la destination d'un lien ?", ["src", "href", "alt", "link"], 1),
              qcm("Quel chemin désigne une page du dossier parent ?", ["./index.html", "../index.html", "/index.html", "#index"], 1),
              qcm("Quel alt pour une image décorative ?", ["alt=\"image\"", "alt=\"\"", "pas d'alt", "alt=\"décoration\""], 1),
              vraiFaux("img a une balise fermante </img>.", false),
            ], 8),
            evaluation: chapterEvaluation("html-liens-evaluation", "Évaluation — Liens et images", [
              qcm("Comment lier la section id=\"examens\" de la même page ?", ["href=\"examens\"", "href=\"#examens\"", "href=\"/examens\"", "src=\"#examens\""], 1),
              qcm("Pourquoi ajouter rel=\"noopener\" à un lien target=\"_blank\" ?", ["Pour la couleur", "Par sécurité", "Pour le référencement", "Ce n'est jamais utile"], 1),
              qcm("Quel format pour un logo vectoriel net à toute taille ?", ["JPEG", "SVG", "BMP", "GIF"], 1),
              qcm("Quel est le meilleur texte de lien ?", ["Cliquez ici", "Lien", "Consulter le calendrier des examens", "Ici"], 2),
              qcm("À quoi servent width et height sur une image ?", ["À compresser l'image", "À réserver la place et éviter que la page saute", "À changer le format", "À rien"], 1),
              vraiFaux("Un chemin relatif continue de fonctionner si tout le site change d'adresse.", true),
              qcm("Que lit un lecteur d'écran pour une image ?", ["Son nom de fichier uniquement", "Son texte alternatif", "Sa taille", "Rien"], 1),
            ]),
          },
        }),
      ],
    },
  ],
};
