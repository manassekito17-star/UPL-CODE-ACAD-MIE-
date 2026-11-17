# Rebranding ZiTECH — rapport

Nouvelle identité : **ZiTECH** — slogan **BUILD BEYOND LIMITS**.
Point de restauration : commit `9aa492e` de `main` (dernier état avant le rebranding).

## Logo (d'après le logo officiel fourni)

Symbole « Z » à circuit vectorisé (tracé) depuis l'image fournie, dégradé bleu électrique `#1677FF` → turquoise `#00D9D0`.
Mot « ZiTECH » en lettres géométriques espacées (police Exo 2, licence OFL), converti en tracés.

| Fichier | Usage |
|---|---|
| `public/brand/zitech-logo-horizontal-blanc.svg` / `-sombre.svg` | logo horizontal (fond sombre / fond clair) |
| `public/brand/zitech-logo-vertical-blanc.svg` / `-sombre.svg` | logo vertical |
| `public/brand/zitech-symbole.svg` | symbole Z seul (dégradé) |
| `public/brand/zitech-symbole-blanc.svg` / `-sombre.svg` | symbole monochrome |
| `public/icons/site-*.png`, `apple-touch-icon.png` | icônes d'application et PWA (192, 512, adaptable) |
| `public/icons/ide-*.png`, `editeur-v2-*.png` | icônes de ZiTECH IDE et ZiTECH Algo |
| `src/app/favicon.ico` | favicon 16/32/48 px |
| `src/app/opengraph-image.tsx` | image de partage (WhatsApp, Facebook, Telegram…) |
| `src/components/brand/zitech-mark.tsx` | composants `ZitechSymbol` et `ZitechWordmark` |

## Appellations remplacées

| Ancienne | Nouvelle |
|---|---|
| UPL CODE ACADEMY MK, UPL CODE ACADEMY, UPL CODE MK | ZiTECH |
| UPL IDE / UPL Algo / UPL Algo Classique / UPL Flow Studio | ZiTECH IDE / ZiTECH Algo / ZiTECH Algo Classique / ZiTECH Flow Studio |
| LEARN. CODE. PRACTICE. MASTER. | BUILD BEYOND LIMITS |
| « interpréteur UPL », « Thème nuit UPL » | « interpréteur ZiTECH », « Thème nuit ZiTECH » |

Couvert : accueil, en-tête, pied de page, connexion / inscription, tableau de bord, administration, éditeurs (IDE, Algo, Flow Studio, interface LARP), annonces et avis, certificats et bulletins PDF, résumés PDF, professeur IA, manifestes PWA, métadonnées, image de partage, documentation, tests.
Hyper Academy : aucune occurrence trouvée.

Conservé volontairement :
- l'avis « initiative indépendante, non officielle de l'Université Protestante de Lubumbashi » (protection juridique) ; la phrase « destinée aux étudiants de l'UPL » est retirée ;
- les exemples et exercices dont les textes contiennent « UPL » (ex. « Bonjour UPL ») : contenu pédagogique corrigé automatiquement, non modifié ;
- les adresses (`/connexion`, `/inscription`, `/tableau-de-bord`, `/ide`, `/editeur`, `/flow`…) : inchangées, aucun lien cassé, Google OAuth intact ;
- les identifiants techniques (paquet, projet Supabase, tables, clés de stockage `upl:…`, en-tête `X-UPL-Hors-Ligne`) : les renommer effacerait les brouillons des étudiants.

## Palette

Bleu nuit `#020817`, bleu électrique `#1677FF`, turquoise `#00D9D0`, gris secondaire `#AAB4C3` (jetons du thème mis à jour ; le bleu des textes sur fond blanc reste un peu plus foncé, `#0E62E0`, pour la lisibilité).

## Base de données

`supabase/rebranding-zitech.sql` : à lancer une fois dans Supabase → SQL Editor. Remplace les anciennes appellations uniquement dans les tables de contenu (cours, niveaux, modules, leçons, quiz, badges, annonces, paramètres). Aucun compte ni donnée personnelle n'est touché. Relançable sans risque.

## Configurations externes à modifier (non faites automatiquement)

1. **Supabase → Authentication → Email Templates** : nom d'expéditeur et textes des e-mails (confirmation, mot de passe oublié).
2. **Google Cloud → OAuth consent screen** : nom de l'application et logo affichés sur l'écran Google.
3. **Vercel** : nom du projet (facultatif) ; domaine personnalisé quand il sera acheté.
4. **Domaine** : aucun domaine n'a été acheté ni configuré. Après achat : ajouter le domaine dans Vercel, mettre à jour `NEXT_PUBLIC_SITE_URL`, puis Supabase (Site URL, Redirect URLs) et Google OAuth (origines JavaScript autorisées).
5. **Application d'authentification (2FA)** : le nom affiché vient du projet Supabase ; les nouveaux appareils portent « ZiTECH ».
