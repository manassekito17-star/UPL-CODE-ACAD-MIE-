import type { Metadata } from "next";
import Link from "next/link";
import { Card, Container, PageHeader } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm, type ProfileData } from "./profile-form";

export const metadata: Metadata = { title: "Mon profil" };

const ROLE_LABELS = { etudiant: "Étudiant", enseignant: "Enseignant", administrateur: "Administrateur" };

export default async function ProfilePage() {
  const user = await requireUser("/profil");
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("full_name, student_number, faculty, level, learning_goal, weekly_goal_minutes").eq("id", user.id).single();
  return (
    <>
      <PageHeader title="Mon profil" subtitle={`${user.email} · ${user.roles.map((r) => ROLE_LABELS[r]).join(", ")}`} />
      <Container className="grid gap-6 py-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <Card className="p-6"><ProfileForm profile={data as ProfileData} /></Card>
        <aside className="space-y-3 text-sm">
          <Card className="p-5">
            <p className="font-semibold text-nuit-900">Sécurité</p>
            <Link href="/mot-de-passe-oublie" className="mt-2 block text-electrique-600 hover:underline">Changer mon mot de passe</Link>
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
