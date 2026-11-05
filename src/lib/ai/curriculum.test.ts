import { describe, expect, it } from "vitest";
import { staticCourses } from "@/content";
import { levelStates } from "../levels/rules";
import { buildCurriculumContext, vocabularyForLevel } from "./curriculum";
import { buildUserMessage, TUTOR_SYSTEM_PROMPT } from "./prompts";

const html = staticCourses.find((c) => c.slug === "html")!;

describe("professeur IA spécialisé", () => {
  it("le programme transmis couvre les quatre niveaux, les chapitres publiés et ceux au programme", () => {
    const text = buildCurriculumContext(html, { lessonSlug: "html-liens-images", current: 2 });
    for (const n of [1, 2, 3, 4]) expect(text).toContain(`Niveau ${n} —`);
    expect(text).toContain("Liens et images");
    expect(text).toContain("Au programme (pas encore publiés) : HTML sémantique");
    expect(text).toContain("Chapitre en cours : « Liens et images »");
    expect(text).toContain("Projet pratique");
    expect(text).toContain("Niveau actuel de l'étudiant dans ce parcours : 2 — Débutant");
  });

  it("le statut de chaque niveau de l'étudiant est indiqué", () => {
    const states = levelStates(html, { validatedLessons: new Set(), examBest: {}, recorded: { 1: "valide" } });
    expect(buildCurriculumContext(html, { states })).toContain("[valide]");
  });

  it("le niveau mesuré prime sur la préférence de l'interface", () => {
    const msg = buildUserMessage(
      { message: "Bonjour", mode: "interroger", level: "avance", context: {}, history: [] },
      null,
      { text: "Parcours : HTML", vocabulary: vocabularyForLevel(1) },
    );
    expect(msg).toContain("<niveau_etudiant>débutant</niveau_etudiant>");
    expect(msg).toContain("<parcours>\nParcours : HTML\n</parcours>");
    expect(msg).toContain("EXAMINATEUR");
  });

  it("les consignes couvrent les sept parcours et protègent les épreuves", () => {
    for (const s of ["HTML", "CSS", "Python", "langage C", "JavaScript", "Java", "algorithmique"]) expect(TUTOR_SYSTEM_PROMPT).toContain(s);
    expect(TUTOR_SYSTEM_PROMPT).toContain("n'indique pas la bonne réponse");
    expect(TUTOR_SYSTEM_PROMPT).toContain("ne fournis jamais de solution complète");
  });
});
