import { ButtonLink, Container } from "@/components/ui";

export const metadata = { title: "Accès refusé" };

export default function AccessDenied() {
  return (
    <Container className="py-20 text-center">
      <p className="text-5xl">🔒</p>
      <h1 className="mt-4 text-2xl font-bold text-nuit-900">Accès refusé</h1>
      <p className="mt-2 text-gris-700">Vous n&apos;avez pas les droits nécessaires pour accéder à cette page.</p>
      <ButtonLink href="/tableau-de-bord" className="mt-6">Retour au tableau de bord</ButtonLink>
    </Container>
  );
}
