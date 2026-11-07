import { annotated, chapterEvaluation, commonError, example, interrogation, lesson, qcm, solved, vraiFaux } from "../helpers";
import type { Course } from "../types";

const C = "css" as const;

/** Parcours CSS. Niveau 1 rédigé ; niveaux 2 à 4 au programme (voir src/content/levels). */
export const css: Course = {
  slug: "css",
  code: "Parcours CSS",
  language: "css",
  category: "web",
  title: "CSS",
  tagline: "Mettre en forme et mettre en page le web.",
  description:
    "CSS (Cascading Style Sheets) décrit l'apparence des pages HTML : couleurs, typographie, espacements, mise en page, adaptation aux téléphones, animations. Ce parcours part des règles de base et mène jusqu'aux mises en page professionnelles et à l'architecture des feuilles de style.",
  level: "debutant",
  prerequisites: ["Parcours HTML, niveau 1."],
  objectives: [
    "Écrire des règles CSS et cibler précisément les éléments.",
    "Maîtriser couleurs, typographie et modèle de boîte.",
    "Construire des mises en page adaptées à tous les écrans.",
    "Organiser des feuilles de style maintenables.",
  ],
  durationHours: 30,
  status: "publie",
  levels: [],
  modules: [
    {
      slug: "fondamentaux-css",
      title: "Fondamentaux du CSS",
      lessons: [
        // ===============================================================
        lesson({
          slug: "css-introduction-selecteurs",
          title: "Introduction au CSS et sélecteurs",
          durationMinutes: 90,
          objectives: [
            "Expliquer le rôle du CSS et la séparation contenu / présentation.",
            "Écrire une règle CSS : sélecteur, propriété, valeur.",
            "Relier une feuille de style à une page.",
            "Cibler des éléments par type, par classe et par identifiant.",
          ],
          prerequisites: ["Parcours HTML — chapitres 1 à 3."],
          content: `
            ## 1. Séparer le contenu et la présentation

            HTML dit **ce qu'est** le contenu (un titre, une liste) ; CSS dit **à quoi il ressemble** (bleu, centré, en gros caractères). Cette séparation a trois avantages :

            - une seule feuille de style peut habiller **tout un site** : changer une couleur se fait en une ligne ;
            - le HTML reste lisible et sémantique ;
            - on peut proposer plusieurs présentations du même contenu (écran, téléphone, impression).

            ## 2. Anatomie d'une règle

            ~~~css
            h1 {
              color: navy;
              text-align: center;
            }
            ~~~

            - **h1** est le **sélecteur** : il désigne les éléments concernés.
            - Entre accolades se trouvent les **déclarations**, chacune sous la forme **propriété: valeur;**.
            - **color** est une **propriété**, **navy** sa **valeur**. Chaque déclaration se termine par un **point-virgule**.

            Les commentaires CSS s'écrivent **/* ainsi */**.

            ## 3. Relier le CSS au HTML

            La méthode recommandée est une **feuille de style externe**, fichier **style.css**, reliée dans **head** :

            ~~~html
            <link rel="stylesheet" href="style.css">
            ~~~

            Deux autres possibilités existent : un élément **style** dans head (pratique pour un essai), et l'attribut **style** sur un élément (à éviter : il mélange contenu et présentation). Dans UPL IDE, les projets web contiennent déjà **index.html** et **style.css** reliés.

            ## 4. Les sélecteurs de base

            | Sélecteur | Exemple | Cible |
            |---|---|---|
            | type | p | tous les paragraphes |
            | classe | .important | tous les éléments ayant class="important" |
            | identifiant | #menu | l'unique élément ayant id="menu" |
            | descendant | nav a | les liens situés dans un nav |
            | groupe | h1, h2 | les h1 et les h2 |
            | universel | * | tous les éléments |

            Une **classe** peut être utilisée sur plusieurs éléments, et un élément peut avoir plusieurs classes : **class="carte vedette"**. Un **identifiant** est unique dans la page. En pratique, on stylise surtout avec des **classes**, réutilisables.

            ## 5. La cascade et la spécificité

            Quand plusieurs règles s'appliquent à un même élément et se contredisent, le navigateur choisit :

            1. la règle la plus **spécifique** : un identifiant l'emporte sur une classe, qui l'emporte sur un type ;
            2. à spécificité égale, la règle écrite **en dernier**.

            ~~~css
            p { color: black; }
            .alerte { color: red; }   /* un <p class="alerte"> sera rouge */
            ~~~

            ## 6. L'héritage

            Certaines propriétés, comme **color** et **font-family**, sont **héritées** : définies sur body, elles s'appliquent à tous les éléments qu'il contient, sauf s'ils en redéfinissent une autre valeur. D'autres, comme **border** ou **margin**, ne le sont pas.

            ## 7. Les outils de développement

            Ouvrez les outils du navigateur (**F12**), puis sélectionnez un élément dans l'onglet **Éléments**. Le panneau **Styles** affiche :
            - toutes les règles qui s'appliquent à cet élément, de la plus spécifique à la moins spécifique ;
            - les déclarations **barrées**, qui ont perdu la cascade ;
            - le fichier et la ligne d'où vient chaque règle.

            C'est l'outil indispensable pour comprendre pourquoi une règle « ne marche pas ». Dans la grande majorité des cas, c'est l'une de ces trois raisons :
            - le sélecteur ne cible pas l'élément voulu ;
            - une règle plus spécifique l'emporte ;
            - la propriété est mal orthographiée et donc ignorée.
          `,
          examples: [
            example(C, "Sélecteurs de type, de classe et d'identifiant", `
              <!DOCTYPE html>
              <html lang="fr">
              <head>
                <meta charset="utf-8">
                <title>Sélecteurs</title>
                <style>
                  body { font-family: Arial, sans-serif; }
                  h1 { color: navy; }
                  .important { color: red; font-weight: bold; }
                  #pied { color: gray; }
                </style>
              </head>
              <body>
                <h1>Annonces du club</h1>
                <p>Réunion vendredi à 14 h.</p>
                <p class="important">Inscription obligatoire avant jeudi.</p>
                <p id="pied">Club informatique de l'UPL</p>
              </body>
              </html>
            `, { explanation: "Dans un vrai projet, les règles seraient dans style.css." }),
          ],
          summary: [
            "HTML structure le contenu, CSS le présente.",
            "Une règle = sélecteur { propriété: valeur; }.",
            "On relie une feuille externe avec <link rel=\"stylesheet\" href=\"style.css\">.",
            "Sélecteurs : type (p), classe (.nom), identifiant (#nom), descendant (nav a), groupe (h1, h2).",
            "En cas de conflit : la règle la plus spécifique, puis la dernière écrite.",
          ],
          exerciseSlugs: ["css-titre-couleur"],
          pedagogy: {
            competences: ["Écrire des règles CSS", "Relier une feuille de style", "Choisir le bon sélecteur", "Prévoir le résultat de la cascade"],
            definitions: [
              { term: "Règle CSS", definition: "Association d'un sélecteur et d'un bloc de déclarations." },
              { term: "Sélecteur", definition: "Motif qui désigne les éléments auxquels s'appliquent les déclarations." },
              { term: "Déclaration", definition: "Couple **propriété: valeur;** qui fixe une caractéristique d'affichage." },
              { term: "Classe", definition: "Attribut class réutilisable sur plusieurs éléments, ciblé en CSS par **.nom**." },
              { term: "Spécificité", definition: "Poids d'un sélecteur qui départage les règles en conflit (identifiant > classe > type)." },
            ],
            commentedAlgorithms: [
              annotated(
                "Une feuille de style commentée",
                [
                  ["<style>", "Dans un projet réel, ce contenu irait dans style.css."],
                  ["  body {", "Sélecteur de type : l'élément body."],
                  ["    font-family: Georgia, serif;", "Police héritée par tous les éléments de la page."],
                  ["  }"],
                  ["  .carte {", "Sélecteur de classe : tous les éléments class=\"carte\"."],
                  ["    border: 2px solid #1d5fe0;", "Bordure de 2 pixels, pleine, bleue."],
                  ["    padding: 12px;", "Espace intérieur entre la bordure et le texte."],
                  ["  }"],
                  ["  #titre {", "Sélecteur d'identifiant : l'élément unique id=\"titre\"."],
                  ["    color: #0a1a3a;", "Couleur du texte, en hexadécimal."],
                  ["  }"],
                  ["</style>"],
                  ["<h1 id=\"titre\">Nos formations</h1>"],
                  ["<p class=\"carte\">Algorithmique</p>", "Même classe sur deux éléments : même style."],
                  ["<p class=\"carte\">Python</p>"],
                ],
                { language: C, showPreview: true },
              ),
            ],
            commonErrors: [
              commonError("Oublier le point d'une classe", "important { color: red; }", ".important { color: red; }", "Sans le point, le sélecteur cherche un élément nommé « important », qui n'existe pas en HTML."),
              commonError("Oublier un point-virgule", "h1 {\n  color: navy\n  font-size: 32px;\n}", "h1 {\n  color: navy;\n  font-size: 32px;\n}", "Sans point-virgule, « navy font-size: 32px » est lu comme une seule valeur invalide : les deux déclarations sont ignorées."),
            ],
            solvedExercises: [
              solved("Prévoir la couleur", "Avec p { color: black; } puis .note { color: green; } puis #n1 { color: blue; }, de quelle couleur est <p class=\"note\" id=\"n1\"> ?", "Bleu.", "L'identifiant est plus spécifique que la classe, elle-même plus spécifique que le type."),
              solved("Écrire des sélecteurs", "Écrivez le sélecteur qui cible : (a) tous les liens du menu nav, (b) les h2 et h3, (c) les éléments de classe prix.", "(a) nav a\n(b) h2, h3\n(c) .prix", "Espace = descendant ; virgule = groupe ; point = classe."),
            ],
            td: { title: "TD 1 — Sélecteurs et règles", instructions: "Écrivez vos règles dans style.css ; la page index.html est déjà reliée. La correction lit vos règles CSS.", exerciseSlugs: ["css-classe-alerte", "css-menu-liens"] },
            interrogation: interrogation("css-introduction-interrogation", "Interrogation — Sélecteurs", [
              qcm("Quel sélecteur cible class=\"prix\" ?", ["prix", "#prix", ".prix", "*prix"], 2),
              qcm("Quel sélecteur cible id=\"menu\" ?", [".menu", "#menu", "menu", "@menu"], 1),
              qcm("Quelle règle l'emporte à spécificité égale ?", ["la première écrite", "la dernière écrite", "la plus courte", "aucune"], 1),
              vraiFaux("La propriété color est héritée par les éléments enfants.", true),
            ], 8),
            evaluation: chapterEvaluation("css-introduction-evaluation", "Évaluation — Introduction au CSS", [
              qcm("Dans h1 { color: navy; }, quelle est la propriété ?", ["h1", "color", "navy", "{ }"], 1),
              qcm("Comment relier style.css à une page ?", ["<style src=\"style.css\">", "<link rel=\"stylesheet\" href=\"style.css\">", "<css>style.css</css>", "<script src=\"style.css\">"], 1),
              qcm("Que cible nav a ?", ["les nav et les a", "les liens situés dans un nav", "le premier lien", "les nav dans un lien"], 1),
              qcm("Quel sélecteur est le plus spécifique ?", ["p", ".texte", "#intro", "*"], 2),
              vraiFaux("Un même identifiant peut être utilisé sur plusieurs éléments d'une page.", false),
              qcm("Pourquoi éviter l'attribut style dans le HTML ?", ["Il est interdit", "Il mélange contenu et présentation", "Il est plus lent", "Il ne fonctionne pas"], 1),
              qcm("Comment écrit-on un commentaire CSS ?", ["<!-- -->", "// ", "/* */", "#"], 2),
            ]),
          },
        }),
        // ===============================================================
        lesson({
          slug: "css-couleurs-textes",
          title: "Couleurs, textes et polices",
          durationMinutes: 90,
          objectives: [
            "Exprimer des couleurs (noms, hexadécimal, rgb) et garantir un bon contraste.",
            "Régler la police, la taille, la graisse et l'alignement du texte.",
            "Choisir l'unité adaptée : px, em, rem, %.",
          ],
          prerequisites: ["Chapitre 1 — Introduction au CSS et sélecteurs."],
          content: `
            ## 1. Les couleurs

            Deux propriétés principales : **color** (couleur du texte) et **background-color** (couleur du fond). Une couleur peut s'écrire :

            | Notation | Exemple | Remarque |
            |---|---|---|
            | nom | navy, white, tomato | 140 noms prédéfinis |
            | hexadécimal | #1d5fe0 | rouge, vert, bleu de 00 à ff |
            | hexadécimal court | #fff | équivaut à #ffffff |
            | rgb | rgb(29, 95, 224) | valeurs de 0 à 255 |
            | rgb avec transparence | rgb(29 95 224 / 50%) | opacité de 50 % |

            ## 2. Le contraste, une question d'accessibilité

            Un texte gris clair sur fond blanc est difficile à lire, surtout en plein soleil sur un téléphone ou pour une personne malvoyante. Les recommandations d'accessibilité (WCAG) demandent un **rapport de contraste d'au moins 4,5 : 1** pour le texte courant. Des outils comme le vérificateur de contraste des outils de développement du navigateur permettent de le mesurer.

            ## 3. Les polices

            ~~~css
            body {
              font-family: "Segoe UI", Arial, sans-serif;
            }
            ~~~

            **font-family** reçoit une **liste** de polices : le navigateur utilise la première disponible. On termine toujours par une **famille générique** (**sans-serif**, **serif**, **monospace**). Les noms contenant des espaces s'écrivent entre guillemets.

            Autres propriétés : **font-size** (taille), **font-weight** (graisse : **normal**, **bold** ou un nombre de 100 à 900), **font-style** (**italic**), **line-height** (hauteur de ligne ; 1.5 améliore la lisibilité).

            ## 4. Les unités

            | Unité | Signification | Usage |
            |---|---|---|
            | px | pixel | bordures, petits détails |
            | rem | relatif à la taille de police de la racine (16 px par défaut) | tailles de texte et espacements |
            | em | relatif à la taille de police de l'élément | espacements proportionnels au texte |
            | % | pourcentage de l'élément parent | largeurs |

            Avec **rem**, si l'utilisateur agrandit la police de son navigateur, toute la page suit : c'est plus accessible que des tailles fixes en px.

            ## 5. L'alignement et la décoration du texte

            - **text-align** : **left**, **center**, **right**, **justify** ;
            - **text-decoration** : **none** (retirer le soulignement d'un lien), **underline** ;
            - **text-transform** : **uppercase** (majuscules), **capitalize** ;
            - **letter-spacing** : espacement entre les lettres.

            ## 6. Styler les liens

            Les liens ont plusieurs **états**, ciblés par des **pseudo-classes** :

            ~~~css
            a { color: #1d5fe0; }
            a:hover { text-decoration: underline; }   /* survol de la souris */
            a:focus { outline: 2px solid orange; }    /* navigation au clavier */
            ~~~

            Ne supprimez jamais l'indicateur de focus sans le remplacer : il permet aux personnes qui naviguent au clavier de savoir où elles se trouvent.

            ## 7. Organiser ses couleurs et ses textes

            Sur un vrai site, on limite volontairement le nombre de couleurs :
            - une couleur **principale** (boutons, liens) ;
            - une couleur **d'accent** ;
            - des **gris** pour le texte et les fonds.

            On fixe la police et la couleur du texte une seule fois sur **body** : grâce à l'héritage, tous les éléments en profitent. On ne redéfinit ensuite que les exceptions (titres, liens).

            Cette discipline rend la feuille de style courte, cohérente et facile à modifier : changer la couleur principale ne demande alors qu'une modification. Au niveau 3, les **variables CSS** permettront de nommer ces couleurs.
          `,
          examples: [
            example(C, "Typographie lisible", `
              <!DOCTYPE html>
              <html lang="fr">
              <head>
                <meta charset="utf-8">
                <title>Typographie</title>
                <style>
                  body { font-family: Georgia, serif; font-size: 1.125rem; line-height: 1.6; color: #222222; background-color: #fafafa; }
                  h1 { font-family: Arial, sans-serif; color: #1d5fe0; text-align: center; text-transform: uppercase; letter-spacing: 2px; }
                  a { color: #0a1a3a; }
                  a:hover { color: #1d5fe0; }
                </style>
              </head>
              <body>
                <h1>Le CSS</h1>
                <p>Un texte bien contrasté, avec une hauteur de ligne de 1,6, se lit beaucoup plus facilement, en particulier sur téléphone.</p>
                <p><a href="#">Un lien qui change de couleur au survol</a></p>
              </body>
              </html>
            `),
          ],
          summary: [
            "color pour le texte, background-color pour le fond ; noms, hexadécimal ou rgb.",
            "Un contraste suffisant (4,5 : 1) est une exigence d'accessibilité.",
            "font-family se termine par une famille générique ; line-height de 1,5 améliore la lecture.",
            "rem pour les tailles de texte : la page suit le réglage de l'utilisateur.",
            "Les pseudo-classes :hover et :focus stylisent les états des liens.",
          ],
          exerciseSlugs: ["css-typographie-body"],
          pedagogy: {
            competences: ["Exprimer une couleur et vérifier un contraste", "Configurer la typographie", "Choisir une unité adaptée"],
            definitions: [
              { term: "Hexadécimal", definition: "Notation #rrggbb où chaque paire (00 à ff) donne la quantité de rouge, de vert et de bleu." },
              { term: "Famille générique", definition: "Catégorie de police (serif, sans-serif, monospace) utilisée si aucune police listée n'est disponible." },
              { term: "rem", definition: "Unité relative à la taille de police de l'élément racine (16 px par défaut)." },
              { term: "Pseudo-classe", definition: "Mot-clé ajouté au sélecteur (**:hover**, **:focus**) qui cible un état particulier d'un élément." },
              { term: "Contraste", definition: "Rapport de luminosité entre le texte et son fond ; au moins 4,5 : 1 pour un texte courant." },
            ],
            commentedAlgorithms: [
              annotated(
                "Mise en forme d'un article",
                [
                  ["<style>"],
                  ["  body {", "Réglages de base hérités par tout le document."],
                  ["    font-family: \"Segoe UI\", Arial, sans-serif;", "Liste de polices terminée par une famille générique."],
                  ["    font-size: 1rem;", "16 px par défaut, ajustable par l'utilisateur."],
                  ["    line-height: 1.5;", "Hauteur de ligne : 1,5 fois la taille du texte."],
                  ["    color: #1f2937;", "Gris très foncé : bon contraste sur fond blanc."],
                  ["  }"],
                  ["  h1 {"],
                  ["    font-size: 2rem;", "Deux fois la taille de base."],
                  ["    color: #1d5fe0;", "Le bleu principal du site, réservé aux titres."],
                  ["  }"],
                  ["  .chapeau {", "Classe pour le résumé de l'article."],
                  ["    font-style: italic;", "Italique : distingue le résumé du texte courant."],
                  ["    font-weight: 600;", "Graisse intermédiaire (semi-gras)."],
                  ["  }"],
                  ["</style>"],
                  ["<h1>Rentrée académique</h1>"],
                  ["<p class=\"chapeau\">Les cours reprennent le lundi 6 octobre.</p>"],
                  ["<p>Les étudiants sont invités à consulter leur emploi du temps.</p>"],
                ],
                { language: C, showPreview: true },
              ),
            ],
            commonErrors: [
              commonError("Une police sans famille générique", "body { font-family: Calibri; }", "body { font-family: Calibri, Arial, sans-serif; }", "Si Calibri n'est pas installée (téléphones Android, Linux), le navigateur choisit une police par défaut imprévisible."),
              commonError("Un contraste insuffisant", "p { color: #cccccc; background-color: #ffffff; }", "p { color: #374151; background-color: #ffffff; }", "Le gris clair sur blanc a un contraste d'environ 1,6 : 1, illisible pour beaucoup d'utilisateurs."),
            ],
            solvedExercises: [
              solved("Convertir des couleurs", "Écrivez en hexadécimal : (a) blanc, (b) noir, (c) rouge pur, (d) rgb(29, 95, 224).", "(a) #ffffff\n(b) #000000\n(c) #ff0000\n(d) #1d5fe0", "29 = 1d, 95 = 5f, 224 = e0 en base 16."),
              solved("Calculer des tailles", "La racine a une taille de 16 px. Que valent 1.5rem et 0.75rem en pixels ?", "1.5rem = 24 px ; 0.75rem = 12 px", "Il suffit de multiplier par 16."),
            ],
            td: { title: "TD 2 — Couleurs et typographie", instructions: "Écrivez exactement les valeurs demandées : la correction compare les valeurs de vos déclarations.", exerciseSlugs: ["css-bandeau-couleurs", "css-liens-etats"] },
            interrogation: interrogation("css-couleurs-interrogation", "Interrogation — Couleurs et textes", [
              qcm("Quelle propriété change la couleur du fond ?", ["color", "background-color", "font-color", "bg"], 1),
              qcm("Que vaut #fff ?", ["noir", "blanc", "rouge", "gris"], 1),
              qcm("Par quoi doit se terminer font-family ?", ["une police installée", "une famille générique", "un point", "une taille"], 1),
              qcm("Combien vaut 2rem si la racine fait 16 px ?", ["16 px", "18 px", "32 px", "2 px"], 2),
            ], 8),
            evaluation: chapterEvaluation("css-couleurs-evaluation", "Évaluation — Couleurs, textes et polices", [
              qcm("Quelle pseudo-classe cible le survol de la souris ?", [":focus", ":hover", ":active", ":visited"], 1),
              qcm("Quelle propriété retire le soulignement d'un lien ?", ["text-style: none", "text-decoration: none", "underline: none", "font-decoration: none"], 1),
              qcm("Quelle valeur de line-height améliore la lecture d'un paragraphe ?", ["0.5", "1.5", "5", "0"], 1),
              qcm("Quel rapport de contraste minimal pour un texte courant ?", ["1 : 1", "2 : 1", "4,5 : 1", "10 : 1"], 2),
              vraiFaux("Supprimer l'indicateur de focus sans le remplacer gêne la navigation au clavier.", true),
              qcm("Pourquoi préférer rem à px pour le texte ?", ["rem est plus rapide", "La page suit le réglage de taille de l'utilisateur", "px n'existe plus", "rem change la police"], 1),
              qcm("Que fait text-transform: uppercase ?", ["Met en gras", "Affiche en majuscules", "Souligne", "Agrandit"], 1),
            ]),
          },
        }),
        // ===============================================================
        lesson({
          slug: "css-modele-boite",
          title: "Le modèle de boîte",
          durationMinutes: 100,
          objectives: [
            "Décrire les quatre zones d'une boîte : contenu, padding, bordure, marge.",
            "Régler largeur, hauteur et box-sizing.",
            "Centrer un bloc horizontalement et espacer les éléments.",
          ],
          prerequisites: ["Chapitre 2 — Couleurs, textes et polices."],
          content: `
            ## 1. Tout élément est une boîte

            Le navigateur dessine chaque élément comme un **rectangle** composé de quatre zones, de l'intérieur vers l'extérieur :

            1. le **contenu** (texte, image) ;
            2. le **padding** (marge intérieure) : espace entre le contenu et la bordure, qui prend la couleur de fond ;
            3. la **bordure** (**border**) ;
            4. la **marge** (**margin**, marge extérieure) : espace transparent qui sépare la boîte de ses voisines.

            ~~~text
            ┌──────────── margin ────────────┐
            │ ┌────────── border ──────────┐ │
            │ │ ┌──────── padding ───────┐ │ │
            │ │ │        contenu         │ │ │
            │ │ └────────────────────────┘ │ │
            │ └────────────────────────────┘ │
            └────────────────────────────────┘
            ~~~

            Les outils de développement du navigateur (clic droit → Inspecter) affichent ce schéma pour l'élément sélectionné.

            ## 2. Padding, border et margin

            ~~~css
            .carte {
              padding: 16px;                 /* les 4 côtés */
              border: 1px solid #dfe5ee;     /* épaisseur, style, couleur */
              margin: 0 0 24px 0;            /* haut, droite, bas, gauche */
            }
            ~~~

            Les raccourcis s'écrivent dans le sens des aiguilles d'une montre : **haut droite bas gauche**. Avec deux valeurs, la première vaut pour haut et bas, la seconde pour droite et gauche. On peut aussi régler un seul côté : **padding-top**, **margin-left**…

            **border-radius** arrondit les coins : **border-radius: 8px**.

            ## 3. Largeur, hauteur et box-sizing

            Par défaut (**box-sizing: content-box**), **width** ne concerne que le contenu : une boîte de width 300px avec 20px de padding et 1px de bordure occupe en réalité 342 px. C'est source d'erreurs. La plupart des projets commencent donc par :

            ~~~css
            * { box-sizing: border-box; }
            ~~~

            Avec **border-box**, width inclut padding et bordure : la boîte occupe exactement 300 px.

            Préférez **max-width** à width pour les blocs de texte : la boîte se réduit sur les petits écrans au lieu de déborder.

            ## 4. Éléments de bloc et éléments en ligne

            - Les éléments **de bloc** (p, h1, div, ul, section) occupent toute la largeur disponible et commencent sur une nouvelle ligne ; width, height et les marges verticales s'y appliquent.
            - Les éléments **en ligne** (a, strong, em, span) s'insèrent dans le texte ; leur largeur et leurs marges verticales sont ignorées.

            La propriété **display** change ce comportement : **display: block**, **display: inline-block** (en ligne mais dimensionnable).

            ## 5. Centrer un bloc

            Pour centrer horizontalement un bloc de largeur fixée, on lui donne des marges latérales automatiques :

            ~~~css
            .conteneur {
              max-width: 720px;
              margin: 0 auto;
            }
            ~~~

            Pour centrer du **texte** à l'intérieur d'un bloc, on utilise **text-align: center** : ce n'est pas la même chose.

            ## 6. La fusion des marges

            Les marges verticales de deux blocs voisins ne s'additionnent pas : elles **fusionnent**, et la plus grande l'emporte. Un paragraphe avec margin-bottom 24px suivi d'un autre avec margin-top 16px sont séparés de 24 px, pas de 40 px.

            ## 7. Déboguer une mise en page

            Quand une boîte n'a pas la taille ou la place attendue, ajoutez temporairement **outline: 1px solid red;** à l'élément concerné. Contrairement à **border**, **outline** ne prend pas de place et ne modifie donc pas les dimensions de la boîte.

            Les outils de développement affichent aussi un schéma du modèle de boîte de l'élément sélectionné, avec les valeurs calculées du contenu, du padding, de la bordure et de la marge.

            Dernier réflexe : vérifiez si **box-sizing: border-box** est appliqué. C'est la cause la plus fréquente d'un écart de quelques pixels entre la largeur demandée et la largeur obtenue.
          `,
          examples: [
            example(C, "Une carte centrée", `
              <!DOCTYPE html>
              <html lang="fr">
              <head>
                <meta charset="utf-8">
                <title>Modèle de boîte</title>
                <style>
                  * { box-sizing: border-box; }
                  body { font-family: Arial, sans-serif; background-color: #eef2f7; }
                  .carte { max-width: 360px; margin: 40px auto; padding: 20px; background-color: white; border: 1px solid #dfe5ee; border-radius: 12px; }
                  .carte h2 { margin: 0 0 8px 0; color: #1d5fe0; }
                </style>
              </head>
              <body>
                <div class="carte">
                  <h2>Parcours HTML</h2>
                  <p>Structurer le contenu des pages web.</p>
                </div>
              </body>
              </html>
            `),
          ],
          summary: [
            "Une boîte = contenu + padding + bordure + marge.",
            "Raccourcis dans l'ordre haut, droite, bas, gauche.",
            "box-sizing: border-box fait inclure padding et bordure dans width.",
            "Les blocs prennent toute la largeur ; les éléments en ligne s'insèrent dans le texte.",
            "margin: 0 auto centre un bloc de largeur limitée ; text-align centre le texte.",
          ],
          exerciseSlugs: ["css-carte-boite"],
          pedagogy: {
            competences: ["Décrire le modèle de boîte", "Régler les espacements", "Centrer un bloc", "Utiliser box-sizing"],
            definitions: [
              { term: "Padding", definition: "Marge intérieure, entre le contenu et la bordure ; elle prend la couleur de fond de l'élément." },
              { term: "Margin", definition: "Marge extérieure, transparente, qui sépare la boîte des éléments voisins." },
              { term: "box-sizing", definition: "Propriété qui indique si width inclut (border-box) ou non (content-box) le padding et la bordure." },
              { term: "Élément de bloc", definition: "Élément qui occupe toute la largeur disponible et commence sur une nouvelle ligne." },
              { term: "Fusion des marges", definition: "Les marges verticales adjacentes de deux blocs se confondent : seule la plus grande est appliquée." },
            ],
            commentedAlgorithms: [
              annotated(
                "Mise en page d'une fiche centrée",
                [
                  ["<style>"],
                  ["  * {", "Sélecteur universel : tous les éléments."],
                  ["    box-sizing: border-box;", "width inclut padding et bordure."],
                  ["  }"],
                  ["  .fiche {"],
                  ["    max-width: 400px;", "Jamais plus de 400 px, moins sur petit écran."],
                  ["    margin: 24px auto;", "24 px en haut et en bas, centrée horizontalement."],
                  ["    padding: 16px 24px;", "16 px en haut et en bas, 24 px à gauche et à droite."],
                  ["    border: 2px solid #1d5fe0;", "Bordure bleue de 2 px."],
                  ["    border-radius: 8px;", "Coins arrondis."],
                  ["  }"],
                  ["  .fiche p {", "Paragraphes situés dans une fiche."],
                  ["    margin: 0 0 12px 0;", "Seulement une marge basse de 12 px."],
                  ["  }"],
                  ["</style>"],
                  ["<div class=\"fiche\">", "div : bloc générique, sans signification particulière."],
                  ["  <p><strong>Nom :</strong> Amani</p>"],
                  ["  <p><strong>Filière :</strong> Informatique</p>"],
                  ["</div>"],
                ],
                { language: C, showPreview: true },
              ),
            ],
            commonErrors: [
              commonError("Centrer un bloc avec text-align", ".conteneur { width: 600px; text-align: center; }", ".conteneur { max-width: 600px; margin: 0 auto; }", "text-align centre le **contenu en ligne** (le texte) à l'intérieur du bloc, pas le bloc lui-même."),
              commonError("Oublier box-sizing et déborder", ".colonne { width: 100%; padding: 20px; }", "* { box-sizing: border-box; }\n.colonne { width: 100%; padding: 20px; }", "En content-box, 100 % + 40 px de padding dépasse la largeur du parent et provoque un défilement horizontal, en particulier sur téléphone."),
            ],
            solvedExercises: [
              solved("Calculer une largeur", "Une boîte a width: 300px, padding: 10px, border: 2px solid. Quelle largeur occupe-t-elle en content-box ? en border-box ?", "content-box : 300 + 2 × 10 + 2 × 2 = 324 px\nborder-box : 300 px", "En border-box, le contenu se réduit à 300 − 24 = 276 px pour que le total reste 300 px."),
              solved("Lire un raccourci", "Que signifie margin: 10px 20px 30px ?", "haut 10px, droite et gauche 20px, bas 30px", "Avec trois valeurs : haut, puis droite et gauche, puis bas."),
            ],
            td: { title: "TD 3 — Boîtes et espacements", instructions: "Utilisez exactement les sélecteurs et les valeurs demandés.", exerciseSlugs: ["css-conteneur-centre", "css-espacements-liste"] },
            project: {
              title: "Carte de profil étudiant",
              context: "Mettre en forme la carte de profil d'un étudiant : centrée, aérée, lisible et adaptée au téléphone.",
              steps: [
                "Ajouter box-sizing: border-box à tous les éléments.",
                "Centrer la carte avec une largeur maximale et des marges automatiques.",
                "Régler padding, bordure arrondie et couleur de fond.",
                "Mettre en forme le titre et le texte, puis vérifier l'aperçu et soumettre.",
              ],
              deliverables: ["Une feuille style.css qui satisfait toutes les vérifications."],
              exerciseSlug: "css-projet-profil",
            },
            interrogation: interrogation("css-boite-interrogation", "Interrogation — Modèle de boîte", [
              qcm("Quelle zone est entre le contenu et la bordure ?", ["margin", "padding", "outline", "width"], 1),
              qcm("Que signifie padding: 10px 20px ?", ["haut/bas 10, gauche/droite 20", "haut 10, bas 20", "gauche 10, droite 20", "tous les côtés 30"], 0),
              qcm("Comment centrer un bloc de largeur limitée ?", ["text-align: center", "margin: 0 auto", "padding: auto", "align: center"], 1),
              vraiFaux("En border-box, width inclut padding et bordure.", true),
            ], 8),
            evaluation: chapterEvaluation("css-boite-evaluation", "Évaluation — Le modèle de boîte", [
              qcm("Quelle est la zone la plus extérieure d'une boîte ?", ["padding", "border", "margin", "contenu"], 2),
              qcm("Quelle largeur occupe width: 200px; padding: 10px; border: 1px solid en content-box ?", ["200 px", "211 px", "222 px", "220 px"], 2),
              qcm("Quel élément est en ligne par défaut ?", ["p", "div", "span", "h2"], 2),
              qcm("Deux paragraphes : margin-bottom 30px puis margin-top 20px. Quel espace les sépare ?", ["50 px", "30 px", "20 px", "10 px"], 1),
              qcm("Pourquoi préférer max-width à width pour un bloc de texte ?", ["max-width est plus rapide", "Le bloc se réduit sur les petits écrans", "width n'existe pas", "Pour la couleur"], 1),
              vraiFaux("Le padding prend la couleur de fond de l'élément.", true),
              qcm("Quelle propriété arrondit les coins ?", ["corner", "border-radius", "round", "radius"], 1),
            ]),
          },
        }),
      ],
    },
  ],
};
