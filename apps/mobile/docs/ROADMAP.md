# Feuille de route de la version 0.1

Chaque phase se termine par un rapport et attend une validation avant la suivante.

| Phase | Contenu | État |
|---|---|---|
| 1 | Initialisation : projet Expo SDK 58, TypeScript strict, dépendances, architecture, navigation, thème sombre, outillage de tests | Livrée et validée |
| 2 | Interface : accueil complet, formulaire de création de document (dimensions, orientation, fond, limites mémoire), espace de travail (barres, panneaux repliables) | Livrée et validée |
| 3 | Moteur graphique : modèle de document, canvas Skia, coordonnées document/écran, zoom, déplacement, ajustement | Livrée et validée |
| 4 | Calques : ajout, suppression confirmée, sélection, renommage, duplication, visibilité, opacité, ordre, déplacement | Livrée et validée (premier type de calque : rectangle) |
| 5 | Import d'images (galerie, permissions, original préservé), outil texte éditable, formes (rectangle, cercle, ligne), transformations tactiles | **Livrée, en attente de validation** |
| 6 | Historique Undo/Redo par commandes réversibles | À faire |
| 7 | Sauvegarde : format de projet versionné, SQLite + fichiers, sauvegarde automatique, récupération après interruption, liste des projets récents | À faire |
| 8 | Export PNG fidèle (dimensions, transparence, visibilité, ordre, transformations) | À faire |
| 9 | Tests, mesures de performance sur plusieurs appareils, optimisation, durcissement des permissions | À faire |
