import { qcm, vraiFaux } from "../helpers";
import { levelExam, placement, type LevelPlan } from "./build";

// =====================================================================
// HTML
// =====================================================================
export const htmlLevels: LevelPlan[] = [
  {
    number: 1,
    title: "Niveau 1 — Très débutant : premières pages",
    description: "Comprendre le web, écrire un document HTML complet, structurer du texte avec titres, paragraphes et listes, relier des pages par des liens et insérer des images accessibles.",
    objectives: [
      "Expliquer le rôle du navigateur, du serveur et du HTML.",
      "Écrire un document HTML valide (doctype, head, body, métadonnées).",
      "Structurer un texte avec une hiérarchie de titres et des listes.",
      "Créer des liens et insérer des images avec un texte alternatif.",
    ],
    modules: [{ slug: "premiers-pas", title: "Premiers pas en HTML", lessons: ["html-introduction-web", "html-structure-document", "html-textes-listes", "html-liens-images"] }],
    exam: levelExam("html-examen-niveau-1", "Examen du niveau 1 — Premières pages HTML", [
      qcm("Que signifie HTML ?", ["HyperText Markup Language", "High Tech Modern Language", "HyperTransfer Main Link", "Home Tool Markup Language"], 0),
      qcm("Quelle balise contient le contenu visible de la page ?", ["<head>", "<body>", "<title>", "<meta>"], 1),
      qcm("Quelle ligne doit commencer un document HTML5 ?", ["<html5>", "<!DOCTYPE html>", "<?xml?>", "<doctype=5>"], 1),
      qcm("Combien de <h1> recommande-t-on par page ?", ["Aucun", "Un seul", "Au moins trois", "Un par paragraphe"], 1),
      qcm("Quelle balise crée une liste numérotée ?", ["<ul>", "<ol>", "<li>", "<dl>"], 1),
      qcm("Quel attribut donne la destination d'un lien ?", ["src", "href", "alt", "link"], 1),
      qcm("Quel attribut décrit une image pour un lecteur d'écran ?", ["title", "alt", "name", "desc"], 1),
      vraiFaux("La balise <img> est un élément vide : elle n'a pas de balise fermante.", true),
      qcm("Où place-t-on <meta charset=\"utf-8\"> ?", ["dans <body>", "dans <head>", "après </html>", "dans <title>"], 1),
      qcm("Quel lien mène à l'élément d'id « contact » de la même page ?", ["<a href=\"contact\">", "<a href=\"#contact\">", "<a id=\"contact\">", "<a href=\".contact\">"], 1),
    ]),
  },
  {
    number: 2,
    title: "Niveau 2 — Débutant : structure et formulaires",
    description: "Balises sémantiques de mise en page, tableaux de données, formulaires et médias.",
    objectives: ["Structurer une page avec header, nav, main, section, article et footer.", "Présenter des données dans un tableau accessible.", "Construire un formulaire avec des champs étiquetés et validés."],
    modules: [],
    plannedChapters: ["HTML sémantique (header, nav, main, footer)", "Tableaux de données", "Formulaires et types de champs", "Validation native des formulaires", "Audio, vidéo et iframes"],
  },
  {
    number: 3,
    title: "Niveau 3 — Intermédiaire : accessibilité et qualité",
    description: "Accessibilité (WCAG, ARIA), référencement, validation W3C et bonnes pratiques.",
    objectives: ["Rendre une page accessible au clavier et aux lecteurs d'écran.", "Optimiser le référencement d'une page.", "Valider et corriger un document."],
    modules: [],
    plannedChapters: ["Accessibilité et rôles ARIA", "Référencement (SEO) et métadonnées", "Validation W3C et erreurs courantes", "Images responsives (srcset, picture)"],
  },
  {
    number: 4,
    title: "Niveau 4 — Professionnel : site complet",
    description: "Organisation d'un site multipages, performances, intégration avec CSS et JavaScript, mise en ligne.",
    objectives: ["Organiser un site multipages maintenable.", "Mesurer les performances et l'accessibilité.", "Mettre un site en ligne."],
    modules: [],
    plannedChapters: ["Organisation d'un site multipages", "Performances et Lighthouse", "Mise en ligne d'un site statique", "Projet professionnel"],
  },
];

export const htmlPlacement = placement("html-positionnement", "Test de positionnement — HTML", {
  1: [
    qcm("Quelle balise crée un paragraphe ?", ["<p>", "<para>", "<text>", "<br>"], 0),
    qcm("Quel attribut donne l'adresse d'un lien ?", ["src", "href", "url", "alt"], 1),
    qcm("Quelle balise crée un élément de liste ?", ["<ul>", "<li>", "<list>", "<ol>"], 1),
  ],
  2: [
    qcm("Quelle balise regroupe le contenu principal unique de la page ?", ["<section>", "<main>", "<div>", "<body>"], 1),
    qcm("Quel attribut relie un <label> à son champ ?", ["name", "for", "id", "value"], 1),
    qcm("Quelle balise crée une cellule d'en-tête de tableau ?", ["<td>", "<th>", "<thead>", "<tr>"], 1),
  ],
  3: [
    qcm("À quoi sert l'attribut aria-label ?", ["à styliser", "à donner un nom accessible", "à valider un champ", "à créer un lien"], 1),
    qcm("Quel élément propose plusieurs sources d'image selon l'écran ?", ["<figure>", "<picture>", "<canvas>", "<source> seul"], 1),
    vraiFaux("Un bouton créé avec <div onclick> est aussi accessible au clavier qu'un <button>.", false),
  ],
  4: [
    qcm("Quel outil audite performances et accessibilité d'une page ?", ["Lighthouse", "Git", "npm", "Babel"], 0),
    qcm("Quel attribut retarde le chargement d'une image hors écran ?", ["defer", "loading=\"lazy\"", "async", "preload"], 1),
    qcm("Quelle balise déclare l'URL canonique d'une page ?", ["<meta name=\"canonical\">", "<link rel=\"canonical\">", "<base>", "<a rel=\"canonical\">"], 1),
  ],
});

// =====================================================================
// CSS
// =====================================================================
export const cssLevels: LevelPlan[] = [
  {
    number: 1,
    title: "Niveau 1 — Très débutant : mettre en forme",
    description: "Relier une feuille de style, cibler les éléments avec des sélecteurs, gérer couleurs et textes, comprendre le modèle de boîte.",
    objectives: [
      "Relier une feuille CSS et écrire des règles.",
      "Choisir le bon sélecteur (élément, classe, id, descendant).",
      "Mettre en forme couleurs, polices et textes.",
      "Dimensionner et espacer des boîtes (margin, border, padding).",
    ],
    modules: [{ slug: "fondamentaux-css", title: "Fondamentaux du CSS", lessons: ["css-introduction-selecteurs", "css-couleurs-textes", "css-modele-boite"] }],
    exam: levelExam("css-examen-niveau-1", "Examen du niveau 1 — Fondamentaux du CSS", [
      qcm("Comment relie-t-on une feuille style.css à une page ?", ["<style src=\"style.css\">", "<link rel=\"stylesheet\" href=\"style.css\">", "<css href=\"style.css\">", "<script src=\"style.css\">"], 1),
      qcm("Quel sélecteur cible les éléments de classe « carte » ?", ["#carte", ".carte", "carte", "*carte"], 1),
      qcm("Quel sélecteur est le plus spécifique ?", ["p", ".texte", "#intro", "*"], 2),
      qcm("Que cible « nav a » ?", ["les nav qui sont dans un a", "les a situés dans un nav", "les nav et les a", "le premier a"], 1),
      qcm("Quelle propriété change la couleur du texte ?", ["background-color", "color", "font-color", "text-color"], 1),
      qcm("Quelle propriété met le texte en gras ?", ["font-style: bold", "font-weight: bold", "text-weight: bold", "bold: true"], 1),
      qcm("Dans le modèle de boîte, quel espace est à l'intérieur de la bordure ?", ["margin", "padding", "outline", "gap"], 1),
      qcm("Avec box-sizing: border-box, width inclut…", ["seulement le contenu", "contenu, padding et bordure", "aussi la marge", "rien"], 1),
      vraiFaux("margin: 0 auto centre horizontalement un bloc qui a une largeur définie.", true),
      qcm("Si deux règles de même spécificité se contredisent, laquelle s'applique ?", ["la première écrite", "la dernière écrite", "aucune", "celle avec le plus de propriétés"], 1),
    ]),
  },
  {
    number: 2,
    title: "Niveau 2 — Débutant : mise en page",
    description: "Positionnement, Flexbox, Grid et pages adaptées aux mobiles.",
    objectives: ["Disposer des éléments avec Flexbox et Grid.", "Adapter une page aux écrans avec les media queries."],
    modules: [],
    plannedChapters: ["Affichage et positionnement", "Flexbox", "CSS Grid", "Responsive design et media queries", "Unités relatives (rem, %, vw)"],
  },
  {
    number: 3,
    title: "Niveau 3 — Intermédiaire : interfaces soignées",
    description: "Variables CSS, transitions et animations, pseudo-éléments, thèmes clair et sombre.",
    objectives: ["Construire un thème avec des variables CSS.", "Animer une interface sans nuire à l'accessibilité."],
    modules: [],
    plannedChapters: ["Variables CSS (custom properties)", "Transitions et animations", "Pseudo-classes et pseudo-éléments avancés", "Thèmes clair et sombre"],
  },
  {
    number: 4,
    title: "Niveau 4 — Professionnel : architecture CSS",
    description: "Organisation des feuilles de style, méthodologies, préprocesseurs et frameworks, performances.",
    objectives: ["Organiser le CSS d'un projet réel (BEM, composants).", "Évaluer l'usage d'un framework CSS.", "Optimiser le rendu."],
    modules: [],
    plannedChapters: ["Méthodologie BEM et composants", "Préprocesseurs (Sass)", "Frameworks utilitaires", "Performances du rendu", "Projet professionnel"],
  },
];

export const cssPlacement = placement("css-positionnement", "Test de positionnement — CSS", {
  1: [
    qcm("Quel sélecteur cible l'élément d'id « menu » ?", [".menu", "#menu", "menu", "@menu"], 1),
    qcm("Quelle propriété change la couleur de fond ?", ["color", "background-color", "fill", "bgcolor"], 1),
    qcm("Quelle propriété ajoute de l'espace à l'intérieur de la bordure ?", ["margin", "padding", "spacing", "gap"], 1),
  ],
  2: [
    qcm("Quelle déclaration active Flexbox sur un conteneur ?", ["display: flex", "flex: on", "position: flex", "float: flex"], 0),
    qcm("Quelle règle applique des styles seulement sous 600 px de large ?", ["@media (max-width: 600px)", "@screen 600", "@if width < 600", "@media (min-width: 600px)"], 0),
    qcm("Quelle propriété définit les colonnes d'une grille ?", ["grid-columns", "grid-template-columns", "columns-grid", "grid-cols"], 1),
  ],
  3: [
    qcm("Comment utilise-t-on la variable --principale ?", ["$principale", "var(--principale)", "@principale", "--principale()"], 1),
    qcm("Quel pseudo-élément insère du contenu avant un élément ?", [":before-content", "::before", ":first", "::start"], 1),
    qcm("Quelle propriété anime en douceur un changement de couleur au survol ?", ["animation-color", "transition", "transform", "keyframes"], 1),
  ],
  4: [
    qcm("Dans la méthode BEM, que désigne « carte__titre » ?", ["un modificateur", "un élément du bloc carte", "un bloc", "un id"], 1),
    qcm("Quelle propriété est la moins coûteuse à animer ?", ["width", "top", "transform", "margin"], 2),
    vraiFaux("Sass est un préprocesseur compilé en CSS avant d'être envoyé au navigateur.", true),
  ],
});
