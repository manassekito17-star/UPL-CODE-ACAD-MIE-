-- Liens explicites vers public.profiles (profiles.id = auth.users.id) pour
-- permettre les jointures PostgREST (nom de l'étudiant dans les corrections,
-- auteur dans les journaux…).
alter table public.submissions
  add constraint submissions_user_profile_fk foreign key (user_id) references public.profiles (id) on delete cascade;
alter table public.audit_logs
  add constraint audit_logs_actor_profile_fk foreign key (actor_id) references public.profiles (id) on delete set null;
alter table public.course_progress
  add constraint course_progress_user_profile_fk foreign key (user_id) references public.profiles (id) on delete cascade;
