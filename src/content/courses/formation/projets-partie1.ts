import { makeExercise, type ExInput } from "../../helpers";
import type { Exercise, PracticalProject } from "../../types";

/** Projets pratiques de la Partie 1 (un par chapitre), chacun vérifié par un mini-projet noté. */
export const projetsPartie1: Record<string, PracticalProject> = {
  "introduction-algorithmique": {
    title: "Carte de visite numérique",
    context: "Vous préparez la carte de présentation affichée sur votre profil étudiant.",
    steps: ["Identifier les trois données à lire : prénom, filière, année d'études.", "Écrire l'algorithme séquentiel qui affiche la carte, ligne par ligne.", "Vérifier le format exact (bordures, espaces) puis soumettre."],
    deliverables: ["Un algorithme qui affiche une carte de 5 lignes conforme au modèle."],
    exerciseSlug: "algo-projet-carte",
  },
  "logique-raisonnement": {
    title: "Contrôle d'accès à la bibliothèque",
    context: "La bibliothèque universitaire autorise l'accès si la carte est valide ET (la cotisation est payée OU l'usager a moins de 18 ans).",
    steps: ["Traduire la règle en une condition logique.", "Construire la table de vérité de la condition (8 cas).", "Écrire l'algorithme sans SI, en affichant directement les booléens.", "Tester les 8 cas avant de soumettre."],
    deliverables: ["Un algorithme qui affiche l'autorisation d'accès et la gratuité."],
    exerciseSlug: "algo-projet-bibliotheque",
  },
  "analyse-problemes": {
    title: "Budget mensuel de l'étudiant",
    context: "Un étudiant veut savoir ce qu'il lui reste chaque mois après le loyer, le transport et les repas.",
    steps: ["Lister données, résultats et contraintes ; écrire la postcondition.", "Préparer un jeu d'essai de 3 cas dont un cas limite (reste nul).", "Décomposer : dépenses de transport, dépenses de repas, total, reste.", "Écrire, exécuter le jeu d'essai, soumettre."],
    deliverables: ["La spécification, le jeu d'essai et l'algorithme."],
    exerciseSlug: "algo-projet-budget",
  },
  "variables-constantes": {
    title: "Caisse enregistreuse simplifiée",
    context: "Une cantine enregistre trois articles et affiche le sous-total après chacun.",
    steps: ["Déclarer une seule variable total et l'initialiser.", "Après chaque lecture de prix, mettre à jour total et afficher le sous-total.", "Faire la trace de l'algorithme sur l'exemple, puis soumettre."],
    deliverables: ["Un algorithme avec un accumulateur et un tableau de suivi."],
    exerciseSlug: "algo-projet-caisse-simple",
  },
  "types-donnees": {
    title: "Fiche de résultats",
    context: "Le secrétariat veut une fiche normalisée : nom en majuscules, initiale du prénom, moyenne et décision.",
    steps: ["Choisir le type de chaque donnée (CHAINE, REEL, BOOLEEN).", "Construire l'identité « NOM P. » avec MAJUSCULE et l'indexation.", "Calculer la moyenne et la décision, puis afficher la fiche."],
    deliverables: ["Un algorithme correctement typé, sans erreur de type."],
    exerciseSlug: "algo-projet-fiche",
  },
  operateurs: {
    title: "Horloge de la semaine",
    context: "Un capteur compte les minutes écoulées depuis lundi 00 h 00. Il faut afficher le jour et l'heure correspondants.",
    steps: ["Calculer le nombre de minutes par jour (1 440).", "Utiliser DIV et MOD pour obtenir le jour, les heures et les minutes.", "Tester les cas limites : 0, 1 439, 1 440 et la dernière minute de la semaine."],
    deliverables: ["Un algorithme utilisant DIV et MOD, vérifié sur des cas limites."],
    exerciseSlug: "algo-projet-horloge",
  },
  "entrees-sorties": {
    title: "Reçu de paiement des frais académiques",
    context: "La caisse de l'université remet un reçu indiquant le montant payé et le reste à payer.",
    steps: ["Lire nom, matricule, montant total et montant payé dans cet ordre.", "Calculer le reste à payer.", "Afficher le reçu en respectant exactement le format."],
    deliverables: ["Un reçu de 6 lignes conforme au modèle."],
    exerciseSlug: "algo-projet-recu",
  },
};

const ex = (input: ExInput) => makeExercise({ language: "pseudocode", courseSlug: "algorithmique" }, input);

export const projetsPartie1Exercises: Exercise[] = [
  ex({
    slug: "algo-projet-carte",
    lessonSlug: "introduction-algorithmique",
    title: "Projet : carte de visite numérique",
    difficulty: "debutant",
    type: "mini_projet",
    statement: `
      Lisez un prénom, une filière puis une année d'études (texte, par exemple « Bac 1 ») et affichez exactement :

      ~~~text
      +----------------------+
      Nom : <prénom>
      Filière : <filière>
      Année : <année>
      +----------------------+
      ~~~
    `,
    examples: [{ input: "Amani\nInformatique\nBac 1", output: "+----------------------+\nNom : Amani\nFilière : Informatique\nAnnée : Bac 1\n+----------------------+" }],
    hints: ["Trois LIRE puis cinq ECRIRE.", "Les deux bordures sont identiques : copiez-les exactement."],
    tests: [
      { input: "Amani\nInformatique\nBac 1", expected: "+----------------------+\nNom : Amani\nFilière : Informatique\nAnnée : Bac 1\n+----------------------+" },
      { input: "Ruth\nIntelligence Artificielle\nBac 2", expected: "+----------------------+\nNom : Ruth\nFilière : Intelligence Artificielle\nAnnée : Bac 2\n+----------------------+", hidden: true },
    ],
    solution: `
      ALGORITHME Carte
      VARIABLES
        prenom, filiere, annee : CHAINE
      DEBUT
        LIRE(prenom)
        LIRE(filiere)
        LIRE(annee)
        ECRIRE("+----------------------+")
        ECRIRE("Nom : ", prenom)
        ECRIRE("Filière : ", filiere)
        ECRIRE("Année : ", annee)
        ECRIRE("+----------------------+")
      FIN
    `,
    correction: "L'année est lue comme un texte car elle contient « Bac ». L'algorithme est purement séquentiel.",
    points: 15,
  }),
  ex({
    slug: "algo-projet-bibliotheque",
    lessonSlug: "logique-raisonnement",
    title: "Projet : contrôle d'accès à la bibliothèque",
    difficulty: "intermediaire",
    type: "mini_projet",
    statement: `
      Lisez l'âge (entier), puis si la carte est valide (booléen), puis si la cotisation est payée (booléen). L'accès est autorisé si **la carte est valide ET (la cotisation est payée OU l'âge est inférieur à 18)**. L'accès est gratuit si l'âge est inférieur à 18. Affichez, sans utiliser SI :

      ~~~text
      Accès : <VRAI/FAUX>
      Gratuit : <VRAI/FAUX>
      ~~~
    `,
    examples: [{ input: "20\nVRAI\nFAUX", output: "Accès : FAUX\nGratuit : FAUX" }],
    constraints: ["Ne pas utiliser SI."],
    hints: ["Traduisez mot à mot : carte ET (cotisation OU age < 18).", "Les parenthèses sont indispensables : ET est prioritaire sur OU."],
    tests: [
      { input: "20\nVRAI\nFAUX", expected: "Accès : FAUX\nGratuit : FAUX" },
      { input: "16\nVRAI\nFAUX", expected: "Accès : VRAI\nGratuit : VRAI" },
      { input: "25\nVRAI\nVRAI", expected: "Accès : VRAI\nGratuit : FAUX", hidden: true },
      { input: "15\nFAUX\nVRAI", expected: "Accès : FAUX\nGratuit : VRAI", hidden: true },
      { input: "18\nVRAI\nFAUX", expected: "Accès : FAUX\nGratuit : FAUX", hidden: true },
    ],
    solution: `
      ALGORITHME Bibliotheque
      VARIABLES
        age : ENTIER
        carte, cotisation : BOOLEEN
      DEBUT
        LIRE(age)
        LIRE(carte)
        LIRE(cotisation)
        ECRIRE("Accès : ", carte ET (cotisation OU age < 18))
        ECRIRE("Gratuit : ", age < 18)
      FIN
    `,
    correction: "Sans parenthèses, « carte ET cotisation OU age < 18 » autoriserait un mineur sans carte valide (cas 15, FAUX, VRAI). Le cas 18 ans vérifie la borne stricte < 18.",
    points: 20,
    isEvaluated: true,
  }),
  ex({
    slug: "algo-projet-budget",
    lessonSlug: "analyse-problemes",
    title: "Projet : budget mensuel",
    difficulty: "intermediaire",
    type: "mini_projet",
    statement: `
      Lisez (entiers, en FC) : le revenu mensuel, le loyer, le coût du transport **par jour de cours** et le coût d'un repas. Un mois compte **22 jours de cours** avec **un repas par jour**. Affichez :

      ~~~text
      Transport : <total transport>
      Repas : <total repas>
      Dépenses : <loyer + transport + repas>
      Reste : <revenu - dépenses>
      ~~~
    `,
    examples: [{ input: "200000\n60000\n2000\n3000", output: "Transport : 44000\nRepas : 66000\nDépenses : 170000\nReste : 30000" }],
    hints: ["Déclarez JOURS = 22 en constante.", "Calculez chaque total dans sa propre variable avant de les additionner."],
    tests: [
      { input: "200000\n60000\n2000\n3000", expected: "Transport : 44000\nRepas : 66000\nDépenses : 170000\nReste : 30000" },
      { input: "110000\n0\n2500\n2500", expected: "Transport : 55000\nRepas : 55000\nDépenses : 110000\nReste : 0" },
      { input: "150000\n80000\n1500\n2000", expected: "Transport : 33000\nRepas : 44000\nDépenses : 157000\nReste : -7000", hidden: true },
    ],
    solution: `
      ALGORITHME Budget
      CONSTANTES
        JOURS = 22
      VARIABLES
        revenu, loyer, transportJour, repas, transport, totalRepas, depenses : ENTIER
      DEBUT
        LIRE(revenu)
        LIRE(loyer)
        LIRE(transportJour)
        LIRE(repas)
        transport ← transportJour * JOURS
        totalRepas ← repas * JOURS
        depenses ← loyer + transport + totalRepas
        ECRIRE("Transport : ", transport)
        ECRIRE("Repas : ", totalRepas)
        ECRIRE("Dépenses : ", depenses)
        ECRIRE("Reste : ", revenu - depenses)
      FIN
    `,
    correction: "La décomposition suit l'analyse : un total par poste, puis la somme, puis le reste. Le test caché montre qu'un reste négatif est possible : un futur chapitre permettra d'afficher un avertissement avec une condition.",
    points: 20,
  }),
  ex({
    slug: "algo-projet-caisse-simple",
    lessonSlug: "variables-constantes",
    title: "Projet : caisse enregistreuse",
    difficulty: "debutant",
    type: "mini_projet",
    statement: `
      Lisez les prix de trois articles (réels). Après chaque lecture, ajoutez le prix à une variable **total** et affichez le sous-total :

      ~~~text
      Sous-total : <après article 1>
      Sous-total : <après article 2>
      Total : <après article 3>
      ~~~
    `,
    examples: [{ input: "1500\n250.5\n3000", output: "Sous-total : 1500\nSous-total : 1750.5\nTotal : 4750.5" }],
    constraints: ["Une seule variable pour le cumul."],
    hints: ["Initialisez total à 0 avant la première lecture.", "Lisez le prix dans une variable prix, puis total ← total + prix."],
    tests: [
      { input: "1500\n250.5\n3000", expected: "Sous-total : 1500\nSous-total : 1750.5\nTotal : 4750.5" },
      { input: "0\n0\n0", expected: "Sous-total : 0\nSous-total : 0\nTotal : 0", hidden: true },
      { input: "100\n200\n300", expected: "Sous-total : 100\nSous-total : 300\nTotal : 600", hidden: true },
    ],
    solution: `
      ALGORITHME Caisse
      VARIABLES
        prix, total : REEL
      DEBUT
        total ← 0
        LIRE(prix)
        total ← total + prix
        ECRIRE("Sous-total : ", total)
        LIRE(prix)
        total ← total + prix
        ECRIRE("Sous-total : ", total)
        LIRE(prix)
        total ← total + prix
        ECRIRE("Total : ", total)
      FIN
    `,
    correction: "La même variable prix est réutilisée pour chaque lecture ; total accumule. Ce motif répété sera écrit avec une boucle au niveau 2.",
    points: 15,
  }),
  ex({
    slug: "algo-projet-fiche",
    lessonSlug: "types-donnees",
    title: "Projet : fiche de résultats",
    difficulty: "intermediaire",
    type: "mini_projet",
    statement: `
      Lisez un nom, un prénom, puis deux notes (réels). Affichez :

      ~~~text
      Étudiant : <NOM EN MAJUSCULES> <initiale du prénom en majuscule>.
      Moyenne : <moyenne des deux notes>
      Admis : <VRAI si moyenne >= 10>
      ~~~
    `,
    examples: [{ input: "mbuyi\njoël\n12\n9", output: "Étudiant : MBUYI J.\nMoyenne : 10.5\nAdmis : VRAI" }],
    hints: ["MAJUSCULE(nom) et MAJUSCULE(prenom[1]).", "La moyenne est un REEL."],
    tests: [
      { input: "mbuyi\njoël\n12\n9", expected: "Étudiant : MBUYI J.\nMoyenne : 10.5\nAdmis : VRAI" },
      { input: "Kabeya\nesther\n8\n11.5", expected: "Étudiant : KABEYA E.\nMoyenne : 9.75\nAdmis : FAUX", hidden: true },
      { input: "ilunga\nAnne\n10\n10", expected: "Étudiant : ILUNGA A.\nMoyenne : 10\nAdmis : VRAI", hidden: true },
    ],
    solution: `
      ALGORITHME FicheResultats
      VARIABLES
        nom, prenom : CHAINE
        n1, n2, moyenne : REEL
      DEBUT
        LIRE(nom)
        LIRE(prenom)
        LIRE(n1)
        LIRE(n2)
        moyenne ← (n1 + n2) / 2
        ECRIRE("Étudiant : ", MAJUSCULE(nom), " ", MAJUSCULE(prenom[1]), ".")
        ECRIRE("Moyenne : ", moyenne)
        ECRIRE("Admis : ", moyenne >= 10)
      FIN
    `,
    correction: "Chaque donnée a son type : CHAINE pour l'identité, REEL pour les notes, et la décision est un BOOLEEN obtenu par comparaison.",
    points: 20,
  }),
  ex({
    slug: "algo-projet-horloge",
    lessonSlug: "operateurs",
    title: "Projet : horloge de la semaine",
    difficulty: "intermediaire",
    type: "mini_projet",
    statement: `
      Lisez un nombre de minutes écoulées depuis lundi 00 h 00 (entier entre 0 et 10 079). Les jours sont numérotés de 1 (lundi) à 7 (dimanche). Affichez :

      ~~~text
      Jour <n>, <h> h <m> min
      ~~~
    `,
    examples: [{ input: "1530", output: "Jour 2, 1 h 30 min" }],
    hints: ["Un jour compte 1 440 minutes.", "Jour : minutes DIV 1440 + 1 ; heures : (minutes MOD 1440) DIV 60 ; minutes : minutes MOD 60."],
    tests: [
      { input: "1530", expected: "Jour 2, 1 h 30 min" },
      { input: "0", expected: "Jour 1, 0 h 0 min" },
      { input: "1439", expected: "Jour 1, 23 h 59 min", hidden: true },
      { input: "1440", expected: "Jour 2, 0 h 0 min", hidden: true },
      { input: "10079", expected: "Jour 7, 23 h 59 min", hidden: true },
    ],
    solution: `
      ALGORITHME Horloge
      CONSTANTES
        MIN_JOUR = 1440
      VARIABLES
        minutes, jour, h, m : ENTIER
      DEBUT
        LIRE(minutes)
        jour ← minutes DIV MIN_JOUR + 1
        h ← (minutes MOD MIN_JOUR) DIV 60
        m ← minutes MOD 60
        ECRIRE("Jour ", jour, ", ", h, " h ", m, " min")
      FIN
    `,
    correction: "DIV donne le nombre de jours complets écoulés (on ajoute 1 car lundi est le jour 1) ; MOD 1440 donne les minutes du jour courant. Les cas 1 439 et 1 440 vérifient le passage de minuit.",
    points: 20,
    isEvaluated: true,
  }),
  ex({
    slug: "algo-projet-recu",
    lessonSlug: "entrees-sorties",
    title: "Projet : reçu de paiement",
    difficulty: "intermediaire",
    type: "mini_projet",
    statement: `
      Lisez le nom de l'étudiant, son matricule (texte), le montant total des frais et le montant payé (entiers, en dollars). Affichez exactement :

      ~~~text
      ===== REÇU =====
      Étudiant : <nom>
      Matricule : <matricule>
      Payé : <payé> $ / <total> $
      Reste à payer : <total - payé> $
      ================
      ~~~
    `,
    examples: [{ input: "Kasongo Amani\nUPL-2026-0042\n600\n450", output: "===== REÇU =====\nÉtudiant : Kasongo Amani\nMatricule : UPL-2026-0042\nPayé : 450 $ / 600 $\nReste à payer : 150 $\n================" }],
    hints: ["Le matricule contient des lettres et des tirets : type CHAINE.", "Respectez les espaces autour de « / » et avant « $ »."],
    tests: [
      { input: "Kasongo Amani\nUPL-2026-0042\n600\n450", expected: "===== REÇU =====\nÉtudiant : Kasongo Amani\nMatricule : UPL-2026-0042\nPayé : 450 $ / 600 $\nReste à payer : 150 $\n================" },
      { input: "Ruth Kalenga\nUPL-2025-0007\n800\n800", expected: "===== REÇU =====\nÉtudiant : Ruth Kalenga\nMatricule : UPL-2025-0007\nPayé : 800 $ / 800 $\nReste à payer : 0 $\n================", hidden: true },
    ],
    solution: `
      ALGORITHME Recu
      VARIABLES
        nom, matricule : CHAINE
        total, paye : ENTIER
      DEBUT
        LIRE(nom)
        LIRE(matricule)
        LIRE(total)
        LIRE(paye)
        ECRIRE("===== REÇU =====")
        ECRIRE("Étudiant : ", nom)
        ECRIRE("Matricule : ", matricule)
        ECRIRE("Payé : ", paye, " $ / ", total, " $")
        ECRIRE("Reste à payer : ", total - paye, " $")
        ECRIRE("================")
      FIN
    `,
    correction: "L'ordre des LIRE suit l'ordre des données ; l'affichage reprend exactement le modèle, espaces compris.",
    points: 20,
  }),
];
