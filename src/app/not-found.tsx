import { ButtonLink, Container } from "@/components/ui";

export default function NotFound() {
  return (
    <Container className="py-20 text-center">
      <p className="font-mono text-5xl font-black text-electrique-600">404</p>
      <h1 className="mt-4 text-2xl font-bold text-nuit-900">Page introuvable</h1>
      <p className="mt-2 text-gris-700">Cette page n&apos;existe pas ou n&apos;est pas encore publiée.</p>
      <ButtonLink href="/formations" className="mt-6">Voir les formations</ButtonLink>
    </Container>
  );
}
