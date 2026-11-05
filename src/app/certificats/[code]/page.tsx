import type { Metadata } from "next";
import { Card, Container, Notice } from "@/components/ui";
import { LEVEL_NAMES } from "@/content/types";
import { getCurrentUser } from "@/lib/auth";
import { verifyCertificate } from "@/lib/levels/certificates";
import { INTERNAL_NOTICE_SHORT } from "@/lib/levels/notice";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Vérification de certificat", robots: { index: false } };

export default async function CertificatePage({ params }: PageProps<"/certificats/[code]">) {
  const { code } = await params;
  const cert = await verifyCertificate(code);
  const user = await getCurrentUser();
  let own = false;
  if (cert && user) {
    const supabase = await createClient();
    const { data } = await supabase.from("certificates").select("id").eq("verification_code", code).eq("user_id", user.id).maybeSingle();
    own = Boolean(data);
  }
  return (
    <Container className="max-w-2xl py-12">
      <h1 className="text-3xl font-extrabold text-nuit-900">Vérification de certificat</h1>
      {!cert ? (
        <div className="mt-6">
          <Notice tone="erreur">Aucun certificat ne correspond à ce code.</Notice>
        </div>
      ) : (
        <Card className="mt-6 space-y-2 p-6" data-testid="certificat-verifie">
          <p className="text-sm font-semibold uppercase tracking-wide text-green-700">✓ Certificat authentique</p>
          <p className="text-xl font-bold text-nuit-900">{cert.fullName || "Étudiant(e) UPL Code Academy"}</p>
          <p className="text-gris-700">
            {cert.level ? `Niveau ${cert.level} — ${LEVEL_NAMES[cert.level]} validé` : "Parcours complet achevé"} · <strong>{cert.courseTitle}</strong>
          </p>
          {cert.levelTitle && <p className="text-sm text-gris-500">{cert.levelTitle}</p>}
          <p className="text-sm text-gris-700">
            Délivré le {new Date(cert.issuedAt).toLocaleDateString("fr-FR")}
            {cert.score !== null && ` · examen réussi avec ${cert.score} %`}
          </p>
          <p className="font-mono text-xs text-gris-500">Code : {cert.code}</p>
          {own && (
            <a href={`/certificats/${cert.code}/pdf`} className="inline-block text-sm font-medium text-electrique-600 hover:underline">
              Télécharger mon certificat (PDF)
            </a>
          )}
        </Card>
      )}
      <p className="mt-6 text-xs text-gris-500">{INTERNAL_NOTICE_SHORT}</p>
    </Container>
  );
}
