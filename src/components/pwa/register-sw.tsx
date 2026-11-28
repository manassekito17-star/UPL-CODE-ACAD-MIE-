"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { autoPrepareOffline, keepSavedFilesOffline, registerServiceWorker } from "@/lib/offline/client";
import { appOf, DEFAULT_START, readResume, remember, target, writeResume } from "@/lib/resume";

/**
 * Service worker enregistré sur tout le site : la plateforme et ses éditeurs s'installent sur le
 * téléphone. Étudiant connecté : les éditeurs sont téléchargés automatiquement sur le téléphone (et de nouveau au retour d'Internet s'il en manque) pour une utilisation sans
 * Internet (en arrière-plan, quelques secondes après l'ouverture de la page).
 */
export function RegisterServiceWorker({ loggedIn = false }: { loggedIn?: boolean }) {
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    // Retour d'Internet : les éditeurs qui manquent encore sont téléchargés automatiquement.
    const onOnline = () => {
      clearTimeout(timer);
      timer = setTimeout(() => void autoPrepareOffline(loggedIn, { resume: true }).then(() => keepSavedFilesOffline(loggedIn)), 3000);
    };
    void registerServiceWorker().then((reg) => {
      if (!reg) return;
      // Éditeurs d'abord, puis les fichiers sauvegardés du compte.
      timer = setTimeout(() => void autoPrepareOffline(loggedIn).then(() => keepSavedFilesOffline(loggedIn)), 3000);
      window.addEventListener("online", onOnline);
    });
    return () => {
      clearTimeout(timer);
      window.removeEventListener("online", onOnline);
    };
  }, [loggedIn]);
  return (
    <>
      <ResumeTracker />
      <UpdateBanner />
    </>
  );
}

/**
 * Garde la page de travail en cours (à chaque changement de page et quand on quitte l'application).
 * À l'ouverture « à froid » de l'application installée sur sa page de départ, revient à cette page :
 * on retrouve son travail là où on l'avait laissé.
 */
function ResumeTracker() {
  const pathname = usePathname();
  useEffect(() => {
    const save = () => writeResume(remember(readResume(), window.location.pathname + window.location.search, Date.now()));
    // Ouverture de l'application installée (écran d'accueil) : retour à la dernière page de travail.
    try {
      const standalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as unknown as { standalone?: boolean }).standalone === true;
      const here = window.location.pathname + window.location.search;
      if (standalone && !sessionStorage.getItem("zentech:session")) {
        sessionStorage.setItem("zentech:session", "1");
        const app = appOf(here);
        const back = target(readResume(), app === "site" ? null : app, Date.now());
        if (back && back !== here && here === DEFAULT_START[app]) {
          window.location.replace(back);
          return;
        }
      }
      sessionStorage.setItem("zentech:session", "1");
    } catch {
      /* stockage indisponible */
    }
    save();
    const onHide = () => document.visibilityState === "hidden" && save();
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", save);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", save);
    };
  }, [pathname]);
  return null;
}

const CURRENT = process.env.NEXT_PUBLIC_VERSION ?? "dev";

/**
 * Page restée ouverte (onglet ou application sur l'écran d'accueil) pendant une mise en ligne :
 * elle garde l'ancien code en mémoire. Au retour sur la page, on compare avec la version en ligne
 * et on propose de recharger.
 */
function UpdateBanner() {
  const [available, setAvailable] = useState(false);
  useEffect(() => {
    if (CURRENT === "dev") return;
    let last = 0;
    const check = async () => {
      if (document.visibilityState !== "visible" || !navigator.onLine || Date.now() - last < 60_000) return;
      last = Date.now();
      try {
        const res = await fetch("/api/version", { cache: "no-store" });
        const { version } = (await res.json()) as { version?: string };
        if (version && version !== "dev" && version !== CURRENT) setAvailable(true);
      } catch {
        /* hors ligne : on réessaiera */
      }
    };
    void check();
    const timer = setInterval(() => void check(), 10 * 60_000);
    document.addEventListener("visibilitychange", check);
    window.addEventListener("focus", check);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", check);
      window.removeEventListener("focus", check);
    };
  }, []);
  if (!available) return null;
  return (
    <div role="status" data-testid="nouvelle-version" className="fixed inset-x-3 top-[max(0.75rem,env(safe-area-inset-top))] z-[100] mx-auto flex max-w-md items-center gap-3 rounded-lg bg-nuit-900 px-4 py-3 text-sm text-white shadow-xl">
      <span className="flex-1">Une nouvelle version de ZENTECH est disponible. Enregistrez votre travail, puis mettez à jour.</span>
      <button type="button" onClick={() => window.location.reload()} className="shrink-0 rounded-md bg-electrique-600 px-3 py-1.5 font-semibold hover:bg-electrique-500">
        Mettre à jour
      </button>
      <button type="button" onClick={() => setAvailable(false)} aria-label="Plus tard" className="shrink-0 px-1 text-white/70 hover:text-white">
        ✕
      </button>
    </div>
  );
}
