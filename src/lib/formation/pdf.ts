import "server-only";

import fontkit from "@pdf-lib/fontkit";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { PDFDocument, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import type { Course, Lesson } from "@/content/types";

/**
 * Résumé de chapitre en PDF (A4), généré à la demande à partir du contenu
 * en base : objectifs, compétences, définitions, points à retenir,
 * algorithme clé commenté et erreurs fréquentes.
 */

const A4 = { w: 595.28, h: 841.89 };
const M = 50; // marges
const NUIT = rgb(0.04, 0.1, 0.23);
const BLEU = rgb(0.11, 0.37, 0.88);
const GRIS = rgb(0.3, 0.34, 0.42);

let fontCache: { regular: Uint8Array; bold: Uint8Array; mono: Uint8Array } | null = null;
async function fonts() {
  if (!fontCache) {
    const dir = path.join(process.cwd(), "assets", "fonts");
    const [regular, bold, mono] = await Promise.all([
      readFile(path.join(dir, "DejaVuSans.ttf")),
      readFile(path.join(dir, "DejaVuSans-Bold.ttf")),
      readFile(path.join(dir, "DejaVuSansMono.ttf")),
    ]);
    fontCache = { regular, bold, mono };
  }
  return fontCache;
}

/** Retire la mise en forme Markdown simple. */
export function plain(md: string): string {
  return md
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[(.+?)\]\(.+?\)/g, "$1")
    .replace(/^#+\s*/gm, "")
    .trim();
}

export class Writer {
  page!: PDFPage;
  y = 0;
  pageNo = 0;
  constructor(
    private doc: PDFDocument,
    private f: { regular: PDFFont; bold: PDFFont; mono: PDFFont },
    private footer: string,
  ) {
    this.newPage();
  }
  newPage() {
    this.page = this.doc.addPage([A4.w, A4.h]);
    this.pageNo++;
    this.y = A4.h - M;
    this.page.drawText(`${this.footer} — page ${this.pageNo}`, { x: M, y: 28, size: 8, font: this.f.regular, color: GRIS });
  }
  ensure(h: number) {
    if (this.y - h < M) this.newPage();
  }
  wrap(text: string, font: PDFFont, size: number, width: number): string[] {
    const lines: string[] = [];
    for (const para of text.split("\n")) {
      let cur = "";
      for (const word of para.split(/\s+/)) {
        const next = cur ? `${cur} ${word}` : word;
        if (font.widthOfTextAtSize(next, size) > width && cur) {
          lines.push(cur);
          cur = word;
        } else cur = next;
      }
      lines.push(cur);
    }
    return lines;
  }
  text(t: string, opts: { size?: number; bold?: boolean; color?: ReturnType<typeof rgb>; indent?: number; gap?: number } = {}) {
    const size = opts.size ?? 10.5;
    const font = opts.bold ? this.f.bold : this.f.regular;
    const indent = opts.indent ?? 0;
    for (const line of this.wrap(t, font, size, A4.w - 2 * M - indent)) {
      this.ensure(size * 1.45);
      this.page.drawText(line, { x: M + indent, y: this.y - size, size, font, color: opts.color ?? NUIT });
      this.y -= size * 1.45;
    }
    this.y -= opts.gap ?? 4;
  }
  heading(t: string) {
    this.y -= 8;
    this.ensure(40);
    this.page.drawRectangle({ x: M, y: this.y - 16, width: 3, height: 16, color: BLEU });
    this.text(t, { size: 13, bold: true, indent: 10, gap: 6 });
  }
  bullets(items: string[]) {
    for (const it of items) {
      this.ensure(16);
      this.page.drawText("•", { x: M + 4, y: this.y - 10.5, size: 10.5, font: this.f.bold, color: BLEU });
      this.text(plain(it), { indent: 16, gap: 2 });
    }
    this.y -= 4;
  }
  code(src: string, comments: Record<number, string> = {}) {
    const size = 8.8;
    const lines = src.split("\n");
    lines.forEach((l, i) => {
      const comment = comments[i + 1];
      this.ensure(size * 1.5 + (comment ? 12 : 0));
      this.page.drawRectangle({ x: M, y: this.y - size * 1.45, width: A4.w - 2 * M, height: size * 1.5, color: rgb(0.96, 0.97, 0.99) });
      this.page.drawText(String(i + 1).padStart(2, " "), { x: M + 4, y: this.y - size - 1, size, font: this.f.mono, color: GRIS });
      this.page.drawText(l.slice(0, 90), { x: M + 24, y: this.y - size - 1, size, font: this.f.mono, color: NUIT });
      this.y -= size * 1.5;
      if (comment) this.text(`↳ ${plain(comment)}`, { size: 8.5, color: BLEU, indent: 24, gap: 1 });
    });
    this.y -= 6;
  }
}

/** Document A4 avec les polices DejaVu (accents et symboles) intégrées. */
export async function newDocument() {
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  const raw = await fonts();
  const f = {
    regular: await doc.embedFont(raw.regular, { subset: true }),
    bold: await doc.embedFont(raw.bold, { subset: true }),
    mono: await doc.embedFont(raw.mono, { subset: true }),
  };
  doc.setAuthor("UPL CODE ACADEMY MK");
  doc.setLanguage("fr-FR");
  doc.setCreator("UPL CODE ACADEMY MK");
  return { doc, f };
}

export const PDF_COLORS = { NUIT, BLEU, GRIS, A4, M };

export async function buildChapterSummaryPdf(course: Course, lesson: Lesson): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  const raw = await fonts();
  const f = {
    regular: await doc.embedFont(raw.regular, { subset: true }),
    bold: await doc.embedFont(raw.bold, { subset: true }),
    mono: await doc.embedFont(raw.mono, { subset: true }),
  };
  doc.setTitle(`Résumé — ${lesson.title}`);
  doc.setAuthor("UPL CODE ACADEMY MK");
  doc.setSubject(course.title);
  doc.setLanguage("fr-FR");
  doc.setCreator("UPL CODE ACADEMY MK");

  const w = new Writer(doc, f, `UPL CODE ACADEMY MK · ${course.title} · ${lesson.title}`);
  w.text("UPL CODE ACADEMY MK — LEARN. CODE. PRACTICE. MASTER.", { size: 8.5, bold: true, color: BLEU, gap: 8 });
  w.text(lesson.title, { size: 20, bold: true, gap: 2 });
  w.text(`Résumé de chapitre · ${course.title} · durée indicative ${lesson.durationMinutes} min`, { size: 9.5, color: GRIS, gap: 10 });

  const p = lesson.pedagogy;
  w.heading("Objectifs");
  w.bullets(lesson.objectives);
  if (p?.competences.length) {
    w.heading("Compétences visées");
    w.bullets(p.competences);
  }
  if (p?.definitions.length) {
    w.heading("Définitions");
    for (const d of p.definitions) {
      w.text(d.term, { bold: true, gap: 0 });
      w.text(plain(d.definition), { indent: 12, gap: 6 });
    }
  }
  if (lesson.summary.length) {
    w.heading("À retenir");
    w.bullets(lesson.summary);
  }
  const algo = p?.commentedAlgorithms[0];
  if (algo) {
    w.heading(`Algorithme commenté : ${algo.title}`);
    w.code(algo.code, algo.comments);
  }
  if (p?.commonErrors.length) {
    w.heading("Erreurs fréquentes");
    for (const e of p.commonErrors) {
      w.text(e.title, { bold: true, gap: 2 });
      w.text(`À éviter : ${e.wrong.split("\n").join("  ·  ")}`, { size: 9.5, color: rgb(0.7, 0.1, 0.1), indent: 12, gap: 1 });
      w.text(`Correct : ${e.right.split("\n").join("  ·  ")}`, { size: 9.5, color: rgb(0.05, 0.45, 0.2), indent: 12, gap: 1 });
      w.text(plain(e.explanation), { size: 9.5, indent: 12, gap: 6 });
    }
  }
  w.y -= 6;
  w.text("Ce résumé ne remplace pas le cours complet ni les exercices. Contenu pédagogique d'UPL CODE ACADEMY MK, non officiel sauf validation par l'université.", { size: 8, color: GRIS });
  return doc.save();
}
