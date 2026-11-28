# Expérience « logiciel de retouche de bureau » — audit et plan

Demande du 27/11/2026 : retrouver les parcours de Photoshop Desktop (accueil,
Nouveau document, éditeur, Enregistrer sous, Exporter sous, raccourcis),
sous la marque ZENTECH DESIGN, sans ressource ni code d'Adobe.

## Audit (état au 28/11/2026, avant le lot A)

| Demande | État avant | Remarque |
|---|---|---|
| Accueil : nouveau, ouvrir, importer, projets récents | Partiel | Liste simple, pas de menu par projet, pas de « Fichiers » |
| Menu de projet : ouvrir, renommer, dupliquer, supprimer, infos | Partiel | Ouvrir et supprimer seulement |
| Documents partagés, profil, découvrir | Absent | Pas de compte ni de partage en ligne : **non proposés** (aucune rubrique vide) |
| Nouveau document : catégories, préréglages | Partiel | 6 préréglages en pixels |
| Unités px / po / cm / mm, résolution | Absent | — |
| Mode colorimétrique, profondeur | RVB 8 bits | Le moteur (Skia RGBA 8888) ne gère **ni CMJN, ni niveaux de gris, ni 16/32 bits** : affichés désactivés avec la raison |
| Fond blanc / noir / transparent / couleur | Partiel | Couleur personnalisée absente |
| Préréglages personnels enregistrés | Absent | — |
| Éditeur : menus, outils, toile, onglets, règles, panneaux, barre d'état | Fait (M1–M4) | Repères et grille : absents (M16) ; réarrangement des panneaux : absent |
| Enregistrement : automatique, indicateur, récupération | Fait (M3) | Dans la base de l'application |
| Fichier natif `.zdesign` dans un dossier, Ouvrir un fichier | Absent | Faisable : sélecteurs du système (expo-file-system), archive zip (fflate, MIT) |
| Premier enregistrement → Enregistrer sous ; confirmation à la fermeture ; sauvegarde automatique réglable | Absent | Change le modèle « tout est enregistré automatiquement » |
| Exporter sous : PNG, JPEG | Fait (M4) | Aperçu, largeur/hauteur libres, taille estimée : absents |
| WebP | Absent | **Encodage WebP vérifié** dans le moteur |
| PDF | Absent | **Non disponible** : Skia contient un module PDF mais il n'est pas exposé à l'application ; ne sera pas proposé sans développement natif |
| Profil colorimétrique | sRGB | Pas de conversion : affiché « sRGB » sans option |
| Raccourcis clavier | Absent (M17) | React Native ne transmet pas le clavier matériel : web faisable, Android et iOS demandent un petit module natif |
| Téléphone : menus accessibles, panneaux en tiroirs | Partiel | Pas de menus sur téléphone |

## Plan par lots

| Lot | Contenu | État |
|---|---|---|
| A | Accueil professionnel ; fenêtre Nouveau document (8 catégories, préréglages en unités physiques, résolution, fond personnalisé, préréglages personnels) ; format de projet v2 | **Livré** |
| B | Parcours d'enregistrement : document « non enregistré » jusqu'au premier Enregistrer ; Enregistrer sous (nom + emplacement : application ou dossier `.zdesign`) ; Enregistrer une copie ; Ouvrir / Ouvrir récent ; Importer ; Informations du document ; confirmation à la fermeture ; sauvegarde automatique réglable ; récupération | **Livré** |
| C | Exporter sous : aperçu, largeur / hauteur / %, résolution écrite dans le fichier, WebP, taille estimée, emplacement affiché, partage | **Livré** |
| D | Raccourcis clavier (web, puis module natif Android / iOS) et commandes tactiles équivalentes | **Livré** (web et Android ; iOS : module présent, capture à faire sur Mac) |
| E | Téléphone : menus complets en tiroir, panneaux en tiroirs ; grille et repères ; réarrangement des panneaux | **Livré** (réarrangement par menu, sans glisser-déposer) |
| F | Les 6 parcours de validation demandés, automatisés (Jest + navigateur) | Au fil des lots |

## Lot E — livré

- Téléphone : tiroir « Menus » (mêmes menus que la tablette, sans les
  commandes propres à la tablette) ; Fenêtre ouvre six panneaux en feuille.
- Repères (dans le document, format 3), grille (réglage d'affichage),
  magnétisme (document, repères, calques, grille).
- Réarrangement des panneaux par le menu ≡ (vers un groupe, un nouveau
  groupe, la colonne d'icônes ; monter / descendre un groupe) et espaces de
  travail enregistrés sur l'appareil.
- Limites : pas de glisser-déposer des onglets entre groupes ; le
  magnétisme s'applique au déplacement, pas encore au redimensionnement ;
  les repères ne sont pas exportés (comme dans les logiciels de bureau) ;
  sur le téléphone, pas de règles, donc les repères se créent par
  Affichage › Nouveau repère….
- Vérifié dans le navigateur : repère créé en glissant depuis chaque règle,
  déplacé puis retiré à l'outil Déplacement, rectangle aimanté au centre du
  document (et non aimanté une fois le magnétisme coupé), grille, tiroir et
  feuilles du téléphone, disposition et espace « Retouche » retrouvés après
  rechargement de la page.

## Lot B — livré

- Voir CHANGELOG. Limite connue : sur iOS, l'accès à un dossier choisi ne
  dure que la session ; après un redémarrage, « Enregistrer » vers ce
  fichier peut échouer : l'application le dit et propose « Enregistrer
  sous ». La version enregistrée dans l'application, elle, reste à jour.
- Parcours vérifiés : TEST 2 (image, texte, forme, enregistrer), TEST 3
  (redémarrage, réouverture, calques présents), TEST 6 (avertissement à la
  fermeture), en tests automatisés et dans le navigateur.

## Lot A — livré

- Accueil : barre supérieure (logo, Paramètres), colonne de gauche (Nouveau
  projet, Ouvrir, Importer une image ; Accueil, Fichiers), création rapide
  (document personnalisé, publication carrée, story, grand écran, A4),
  « Récent » en grille ou en liste, tri (récent, nom, taille), filtre par
  nom ; menu de chaque projet (Ouvrir, Renommer, Dupliquer, Informations,
  Supprimer avec confirmation) ; fiche d'informations (dimensions, taille
  d'impression, résolution, mode, fond, calques, dates).
- Nouveau document : catégories Récent, Enregistré, Photo, Impression,
  Illustration, Web, Mobile, Film et vidéo ; préréglages en pixels,
  centimètres, millimètres ou pouces convertis avec la résolution ; tous
  dans les limites de l'appareil (A3 proposé à 250 ppp, la raison est
  écrite) ; détails : nom, largeur, hauteur, unité, orientation, résolution
  (px/pouce ou px/cm, raccourcis 72 / 150 / 300), mode RVB 8 bits, fond
  blanc / noir / transparent / couleur personnalisée ; aperçu (pixels,
  taille d'impression, mémoire) ; préréglages personnels enregistrés sur
  l'appareil.
- Format de projet v2 (résolution, couleur de fond) avec migration des
  projets v1 ; base de données schéma v2 (table des réglages).
