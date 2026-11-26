# Journal des versions

Format inspiré de [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/),
versions selon [SemVer](https://semver.org/lang/fr/).

## [Non publié]

### Phase 5 — Images, texte, formes, transformations

- Import d'images : galerie système (aucune autorisation demandée sur Android 13+ et iOS 14+), copie intacte de l'original dans le dossier de l'application, copie de travail JPEG ou PNG (HEIC converti) réduite si elle dépasse 4096 px ou 16,7 Mpx ; nettoyage si l'import échoue. Depuis l'accueil (nouveau document aux dimensions de la photo) ou dans l'éditeur (nouveau calque).
- Texte : vrai calque éditable (contenu, taille, couleur, alignement, gras), police Inter embarquée (rendu identique sur toutes les plateformes et à l'export), retour à la ligne dans la largeur, hauteur ajustée au contenu.
- Formes : rectangle, cercle (ellipse), ligne aux extrémités arrondies ; couleur par nuancier ou code hexadécimal.
- Transformations tactiles : poignées de coin (redimensionner, coin opposé fixe même tourné ; proportions gardées pour les images) et poignée de rotation (aimantée à 45°) ; aperçu sur le thread UI, enregistrement au relâchement.
- Barre d'outils : modes (Sélection, Vue) et insertions (Texte, Formes, Image) ; menu « Ajouter un calque ».
- Ressources de rendu (police, images décodées) fournies explicitement, partagées par l'écran et le futur export.
- Corrections trouvées pendant la phase : détection PNG/GIF par le nom de fichier, tap déclenché à la fin d'un glisser, cadre de sélection qui mordait sur le contenu, vignette de ligne invisible, chargement de Skia sur le web.
- Dépendances : `expo-image-manipulator`, `@expo-google-fonts/inter` ; `@types/node` (tests).

### Phase 4 — Calques

- Modèle de calque (`engine/layers`) : identifiant, nom, type, x, y, largeur, hauteur, rotation, opacité, visibilité, verrouillage ; l'ordre d'affichage est la position dans la pile. Premier type concret : rectangle (cercle, ligne, texte et image en phase 5).
- Opérations pures et testées : ajouter (au-dessus de la sélection), supprimer, renommer, dupliquer, masquer/afficher, verrouiller, opacité, monter/descendre, premier plan/arrière-plan, déplacer, modifier position/taille/rotation. Un identifiant inconnu lève une erreur au lieu d'agir sur un autre calque ; un calque verrouillé ne peut être ni déplacé, ni transformé, ni supprimé.
- Panneau Calques : pile (le haut en premier), sélection, actions, visibilité et verrou par calque, suppression confirmée nommant le calque (la cible est figée à l'ouverture de la boîte), renommage dans une boîte de saisie.
- Panneau Propriétés : X, Y, largeur, hauteur, rotation, opacité, validés en fin de saisie (une seule validation même si Entrée puis perte du focus).
- Canvas : chaque calque rendu par la même matrice et la même composition d'opacité que l'export (vérifié pixel par pixel) ; contenu en cache par calque ; contour de sélection deux tons.
- Outil Sélection : toucher sélectionne le calque visible le plus haut (ou désélectionne), glisser déplace un calque déverrouillé sur le thread UI ; position arrondie au pixel et enregistrée au relâchement. Deux doigts agissent toujours sur la vue.

### Phase 3 — Moteur graphique

- Canvas Skia du document (`engine/canvas/DocumentCanvas`) : rendu GPU, bordure d'un point quel que soit le zoom, damier de transparence (repère d'affichage, jamais exporté).
- Code de dessin unique (`engine/renderer`) pour l'écran (Picture mise en cache) et le rendu hors écran (base de l'export PNG), vérifié pixel par pixel avec le vrai Skia.
- Géométrie de la vue (`engine/transformations`) : conversions document ↔ écran, ajustement à l'écran (évite la barre de zoom), zoom autour d'un point fixe, bornes (¼ de l'ajustement → 32 pixels physiques par pixel), le document ne peut pas sortir de la vue.
- Gestes (Gesture Handler 3 + Reanimated 4, thread UI) : pincer pour zoomer, glisser à deux doigts, glisser à un doigt avec l'outil Vue, double tap (ajuster / 100 %). Règle d'arbitrage vue ↔ calques définie et testée (`engine/canvas/gestures.ts`).
- Commandes de zoom : dézoomer, zoomer (×√2), valeur en % (100 % = 1 pixel du document par pixel physique), ajuster à l'écran. Réajustement automatique à la rotation ou à l'ouverture des panneaux.
- Outil « Vue » disponible et actif par défaut.
- Tests : doublures Skia et Reanimated pour les tests d'interface (la doublure officielle de Reanimated 4.7 échoue avec jest-expo).

### Phase 2 — Interface

- Nom commercial : **ZENTECH DESIGN** (nom affiché, logo, paramètres, autorisation photos). Slug Expo `zentech-design`, schéma de liens `zentechdesign://`.

- Création de document : formats prédéfinis (écran de l'appareil, carré, story, Full HD, 4K, A4 300 dpi), largeur et hauteur libres, orientation (inversion automatique), fond blanc, noir ou transparent, nom, aperçu et mémoire estimée.
- Protection mémoire : 1 à 8192 px par côté, 16,7 Mpx au plus (64 Mo par calque), avertissement au-delà de 8,4 Mpx. Valeurs provisoires, à mesurer en phase 9.
- Modèle de document versionné (`engine/documents`) et store de session (Zustand).
- Accueil : projets récents (vignette, dimensions, fond, date), ouverture, suppression avec confirmation nommant le projet.
- Espace de travail : barre supérieure, zone de travail, barre d'outils, panneaux Calques et Propriétés ; colonne repliable sur grand écran, feuille sur téléphone ; projet introuvable signalé.
- Composants : icônes, bouton-icône, champ de saisie, sélecteur segmenté, puce, boîte de confirmation, panneau repliable, aperçu de fond.
- Accessibilité : nouveau rouge `dangerSolid` pour les boutons destructifs (contrastes testés).
- Ajout de `@expo/vector-icons`, `expo-font`, `expo-asset`.

### Phase 1 — Initialisation

- Projet Expo SDK 58 / React Native 0.88 / TypeScript strict dans `apps/mobile/`.
- Navigation Expo Router : accueil, nouveau projet, éditeur, paramètres, écran introuvable.
- Thème sombre (palette imposée, jetons dérivés conformes WCAG 2.2 AA), composants de base.
- Architecture modulaire (`engine`, `features`, `stores`, `services`…) et frontières contrôlées par ESLint.
- Tests Jest : thème et contrastes, classes de largeur, navigation sur les vraies routes, rendu Skia hors écran et encodage PNG.
- Documentation : architecture, dépendances, tests, compilation Android et iOS.
