import { qcm, vraiFaux } from "../helpers";
import { levelExam, placement, type LevelPlan } from "./build";

// =====================================================================
// K+ (programmation en français)
// Niveaux 1 et 2 rédigés ; niveaux 3 et 4 programmés au rythme des
// versions du langage (feuille de route K+ : 0.3 serveur, 0.4, 0.5…).
// =====================================================================
export const kplusLevels: LevelPlan[] = [
  {
    number: 1,
    title: "Niveau 1 — Très débutant : programmer en français",
    description: "Écrire ses premiers programmes K+ : afficher, variables, calculs, conditions, boucles, fonctions et listes.",
    objectives: [
      "Écrire et exécuter un programme K+.",
      "Utiliser variables, calculs, conditions et boucles.",
      "Écrire des fonctions et gérer les erreurs.",
    ],
    modules: [{ slug: "bases", title: "Les bases du langage K+", lessons: ["kplus-introduction", "kplus-variables", "kplus-calculs", "kplus-conditions", "kplus-boucles", "kplus-fonctions-listes"] }],
    exam: levelExam("kplus-examen-niveau-1", "Examen du niveau 1 — Bases de K+", [
      qcm("Que renvoie demander(…) ?", ["un entier", "un texte", "un décimal", "nul"], 1),
      qcm("Que vaut 7 / 2 en K+ ?", ["3", "3.5", "4", "erreur"], 1),
      qcm("Que vaut 17 % 5 ?", ["3", "2", "3.4", "5"], 1),
      qcm("Quel mot termine un bloc si … alors ?", ["finsi", "fin", "}", "end"], 1),
      qcm("Quelles valeurs prend i dans « pour i de 1 à 4 faire » ?", ["1, 2, 3", "1, 2, 3, 4", "0, 1, 2, 3", "1 et 4"], 1),
      vraiFaux("En K+, \"Âge : \" + 20 est accepté sans conversion.", false, "Il faut écrire texte(20)."),
      qcm("Quel est l'indice du premier élément d'une liste ?", ["0", "1", "-1", "ça dépend"], 0),
      qcm("Quel bloc attrape une erreur ?", ["si … sinon", "essayer … attraper", "tant que", "lever"], 1),
    ]),
  },
  {
    number: 2,
    title: "Niveau 2 — Débutant : sites web dynamiques avec K+",
    description: "Construire des pages web qui réagissent au visiteur : boutons, champs, listes dynamiques, mise en forme et minuteries.",
    objectives: [
      "Construire une page avec utiliser web.",
      "Réagir aux clics et aux saisies du visiteur.",
      "Faire évoluer une page dans le temps et la publier.",
    ],
    modules: [{ slug: "sites-web", title: "Sites web dynamiques avec K+", lessons: ["kplus-web-premiere-page", "kplus-web-interactions", "kplus-web-listes", "kplus-web-minuteries"] }],
    exam: levelExam("kplus-examen-niveau-2", "Examen du niveau 2 — Sites web dynamiques", [
      qcm("Quelle ligne active les fonctions de page ?", ["importer page", "utiliser web", "web()", "page web"], 1),
      qcm("Comment associe-t-on la fonction envoyer à un bouton ?", ["bouton(\"Envoyer\", envoyer)", "bouton(\"Envoyer\", envoyer())", "bouton(envoyer)", "clic(envoyer)"], 0),
      qcm("Que renvoie valeur(champ) ?", ["un nombre", "le texte tapé", "l'étiquette", "vrai si rempli"], 1),
      qcm("Quelle fonction remplace le texte d'un paragraphe ?", ["changer_valeur", "changer_texte", "paragraphe", "afficher"], 1),
      vraiFaux("Les variables du programme restent en mémoire entre deux clics.", true),
      qcm("Comment arrête-t-on une minuterie m ?", ["supprimer(m)", "arreter_minuterie(m)", "arreter", "cacher(m)"], 1),
    ]),
  },
  {
    number: 3,
    title: "Niveau 3 — Intermédiaire : sites côté serveur",
    description: "Sites avec plusieurs pages, formulaires, données enregistrées et comptes utilisateurs, à la manière de PHP (K+ 0.3, en préparation).",
    objectives: ["Créer un site à plusieurs pages.", "Traiter des formulaires.", "Enregistrer des données de façon sûre."],
    modules: [],
    plannedChapters: [
      "Plusieurs pages et adresses (utiliser serveur)",
      "Formulaires et paramètres",
      "Enregistrer des données dans des tables",
      "Comptes, sessions et mots de passe",
      "Dictionnaires et modules (K+ 0.4)",
    ],
  },
  {
    number: 4,
    title: "Niveau 4 — Professionnel : projets K+",
    description: "Objets, types vérifiés et projet de site complet publié en ligne.",
    objectives: ["Organiser un grand programme K+.", "Sécuriser un site.", "Mener un projet de bout en bout."],
    modules: [],
    plannedChapters: ["Objets et classes (K+ 0.5)", "Types vérifiés (K+ 0.6)", "Sécurité d'un site web", "Projet professionnel : site complet publié"],
  },
];

export const kplusPlacement = placement("kplus-positionnement", "Test de positionnement — K+", {
  1: [
    qcm("Comment affiche-t-on du texte en K+ ?", ["print()", "afficher()", "echo", "ecrire()"], 1),
    qcm("Comment déclare-t-on une variable ?", ["var x = 1", "variable x = 1", "x := 1", "let x = 1"], 1),
  ],
  2: [
    qcm("Que fait ajouter_ligne(liste, \"Riz\") ?", ["ajoute Riz à une liste de la page", "affiche Riz", "crée une variable", "rien"], 0),
    qcm("Que fait toutes_les(1000, tic) ?", ["appelle tic une fois", "appelle tic chaque seconde", "attend 1000 secondes", "arrête tic"], 1),
  ],
  3: [
    qcm("Côté serveur, où doit-on vérifier les données d'un formulaire ?", ["seulement dans le navigateur", "sur le serveur", "nulle part", "dans le titre"], 1),
    qcm("Comment doit-on enregistrer un mot de passe ?", ["en clair", "chiffré par une fonction de hachage lente", "dans un cookie", "dans l'adresse"], 1),
  ],
  4: [
    qcm("Pourquoi écrire des tests automatisés ?", ["pour vérifier le programme à chaque modification", "pour ralentir le site", "c'est inutile", "pour cacher le code"], 0),
    qcm("Qu'est-ce qu'une injection ?", ["une donnée du visiteur exécutée comme du code", "une fonction rapide", "un type de boucle", "une image"], 0),
  ],
});
