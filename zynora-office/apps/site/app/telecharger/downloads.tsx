"use client";

import { useEffect, useState } from "react";

import { DOWNLOAD_BASE, DOWNLOADS, PLATFORM_ORDER, type Platform } from "../content";

type Detected = Platform | "iphone";

function detect(): Detected {
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)) return "iphone";
  if (/Android/.test(ua)) return "android";
  if (/Mac/.test(ua)) return "macos";
  if (/Linux|X11/.test(ua)) return "linux";
  return "windows";
}

export function Downloads() {
  const [device, setDevice] = useState<Detected | null>(null);
  // L'appareil n'est connu que dans le navigateur (la page est générée à l'avance).
  useEffect(() => setDevice(detect()), []);
  const order = device && device !== "iphone" ? [device, ...PLATFORM_ORDER.filter((p) => p !== device)] : PLATFORM_ORDER;

  return (
    <div className="downloads" data-testid="telechargements">
      {device === "iphone" && (
        <p className="warning" data-testid="iphone">
          <strong>iPhone et iPad :</strong> la version iOS n&apos;est pas encore disponible. Vous pouvez télécharger ZYNORA Office pour votre ordinateur ci-dessous.
        </p>
      )}
      <div className="platforms">
        {order.map((p, index) => {
          const d = DOWNLOADS[p];
          const mine = index === 0 && device === p;
          return (
            <article key={p} className={`card platform${mine ? " platform--mine" : ""}`} data-testid={`plateforme-${p}`}>
              <header>
                <h2>{d.title}</h2>
                {mine && <span className="badge">Votre appareil</span>}
              </header>
              <ul className="files">
                {d.files.map((f) => (
                  <li key={f.file}>
                    <a href={`${DOWNLOAD_BASE}/${f.file}`} rel="noopener" className="file">
                      <span>⬇ {f.label}</span>
                      <small>{f.hint}</small>
                    </a>
                  </li>
                ))}
              </ul>
              <ol className="steps">
                {d.steps.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ol>
            </article>
          );
        })}
      </div>
    </div>
  );
}
