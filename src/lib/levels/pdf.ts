import "server-only";

import { rgb } from "pdf-lib";
import { LEVEL_NAMES, type LevelNumber } from "@/content/types";
import { newDocument, PDF_COLORS, Writer } from "../formation/pdf";
import type { BulletinCourse } from "./bulletin";
import { LEVEL_STATUS_LABELS } from "./rules";

const { NUIT, BLEU, GRIS, A4, M } = PDF_COLORS;
const date = (iso: string) => new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "Africa/Kinshasa" });

export const INTERNAL_NOTICE =
  "Document interne à UPL CODE ACADEMY MK. Il atteste une progression mesurée sur la plateforme et ne constitue ni un diplôme, ni un titre, ni des crédits académiques officiels de l'Université Protestante de Lubumbashi.";

/** Bulletin de progression (A4). */
export async function buildBulletinPdf(student: { name: string; email: string }, data: BulletinCourse[]): Promise<Uint8Array> {
  const { doc, f } = await newDocument();
  doc.setTitle(`Bulletin de progression — ${student.name}`);
  const w = new Writer(doc, f, "UPL CODE ACADEMY MK — bulletin de progression (document interne)");
  w.text("UPL CODE ACADEMY MK", { size: 10, bold: true, color: BLEU });
  w.text("Bulletin de progression", { size: 22, bold: true, gap: 2 });
  w.text(`${student.name || student.email} · édité le ${date(new Date().toISOString())}`, { size: 10, color: GRIS, gap: 10 });
  if (!data.length) w.text("Aucun parcours commencé pour l'instant.");
  for (const b of data) {
    w.heading(b.course.title);
    w.text(`Niveau actuel : ${b.current} — ${LEVEL_NAMES[b.current]}${b.placement ? ` · positionnement du ${date(b.placement.at)} : niveau ${b.placement.recommended} recommandé` : ""}`, { size: 10 });
    for (const lv of b.levels) {
      const exam = lv.examBest !== null ? `, examen ${lv.examBest} %` : "";
      w.text(`Niveau ${lv.number} (${LEVEL_NAMES[lv.number]}) — ${LEVEL_STATUS_LABELS[lv.status]} · ${lv.validatedCount}/${lv.lessons.length} chapitre(s) validé(s)${exam}`, { size: 9.5, indent: 10, gap: 1 });
    }
    w.y -= 4;
    const validated = b.chapters.filter((c) => c.status === "valide");
    w.text(`Chapitres validés (${validated.length}/${b.chapters.length})`, { size: 10.5, bold: true });
    w.bullets(validated.length ? validated.map((c) => `${c.title}${c.evaluationBest !== null ? ` — évaluation ${c.evaluationBest} %` : ""}`) : ["Aucun chapitre validé pour l'instant."]);
    if (b.toReview.length) {
      w.text("À revoir", { size: 10.5, bold: true });
      w.bullets(b.toReview.map((r) => `${r.title} : ${r.reason}`));
    }
    if (b.certificates.length) {
      w.text("Certificats internes", { size: 10.5, bold: true });
      w.bullets(b.certificates.map((c) => `${c.level ? `Niveau ${c.level}` : "Parcours complet"} — ${date(c.issuedAt)}${c.score !== null ? ` — ${c.score} %` : ""} — code ${c.code}`));
    }
  }
  w.y -= 10;
  w.text(INTERNAL_NOTICE, { size: 8.5, color: GRIS });
  return doc.save();
}

/** Certificat interne de niveau ou de parcours (A4 paysage). */
export async function buildCertificatePdf(c: { fullName: string; courseTitle: string; level: LevelNumber | null; levelTitle: string | null; score: number | null; issuedAt: string; code: string; verifyUrl: string }): Promise<Uint8Array> {
  const { doc, f } = await newDocument();
  doc.setTitle(`Certificat interne — ${c.courseTitle}`);
  const page = doc.addPage([A4.h, A4.w]);
  const W = A4.h;
  const H = A4.w;
  page.drawRectangle({ x: 20, y: 20, width: W - 40, height: H - 40, borderColor: BLEU, borderWidth: 2 });
  page.drawRectangle({ x: 28, y: 28, width: W - 56, height: H - 56, borderColor: rgb(0.13, 0.83, 0.93), borderWidth: 0.8 });
  const center = (t: string, y: number, size: number, bold = false, color = NUIT) => {
    const font = bold ? f.bold : f.regular;
    page.drawText(t, { x: (W - font.widthOfTextAtSize(t, size)) / 2, y, size, font, color });
  };
  center("UPL CODE ACADEMY MK", H - 80, 12, true, BLEU);
  center("CERTIFICAT INTERNE DE RÉUSSITE", H - 120, 24, true);
  center("décerné à", H - 160, 11, false, GRIS);
  center(c.fullName || "Étudiant(e) UPL CODE ACADEMY MK", H - 195, 26, true);
  center(c.level ? `pour la validation du niveau ${c.level} — ${LEVEL_NAMES[c.level]}` : "pour l'achèvement complet du parcours", H - 235, 13);
  center(c.courseTitle, H - 262, 18, true, BLEU);
  if (c.levelTitle) center(c.levelTitle, H - 285, 10.5, false, GRIS);
  center(`Délivré le ${date(c.issuedAt)}${c.score !== null ? ` · examen réussi avec ${c.score} %` : ""}`, H - 320, 11);
  center(`Code de vérification : ${c.code}`, H - 350, 10, true);
  center(`Vérifiable sur ${c.verifyUrl}`, H - 366, 9, false, GRIS);
  // Mention obligatoire : document interne, pas un diplôme.
  const lines: string[] = [];
  let cur = "";
  for (const word of INTERNAL_NOTICE.split(" ")) {
    const next = cur ? `${cur} ${word}` : word;
    if (f.regular.widthOfTextAtSize(next, 9) > W - 2 * M - 60) {
      lines.push(cur);
      cur = word;
    } else cur = next;
  }
  lines.push(cur);
  lines.forEach((l, i) => center(l, 70 - i * 12, 9, false, GRIS));
  return doc.save();
}
