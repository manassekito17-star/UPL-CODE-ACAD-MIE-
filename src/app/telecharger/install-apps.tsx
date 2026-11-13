"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { InstallPromptEvent } from "@/components/ide/offline-dialog";
import { Card } from "@/components/ui";

type Platform = "iphone" | "android" | "ordinateur";

const APPS = [
  {
    id: "plateforme",
    name: "UPL CODE ACADEMY MK",
    icon: "/icons/site-apple-touch-icon.png",
    text: "La plateforme complète : formations, exercices, professeur IA, progression et certificats.",
    open: "/tableau-de-bord",
  },
  {
    id: "ide",
    name: "UPL IDE",
    icon: "/icons/apple-touch-icon.png",
    text: "L'environnement de développement : projets, fichiers et dossiers, HTML/CSS/JS, Python, PHP, SQL… même sans Internet.",
    open: "/ide",
  },
  {
    id: "algo",
    name: "UPL Algo",
    icon: "/icons/editeur-apple-touch-icon.png",
    text: "L'éditeur d'algorithmes plein écran : pseudocode, console, clavier de symboles, utilisable sans Internet.",
    open: "/editeur?langage=pseudocode",
  },
] as const;

function detect(): Platform {
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)) return "iphone";
  if (/Android/.test(ua)) return "android";
  return "ordinateur";
}

/** Bouton « Partager » d'iPhone (carré avec une flèche), dessiné pour le reconnaître. */
function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" className="inline h-5 w-5 align-text-bottom text-electrique-600" fill="none" stroke="currentColor" strokeWidth="2" aria-label="bouton Partager">
      <path d="M12 3v12M7 8l5-5 5 5" />
      <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" />
    </svg>
  );
}

export function InstallApps() {
  const [platform, setPlatform] = useState<Platform | null>(null);
  const [installEvent, setInstallEvent] = useState<InstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Informations de l'appareil, connues seulement dans le navigateur.
    /* eslint-disable react-hooks/set-state-in-effect */
    setPlatform(detect());
    /* eslint-enable react-hooks/set-state-in-effect */
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as InstallPromptEvent);
    };
    const onInstalled = () => setInstalled(true);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const installPlatform = async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    if ((await installEvent.userChoice).outcome === "accepted") setInstalled(true);
    setInstallEvent(null);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-2 text-sm" role="group" aria-label="Choisir votre appareil">
        {(["android", "iphone", "ordinateur"] as const).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPlatform(p)}
            className={`rounded-full border px-4 py-1.5 font-semibold ${platform === p ? "border-electrique-600 bg-electrique-600 text-white" : "border-gris-200 bg-white text-nuit-900"}`}
          >
            {p === "android" ? "Android" : p === "iphone" ? "iPhone / iPad" : "Ordinateur"}
          </button>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-3" data-testid="applications">
        {APPS.map((app) => (
          <Card key={app.id} className="flex flex-col p-5" data-testid={`appli-${app.id}`}>
            <div className="mb-3 flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={app.icon} alt={`Icône ${app.name}`} width={64} height={64} className="h-16 w-16 rounded-2xl shadow-md" />
              <h2 className="text-lg font-bold text-nuit-900">{app.name}</h2>
            </div>
            <p className="mb-4 flex-1 text-sm text-gris-700">{app.text}</p>
            {platform === "iphone" ? (
              <div className="space-y-3 text-sm">
                <ol className="list-decimal space-y-1.5 pl-5 text-gris-700">
                  <li>
                    Touchez <b>« Ouvrir {app.name} »</b> ci-dessous (dans <b>Safari</b> de préférence).
                  </li>
                  <li>
                    Touchez le bouton <b>Partager</b> <ShareIcon /> en bas de l&apos;écran (ou en haut sur iPad).
                  </li>
                  <li>
                    Faites défiler et choisissez <b>« Sur l&apos;écran d&apos;accueil »</b>, puis <b>« Ajouter »</b>.
                  </li>
                </ol>
                <Link href={app.id === "plateforme" ? app.open : `${app.open}${app.open.includes("?") ? "&" : "?"}installer=1`} className="block rounded-lg bg-electrique-600 px-4 py-2.5 text-center font-semibold text-white">
                  Ouvrir {app.name}
                </Link>
              </div>
            ) : app.id === "plateforme" && installEvent ? (
              <button type="button" onClick={() => void installPlatform()} className="rounded-lg bg-electrique-600 px-4 py-2.5 font-semibold text-white">
                Installer {app.name}
              </button>
            ) : app.id === "plateforme" && installed ? (
              <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800">✓ Installée : retrouvez l&apos;icône sur votre écran d&apos;accueil.</p>
            ) : (
              <div className="space-y-3 text-sm">
                {app.id === "plateforme" && (
                  <p className="text-gris-700">
                    {platform === "android" ? (
                      <>Dans <b>Chrome</b> : menu <b>⋮</b> → <b>« Installer l&apos;application »</b> (et non « Créer un raccourci »).</>
                    ) : (
                      <>Dans <b>Chrome</b> ou <b>Edge</b> : icône d&apos;installation à droite de la barre d&apos;adresse, puis <b>« Installer »</b>.</>
                    )}
                  </p>
                )}
                <Link href={`${app.open}${app.open.includes("?") ? "&" : "?"}installer=1`} className="block rounded-lg bg-electrique-600 px-4 py-2.5 text-center font-semibold text-white">
                  {app.id === "plateforme" ? `Ouvrir ${app.name}` : `Installer ${app.name}`}
                </Link>
              </div>
            )}
          </Card>
        ))}
      </div>

      <Card className="p-5 text-sm text-gris-700">
        <h2 className="mb-2 font-bold text-nuit-900">Bon à savoir</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Chaque application a sa propre icône et s&apos;ouvre en plein écran, sans la barre du navigateur, comme une application du magasin.</li>
          <li>Gratuit et léger : rien à télécharger depuis Play Store ou App Store, les mises à jour sont automatiques.</li>
          <li>UPL IDE et UPL Algo fonctionnent aussi <b>sans Internet</b> : dans l&apos;application, menu → « Installer · utiliser sans Internet » → « Télécharger pour utiliser sans Internet ».</li>
          <li>Sur Android, si une icône porte le petit logo Chrome, c&apos;est un simple raccourci : supprimez-la et installez de nouveau avec « Installer l&apos;application ».</li>
          <li>Sur iPhone, l&apos;installation se fait depuis <b>Safari</b> (ou Chrome récent) avec le bouton Partager : Apple n&apos;autorise pas de bouton « Installer » automatique.</li>
        </ul>
      </Card>
    </div>
  );
}
