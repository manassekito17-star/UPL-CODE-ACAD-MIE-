"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { linesToArray, parseQuizText, parseTestsText } from "@/lib/admin/formats";
import { parsePedagogy } from "@/lib/admin/pedagogy-schema";
import { saveQuizQuestions } from "@/lib/admin/quizzes";
import { audit } from "@/lib/audit";
import { requireAdmin, requireStaff } from "@/lib/auth";
import { clientIp } from "@/lib/rate-limit";
import { invalidateSettingsCache } from "@/lib/settings";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { LANGUAGE_IDS } from "@/lib/execution/languages";

export interface ActionState {
  error?: string;
  success?: string;
}

const slug = z.string().trim().regex(/^[a-z0-9-]{2,80}$/, "Identifiant (slug) invalide : lettres minuscules, chiffres et tirets.");
const level = z.enum(["debutant", "intermediaire", "avance"]);
const status = z.enum(["brouillon", "en_revision", "publie", "archive"]);
const ip = async () => clientIp(await headers());
const fail = (e: z.ZodError): ActionState => ({ error: e.issues.map((i) => i.message).join(" ") });

// ---------------- Utilisateurs (administrateur) ----------------

export async function setUserRole(form: FormData) {
  const admin = await requireAdmin();
  const parsed = z
    .object({ userId: z.string().uuid(), role: z.enum(["etudiant", "enseignant", "administrateur"]), permissions: z.array(z.enum(["contenus", "corrections", "suivi"])) })
    .safeParse({ userId: form.get("userId"), role: form.get("role"), permissions: form.getAll("permissions") });
  if (!parsed.success) return;
  const { userId, role, permissions } = parsed.data;
  if (userId === admin.id && role !== "administrateur") return; // pas d'auto-rétrogradation accidentelle
  const supabase = await createClient();
  await supabase.from("user_roles").delete().eq("user_id", userId).neq("role", "etudiant");
  await supabase.from("user_roles").upsert({ user_id: userId, role: "etudiant", granted_by: admin.id }, { onConflict: "user_id,role" });
  if (role !== "etudiant") {
    await supabase.from("user_roles").insert({ user_id: userId, role, permissions: role === "enseignant" ? permissions : [], granted_by: admin.id });
  }
  await audit(admin.id, "utilisateur.role_modifie", { type: "utilisateur", id: userId }, { role, permissions }, await ip());
  revalidatePath("/admin/utilisateurs");
}

export async function setUserStatus(form: FormData) {
  const admin = await requireAdmin();
  const parsed = z
    .object({ userId: z.string().uuid(), status: z.enum(["actif", "suspendu"]), reason: z.string().max(500).optional() })
    .safeParse({ userId: form.get("userId"), status: form.get("status"), reason: form.get("reason") ?? undefined });
  if (!parsed.success || parsed.data.userId === admin.id) return;
  const supabase = await createClient();
  await supabase.from("profiles").update({ status: parsed.data.status, suspended_reason: parsed.data.status === "suspendu" ? (parsed.data.reason ?? null) : null }).eq("id", parsed.data.userId);
  if (parsed.data.status === "suspendu") {
    // Invalide les sessions en cours
    await createAdminClient().auth.admin.signOut(parsed.data.userId).catch(() => undefined);
  }
  await audit(admin.id, parsed.data.status === "suspendu" ? "utilisateur.suspendu" : "utilisateur.reactive", { type: "utilisateur", id: parsed.data.userId }, { reason: parsed.data.reason }, await ip());
  revalidatePath("/admin/utilisateurs");
}

// ---------------- Formations ----------------

export async function saveCourse(_prev: ActionState, form: FormData): Promise<ActionState> {
  const user = await requireStaff("contenus");
  const parsed = z
    .object({
      id: z.string().uuid().optional().or(z.literal("")),
      slug,
      code: z.string().max(40).optional(),
      title: z.string().trim().min(3).max(160),
      tagline: z.string().max(300).optional(),
      description: z.string().max(5000).optional(),
      language_id: z.enum(LANGUAGE_IDS as [string, ...string[]]),
      level,
      duration_hours: z.coerce.number().min(0).max(1000),
      objectives: z.string().max(5000).optional(),
      prerequisites: z.string().max(5000).optional(),
      sort_order: z.coerce.number().int().min(0).max(1000).default(0),
    })
    .safeParse(Object.fromEntries(form));
  if (!parsed.success) return fail(parsed.error);
  const { id, objectives, prerequisites, ...rest } = parsed.data;
  const row = { ...rest, objectives: linesToArray(objectives ?? ""), prerequisites: linesToArray(prerequisites ?? "") };
  const supabase = await createClient();
  const q = id ? supabase.from("courses").update(row).eq("id", id) : supabase.from("courses").insert({ ...row, created_by: user.id, status: "brouillon" });
  const { error } = await q;
  if (error) return { error: error.code === "23505" ? "Ce slug est déjà utilisé." : error.message };
  await audit(user.id, id ? "formation.modifiee" : "formation.creee", { type: "formation", id: rest.slug }, {}, await ip());
  revalidatePath("/admin/formations");
  revalidatePath("/formations", "layout");
  if (!id) redirect(`/admin/formations/${rest.slug}`);
  return { success: "Formation enregistrée." };
}

/** Publication / dépublication. La publication exige une validation pédagogique (enseignant ou responsable). */
export async function setCourseStatus(form: FormData) {
  const user = await requireStaff("contenus");
  const parsed = z.object({ id: z.string().uuid(), status, slug }).safeParse(Object.fromEntries(form));
  if (!parsed.success) return;
  const supabase = await createClient();
  await supabase
    .from("courses")
    .update({ status: parsed.data.status, ...(parsed.data.status === "publie" ? { validated_by: user.id, validated_at: new Date().toISOString() } : {}) })
    .eq("id", parsed.data.id);
  await audit(user.id, `formation.statut.${parsed.data.status}`, { type: "formation", id: parsed.data.slug }, {}, await ip());
  revalidatePath("/admin/formations");
  revalidatePath(`/admin/formations/${parsed.data.slug}`);
  revalidatePath("/formations", "layout");
}

export async function saveModule(form: FormData) {
  const user = await requireStaff("contenus");
  const parsed = z
    .object({
      id: z.string().uuid().optional().or(z.literal("")),
      course_id: z.string().uuid(),
      courseSlug: slug,
      slug,
      title: z.string().trim().min(2).max(200),
      description: z.string().max(2000).optional(),
      position: z.coerce.number().int().min(0).max(1000),
      level_number: z.enum(["", "1", "2", "3", "4"]).optional(),
    })
    .safeParse(Object.fromEntries(form));
  if (!parsed.success) return;
  const { id, courseSlug, level_number, ...rest } = parsed.data;
  const row = { ...rest, level_number: level_number ? Number(level_number) : null };
  const supabase = await createClient();
  if (id) await supabase.from("modules").update(row).eq("id", id);
  else await supabase.from("modules").insert(row);
  await audit(user.id, id ? "module.modifie" : "module.cree", { type: "module", id: row.slug }, { courseSlug }, await ip());
  revalidatePath(`/admin/formations/${courseSlug}`);
}

export async function saveLesson(_prev: ActionState, form: FormData): Promise<ActionState> {
  const user = await requireStaff("contenus");
  const parsed = z
    .object({
      id: z.string().uuid().optional().or(z.literal("")),
      course_id: z.string().uuid(),
      courseSlug: slug,
      module_id: z.string().uuid(),
      slug,
      title: z.string().trim().min(2).max(200),
      level,
      duration_minutes: z.coerce.number().int().min(1).max(600),
      position: z.coerce.number().int().min(0).max(1000),
      objectives: z.string().max(5000).optional(),
      prerequisites: z.string().max(5000).optional(),
      summary: z.string().max(5000).optional(),
      content: z.string().max(200_000),
      examples: z.string().max(100_000).optional(),
      status,
      quiz: z.string().max(50_000).optional(),
      interrogation: z.string().max(50_000).optional(),
      evaluation: z.string().max(50_000).optional(),
      evaluation_pass_score: z.coerce.number().int().min(1).max(100).default(70),
      pedagogy: z.string().max(300_000).optional(),
    })
    .safeParse(Object.fromEntries(form));
  if (!parsed.success) return fail(parsed.error);
  const d = parsed.data;
  const interrogation = d.interrogation?.trim() ? parseQuizText(d.interrogation) : null;
  if (interrogation?.errors.length) return { error: `Interrogation : ${interrogation.errors.join(" ")}` };
  const evaluation = d.evaluation?.trim() ? parseQuizText(d.evaluation) : null;
  if (evaluation?.errors.length) return { error: `Évaluation : ${evaluation.errors.join(" ")}` };
  let examples: unknown = [];
  try {
    examples = d.examples?.trim() ? JSON.parse(d.examples) : [];
    if (!Array.isArray(examples)) throw new Error();
  } catch {
    return { error: "Les exemples doivent être un tableau JSON valide : [{\"title\", \"language\", \"code\", \"stdin\"}]." };
  }
  const pedagogy = parsePedagogy(d.pedagogy ?? "");
  if (!pedagogy.ok) return { error: pedagogy.error };
  const quiz = d.quiz?.trim() ? parseQuizText(d.quiz) : null;
  if (quiz?.errors.length) return { error: `Quiz : ${quiz.errors.join(" ")}` };

  const supabase = await createClient();
  const row = {
    course_id: d.course_id,
    module_id: d.module_id,
    slug: d.slug,
    title: d.title,
    level: d.level,
    duration_minutes: d.duration_minutes,
    position: d.position,
    objectives: linesToArray(d.objectives ?? ""),
    prerequisites: linesToArray(d.prerequisites ?? ""),
    summary: linesToArray(d.summary ?? ""),
    content: d.content,
    examples,
    pedagogy: pedagogy.value,
    status: d.status,
    ...(d.status === "publie" ? { validated_by: user.id, validated_at: new Date().toISOString() } : {}),
  };
  const { data: saved, error } = d.id
    ? await supabase.from("lessons").update(row).eq("id", d.id).select("id").single()
    : await supabase.from("lessons").insert(row).select("id").single();
  if (error) return { error: error.code === "23505" ? "Ce slug de leçon existe déjà dans ce cours." : error.message };

  // Quiz de la leçon (questions publiques + réponses dans la table réservée)
  // Quiz de vérification uniquement : interrogation et évaluation ne sont pas touchées ici.
  const { data: existing } = await supabase.from("quizzes").select("id").eq("lesson_id", saved.id).eq("is_final", false).eq("kind", "verification").maybeSingle();
  if (quiz?.questions.length) {
    const quizId =
      existing?.id ??
      (await supabase.from("quizzes").insert({ course_id: d.course_id, lesson_id: saved.id, slug: `${d.courseSlug}-${d.slug}-quiz`.slice(0, 120), title: "Vérifier sa compréhension", status: "publie", kind: "verification" }).select("id").single()).data?.id;
    if (quizId) {
      await supabase.from("quiz_questions").delete().eq("quiz_id", quizId);
      for (const [i, q] of quiz.questions.entries()) {
        const { data: qq } = await supabase
          .from("quiz_questions")
          .insert({ quiz_id: quizId, type: q.correct.length > 1 ? "choix_multiples" : q.choices.length === 2 && q.choices[0] === "Vrai" ? "vrai_faux" : "qcm", prompt: q.prompt, choices: q.choices, position: i })
          .select("id")
          .single();
        if (qq) await supabase.from("quiz_answer_keys").insert({ question_id: qq.id, correct: q.correct, explanation: q.explanation ?? null });
      }
    }
  } else if (existing) {
    await supabase.from("quizzes").delete().eq("id", existing.id);
  }

  // Interrogation (minutée) et évaluation (valide le chapitre)
  for (const [kind, parsedQuiz, title, passScore, duration] of [
    ["interrogation", interrogation, `Interrogation — ${d.title}`, 60, 10],
    ["evaluation", evaluation, `Évaluation — ${d.title}`, d.evaluation_pass_score, null],
  ] as const) {
    const { data: ex } = await supabase.from("quizzes").select("id").eq("lesson_id", saved.id).eq("kind", kind).maybeSingle();
    if (parsedQuiz?.questions.length) {
      try {
        await saveQuizQuestions(
          supabase,
          { courseId: d.course_id, lessonId: saved.id, slug: ex ? "" : `${d.courseSlug}-${d.slug}-${kind}`.slice(0, 120), title, kind, passScore, durationMinutes: duration },
          parsedQuiz.questions,
          ex?.id,
        );
      } catch (e) {
        return { error: `${kind === "evaluation" ? "Évaluation" : "Interrogation"} : ${(e as Error).message}` };
      }
    } else if (ex) {
      await supabase.from("quizzes").delete().eq("id", ex.id);
    }
  }

  await audit(user.id, d.id ? "lecon.modifiee" : "lecon.creee", { type: "lecon", id: `${d.courseSlug}/${d.slug}` }, { status: d.status }, await ip());
  revalidatePath(`/admin/formations/${d.courseSlug}`);
  revalidatePath(`/formations/${d.courseSlug}`, "layout");
  if (!d.id) redirect(`/admin/formations/${d.courseSlug}/lecons/${saved.id}`);
  return { success: "Leçon enregistrée." };
}

// ---------------- Exercices ----------------

export async function saveExercise(_prev: ActionState, form: FormData): Promise<ActionState> {
  const user = await requireStaff("contenus");
  const parsed = z
    .object({
      id: z.string().uuid().optional().or(z.literal("")),
      slug,
      title: z.string().trim().min(2).max(200),
      course_id: z.string().uuid().optional().or(z.literal("")),
      lesson_id: z.string().uuid().optional().or(z.literal("")),
      language_id: z.enum(LANGUAGE_IDS as [string, ...string[]]),
      difficulty: level,
      type: z.enum(["qcm", "vrai_faux", "completer", "corriger", "ecrire_algorithme", "ecrire_programme", "probleme", "mini_projet"]),
      statement: z.string().min(5).max(50_000),
      objectives: z.string().max(5000).optional(),
      constraints: z.string().max(5000).optional(),
      hints: z.string().max(10_000).optional(),
      starter_code: z.string().max(50_000).optional(),
      solution_code: z.string().max(50_000).optional(),
      correction: z.string().max(50_000).optional(),
      tests: z.string().max(200_000),
      points: z.coerce.number().int().min(0).max(1000),
      is_evaluated: z.string().optional(),
      status,
    })
    .safeParse(Object.fromEntries(form));
  if (!parsed.success) return fail(parsed.error);
  const d = parsed.data;
  const tests = parseTestsText(d.tests);
  if (tests.errors.length) return { error: `Tests : ${tests.errors.join(" ")}` };
  if (!tests.tests.length) return { error: "Ajoutez au moins un test automatique." };

  const supabase = await createClient();
  const visible = tests.tests.filter((t) => !t.hidden);
  const row = {
    slug: d.slug,
    title: d.title,
    course_id: d.course_id || null,
    lesson_id: d.lesson_id || null,
    language_id: d.language_id,
    difficulty: d.difficulty,
    type: d.type,
    statement: d.statement,
    objectives: linesToArray(d.objectives ?? ""),
    constraints: linesToArray(d.constraints ?? ""),
    hints: linesToArray(d.hints ?? ""),
    starter_code: d.starter_code ?? "",
    examples: visible.slice(0, 3).map((t) => ({ input: t.input, output: t.expected })),
    points: d.points,
    is_evaluated: d.is_evaluated === "on",
    status: d.status,
  };
  const { data: saved, error } = d.id
    ? await supabase.from("exercises").update(row).eq("id", d.id).select("id").single()
    : await supabase.from("exercises").insert({ ...row, created_by: user.id }).select("id").single();
  if (error) return { error: error.code === "23505" ? "Ce slug d'exercice existe déjà." : error.message };
  await supabase.from("exercise_test_cases").delete().eq("exercise_id", saved.id);
  await supabase.from("exercise_test_cases").insert(tests.tests.map((t, i) => ({ exercise_id: saved.id, input: t.input, expected_output: t.expected, is_hidden: t.hidden, position: i })));
  await supabase.from("exercise_solutions").upsert({ exercise_id: saved.id, solution_code: d.solution_code ?? "", correction: d.correction ?? "", updated_at: new Date().toISOString() });
  await audit(user.id, d.id ? "exercice.modifie" : "exercice.cree", { type: "exercice", id: d.slug }, { status: d.status }, await ip());
  revalidatePath("/admin/exercices");
  revalidatePath("/exercices", "layout");
  if (!d.id) redirect(`/admin/exercices/${d.slug}`);
  return { success: "Exercice enregistré." };
}

// ---------------- Corrections ----------------

export async function reviewSubmission(form: FormData) {
  const user = await requireStaff("corrections");
  const parsed = z
    .object({ id: z.string().uuid(), teacher_feedback: z.string().max(5000), teacher_score: z.union([z.literal(""), z.coerce.number().min(0).max(100)]) })
    .safeParse(Object.fromEntries(form));
  if (!parsed.success) return;
  const supabase = await createClient();
  await supabase
    .from("submissions")
    .update({
      teacher_feedback: parsed.data.teacher_feedback || null,
      teacher_score: parsed.data.teacher_score === "" ? null : parsed.data.teacher_score,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", parsed.data.id);
  await audit(user.id, "soumission.corrigee", { type: "soumission", id: parsed.data.id }, { score: parsed.data.teacher_score }, await ip());
  revalidatePath("/admin/corrections");
}

// ---------------- Annonces ----------------

export async function saveAnnouncement(form: FormData) {
  const user = await requireStaff("contenus");
  const parsed = z
    .object({ id: z.string().uuid().optional().or(z.literal("")), title: z.string().trim().min(2).max(200), body: z.string().min(2).max(10_000), audience: z.enum(["tous", "etudiants", "enseignants"]), published: z.string().optional() })
    .safeParse(Object.fromEntries(form));
  if (!parsed.success) return;
  const { id, published, ...row } = parsed.data;
  const supabase = await createClient();
  const data = { ...row, published: published === "on" };
  if (id) await supabase.from("announcements").update(data).eq("id", id);
  else await supabase.from("announcements").insert({ ...data, created_by: user.id });
  await audit(user.id, id ? "annonce.modifiee" : "annonce.creee", { type: "annonce", id: id || row.title }, {}, await ip());
  revalidatePath("/admin/annonces");
}

export async function deleteAnnouncement(form: FormData) {
  const user = await requireStaff("contenus");
  const id = z.string().uuid().safeParse(form.get("id"));
  if (!id.success) return;
  const supabase = await createClient();
  await supabase.from("announcements").delete().eq("id", id.data);
  await audit(user.id, "annonce.supprimee", { type: "annonce", id: id.data }, {}, await ip());
  revalidatePath("/admin/annonces");
}

// ---------------- Paramètres (administrateur) ----------------

export async function saveSettings(_prev: ActionState, form: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const parsed = z
    .object({
      ai_enabled: z.string().optional(),
      ai_daily: z.coerce.number().int().min(0).max(1000),
      ai_budget: z.coerce.number().min(0).max(100_000),
      ai_max_tokens: z.coerce.number().int().min(200).max(16_000),
      ai_effort: z.enum(["low", "medium", "high"]),
      exec_enabled: z.string().optional(),
      exec_rpm: z.coerce.number().int().min(1).max(300),
      exec_cpu: z.coerce.number().min(1).max(15),
      exec_memory: z.coerce.number().int().min(16_000).max(512_000),
      reg_open: z.string().optional(),
      reg_domains: z.string().max(2000).optional(),
    })
    .safeParse(Object.fromEntries(form));
  if (!parsed.success) return fail(parsed.error);
  const d = parsed.data;
  const supabase = await createClient();
  const rows = [
    { key: "ai", value: { enabled: d.ai_enabled === "on", daily_messages_per_user: d.ai_daily, monthly_budget_usd: d.ai_budget, max_output_tokens: d.ai_max_tokens, effort: d.ai_effort } },
    { key: "execution", value: { enabled: d.exec_enabled === "on", max_runs_per_minute: d.exec_rpm, cpu_time_limit_s: d.exec_cpu, memory_limit_kb: d.exec_memory } },
    { key: "registration", value: { open: d.reg_open === "on", allowed_email_domains: (d.reg_domains ?? "").split(/[\s,;]+/).map((x) => x.replace(/^@/, "").toLowerCase()).filter(Boolean) } },
  ];
  for (const r of rows) {
    const { error } = await supabase.from("platform_settings").upsert({ ...r, updated_by: admin.id, updated_at: new Date().toISOString() });
    if (error) return { error: error.message };
  }
  invalidateSettingsCache();
  await audit(admin.id, "parametres.modifies", { type: "parametres", id: "plateforme" }, { rows }, await ip());
  return { success: "Paramètres enregistrés." };
}

export async function saveLanguage(form: FormData) {
  const admin = await requireAdmin();
  const parsed = z
    .object({ id: z.enum(LANGUAGE_IDS as [string, ...string[]]), name: z.string().trim().min(1).max(80), judge0_language_id: z.union([z.literal(""), z.coerce.number().int().min(1).max(10_000)]), enabled: z.string().optional() })
    .safeParse(Object.fromEntries(form));
  if (!parsed.success) return;
  const supabase = await createClient();
  await supabase
    .from("languages")
    .update({ name: parsed.data.name, judge0_language_id: parsed.data.judge0_language_id === "" ? null : parsed.data.judge0_language_id, enabled: parsed.data.enabled === "on" })
    .eq("id", parsed.data.id);
  await audit(admin.id, "langage.modifie", { type: "langage", id: parsed.data.id }, {}, await ip());
  revalidatePath("/admin/parametres");
}

export async function saveCategory(form: FormData) {
  const admin = await requireAdmin();
  const parsed = z.object({ slug, name: z.string().trim().min(2).max(120), description: z.string().max(500).optional() }).safeParse(Object.fromEntries(form));
  if (!parsed.success) return;
  const supabase = await createClient();
  await supabase.from("course_categories").upsert(parsed.data, { onConflict: "slug" });
  await audit(admin.id, "categorie.enregistree", { type: "categorie", id: parsed.data.slug }, {}, await ip());
  revalidatePath("/admin/parametres");
}

// ---------------- Niveaux, examens et positionnement ----------------

export async function saveLevel(_prev: ActionState, form: FormData): Promise<ActionState> {
  const user = await requireStaff("contenus");
  const parsed = z
    .object({
      course_id: z.string().uuid(),
      courseSlug: slug,
      number: z.coerce.number().int().min(1).max(4),
      title: z.string().trim().min(3).max(200),
      description: z.string().max(3000).optional(),
      objectives: z.string().max(5000).optional(),
      planned_chapters: z.string().max(5000).optional(),
      chapters_validated_pct: z.coerce.number().int().min(0).max(100),
      exam_pass_score: z.coerce.number().int().min(1).max(100),
      exam: z.string().max(80_000).optional(),
    })
    .safeParse(Object.fromEntries(form));
  if (!parsed.success) return fail(parsed.error);
  const d = parsed.data;
  const exam = d.exam?.trim() ? parseQuizText(d.exam) : null;
  if (exam?.errors.length) return { error: `Examen : ${exam.errors.join(" ")}` };
  const supabase = await createClient();
  const { error } = await supabase.from("course_levels").upsert(
    {
      course_id: d.course_id,
      number: d.number,
      title: d.title,
      description: d.description ?? "",
      objectives: linesToArray(d.objectives ?? ""),
      planned_chapters: linesToArray(d.planned_chapters ?? ""),
      chapters_validated_pct: d.chapters_validated_pct,
      exam_pass_score: d.exam_pass_score,
    },
    { onConflict: "course_id,number" },
  );
  if (error) return { error: error.message };
  const { data: existing } = await supabase.from("quizzes").select("id").eq("course_id", d.course_id).eq("kind", "examen_niveau").eq("level_number", d.number).maybeSingle();
  if (exam?.questions.length) {
    try {
      await saveQuizQuestions(
        supabase,
        { courseId: d.course_id, slug: existing ? "" : `${d.courseSlug}-examen-niveau-${d.number}`, title: `Examen du niveau ${d.number} — ${d.title}`.slice(0, 200), kind: "examen_niveau", levelNumber: d.number, passScore: d.exam_pass_score },
        exam.questions,
        existing?.id,
      );
    } catch (e) {
      return { error: `Examen : ${(e as Error).message}` };
    }
  } else if (existing) {
    await supabase.from("quizzes").delete().eq("id", existing.id);
  }
  await audit(user.id, "niveau.modifie", { type: "niveau", id: `${d.courseSlug}/${d.number}` }, { criteria: [d.chapters_validated_pct, d.exam_pass_score], examQuestions: exam?.questions.length ?? 0 }, await ip());
  revalidatePath(`/admin/formations/${d.courseSlug}/niveaux`);
  revalidatePath(`/formations/${d.courseSlug}`, "layout");
  return { success: `Niveau ${d.number} enregistré${exam?.questions.length ? ` avec un examen de ${exam.questions.length} question(s)` : " (sans examen : il ne pourra pas être validé)"}.` };
}

export async function savePlacement(_prev: ActionState, form: FormData): Promise<ActionState> {
  const user = await requireStaff("contenus");
  const parsed = z.object({ course_id: z.string().uuid(), courseSlug: slug, placement: z.string().max(80_000) }).safeParse(Object.fromEntries(form));
  if (!parsed.success) return fail(parsed.error);
  const d = parsed.data;
  const quiz = d.placement.trim() ? parseQuizText(d.placement) : null;
  if (quiz?.errors.length) return { error: quiz.errors.join(" ") };
  if (quiz) {
    const missing = quiz.questions.filter((q) => !q.level).length;
    if (missing) return { error: `${missing} question(s) sans « @ niveau n » : chaque question du positionnement doit indiquer le niveau qu'elle évalue.` };
    const levels = new Set(quiz.questions.map((q) => q.level));
    if (levels.size < 4) return { error: "Le test doit comporter des questions des quatre niveaux." };
  }
  const supabase = await createClient();
  const { data: existing } = await supabase.from("quizzes").select("id").eq("course_id", d.course_id).eq("kind", "positionnement").maybeSingle();
  if (quiz?.questions.length) {
    try {
      await saveQuizQuestions(supabase, { courseId: d.course_id, slug: existing ? "" : `${d.courseSlug}-positionnement`, title: "Test de positionnement", kind: "positionnement", passScore: 0 }, quiz.questions, existing?.id);
    } catch (e) {
      return { error: (e as Error).message };
    }
  } else if (existing) {
    await supabase.from("quizzes").delete().eq("id", existing.id);
  }
  await audit(user.id, "positionnement.modifie", { type: "cours", id: d.courseSlug }, { questions: quiz?.questions.length ?? 0 }, await ip());
  revalidatePath(`/admin/formations/${d.courseSlug}/niveaux`);
  revalidatePath(`/formations/${d.courseSlug}`, "layout");
  return { success: quiz ? `Test de positionnement enregistré (${quiz.questions.length} questions).` : "Test de positionnement supprimé." };
}

// ---------------- Ressources de leçon (vidéos, documents, liens) ----------------

const RESOURCE_MAX_BYTES = 20 * 1024 * 1024;
const RESOURCE_TYPES: Record<string, string> = {
  "application/pdf": "pdf",
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "video/mp4": "mp4",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",
};

export async function addLessonResource(_prev: ActionState, form: FormData): Promise<ActionState> {
  const user = await requireStaff("contenus");
  const parsed = z
    .object({
      lesson_id: z.string().uuid(),
      courseSlug: slug,
      kind: z.enum(["video", "document", "lien", "image"]),
      title: z.string().trim().min(2).max(200),
      url: z.string().trim().max(1000).optional(),
    })
    .safeParse({ lesson_id: form.get("lesson_id"), courseSlug: form.get("courseSlug"), kind: form.get("kind"), title: form.get("title"), url: form.get("url") || undefined });
  if (!parsed.success) return fail(parsed.error);
  const d = parsed.data;
  const file = form.get("file");
  const supabase = await createClient();
  let url: string | null = null;
  let storagePath: string | null = null;
  if (file instanceof File && file.size > 0) {
    const ext = RESOURCE_TYPES[file.type];
    if (!ext) return { error: "Type de fichier non accepté (PDF, PNG, JPEG, WebP, MP4, DOCX, PPTX)." };
    if (file.size > RESOURCE_MAX_BYTES) return { error: "Fichier trop volumineux (20 Mo au maximum)." };
    storagePath = `lecons/${d.lesson_id}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("ressources").upload(storagePath, file, { contentType: file.type, upsert: false });
    if (error) return { error: `Envoi impossible : ${error.message}` };
    url = supabase.storage.from("ressources").getPublicUrl(storagePath).data.publicUrl;
  } else if (d.url) {
    // Liens externes : https uniquement (pas de javascript:, data:, etc.).
    if (!/^https:\/\/[^\s]+$/i.test(d.url)) return { error: "L'adresse doit commencer par https://." };
    url = d.url;
  } else {
    return { error: "Indiquez une adresse https:// ou choisissez un fichier." };
  }
  const { count } = await supabase.from("lesson_resources").select("id", { count: "exact", head: true }).eq("lesson_id", d.lesson_id);
  const { error } = await supabase.from("lesson_resources").insert({ lesson_id: d.lesson_id, kind: d.kind, title: d.title, url, storage_path: storagePath, position: count ?? 0 });
  if (error) return { error: error.message };
  await audit(user.id, "ressource.ajoutee", { type: "lecon", id: d.lesson_id }, { kind: d.kind, title: d.title }, await ip());
  revalidatePath(`/admin/formations/${d.courseSlug}`, "layout");
  revalidatePath(`/formations/${d.courseSlug}`, "layout");
  return { success: "Ressource ajoutée." };
}

export async function deleteLessonResource(form: FormData) {
  const user = await requireStaff("contenus");
  const parsed = z.object({ id: z.string().uuid(), courseSlug: slug }).safeParse(Object.fromEntries(form));
  if (!parsed.success) return;
  const supabase = await createClient();
  const { data: r } = await supabase.from("lesson_resources").select("storage_path").eq("id", parsed.data.id).maybeSingle();
  if (r?.storage_path) await supabase.storage.from("ressources").remove([r.storage_path]);
  await supabase.from("lesson_resources").delete().eq("id", parsed.data.id);
  await audit(user.id, "ressource.supprimee", { type: "ressource", id: parsed.data.id }, {}, await ip());
  revalidatePath(`/admin/formations/${parsed.data.courseSlug}`, "layout");
  revalidatePath(`/formations/${parsed.data.courseSlug}`, "layout");
}
