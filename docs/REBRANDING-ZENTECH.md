# Rebranding ZENTECH — rapport

Nouvelle identité : **ZENTECH** — slogan **BUILD BEYOND LIMITS** — lien souhaité : **zenora-technologie**.
Point de restauration : commit `9aa492e` de `main` (dernier état avant le rebranding).

## Logo (d'après le logo officiel fourni)

Symbole « Z » à circuit vectorisé (tracé) depuis l'image fournie, dégradé bleu électrique `#1677FF` → turquoise `#00D9D0`.
Mot « ZENTECH » en lettres géométriques espacées (police Exo 2, licence OFL), converti en tracés.

| Fichier | Usage |
|---|---|
| `public/brand/zentech-logo-horizontal-blanc.svg` / `-sombre.svg` | logo horizontal (fond sombre / fond clair) |
| `public/brand/zentech-logo-vertical-blanc.svg` / `-sombre.svg` | logo vertical |
| `public/brand/zentech-symbole.svg` | symbole Z seul (dégradé) |
| `public/brand/zentech-symbole-blanc.svg` / `-sombre.svg` | symbole monochrome |
| `public/icons/site-*.png`, `apple-touch-icon.png` | icônes d'application et PWA (192, 512, adaptable) |
| `public/icons/ide-*.png`, `editeur-v2-*.png` | icônes de ZENTECH IDE et ZENTECH Algo |
| `src/app/favicon.ico` | favicon 16/32/48 px |
| `src/app/opengraph-image.tsx` | image de partage (WhatsApp, Facebook, Telegram…) |
| `src/components/brand/zentech-mark.tsx` | composants `ZentechSymbol` et `ZentechWordmark` |

## Appellations remplacées

| Ancienne | Nouvelle |
|---|---|
| UPL CODE ACADEMY MK, UPL CODE ACADEMY, UPL CODE MK | ZENTECH |
| UPL IDE / UPL Algo / UPL Algo Classique / UPL Flow Studio | ZENTECH IDE / ZENTECH Algo / ZENTECH Algo Classique / ZENTECH Flow Studio |
| LEARN. CODE. PRACTICE. MASTER. | BUILD BEYOND LIMITS |
| « interpréteur UPL », « Thème nuit UPL » | « interpréteur ZENTECH », « Thème nuit ZENTECH » |

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

`supabase/rebranding-zentech.sql` : à lancer une fois dans Supabase → SQL Editor. Remplace les anciennes appellations uniquement dans les tables de contenu (cours, niveaux, modules, leçons, quiz, badges, annonces, paramètres). Aucun compte ni donnée personnelle n'est touché. Relançable sans risque.

## Configurations externes à modifier (non faites automatiquement)

1. **Supabase → Authentication → Email Templates** : nom d'expéditeur et textes des e-mails (confirmation, mot de passe oublié).
2. **Google Cloud → OAuth consent screen** : nom de l'application et logo affichés sur l'écran Google.
3. **Vercel** : nom du projet (facultatif) ; domaine personnalisé quand il sera acheté.
4. **Domaine** : aucun domaine n'a été acheté ni configuré. Après achat : ajouter le domaine dans Vercel, mettre à jour `NEXT_PUBLIC_SITE_URL`, puis Supabase (Site URL, Redirect URLs) et Google OAuth (origines JavaScript autorisées).
5. **Application d'authentification (2FA)** : le nom affiché vient du projet Supabase ; les nouveaux appareils portent « ZENTECH ».

## Lien zenora-technologie

Adresse souhaitée : **https://zenora-technologie.vercel.app** (gratuite ; le caractère « _ » est interdit dans une adresse web).
Ce changement se fait dans les réglages des services (pas dans le code) :

1. **Vercel** → projet `upl-code-acad-mie-5zv2` → Settings → Domains → Add → `zenora-technologie.vercel.app` (si le nom est libre). L'ancienne adresse continue de fonctionner.
2. **Vercel** → Settings → Environment Variables → `NEXT_PUBLIC_SITE_URL` = `https://zenora-technologie.vercel.app`, puis Redeploy.
3. **Supabase** → Authentication → URL Configuration : Site URL = la nouvelle adresse ; Redirect URLs : ajouter `https://zenora-technologie.vercel.app/**` (garder l'ancienne).
4. **Google Cloud** → Identifiants → client OAuth : rien à changer pour les « URI de redirection » (elles pointent vers Supabase) ; ajouter la nouvelle adresse dans « Origines JavaScript autorisées » si elle y figure déjà pour l'ancienne.
