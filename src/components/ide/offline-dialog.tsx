"use client";

import { useEffect, useState } from "react";
import { offlineReadyInfo, offlineSupported, prepareOffline } from "@/lib/offline/client";
import { cn } from "../ui";

/** Événement d'installation proposé par Chrome, Edge et Android. */
export interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

type Platform = "ios" | "android" | "ordinateur";

function platform(): Platform {
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)) return "ios";
  if (/Android/.test(ua)) return "android";
  return "ordinateur";
}

export function isStandalone(): boolean {
  return window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
}

/**
 * Fenêtre « Installer UPL IDE et l'utiliser sans Internet » : installation sur
 * l'écran d'accueil (comme PharmaGestion), puis téléchargement des fichiers
 * nécessaires pour travailler sans connexion.
 */
export function OfflineDialog({
  open,
  onClose,
  installEvent,
  onInstalled,
  online,
  loadLanguages,
  warmPython,
  warmEngines,
  warmPhpSql,
  appName = "UPL IDE",
  features,
}: {
  open: boolean;
  onClose: () => void;
  installEvent: InstallPromptEvent | null;
  onInstalled: () => void;
  online: boolean;
  loadLanguages: () => Promise<void>;
  warmPython: () => Promise<void>;
  warmEngines: () => Promise<void>;
  /** Télécharge PHP 8.3 et SQLite (facultatif, environ 13 Mo). */
  warmPhpSql?: () => Promise<void>;
  /** Nom de l'application installée (UPL IDE, ou l'éditeur d'algorithmes « UPL »). */
  appName?: string;
  /** Liste « Ce qui marche sans Internet » propre à l'application. */
  features?: React.ReactNode;
}) {
  const [withPython, setWithPython] = useState(true);
  const [withPhp, setWithPhp] = useState(false);
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState<string | null>(null);
  const [message, setMessage] = useState<{ tone: "ok" | "erreur"; text: string } | null>(null);
  const [ready, setReady] = useState<{ at: string; python: boolean } | null>(null);
  const [env, setEnv] = useState<{ platform: Platform; standalone: boolean; supported: boolean } | null>(null);

  useEffect(() => {
    if (!open) return;
    // Informations de l'appareil, connues seulement dans le navigateur.
    /* eslint-disable react-hooks/set-state-in-effect */
    setReady(offlineReadyInfo());
    setEnv({ platform: platform(), standalone: isStandalone(), supported: offlineSupported() });
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [open]);

  if (!open || !env) return null;

  const install = async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    const choice = await installEvent.userChoice;
    if (choice.outcome === "accepted") onInstalled();
  };

  const prepare = async () => {
    setBusy(true);
    setMessage(null);
    try {
      const r = await prepareOffline({
        loadLanguages: async () => {
          await loadLanguages();
          await warmEngines();
        },
        warmPython: withPython ? warmPython : undefined,
        extraEngines: withPhp && warmPhpSql ? [{ label: "PHP 8.3 et SQLite (environ 13 Mo)…", run: warmPhpSql }] : [],
        onStep: setStep,
      });
      setReady(offlineReadyInfo());
      setMessage({ tone: "ok", text: `Prêt : ${appName} fonctionne maintenant sans Internet sur cet appareil (${r.ok} fichier(s) enregistrés).` });
    } catch (e) {
      setMessage({ tone: "erreur", text: e instanceof Error ? e.message : "Préparation impossible." });
    } finally {
      setBusy(false);
      setStep(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-black/60 p-3" role="dialog" aria-modal="true" aria-labelledby="titre-hors-ligne" onClick={onClose}>
      <div className="max-h-full w-full max-w-lg overflow-auto rounded-lg border border-[var(--ide-border)] bg-[var(--ide-menu)] p-5 text-sm text-[var(--ide-text)] shadow-2xl" onClick={(e) => e.stopPropagation()} data-testid="ide-hors-ligne">
        <div className="mb-3 flex items-start gap-3">
          <h2 id="titre-hors-ligne" className="flex-1 text-lg font-semibold">Installer {appName} et l&apos;utiliser sans Internet</h2>
          <button type="button" onClick={onClose} aria-label="Fermer" className="rounded px-2 text-lg text-[var(--ide-muted)] hover:bg-[var(--ide-hover)]">✕</button>
        </div>
        <p className={cn("mb-4 inline-block rounded px-2 py-0.5 text-xs", online ? "bg-emerald-500/15 text-emerald-300" : "bg-amber-500/15 text-amber-300")}>{online ? "● Connecté à Internet" : "● Hors connexion"}</p>

        <section className="mb-5">
          <h3 className="mb-1 font-semibold">1. Installer sur l&apos;appareil</h3>
          {env.standalone ? (
            <p className="text-emerald-300">✓ {appName} est installé : vous l&apos;utilisez depuis son icône.</p>
          ) : installEvent ? (
            <>
              <p className="mb-2 text-[var(--ide-muted)]">{appName} s&apos;ajoute à l&apos;écran d&apos;accueil (ou aux programmes de l&apos;ordinateur) et s&apos;ouvre comme une vraie application, avec sa propre icône, sans magasin d&apos;applications.</p>
              <button type="button" onClick={() => void install()} className="rounded bg-[var(--ide-accent)] px-3 py-1.5 font-semibold text-white">Installer {appName}</button>
            </>
          ) : env.platform === "ios" ? (
            <ol className="list-decimal space-y-1 pl-5 text-[var(--ide-muted)]">
              <li>Ouvrez cette page dans <b className="text-[var(--ide-text)]">Safari</b>.</li>
              <li>Touchez le bouton <b className="text-[var(--ide-text)]">Partager</b> (carré avec une flèche vers le haut).</li>
              <li>Choisissez <b className="text-[var(--ide-text)]">« Sur l&apos;écran d&apos;accueil »</b>, puis <b className="text-[var(--ide-text)]">Ajouter</b>.</li>
            </ol>
          ) : env.platform === "android" ? (
            <ol className="list-decimal space-y-1 pl-5 text-[var(--ide-muted)]">
              <li>Ouvrez cette page dans <b className="text-[var(--ide-text)]">Chrome</b>.</li>
              <li>Touchez le menu <b className="text-[var(--ide-text)]">⋮</b> en haut à droite.</li>
              <li>
                Choisissez <b className="text-[var(--ide-text)]">« Installer l&apos;application »</b>. Si Chrome propose « Ajouter à l&apos;écran d&apos;accueil », touchez ensuite{" "}
                <b className="text-[var(--ide-text)]">« Installer »</b> (et non « Créer un raccourci »).
              </li>
              <li>
                Une ancienne icône porte le petit logo Chrome ? C&apos;est un simple raccourci : supprimez-la (appui long → Supprimer), puis installez à nouveau
                avec « Installer l&apos;application ».
              </li>
            </ol>
          ) : (
            <p className="text-[var(--ide-muted)]">
              Dans <b className="text-[var(--ide-text)]">Chrome</b> ou <b className="text-[var(--ide-text)]">Edge</b>, cliquez sur l&apos;icône d&apos;installation (écran avec une flèche) à droite de la barre
              d&apos;adresse, puis sur « Installer ». {appName} s&apos;ouvre alors dans sa propre fenêtre, avec son icône sur le bureau et dans le menu Démarrer.
            </p>
          )}
        </section>

        <section className="mb-5">
          <h3 className="mb-1 font-semibold">2. Télécharger pour travailler sans Internet</h3>
          {!env.supported ? (
            <p className="text-amber-300">Ce navigateur ne permet pas l&apos;utilisation hors ligne. Utilisez Chrome, Edge ou Safari récent.</p>
          ) : (
            <>
              <p className="mb-2 text-[var(--ide-muted)]">Une seule fois, avec Internet : l&apos;éditeur, ses langages{withPython ? ", Python et K+" : ""} sont enregistrés sur cet appareil.</p>
              <label className="mb-3 flex items-center gap-2">
                <input type="checkbox" checked={withPython} onChange={(e) => setWithPython(e.target.checked)} disabled={busy} />
                Inclure Python (environ 10 Mo)
              </label>
              {warmPhpSql && (
                <label className="mb-3 flex items-center gap-2">
                  <input type="checkbox" checked={withPhp} onChange={(e) => setWithPhp(e.target.checked)} disabled={busy} />
                  Inclure PHP 8.3 et SQL (SQLite) (environ 13 Mo)
                </label>
              )}
              <button type="button" onClick={() => void prepare()} disabled={busy || !online} className="rounded bg-[var(--ide-accent)] px-3 py-1.5 font-semibold text-white disabled:opacity-50" data-testid="ide-preparer-hors-ligne">
                {busy ? "Téléchargement…" : ready ? "Mettre à jour la version hors ligne" : "Télécharger pour utiliser sans Internet"}
              </button>
              {!online && !busy && <p className="mt-2 text-xs text-amber-300">Connectez-vous à Internet pour télécharger.</p>}
              {step && <p className="mt-2 text-xs text-[var(--ide-muted)]" role="status">{step}</p>}
              {message && <p className={cn("mt-2 text-xs", message.tone === "ok" ? "text-emerald-300" : "text-red-300")} role="status">{message.text}</p>}
              {ready && !message && <p className="mt-2 text-xs text-emerald-300">✓ Déjà prêt sur cet appareil (le {new Date(ready.at).toLocaleString("fr-FR")}{ready.python ? ", avec Python" : ""}).</p>}
            </>
          )}
        </section>

        <section>
          <h3 className="mb-1 font-semibold">Ce qui marche sans Internet</h3>
          {features ?? (
          <ul className="space-y-0.5 text-[var(--ide-muted)]">
            <li>✓ Éditeur, fichiers et dossiers, projet enregistré sur l&apos;appareil</li>
            <li>✓ Pseudocode, JavaScript{ready?.python || withPython ? ", Python, K+" : ""} et aperçu des pages HTML/CSS</li>
            <li>✓ Clavier de programmation, modèles de fichiers, balises Emmet</li>
            <li>✗ C et Java (exécutés sur le serveur), professeur IA, cours en ligne</li>
            <li>↻ Projets du compte : modifications gardées sur l&apos;appareil et envoyées au retour de la connexion</li>
          </ul>
          )}
        </section>
      </div>
    </div>
  );
}
