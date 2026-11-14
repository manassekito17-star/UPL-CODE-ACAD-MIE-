import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { Container } from "../ui";
import { Logo } from "./logo";

export function SiteFooter() {
  return (
    <footer className="mt-16 bg-nuit-950 text-gray-300">
      <Container className="grid gap-8 py-10 sm:grid-cols-3">
        <div className="space-y-3">
          <Logo light />
          <p className="text-xs font-bold tracking-[0.25em] text-cyan-accent">LEARN. CODE. PRACTICE. MASTER.</p>
          <p className="text-sm text-gray-400">L&apos;académie numérique de formation informatique : de la théorie à la pratique, avec un professeur IA à vos côtés.</p>
        </div>
        <div>
          <p className="mb-3 text-sm font-semibold text-white">Apprendre</p>
          <ul className="space-y-2 text-sm">
            <li><Link href="/formation" className="hover:text-cyan-accent">Formation en algorithmique</Link></li>
            <li><Link href="/formations" className="hover:text-cyan-accent">Parcours</Link></li>
            <li><Link href="/exercices" className="hover:text-cyan-accent">Exercices</Link></li>
            <li><Link href="/editeur" className="hover:text-cyan-accent">Éditeur de code</Link></li>
            <li><Link href="/flow" className="hover:text-cyan-accent">UPL Flow Studio (organigrammes)</Link></li>
            <li><Link href="/professeur-ia" className="hover:text-cyan-accent">Professeur IA</Link></li>
            <li><Link href="/telecharger" className="hover:text-cyan-accent">Télécharger l&apos;application</Link></li>
          </ul>
        </div>
        <div>
          <p className="mb-3 text-sm font-semibold text-white">À propos</p>
          <p className="text-sm text-gray-400">
            Plateforme pédagogique destinée aux étudiants de l&apos;UPL et aux étudiants en informatique. Les contenus ne constituent pas le programme officiel de l&apos;université, sauf mention contraire validée par celle-ci.
          </p>
        </div>
      </Container>
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 border-t border-white/10 px-4 py-4 text-center text-xs text-gray-500">
        <span>© {new Date().getFullYear()} {BRAND.name}</span>
        <Link href="/confidentialite" className="hover:text-cyan-accent">Confidentialité</Link>
        <Link href="/conditions" className="hover:text-cyan-accent">Conditions d&apos;utilisation</Link>
      </div>
    </footer>
  );
}
