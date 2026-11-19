"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui";

/** Version GitHub publiée automatiquement par la CI après réussite de tous les tests. */
export const RELEASE_URL = "https://github.com/manassekito17-star/UPL-CODE-ACAD-MIE-/releases/tag/zynora-office-preview";
const DOWNLOAD_BASE = "https://github.com/manassekito17-star/UPL-CODE-ACAD-MIE-/releases/download/zynora-office-preview";

type Platform = "windows" | "macos" | "linux" | "android" | "iphone";

interface Download {
  file: string;
  label: string;
  hint: string;
}

export const DOWNLOADS: Record<Exclude<Platform, "iphone">, { title: string; files: Download[]; steps: string[] }> = {
  windows: {
    title: "Windows 10 et 11",
    files: [
      { file: "ZYNORA-Office-Windows-x64-setup.exe", label: "Installateur (.exe)", hint: "Recommandé" },
      { file: "ZYNORA-Office-Windows-x64.msi", label: "Paquet MSI", hint: "Déploiement en entreprise" },
    ],
    steps: [
      "Ouvrez le fichier téléchargé.",
      "Si Windows affiche « Windows a protégé votre ordinateur », cliquez sur « Informations complémentaires » puis « Exécuter quand même » : l'application n'est pas encore signée.",
    ],
  },
  macos: {
    title: "macOS (Mac à puce Apple)",
    files: [{ file: "ZYNORA-Office-macOS-AppleSilicon.dmg", label: "Image disque (.dmg)", hint: "Mac M1 et plus récents" }],
    steps: [
      "Ouvrez le .dmg et glissez ZYNORA Office dans « Applications ».",
      "Au premier lancement, faites un clic droit sur l'application puis « Ouvrir » : elle n'est pas encore notarisée par Apple.",
    ],
  },
  linux: {
    title: "Linux",
    files: [
      { file: "ZYNORA-Office-Linux-x86_64.AppImage", label: "AppImage", hint: "Toutes distributions" },
      { file: "ZYNORA-Office-Linux-amd64.deb", label: "Paquet .deb", hint: "Debian, Ubuntu" },
      { file: "ZYNORA-Office-Linux-x86_64.rpm", label: "Paquet .rpm", hint: "Fedora, openSUSE" },
    ],
    steps: ["AppImage : rendez le fichier exécutable (clic droit → Propriétés, ou chmod +x) puis lancez-le.", "Paquets : installez-les avec votre gestionnaire de logiciels."],
  },
  android: {
    title: "Android (téléphone, tablette)",
    files: [{ file: "ZYNORA-Office-Android-arm64-test.apk", label: "APK de test", hint: "Android 7 et plus" }],
    steps: [
      "Téléchargez l'APK depuis le téléphone, puis ouvrez-le.",
      "Autorisez l'installation depuis cette source quand Android le demande.",
      "Version de test : l'import de fichiers depuis le stockage du téléphone n'est pas encore disponible.",
    ],
  },
};

const ORDER: Array<Exclude<Platform, "iphone">> = ["windows", "macos", "linux", "android"];

function detect(): Platform {
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)) return "iphone";
  if (/Android/.test(ua)) return "android";
  if (/Mac/.test(ua)) return "macos";
  if (/Linux|X11/.test(ua)) return "linux";
  return "windows";
}

export function Downloads() {
  const [platform, setPlatform] = useState<Platform | null>(null);

  useEffect(() => {
    // L'appareil n'est connu que dans le navigateur.
    /* eslint-disable react-hooks/set-state-in-effect */
    setPlatform(detect());
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  // L'appareil du visiteur est présenté en premier.
  const ordered = platform && platform !== "iphone" ? [platform, ...ORDER.filter((p) => p !== platform)] : ORDER;

  return (
    <div className="space-y-5" data-testid="telechargements">
      {platform === "iphone" && (
        <Card className="border-amber-300 bg-amber-50 p-5 text-sm text-amber-900" data-testid="iphone">
          <b>iPhone et iPad :</b> la version iOS n&apos;est pas encore disponible (elle doit être compilée sur un Mac et publiée sur l&apos;App Store). Vous pouvez télécharger ZYNORA Office pour votre ordinateur ci-dessous.
        </Card>
      )}
      <div className="grid gap-5 md:grid-cols-2">
        {ordered.map((p, index) => {
          const d = DOWNLOADS[p];
          const recommended = index === 0 && platform === p;
          return (
            <Card key={p} className={`flex flex-col p-5 ${recommended ? "ring-2 ring-electrique-600" : ""}`} data-testid={`plateforme-${p}`}>
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="text-lg font-bold text-nuit-900">{d.title}</h3>
                {recommended && <span className="rounded-full bg-electrique-600 px-2.5 py-0.5 text-xs font-semibold text-white">Votre appareil</span>}
              </div>
              <ul className="mb-4 space-y-2">
                {d.files.map((f) => (
                  <li key={f.file}>
                    <a
                      href={`${DOWNLOAD_BASE}/${f.file}`}
                      className="flex items-center justify-between gap-3 rounded-lg border border-gris-200 bg-white px-4 py-2.5 font-semibold text-nuit-900 hover:border-electrique-600 hover:text-electrique-600"
                      rel="noopener"
                    >
                      <span>⬇ {f.label}</span>
                      <span className="text-xs font-normal text-gris-600">{f.hint}</span>
                    </a>
                  </li>
                ))}
              </ul>
              <ol className="mt-auto list-decimal space-y-1 pl-5 text-sm text-gris-700">
                {d.steps.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ol>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
