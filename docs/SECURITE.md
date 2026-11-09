# Sécurité de UPL CODE ACADEMY MK

Ce document décrit les protections en place, les réglages à faire dans Supabase et Vercel,
et la marche à suivre pour revenir en arrière. Aucune application n'est invulnérable :
ces mesures réduisent les risques, elles ne les suppriment pas.

## Protections en place

| Domaine | Mesure | Où |
|---|---|---|
| Comptes | Connexion obligatoire (sauf accueil et pages légales) | `src/proxy.ts` |
| Comptes | Tentatives limitées par adresse IP **et** par compte, compteurs partagés en base, blocage progressif (15 min, doublé en cas de récidive, 24 h au plus — jamais définitif) | `src/lib/security/attempts.ts`, table `rate_limits` |
| Comptes | Mots de passe gérés uniquement par Supabase Auth (jamais stockés ni journalisés par l'application) | — |
| Sessions | Cookies `HttpOnly`, `SameSite=Lax`, `Secure` en production | `src/lib/supabase/cookies.ts` |
| Redirections | Retour après connexion limité aux pages du site (`//`, `/\`, adresses externes refusés) | `src/lib/security/safe-redirect.ts` |
| Google | Navigateurs intégrés (WhatsApp, Telegram, Facebook…) : rien n'est bloqué, un bouton propose d'ouvrir Chrome (Android) ou Safari (iPhone) | `src/components/auth/in-app-notice.tsx` |
| Administration | Rôles vérifiés par la base (RLS) : impossible de devenir administrateur depuis le navigateur | migrations |
| Administration | Second facteur (TOTP) facultatif ; une fois activé, il est **imposé par la base** (`is_admin()` exige une session « aal2 ») | `/admin/securite`, `/verification-mfa` |
| Fichiers | Type et taille limités par Supabase Storage, et vérification du contenu réel (signature) des ressources | `src/lib/security/file-signature.ts` |
| Navigateur | CSP complète, HSTS, `nosniff`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, pas d'en-tête `X-Powered-By` | `next.config.ts` |
| Code source | Pas de cartes de sources publiques (`productionBrowserSourceMaps: false`), code minifié | `next.config.ts` |
| Erreurs | Messages génériques pour les utilisateurs, détails seulement dans les journaux du serveur | `src/lib/api.ts` |
| Diagnostic | `/api/sante` : visiteurs → `{ ok }` uniquement ; détails réservés aux administrateurs | `src/app/api/sante/route.ts` |
| Code étudiant | Exécuté dans le navigateur (Pyodide, iframe `sandbox`) ou par Judge0 — jamais sur le serveur principal | — |
| Secrets | `SUPABASE_SERVICE_ROLE_KEY`, clés IA et Judge0 : uniquement côté serveur (variables Vercel « Sensitive ») | — |

### Limites connues (honnêtement)

- La CSP garde `'unsafe-inline'` et `'unsafe-eval'` : Next.js, l'éditeur Monaco et le moteur Python en ont besoin.
- Les appels de connexion partent des serveurs Vercel : les limites d'adresse IP **de Supabase** voient donc l'adresse de Vercel. La limite par IP réelle est faite par l'application.
- Le second facteur est facultatif (aucun administrateur n'est bloqué) ; il est fortement recommandé.
- Les tests ont été faits sur navigateur automatisé (ordinateur et téléphone simulé), pas sur de vrais téléphones.

## Réglages à faire une fois

1. **Supabase → SQL Editor** : exécuter `supabase/migrations/20261112000001_securite.sql` (script relançable sans risque).
2. **Supabase → Authentication → Multi-Factor** : vérifier que « TOTP (App Authenticator) » est activé.
3. **Vercel** : `SUPABASE_SERVICE_ROLE_KEY` doit être de type « Sensitive » et ne jamais commencer par `NEXT_PUBLIC_`.
4. **Administration → Sécurité du compte** : activer le second facteur pour chaque administrateur.

## Perte du téléphone (second facteur)

Dans Supabase → SQL Editor, supprimer le facteur de l'administrateur concerné :

```sql
delete from auth.mfa_factors
 where user_id = (select id from auth.users where email = 'adresse@exemple.com');
```

L'administrateur se reconnecte avec son mot de passe et peut réactiver le second facteur.

## Retour arrière

Aucune donnée n'est supprimée par la migration. Pour annuler (SQL Editor) :

```sql
-- Rôles et administration : versions précédentes
create or replace function public.has_role(p_role public.app_role)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.user_roles ur join public.profiles p on p.id = ur.user_id
    where ur.user_id = (select auth.uid()) and ur.role = p_role and p.status = 'actif');
$$;
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select public.has_role('administrateur');
$$;
create or replace function public.can_teach(p_permission text)
returns boolean language sql stable security definer set search_path = '' as $$
  select public.is_admin() or exists (select 1 from public.user_roles ur join public.profiles p on p.id = ur.user_id
    where ur.user_id = (select auth.uid()) and ur.role = 'enseignant' and p.status = 'actif' and p_permission = any (ur.permissions));
$$;
revoke execute on function public.has_role(public.app_role) from anon;
revoke execute on function public.is_admin() from anon;
revoke execute on function public.can_teach(text) from anon;

-- Limitation des tentatives (l'application revient alors à la limite en mémoire)
drop function if exists public.rate_limit_hit(text, integer, integer, integer, boolean);
drop function if exists public.rate_limit_reset(text);
drop table if exists public.rate_limits;

-- Stockage : retirer les limites de type et de taille
update storage.buckets set file_size_limit = null, allowed_mime_types = null where id in ('ressources', 'avatars');
```

Côté application : dans Vercel → Deployments, choisir le déploiement précédent puis « Promote to Production »
(retour immédiat, sans toucher au code). Les en-têtes (CSP…) se trouvent dans `next.config.ts`.
