# Sécurité — ZYNORA OFFICE

## Signaler une vulnérabilité
Ne pas ouvrir de ticket public. Contacter le mainteneur du dépôt en privé (onglet *Security* →
*Report a vulnerability* de GitHub). Réponse visée sous 7 jours.

## Modèle de menace
1. **Document malveillant** reçu par courriel ou téléchargé (principale menace).
2. **Interface compromise** (contenu injecté dans la WebView) qui tenterait d'atteindre le système.
3. **Chaîne d'approvisionnement** : dépendance ou mise à jour piégée.
4. **Perte de données** : écrasement, plantage, base corrompue.

## Protections en place (phases 0 à 3)

| Menace | Protection | Où | Testé |
|---|---|---|---|
| Interface compromise | Fenêtre **sans aucune permission Tauri** ; seules les commandes applicatives typées (liste : ARCHITECTURE.md §3) ; CSP stricte (`script-src 'self'`, pas d'`eval`, pas de ressources distantes) ; `freezePrototype` | `src-tauri/capabilities`, `tauri.conf.json` | e2e |
| Injection via IPC | Arguments désérialisés en énumérations fermées ; clé ou valeur inconnue rejetée ; limites bornées | `packages/database`, `src-tauri/src/lib.rs` | unitaire |
| Injection SQL | Requêtes paramétrées uniquement | `packages/database` | revue |
| Traversée de chemin | `resolve_within` : normalisation, refus des `..` hors racine, des chemins absolus externes et des liens symboliques sortants | `packages/security/src/paths.rs` | unitaire |
| Noms de fichiers non portables | Caractères interdits, noms réservés Windows (`CON`, `LPT1`…), longueur en octets | idem | unitaire |
| Fichier déguisé | Format réel détecté sur les octets ; incohérence extension/contenu refusée ; fichiers Office chiffrés (OLE) signalés | `format.rs` | unitaire |
| Bombe de décompression | Décompression **réelle** et bornée (taille par entrée, totale, taux), nombre d'entrées limité ; les tailles déclarées ne sont pas crues | `archive.rs` | unitaire |
| Chemins piégés dans un ZIP | `..`, chemins absolus (`/…`, `C:…`), `\`, octets nuls, doublons insensibles à la casse refusés | `archive.rs` | unitaire |
| XXE / « billion laughs » | Toute DTD ou déclaration d'entité dans une partie XML/`.rels` est refusée | `archive.rs` | unitaire |
| Macros | Détectées (VBA, Basic) et signalées ; **jamais exécutées** ; extensions à macros (`.docm`…) non acceptées | `archive.rs`, `format.rs` | unitaire |
| Base d'une version plus récente | Refus d'ouverture (pas de corruption par migration descendante) | `packages/database` | unitaire |
| Choix de fichiers par l'interface | Les dialogues natifs sont ouverts **par Rust** ; l'interface ne transmet que des chemins relatifs à la bibliothèque, revalidés à chaque commande ; le dossier interne `.zynora` est inaccessible | `src-tauri/src/library.rs`, `file-manager` | unitaire, e2e |
| Contrôle puis utilisation (TOCTOU) à l'import | Copie bornée (512 Mo) vers un fichier temporaire, validation **de la copie**, renommage atomique ; fichier temporaire supprimé en cas de refus | `file-manager` | unitaire |
| Contenu incohérent | `.docx` qui contient un paquet ODF (et inversement), type MIME ODF qui ne correspond pas à l'extension : refusés | `file-manager` | unitaire |
| Écrasement | Création, renommage, import et restauration ne remplacent jamais un fichier existant | `file-manager` | unitaire, e2e |
| Suppression accidentelle | Corbeille interne ; annulation immédiate ; suppression définitive seulement après confirmation explicite (bouton sûr focalisé par défaut) | `file-manager`, interface | unitaire, interface, e2e |
| Identifiants de corbeille piégés | Format strict (hexadécimal et tirets) ; chemin d'origine restreint à des composants ordinaires | `file-manager` | unitaire |
| Liens symboliques | Jamais suivis dans la bibliothèque (ni listés, ni cherchés) ; écriture à travers un lien cassé refusée | `security`, `file-manager` | unitaire |
| Fichier à moitié écrit | `write_atomic` : fichier temporaire, `fsync`, renommage, `fsync` du dossier | `file-manager` | unitaire |
| CSV piégé | Une valeur commençant par « = » est importée comme texte ; à l'export, un texte commençant par =, +, - ou @ est préfixé d'une apostrophe (injection CSV) | `spreadsheet-engine` | unitaire |
| Document modifié hors de ZYNORA | Chaque ouverture relit le fichier et le **revalide** (macros, DTD, archive piégée) avant de le passer au moteur | `file-manager` | unitaire |
| Perte de modifications | Copie de récupération toutes les 30 s dans le dossier de l'application (jamais à la place du document) ; fermeture d'un classeur modifié soumise à confirmation | `src-tauri/src/sheets.rs`, interface | unitaire, interface |
| Document texte avec contenu non pris en charge | La lecture DOCX relève tout élément qui ne serait pas réécrit ; `word_save` relit le fichier **sur le disque** et refuse de le remplacer s'il en contient (copie obligatoire, nom libre choisi sans écrasement) | `document-engine`, `src-tauri/src/word.rs` | unitaire, interface |
| Liens piégés dans un document | Seuls `http`, `https` et `mailto` sont acceptés (lecture, saisie et écriture) ; `javascript:`, `file:`… refusés ; un clic dans l'éditeur n'ouvre jamais un lien | `document-engine`, `word/schema.ts` | unitaire, interface |
| Modèle de document forgé par l'interface | `word_save` revalide le modèle : dimensions et marges bornées, couleurs hexadécimales, surlignages de la liste DOCX, tailles de police, noms de police | `document-engine` | unitaire |
| Image piégée (document ou fichier choisi) | Format réel vérifié (PNG, JPEG, GIF) ; décodage borné (32 Mo, 16 384 px de côté, 512 Mo de mémoire) ; aucune image distante (CSP `img-src 'self' data:` ; au collage, seules les images de ZYNORA sont reconnues) ; type annoncé par l'interface revérifié | `document-engine/src/image.rs`, `word.rs`, `word/schema.ts` | unitaire, interface |
| Lecteur tiers qui panique | Paniques de docx-rs et IronCalc rattrapées (`panic = "unwind"` + `catch_unwind`) : erreur affichée, application conservée | `document-engine`, `spreadsheet-engine` | unitaire |
| Saisies démesurées | Cellule ≤ 32 767 caractères ; plage demandée ≤ 20 000 cellules ; CSV ≤ 2 millions de cellules ; insertions bornées | `spreadsheet-engine`, `sheets.rs` | unitaire |
| Téléphone | Bibliothèque dans l'espace privé de l'application ; aucune permission de stockage demandée | `src-tauri/src/lib.rs` | revue |
| Journalisation | Opérations sensibles enregistrées localement (jamais le contenu des documents), journal borné à 10 000 entrées | `packages/database` | unitaire, e2e |
| Licences et dépendances | Contrôle automatique de 533 dépendances ; `pnpm audit` ; versions exactes ; `Cargo.lock` et `pnpm-lock.yaml` versionnés | `scripts/check-licenses.mjs`, CI | CI |
| Secrets | Aucun secret dans le dépôt ni l'interface ; signature et clés de mise à jour prévues dans les secrets GitHub | — | revue |

## Prévu
- **Phase 2** : points de récupération du contenu en cours d'édition ; réconciliation de la
  corbeille après un arrêt survenu en pleine opération.
- **Phase 2+** : analyseurs XML avec limites de profondeur et de taille ; images décodées en Rust
  avec limites de dimensions ; liens hypertextes ouverts seulement après confirmation.
- **Publication** : mises à jour signées (minisign, clé publique dans l'application, clé privée
  dans les secrets CI) ; binaires signés (Windows, macOS notarisé).
- **IA** : clé utilisateur dans le trousseau du système (`keyring`), jamais en clair ni en base ;
  communications HTTPS uniquement ; envoi de contenu seulement après action explicite.
