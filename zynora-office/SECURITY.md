# Sécurité — ZYNORA OFFICE

## Signaler une vulnérabilité
Ne pas ouvrir de ticket public. Contacter le mainteneur du dépôt en privé (onglet *Security* →
*Report a vulnerability* de GitHub). Réponse visée sous 7 jours.

## Modèle de menace
1. **Document malveillant** reçu par courriel ou téléchargé (principale menace).
2. **Interface compromise** (contenu injecté dans la WebView) qui tenterait d'atteindre le système.
3. **Chaîne d'approvisionnement** : dépendance ou mise à jour piégée.
4. **Perte de données** : écrasement, plantage, base corrompue.

## Protections en place (phase 0)

| Menace | Protection | Où | Testé |
|---|---|---|---|
| Interface compromise | Fenêtre **sans aucune permission Tauri** ; seules 4 commandes applicatives typées ; CSP stricte (`script-src 'self'`, pas d'`eval`, pas de ressources distantes) ; `freezePrototype` | `src-tauri/capabilities`, `tauri.conf.json` | e2e |
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
| Journalisation | Opérations sensibles enregistrées localement (jamais le contenu des documents), journal borné à 10 000 entrées | `packages/database` | unitaire, e2e |
| Licences et dépendances | Contrôle automatique de 446 dépendances ; `pnpm audit` ; versions exactes ; `Cargo.lock` et `pnpm-lock.yaml` versionnés | `scripts/check-licenses.mjs`, CI | CI |
| Secrets | Aucun secret dans le dépôt ni l'interface ; signature et clés de mise à jour prévues dans les secrets GitHub | — | revue |

## Prévu
- **Phase 1** : toutes les ouvertures/enregistrements passent par `security` ; écriture atomique
  (fichier temporaire + renommage) ; corbeille au lieu de suppression ; points de récupération.
- **Phase 2+** : analyseurs XML avec limites de profondeur et de taille ; images décodées en Rust
  avec limites de dimensions ; liens hypertextes ouverts seulement après confirmation.
- **Publication** : mises à jour signées (minisign, clé publique dans l'application, clé privée
  dans les secrets CI) ; binaires signés (Windows, macOS notarisé).
- **IA** : clé utilisateur dans le trousseau du système (`keyring`), jamais en clair ni en base ;
  communications HTTPS uniquement ; envoi de contenu seulement après action explicite.
