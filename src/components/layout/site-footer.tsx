import Link from "next/link";
import { Container } from "../ui";
import { Logo } from "./logo";

export function SiteFooter() {
  return (
    <footer className="mt-16 bg-nuit-950 text-gray-300">
      <Container className="grid gap-8 py-10 sm:grid-cols-3">
        <div className="space-y-3">
          <Logo light />
          <p className="text-sm text-gray-400">L&apos;académie numérique de formation informatique : de la théorie à la pratique, avec un professeur IA à vos côtés.</p>
        </div>
        <div>
          <p className="mb-3 text-sm font-semibold text-white">Apprendre</p>
          <ul className="space-y-2 text-sm">
            <li><Link href="/formations" className="hover:text-cyan-accent">Formations</Link></li>
            <li><Link href="/exercices" className="hover:text-cyan-accent">Exercices</Link></li>
            <li><Link href="/editeur" className="hover:text-cyan-accent">Éditeur de code</Link></li>
            <li><Link href="/professeur-ia" className="hover:text-cyan-accent">Professeur IA</Link></li>
          </ul>
        </div>
        <div>
          <p className="mb-3 text-sm font-semibold text-white">À propos</p>
          <p className="text-sm text-gray-400">
            Plateforme pédagogique destinée aux étudiants de l&apos;UPL et aux étudiants en informatique. Les contenus ne constituent pas le programme officiel de l&apos;université, sauf mention contraire validée par celle-ci.
          </p>
        </div>
      </Container>
      <div className="border-t border-white/10 py-4 text-center text-xs text-gray-500">© {new Date().getFullYear()} UPL Code Academy</div>
    </footer>
  );
}
