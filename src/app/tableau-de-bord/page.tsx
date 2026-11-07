import type { Metadata } from "next";
import { BRAND } from "@/lib/brand";
import Link from "next/link";
import { CourseCard } from "@/components/learning/course-card";
import { Markdown } from "@/components/learning/markdown";
import { Badge, ButtonLink, Card, Container, EmptyState, Notice, ProgressBar } from "@/components/ui";
import { formatDate, formatDuration } from "@/components/ui/labels";
import { requireUser } from "@/lib/auth";
import { listCourses } from "@/lib/content/repository";
import { getDashboard } from "@/lib/student";

export const metadata: Metadata = { title: "Tableau de bord" };

const ICONS: Record<string, string> = { play: "▶️", check: "✅", flame: "🔥", book: "📖", trophy: "🏆", star: "⭐", award: "🏅" };

export default async function DashboardPage({ searchParams }: PageProps<"/tableau-de-bord">) {
  const user = await requireUser("/tableau-de-bord");
  const sp = await searchParams;
  const [d, courses] = await Promise.all([getDashboard(user), listCourses()]);
  const progressBySlug = Object.fromEntries(d.progress.map((p) => [p.slug, p.percent]));
  const inProgress = courses.filter((c) => progressBySlug[c.slug] !== undefined);
  const overall = inProgress.length ? inProgress.reduce((s, c) => s + progressBySlug[c.slug], 0) / inProgress.length : 0;
  const weekGoal = d.profile?.weekly_goal_minutes ?? 180;

  return (
    <>
      <section className="bg-nuit-950 text-white">
        <Container className="py-8">
          <p className="text-sm text-cyan-accent">Tableau de bord · {BRAND.name}</p>
          <div className="mt-2 flex flex-wrap items-center gap-4" data-testid="identite-etudiant">
            {user.avatarUrl ? (
              // Photo du profil Google (domaine externe : image simple, sans transmission de l'adresse de la page).
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatarUrl} alt="" width={56} height={56} referrerPolicy="no-referrer" className="h-14 w-14 rounded-full border-2 border-white/20 object-cover" />
            ) : (
              <span className="grid h-14 w-14 place-items-center rounded-full bg-electrique-600 text-xl font-bold" aria-hidden>
                {user.fullName.charAt(0).toUpperCase()}
              </span>
            )}
            <div className="min-w-0">
              <h1 className="text-2xl font-bold sm:text-3xl">Bonjour {user.fullName.split(" ")[0]} 👋</h1>
              <p className="truncate text-sm text-gray-300">
                {user.email}
                {user.providers.includes("google") && <span className="ml-2 rounded bg-white/10 px-1.5 py-0.5 text-[11px]">compte Google</span>}
              </p>
            </div>
          </div>
          <p className="mt-2 text-gray-300">{d.profile?.learning_goal || "Fixez-vous un objectif dans votre profil pour rester motivé."}</p>
          <nav aria-label="Mon espace" className="mt-4 flex flex-wrap gap-2 text-sm">
            {[
              ["/formations", "Mes cours"],
              ["/progression", "Ma progression"],
              ["/exercices", "Mes exercices"],
              ["/ide", "Mes projets"],
              ["/mes-programmes", "Mes programmes"],
              ["/bulletin", "Historique et bulletin"],
              ["/profil", "Paramètres du compte"],
            ].map(([href, label]) => (
              <Link key={href} href={href} className="rounded-full border border-white/15 px-3 py-1 text-gray-200 hover:border-cyan-accent hover:text-white">
                {label}
              </Link>
            ))}
          </nav>
          <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ["Progression générale", `${Math.round(overall)} %`],
              ["Leçons terminées", String(d.lessonsDone)],
              ["Exercices réussis", `${d.solvedCount}`],
              ["Temps d'apprentissage", formatDuration(d.totalMinutes)],
            ].map(([k, v]) => (
              <div key={k} className="rounded-xl bg-white/5 p-4">
                <dt className="text-xs text-gray-400">{k}</dt>
                <dd className="mt-1 text-2xl font-bold">{v}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>
      <Container className="grid gap-6 py-8 lg:grid-cols-3">
        {sp.motdepasse === "modifie" && <div className="lg:col-span-3"><Notice tone="succes">Votre mot de passe a été modifié.</Notice></div>}
        {d.announcements.map((a) => (
          <div key={a.id} className="lg:col-span-3">
            <Notice title={`📢 ${a.title}`}><Markdown>{a.body}</Markdown></Notice>
          </div>
        ))}
        <div className="space-y-6 lg:col-span-2">
          <section>
            <h2 className="mb-3 text-lg font-bold text-nuit-900">Reprendre</h2>
            {d.recent.length === 0 ? (
              <EmptyState title="Vous n'avez pas encore commencé de formation.">
                <ButtonLink href="/formations/algorithmique" className="mt-3">Commencer l&apos;algorithmique</ButtonLink>
              </EmptyState>
            ) : (
              <ul className="space-y-2">
                {d.recent.map((r) => (
                  <li key={r.course.slug}>
                    <Link href={r.lesson ? `/formations/${r.course.slug}/${r.lesson.slug}` : `/formations/${r.course.slug}`} className="flex items-center justify-between gap-3 rounded-xl border border-gris-200 bg-white px-4 py-3 hover:border-electrique-400">
                      <span className="min-w-0">
                        <span className="block text-xs text-gris-500">{r.course.title}</span>
                        <span className="block truncate font-medium text-nuit-900">{r.lesson?.title ?? "Début du parcours"}</span>
                      </span>
                      <span className="shrink-0 text-sm font-semibold text-electrique-600">Continuer →</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <section>
            <h2 className="mb-3 text-lg font-bold text-nuit-900">Mes formations</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {(inProgress.length ? inProgress : courses.slice(0, 2)).map((c) => <CourseCard key={c.slug} course={c} progress={progressBySlug[c.slug] ?? 0} />)}
            </div>
          </section>
          <section>
            <h2 className="mb-3 text-lg font-bold text-nuit-900">Résultats récents</h2>
            {d.recentResults.length === 0 ? (
              <EmptyState title="Aucun exercice soumis pour l'instant."><Link href="/exercices" className="text-electrique-600 underline">Voir les exercices</Link></EmptyState>
            ) : (
              <ul className="divide-y divide-gris-100 rounded-xl border border-gris-200 bg-white">
                {d.recentResults.map((r, i) => (
                  <li key={i} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
                    <Link href={`/exercices/${r.slug}`} className="truncate font-medium text-nuit-900 hover:text-electrique-600">{r.title}</Link>
                    <span className="flex shrink-0 items-center gap-2">
                      <Badge tone={r.status === "reussi" ? "vert" : r.status === "partiel" ? "orange" : "rouge"}>{r.score} / 100</Badge>
                      <span className="text-xs text-gris-500">{formatDate(r.at)}</span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
        <aside className="space-y-6">
          <Card className="p-5">
            <h2 className="font-bold text-nuit-900">Objectif de la semaine</h2>
            <p className="mt-1 text-sm text-gris-700">{formatDuration(d.weekMinutes)} sur {formatDuration(weekGoal)}</p>
            <ProgressBar className="mt-3" value={(d.weekMinutes / Math.max(1, weekGoal)) * 100} />
            <Link href="/profil" className="mt-3 inline-block text-xs text-electrique-600 hover:underline">Modifier mes objectifs</Link>
          </Card>
          <Card className="p-5">
            <h2 className="mb-2 font-bold text-nuit-900">Exercices à terminer</h2>
            {d.toFinish.length === 0 ? (
              <p className="text-sm text-gris-500">Rien en attente. 👏</p>
            ) : (
              <ul className="space-y-1.5 text-sm">
                {d.toFinish.map((e) => <li key={e.slug}><Link href={`/exercices/${e.slug}`} className="text-electrique-600 hover:underline">{e.title}</Link></li>)}
              </ul>
            )}
          </Card>
          <Card className="p-5">
            <h2 className="mb-3 font-bold text-nuit-900">Badges</h2>
            {d.badges.length === 0 ? (
              <p className="text-sm text-gris-500">Exécutez votre premier programme pour obtenir un badge !</p>
            ) : (
              <ul className="grid grid-cols-2 gap-2">
                {d.badges.map((b) => (
                  <li key={b.code} className="rounded-lg bg-gris-50 p-2 text-center" title={b.description}>
                    <span className="text-2xl" aria-hidden>{ICONS[b.icon] ?? "🏅"}</span>
                    <p className="text-xs font-semibold text-nuit-900">{b.title}</p>
                  </li>
                ))}
              </ul>
            )}
          </Card>
          {d.certificates.length > 0 && (
            <Card className="p-5">
              <h2 className="mb-2 font-bold text-nuit-900">Certificats</h2>
              <ul className="space-y-2 text-sm">
                {d.certificates.map((c) => (
                  <li key={c.code}>
                    🎓 {c.course}
                    {c.level ? ` — niveau ${c.level}` : ""}{" "}
                    <a href={`/certificats/${c.code}`} className="text-electrique-600 hover:underline">vérifier</a>
                    <span className="block text-xs text-gris-500">Certificat interne · code {c.code}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
          <ButtonLink href="/bulletin" className="w-full">Mon bulletin de progression</ButtonLink>
          <ButtonLink href="/progression" variant="secondaire" className="w-full">Voir mes statistiques détaillées</ButtonLink>
        </aside>
      </Container>
    </>
  );
}
