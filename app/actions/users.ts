"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Role, Status } from "@/lib/types";

async function assertAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  return profile?.role === "administrador";
}

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role: Role;
}

export async function createUser(input: CreateUserInput) {
  if (!(await assertAdmin())) return { error: "Apenas administradores podem criar usuários." };

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true,
    user_metadata: { name: input.name, role: input.role },
  });

  if (error || !data.user) return { error: error?.message ?? "Erro ao criar usuário." };

  // O trigger on_auth_user_created cria o profile automaticamente; garantimos o role/nome corretos.
  await admin
    .from("profiles")
    .update({ name: input.name, role: input.role })
    .eq("id", data.user.id);

  revalidatePath("/usuarios");
  return { id: data.user.id };
}

export async function updateUserStatus(id: string, status: Status) {
  if (!(await assertAdmin())) return { error: "Apenas administradores podem alterar usuários." };
  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ status }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/usuarios");
  return { success: true };
}

export async function updateUserRole(id: string, role: Role) {
  if (!(await assertAdmin())) return { error: "Apenas administradores podem alterar usuários." };
  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ role }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/usuarios");
  return { success: true };
}

export async function updateOwnProfile(name: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado." };

  const { error } = await supabase.from("profiles").update({ name }).eq("id", user.id);
  if (error) return { error: error.message };
  revalidatePath("/configuracoes");
  return { success: true };
}
