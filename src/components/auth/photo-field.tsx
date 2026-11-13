"use client";

import { useRef, useState } from "react";

/** Réduit une image à 512 px (côté le plus long) et la convertit en JPEG (data URL). */
async function resize(file: File): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error("Image illisible"));
      i.src = url;
    });
    const scale = Math.min(1, 512 / Math.max(img.naturalWidth, img.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
    canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.85);
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Photo de profil : choisir une image ou prendre une photo (téléphone). Envoyée réduite, jamais l'original. */
export function PhotoField({ name = "avatar_data", initialUrl, label = "Photo (facultatif)" }: { name?: string; initialUrl?: string | null; label?: string }) {
  const [preview, setPreview] = useState<string | null>(initialUrl ?? null);
  const [data, setData] = useState("");
  const [error, setError] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);
  return (
    <div>
      <span className="mb-1 block text-sm font-medium text-nuit-900">{label}</span>
      <div className="flex items-center gap-4">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Aperçu de la photo" className="h-16 w-16 rounded-full object-cover" data-testid="apercu-photo" />
        ) : (
          <span className="grid h-16 w-16 place-items-center rounded-full bg-gris-100 text-2xl text-gris-500" aria-hidden>👤</span>
        )}
        <div className="flex flex-col gap-1">
          <button type="button" onClick={() => input.current?.click()} className="rounded-lg border border-gris-200 bg-white px-3 py-2 text-sm font-semibold text-nuit-900 hover:bg-gris-50">
            {preview ? "Changer la photo" : "Ajouter une photo"}
          </button>
          {data && (
            <button type="button" onClick={() => { setData(""); setPreview(initialUrl ?? null); if (input.current) input.current.value = ""; }} className="text-left text-xs text-gris-500 hover:underline">
              Retirer
            </button>
          )}
        </div>
      </div>
      <input
        ref={input}
        type="file"
        accept="image/*"
        className="sr-only"
        aria-label={label}
        data-testid="choisir-photo"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          setError(null);
          if (!file) return;
          if (!file.type.startsWith("image/")) return setError("Choisissez une image (JPEG, PNG…).");
          try {
            const url = await resize(file);
            setData(url);
            setPreview(url);
          } catch {
            setError("Cette image ne peut pas être lue. Essayez une autre photo (JPEG ou PNG).");
          }
        }}
      />
      <input type="hidden" name={name} value={data} />
      {error && <p className="mt-1 text-xs text-erreur">{error}</p>}
    </div>
  );
}
