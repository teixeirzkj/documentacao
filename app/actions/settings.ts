"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateAppLogo(logo: { url: string; path: string } | null) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado." };

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "administrador") return { error: "Apenas administradores podem alterar o logo." };

  const { error } = await supabase
    .from("app_settings")
    .update({ logo_url: logo?.url ?? null, logo_path: logo?.path ?? null })
    .eq("id", true);

  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  return { success: true };
}
