# ZENTECH DESIGN — plan « Studio Pro »

Objectif : faire de ZENTECH DESIGN un studio graphique professionnel, avec
l'organisation et la profondeur d'un logiciel de retouche de bureau (menus,
barre d'options, outils à gauche, panneaux à droite), adapté au téléphone,
à la tablette et au grand écran. Identité propre : aucune marque ni copie
d'un autre logiciel.

Rédigé le 26/11/2026, après la phase 5. Maquette interactive : page
« ZENTECH DESIGN Studio Pro » (lien transmis dans la conversation).

## 1. Audit

| Domaine | État |
|---|---|
| Code applicatif | ≈ 5 700 lignes TypeScript, 2 100 lignes de tests (195 tests) |
| Architecture | Couches séparées, frontières contrôlées par ESLint |
| Document | Calques **objets** : formes, texte, image référencée. Opérations pures. |
| Rendu | Skia ; un seul code de dessin écran / export, vérifié pixel par pixel |
| Gestes | Thread UI (zoom, pan, poignées), arbitrage vue / calques |
| Manques bloquants | Aucun calque de pixels ; pas d'historique, de sauvegarde ni d'export ; un seul document ; disposition figée ; canvas monolithique (561 lignes) |

## 2. Interface cible

- **Grand écran** : barre de menus (Fichier, Édition, Image, Calque, Texte,
  Sélection, Filtre, Affichage, Fenêtre, Aide), barre d'options contextuelle,
  barre d'outils par familles à gauche, onglets de documents, règles, repères,
  toile, dock de panneaux à droite, barre d'état.
- **Tablette** : même structure, cibles tactiles agrandies, stylet.
- **Téléphone** : toile prioritaire, barre d'options compacte, 4 outils
  favoris + grille « Outils » (20 familles), panneaux en tiroir à onglets,
  menus derrière le bouton principal.

Chaque commande non développée est **désactivée** et indique son module.

### Familles d'outils (20 familles, 50 outils)

| Raccourci | Famille | Outils | État |
|---|---|---|---|
| V | Déplacement | Déplacement | disponible |
| M | Sélections de forme | rectangulaire, elliptique, ligne, colonne | M6 |
| L | Lassos | lasso, polygonal, magnétique | M6 |
| W | Sélection intelligente | sélection rapide, baguette magique, sujet | M6, M18 |
| C | Recadrage | recadrage, tranche | M14 |
| I | Pipettes | pipette, échantillonneur | M8 |
| J | Correcteurs | localisé, correcteur | M11 |
| S | Tampons | duplication, motif | M11 |
| B | Pinceaux | pinceau, crayon, remplacement de couleur, mélangeur | M5, M11 |
| Y | Pinceau historique | — | M5 + M2 |
| E | Gommes | gomme, magique, d'arrière-plan | M5, M6, M11 |
| G | Remplissages | dégradé, pot de peinture | M5 |
| R | Flou / netteté / doigt | — | M11 |
| O | Densité | densité −, densité +, éponge | M11 |
| P | Plumes | plume, libre, de courbure | M12 |
| T | Texte | horizontal (disponible), vertical, masque | M13 |
| A | Sélection de tracé | tracé, directe | M12 |
| U | Formes | rectangle, ellipse, ligne (disponibles) ; rectangle arrondi, polygone, personnalisée | M12 |
| H | Main | — | disponible (outil Vue) |
| Z | Zoom | — | partiel (pincement, boutons) ; M16 |

## 3. Composants nécessaires

- **Coquille** : `MenuBar`, `Menu`/`MenuItem` (état, raccourci, module),
  `OptionsBar` (une configuration par outil), `ToolRail` + `ToolFlyout`
  (familles), `PhoneToolGrid`, `DocumentTabs`, `StatusBar`, `Ruler`,
  `Guides`.
- **Dock** : `PanelRegistry` (déclaration des panneaux), `PanelHost`
  (onglets, repli, déplacement), `Workspace` (disposition persistée,
  préréglages Photographie, Peinture, Illustration, Typographie, Retouche,
  Composition).
- **Panneaux** : Calques, Canaux, Tracés, Historique, Couleur, Nuancier,
  Propriétés, Ajustements, Navigateur, Caractère, Paragraphe.
- **Contrôles denses** : champ numérique à glisser, curseur, menu de mode
  de fusion, sélecteur de couleur TSV, liste virtualisée de calques.

## 4. Architecture

```
Espace de travail (menus, options, outils, dock, onglets)
  └─ Panneaux (registre) ──► lisent l'état, émettent des commandes
Outils (modules : options, gestes UI, aperçu, commit → commande)
Commandes réversibles (historique, sauvegarde incrémentale)
Modèle de document (objets, pixels en tuiles, groupes, masques, ajustements,
                    sélections, canaux, tracés)
Rendu Skia (compositeur, cache de tuiles, shaders SkSL, export hors écran)
Calcul natif C++ / JSI (remplissage, correcteurs, bruit, IA plus tard)
Stockage (SQLite + fichiers, autosave, récupération, migrations)
```

Règles : le moteur ne connaît pas l'interface (déjà imposé par le lint) ;
un outil = un module ; toute modification = une commande.

## 5. Plan par modules

| Module | Contenu | Dépend de | Taille |
|---|---|---|---|
| M1 | Espace de travail professionnel (menus, options, outils par familles, dock, onglets, trois présentations, espaces enregistrés) | — | L |
| M2 | Historique (commandes réversibles, panneau, retour à un état) | M1 | M |
| M3 | Fichiers et onglets (format versionné, SQLite + fichiers, autosave, récupération, multi-documents) | M2 | L |
| M4 | Export PNG / JPEG | M3 | S |
| M5 | Moteur de pixels (tuiles GPU, pinceau, crayon, gomme, dégradé, pot, pression) | M2 | XL |
| M6 | Sélections (formes, lassos, baguette, sélection rapide classique, contour progressif, presse-papiers) | M5 | L |
| M7 | Calques avancés (groupes, modes de fusion, masques, remplissage, fusion, styles) | M5 | L |
| M8 | Couleur (TSV, HEX/RVB/TSL, premier plan / arrière-plan, pipettes, nuanciers) | M1 | M |
| M9 | Ajustements non destructifs (shaders GPU) | M7 | L |
| M10 | Filtres non destructifs (flous, accentuation, bruit) | M9 | L |
| M11 | Retouche (tampons, correcteurs, densité, éponge, flou/netteté/doigt) — natif | M5, M6 | XL |
| M12 | Vecteurs (plumes, tracés, formes étendues, masques vectoriels) | M2 | L |
| M13 | Typographie avancée (caractère, paragraphe, vertical, polices) | M1 | M |
| M14 | Transformations avancées et recadrage | M5 | L |
| M15 | Canaux (affichage, alpha, sélections mémorisées) | M6 | M |
| M16 | Navigateur, règles, repères, grilles, magnétisme, outil Zoom | M1 | M |
| M17 | Clavier matériel, souris, stylet (module natif) | M1 | M |
| M18 | IA hors ligne (sujet, cheveux, suppression d'objets, arrière-plan) | M6, M11 | XL |
| M19 | Qualité continue sur appareils réels | tous | continu |

Ordre recommandé : **M1**, puis M2, M3, M4 (rien ne doit plus se perdre),
puis M5 mesuré sur appareil, puis les autres selon les priorités.

## 6. Risques et limites

| Niveau | Risque | Réponse |
|---|---|---|
| Élevé | Peinture au pixel fluide (64 Mo par calque 4096²) | Tuiles GPU, historique par tuiles, budget mémoire par appareil, mesures avant d'étendre |
| Élevé | Sujet, cheveux, suppression d'objets | Modèles IA embarqués (taille, licences, inférence native) : en dernier, après les versions classiques |
| Moyen | Algorithmes lourds en JavaScript | Module Expo C++ (JSI), vérifiable seulement sur appareil |
| Moyen | Raccourcis clavier matériels | Non exposés par React Native : module natif Android + iOS |
| Moyen | Essais réels | Cet environnement compile Android sans l'exécuter ; iOS demande un Mac ou un service de builds |
| Faible | Densité sur téléphone | Tiroirs, familles, options contextuelles ; aucune fonction retirée |
| Faible | Identité | Convention de métier, icônes et identité propres, aucune marque tierce |
