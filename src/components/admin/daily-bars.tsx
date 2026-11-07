"use client";

import { useState } from "react";

/**
 * Histogramme quotidien, une seule série (pas de légende : le titre la nomme).
 * Barres fines à extrémité arrondie, espace de 2 px, axe discret, valeur
 * maximale étiquetée, infobulle au survol ou au toucher, tableau accessible.
 */
export function DailyBars({ title, data, unit, testId }: { title: string; data: Array<{ day: string; value: number }>; unit: string; testId?: string }) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 640;
  const H = 180;
  const padL = 28;
  const padB = 22;
  const max = Math.max(1, ...data.map((d) => d.value));
  const slot = (W - padL) / Math.max(1, data.length);
  const bar = Math.min(18, Math.max(3, slot - 2));
  const y = (v: number) => (H - padB) * (1 - v / max);
  const peak = data.reduce((best, d, i) => (d.value > (data[best]?.value ?? -1) ? i : best), 0);
  const fmtDay = (d: string) => new Date(`${d}T00:00:00Z`).toLocaleDateString("fr-FR", { day: "numeric", month: "short", timeZone: "UTC" });
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <figure className="relative" data-testid={testId}>
      <figcaption className="mb-1 flex items-baseline justify-between gap-2">
        <span className="text-sm font-semibold text-nuit-900">{title}</span>
        <span className="text-xs text-gris-500">{total.toLocaleString("fr-FR")} sur {data.length} jours</span>
      </figcaption>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-44 w-full" role="img" aria-label={`${title} : ${total} au total sur ${data.length} jours, maximum ${data[peak]?.value ?? 0} le ${data[peak] ? fmtDay(data[peak].day) : ""}`} onMouseLeave={() => setHover(null)}>
        <line x1={padL} x2={W} y1={H - padB} y2={H - padB} stroke="#d5dbe5" strokeWidth={1} />
        <line x1={padL} x2={W} y1={y(max)} y2={y(max)} stroke="#eef1f5" strokeWidth={1} />
        <text x={padL - 6} y={y(max) + 4} textAnchor="end" fontSize={10} fill="#5b6b85">{max}</text>
        <text x={padL - 6} y={H - padB + 4} textAnchor="end" fontSize={10} fill="#5b6b85">0</text>
        {data.map((d, i) => {
          const x = padL + i * slot + (slot - bar) / 2;
          const h = (H - padB) - y(d.value);
          const r = Math.min(4, bar / 2, h);
          return (
            <g key={d.day} onMouseEnter={() => setHover(i)} onFocus={() => setHover(i)} onTouchStart={() => setHover(i)} tabIndex={0} aria-label={`${fmtDay(d.day)} : ${d.value} ${unit}`}>
              {/* Zone de survol plus large que la barre */}
              <rect x={padL + i * slot} y={0} width={slot} height={H - padB} fill="transparent" />
              {d.value > 0 && <path d={`M${x},${H - padB} V${H - padB - h + r} Q${x},${H - padB - h} ${x + r},${H - padB - h} H${x + bar - r} Q${x + bar},${H - padB - h} ${x + bar},${H - padB - h + r} V${H - padB} Z`} fill={hover === i ? "#1549b8" : "#1d5fe0"} />}
            </g>
          );
        })}
        {data[peak] && data[peak].value > 0 && (
          <text x={padL + peak * slot + slot / 2} y={y(data[peak].value) - 5} textAnchor="middle" fontSize={10} fontWeight={600} fill="#0a1a3a">{data[peak].value}</text>
        )}
        {[0, Math.floor((data.length - 1) / 2), data.length - 1].filter((v, i, a) => data[v] && a.indexOf(v) === i).map((i) => (
          <text key={i} x={padL + i * slot + slot / 2} y={H - 6} textAnchor="middle" fontSize={10} fill="#5b6b85">{fmtDay(data[i].day)}</text>
        ))}
      </svg>
      {hover !== null && data[hover] && (
        <div className="pointer-events-none absolute top-8 rounded-md border border-gris-200 bg-white px-2 py-1 text-xs shadow" style={{ left: `${Math.min(80, ((padL + hover * slot) / W) * 100)}%` }} role="status">
          <strong>{data[hover].value.toLocaleString("fr-FR")}</strong> {unit} · {fmtDay(data[hover].day)}
        </div>
      )}
      <details className="mt-1 text-xs text-gris-700">
        <summary className="cursor-pointer text-gris-500">Voir le tableau</summary>
        <table className="mt-1 w-full max-w-sm">
          <thead><tr><th className="text-left">Jour</th><th className="text-right">{unit}</th></tr></thead>
          <tbody>{data.map((d) => <tr key={d.day}><td>{fmtDay(d.day)}</td><td className="text-right">{d.value}</td></tr>)}</tbody>
        </table>
      </details>
    </figure>
  );
}
