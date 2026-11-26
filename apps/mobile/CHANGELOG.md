# Journal des versions

Format inspiré de [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/),
versions selon [SemVer](https://semver.org/lang/fr/).

## [Non publié]

### Module M2 — Historique (Annuler / Rétablir)

- Moteur (`engine/history`) : chaque action réussie devient un état nommé ; Annuler, Rétablir, aller à un état, supprimer un état et les suivants, effacer l'historique. 50 états par document ; une nouvelle action après un retour abandonne les états rétablissables. Les documents étant immuables, un état est le document lui-même : les calques inchangés sont partagés et les images ne sont jamais copiées.
- Store des documents : `mutateDocument(id, opération, libellé)` enregistre l'état ; une opération refusée ou sans effet n'en crée pas. Un document ouvert depuis une image part de l'état « Ouvrir » (rien à annuler).
- Actions nommées : Nouveau calque de forme / de texte, Importer une image, Dupliquer, Supprimer, Renommer, Afficher / Masquer, Verrouiller / Déverrouiller, Disposition des calques, Aligner, Déplacer, Transformation manuelle, Opacité du calque, Modifier le calque de texte / de forme.
- Après Annuler ou Rétablir, la sélection est retirée si son calque n'existe plus.
- Téléphone : boutons Annuler et Rétablir de la barre supérieure actifs (l'action est annoncée aux lecteurs d'écran).
- Tablette : menu Édition « Annuler : Déplacer » / « Rétablir : … » ; panneau Historique réel (états, état courant, états annulés grisés, compteur sur 50, annuler, rétablir, effacer et supprimer avec confirmation ; « Nouveau document à partir de l'état » prévu M3).
- L'historique vit en mémoire avec le document : il n'est pas enregistré (comme dans les logiciels de retouche), l'enregistrement du document arrive avec M3.
- Tests : 262 (250 avant).

### Module M1 (partie 2) — Interface fidèle aux références

- Décision de l'utilisateur (26/11/2026) : l'interface peut reproduire celle des logiciels de retouche de référence ; ni logo ni icône Adobe, nom et identité ZENTECH DESIGN conservés.
- Barre d'options : bouton Accueil, outil et menu de l'outil (réinitialiser), cases « Sélection auto : Calque » et « Afficher les options de transformation » (réelles : sans sélection auto, un tap ne change pas la sélection et un glisser déplace le calque sélectionné ; sans options de transformation, pas de poignées), à droite recherche (prévue M17), espace de travail (réinitialiser Essentiels), partage (prévu M4).
- Barre d'outils : « >> » une ou deux colonnes, « … » (prévu), couleurs de premier plan / arrière-plan avec permuter et par défaut, mode Masque (prévu M6), mode plein écran avec barre de menus (réel, aussi dans Affichage).
- Onglet du document : fermeture à gauche, « Affiche @ 38% (Texte 1, RVB/8) * ».
- Colonne d'icônes à gauche du dock : Historique, Navigateur, Caractère, Paragraphe, ouverts en fenêtre flottante. **Navigateur réel** : vignette du document (même rendu que la toile), cadre rouge de la partie visible, toucher pour centrer, zoom.
- Dock : « << / >> » réduit le dock en icônes ; menu « ≡ » par groupe (réduire, fermer l'onglet, fermer le groupe) ; toucher l'onglet actif réduit le groupe ; onglets renommés Réglages et Couches.
- Panneau Calques : « Type » avec filtres image / texte / forme cumulables et interrupteur (réels ; réglage et objet dynamique prévus), mode de fusion et « Opacité : », « Verrou : » et « Fond : » (prévu M7), liste défilante.
- Barre d'état : zoom saisissable, « Doc : 5,93M/7,81M » (estimation aplatie / avec calques), menu « › » pour afficher dimensions, nombre de calques ou outil actif.
- Moteur : `pickDragLayer`, options `autoSelect` et `showTransformControls` de la toile, `centerOn`, taille de la vue dans les valeurs partagées.
- Tests : 250 (241 avant).

### Module M1 (partie 1) — Espace studio tablette et grand écran

- Nouvel espace de travail sur tablette et grand écran (hauteur ≥ 520 dp ; le téléphone, y compris en paysage, garde son espace) : barre de menus (Fichier, Édition, Image, Calque, Texte, Sélection, Filtre, Affichage, Fenêtre, Aide), barre d'options contextuelle, barre d'outils verticale par familles, onglet du document, règles, toile, dock de panneaux à onglets, barre d'état. Palette graphite dense, identité propre (aucune icône ni marque tierce).
- Menus : actions réelles (nouveau, ouvrir une image, fermer, insérer texte / formes / image, dupliquer, supprimer avec confirmation, renommer, masquer, verrouiller, disposition, gras et alignement du texte, zoom, règles, panneaux, réinitialisation de l'espace) ; les commandes futures sont désactivées et nomment leur module.
- Outils : 51 outils en 20 familles. Disponibles : Déplacement, Main, Zoom, Texte horizontal, Rectangle, Ellipse, Ligne. Les autres ouvrent leur famille, désactivés, avec leur module.
- Barre d'options : X, Y, L, H, angle et six alignements sur le document (Déplacement) ; zoom (Main, Zoom) ; graisse, taille, alignement et couleur (Texte) ; remplissage et géométrie (Formes).
- Couleurs de premier plan et d'arrière-plan (permuter, par défaut) ; les nouvelles formes et les nouveaux textes prennent la couleur de premier plan.
- Panneau Couleur (sélecteur TSV dessiné par Skia, code hexadécimal, valeurs RVB et TSL), Nuancier, Propriétés (transformation, aspect, texte, image, document), Calques (filtre par type, opacité, tout verrouiller, visibilité, vignettes, arrière-plan verrouillé, renommage par appui long, ajout, suppression confirmée). Ajustements, Canaux, Tracés et Historique : présents, contenu annoncé pour M9, M15, M12 et M2.
- Règles horizontale et verticale en pixels du document, qui suivent le zoom et le déplacement sur le thread UI ; masquables sans recréer la toile.
- Moteur : `alignLayer` (boîte englobante du calque tourné) ; `DocumentCanvas` accepte une vue partagée et une couleur de table de travail.
- Tests : 241 au total, 195 avant le module (espace studio, catalogue d'outils, alignement, état de l'espace, règles, conversions TSV). Les tests des panneaux du téléphone les rendent désormais directement (`tests/helpers/PhonePanels.tsx`).
- Aucune nouvelle dépendance, aucune nouvelle autorisation.

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
