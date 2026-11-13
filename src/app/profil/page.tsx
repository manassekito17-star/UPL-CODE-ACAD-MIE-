import type { Metadata } from "next";
import Link from "next/link";
import { Card, Container, Notice, PageHeader } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { publicEnv } from "@/lib/env";
import { POSITIONS, QUICK_ACCESS_IDLE_DAYS, SEXES } from "@/lib/quick-access";
import { createClient } from "@/lib/supabase/server";
import { linkGoogle } from "./actions";
import { AddEmailForm, ProfileForm, type ProfileData } from "./profile-form";

export const metadata: Metadata = { title: "Mon profil" };

const ROLE_LABELS = { etudiant: "Étudiant", enseignant: "Enseignant", administrateur: "Administrateur" };

export default async function ProfilePage({ searchParams }: PageProps<"/profil">) {
  const sp = await searchParams;
  const user = await requireUser("/profil");
  const supabase = await createClient();
  let { data } = await supabase
    .from("profiles")
    .select("full_name, first_name, last_name, position, sex, student_number, faculty, level, learning_goal, weekly_goal_minutes, created_at")
    .eq("id", user.id)
    .single();
  if (!data) {
    // Base pas encore mise à jour (colonnes de l'accès rapide absentes) : champs historiques seulement.
    const old = await supabase.from("profiles").select("full_name, student_number, faculty, level, learning_goal, weekly_goal_minutes, created_at").eq("id", user.id).single();
    data = old.data ? { ...old.data, first_name: null, last_name: null, position: null, sex: null } : null;
  }
  const p = data as (ProfileData & { created_at: string }) | null;
  const hasGoogle = user.providers.includes("google");
  const initials = (p?.first_name?.[0] ?? user.fullName[0] ?? "?").toUpperCase() + (p?.last_name?.[0] ?? "").toUpperCase();
  const method = user.isAnonymous ? "Accès rapide (sans mot de passe)" : hasGoogle ? "Google" : "Adresse e-mail";
  return (
    <>
      <PageHeader title="Mon profil" subtitle={`${user.email || method} · ${user.roles.map((r) => ROLE_LABELS[r]).join(", ")}`} />
      <Container className="grid gap-6 py-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-6">
          {sp.liaison === "google" && <Notice tone="succes">Votre profil est maintenant lié à Google : connectez-vous avec Google sur tous vos appareils.</Notice>}
          {sp.liaison === "desactivee" && <Notice tone="alerte">La liaison à Google n&apos;est pas encore activée sur cette installation (réglage « Manual linking » de Supabase).</Notice>}
          {sp.liaison === "erreur" && <Notice tone="erreur">Liaison à Google impossible : ce compte Google est peut-être déjà utilisé par un autre profil.</Notice>}
          <Card className="flex flex-wrap items-center gap-5 p-6" data-testid="carte-profil">
            {user.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatarUrl} alt="" className="h-20 w-20 rounded-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <span className="grid h-20 w-20 place-items-center rounded-full bg-electrique-600 text-2xl font-bold text-white" aria-hidden>{initials}</span>
            )}
            <dl className="grid flex-1 grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
              <div><dt className="text-gris-500">Nom</dt><dd className="font-semibold text-nuit-900">{p?.last_name || "—"}</dd></div>
              <div><dt className="text-gris-500">Prénom</dt><dd className="font-semibold text-nuit-900">{p?.first_name || (p?.last_name ? "—" : user.fullName)}</dd></div>
              <div><dt className="text-gris-500">Poste</dt><dd className="font-semibold text-nuit-900">{p?.position ? POSITIONS[p.position as keyof typeof POSITIONS] : "—"}</dd></div>
              <div><dt className="text-gris-500">Sexe</dt><dd className="font-semibold text-nuit-900">{p?.sex ? SEXES[p.sex as keyof typeof SEXES] : "—"}</dd></div>
              <div><dt className="text-gris-500">Filière</dt><dd className="font-semibold text-nuit-900">{p?.faculty || "—"}</dd></div>
              <div><dt className="text-gris-500">Profil créé le</dt><dd className="font-semibold text-nuit-900">{p?.created_at ? new Date(p.created_at).toLocaleDateString("fr-FR") : "—"}</dd></div>
            </dl>
          </Card>
          {p && <Card className="p-6"><h2 className="mb-4 text-lg font-bold text-nuit-900">Modifier mes informations</h2><ProfileForm profile={p} /></Card>}
        </div>
        <aside className="space-y-3 text-sm">
          <Card className="p-5" data-testid="methode-connexion">
            <p className="font-semibold text-nuit-900">Connexion</p>
            <p className="mt-1 text-gris-700">Méthode : <strong>{method}</strong></p>
            {user.isAnonymous && (
              <div className="mt-3 rounded-md bg-amber-50 p-3 text-xs text-amber-900">
                Accès rapide : votre espace est gardé <strong>sur cet appareil</strong> (session fermée après {QUICK_ACCESS_IDLE_DAYS} jours sans visite, ou si vous vous déconnectez).
                Ce profil n&apos;est pas vérifié : nom et prénom ne prouvent pas votre identité. Pour retrouver vos projets sur un autre appareil et ne rien perdre, liez-le à Google.
              </div>
            )}
            {!hasGoogle && publicEnv.googleAuth && (
              <form action={linkGoogle} className="mt-3">
                <button type="submit" className="w-full rounded-lg border border-gris-200 bg-white px-3 py-2 font-semibold text-nuit-900 hover:bg-gris-50">Lier mon profil à Google</button>
              </form>
            )}
            {user.isAnonymous && <AddEmailForm />}
            {!user.isAnonymous && (
              <Link href="/mot-de-passe-oublie" className="mt-3 block text-electrique-600 hover:underline">Changer mon mot de passe</Link>
            )}
            <form action="/auth/deconnexion" method="post" className="mt-3">
              <button type="submit" className="text-erreur hover:underline">Se déconnecter</button>
            </form>
          </Card>
          <Card className="p-5">
            <p className="font-semibold text-nuit-900">Mes données</p>
            <p className="mt-2 text-gris-700">Vos programmes, résultats et conversations ne sont visibles que par vous et, pour le suivi pédagogique, par l&apos;équipe enseignante.</p>
            <Link href="/mes-programmes" className="mt-2 block text-electrique-600 hover:underline">Mes programmes</Link>
          </Card>
        </aside>
      </Container>
    </>
  );
}
