-- =====================================================================
-- Formation : structure pédagogique des chapitres, interrogations et
-- évaluations de chapitre.
-- =====================================================================

-- Définitions, algorithmes commentés, erreurs fréquentes, exercices corrigés,
-- TD et compétences d'un chapitre (format : ChapterPedagogy, sans les quiz).
alter table public.lessons add column if not exists pedagogy jsonb;

-- Nature du quiz : vérification (leçon), interrogation (minutée), évaluation
-- (valide le chapitre). Les évaluations finales de parcours restent is_final.
alter table public.quizzes
  add column if not exists kind text not null default 'verification'
    check (kind in ('verification', 'interrogation', 'evaluation')),
  add column if not exists duration_minutes integer check (duration_minutes between 1 and 240);

create index if not exists quizzes_lesson_idx on public.quizzes (lesson_id);
create index if not exists quiz_attempts_quiz_user_idx on public.quiz_attempts (quiz_id, user_id);

-- Un chapitre est validé par la réussite de son évaluation : le badge porte
-- désormais sur une activité vérifiée, pas sur un clic.
update public.achievements
  set title = 'Premier chapitre validé', description = 'Réussir l''évaluation d''un premier chapitre.'
  where code = 'premiere-lecon';
