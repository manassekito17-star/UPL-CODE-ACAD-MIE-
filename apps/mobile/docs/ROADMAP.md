# Feuille de route de la version 0.1

Chaque phase se termine par un rapport et attend une validation avant la suivante.

| Phase | Contenu | État |
|---|---|---|
| 1 | Initialisation : projet Expo SDK 58, TypeScript strict, dépendances, architecture, navigation, thème sombre, outillage de tests | Livrée et validée |
| 2 | Interface : accueil complet, formulaire de création de document (dimensions, orientation, fond, limites mémoire), espace de travail (barres, panneaux repliables) | Livrée et validée |
| 3 | Moteur graphique : modèle de document, canvas Skia, coordonnées document/écran, zoom, déplacement, ajustement | Livrée et validée |
| 4 | Calques : ajout, suppression confirmée, sélection, renommage, duplication, visibilité, opacité, ordre, déplacement | Livrée et validée (premier type de calque : rectangle) |
| 5 | Import d'images (galerie, permissions, original préservé), outil texte éditable, formes (rectangle, cercle, ligne), transformations tactiles | Livrée et validée |
| 6 | Historique Undo/Redo par commandes réversibles (module M2) | Livrée et validée |
| 7 | Sauvegarde : format de projet versionné, SQLite + fichiers, sauvegarde automatique, récupération après interruption, liste des projets récents (module M3) | **Livrée, en attente de validation** |
| 8 | Export PNG fidèle (dimensions, transparence, visibilité, ordre, transformations) | À faire |
| 9 | Tests, mesures de performance sur plusieurs appareils, optimisation, durcissement des permissions | À faire |

## Plan « Studio Pro » (modules M1 à M19)

Détail, maquettes et risques : [PRO_STUDIO_PLAN.md](PRO_STUDIO_PLAN.md). Les
phases 6 à 9 ci-dessus correspondent aux modules M2 (historique), M3
(sauvegarde, onglets), M4 (export) et M19 (qualité).

| Module | Contenu | État |
|---|---|---|
| M1 | Espace studio tablette / grand écran : menus, barre d'options, 20 familles d'outils, règles, onglet, dock (Couleur, Nuancier, Propriétés, Réglages, Calques, Couches, Tracés), colonne d'icônes (Historique, Navigateur, Caractère, Paragraphe), barre d'état | Parties 1 et 2 livrées et validées |
| M1 (suite) | Espaces de travail enregistrés, guide des outils | À faire |
| M2 | Historique : Annuler, Rétablir, panneau Historique | Livré et validé |
| M3 | Enregistrement des projets, onglets, Enregistrer sous, Dupliquer | **Livré, en attente de validation** |
| M4 à M19 | Voir le plan | À faire |
