"use client";

import dynamic from "next/dynamic";

/** L'interface classique ne s'affiche que dans le navigateur (mise à l'échelle selon l'écran). */
export const LarpStudioLoader = dynamic(() => import("@/components/larp/larp-studio").then((m) => m.LarpStudio), {
  ssr: false,
  loading: () => <div className="fixed inset-0 z-40 grid place-items-center bg-[#3a6ea5] text-sm text-white">Chargement de UPL Algo Classique…</div>,
});
