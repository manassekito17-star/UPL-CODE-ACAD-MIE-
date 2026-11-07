"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function updateProfile(_prev: { error?: string; success?: string }, form: FormData): Promise<{ error?: string; success?: string }> {
  const user = await requireUser("/profil");
  const parsed = z
    .object({
      full_name: z.string().trim().min(2).max(120),
      student_number: z.string().trim().max(40).optional(),
      faculty: z.string().trim().max(120).optional(),
      level: z.enum(["debutant", "intermediaire", "avance"]),
      learning_goal: z.string().trim().max(500).optional(),
      weekly_goal_minutes: z.coerce.number().int().min(0).max(10080),
    })
    .safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: "Vérifiez les champs du formulaire." };
  const supabase = await createClient();
  // RLS : la mise à jour n'est possible que sur son propre profil ; le statut est protégé par un déclencheur.
  const { error } = await supabase.from("profiles").update(parsed.data).eq("id", user.id);
  if (error) return { error: "Enregistrement impossible." };
  revalidatePath("/", "layout");
  return { success: "Profil enregistré." };
}
