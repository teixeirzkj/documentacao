"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface DocumentationInput {
  title: string;
  categoryId: string | null;
  problem: string;
  identification: string;
  solution: string;
  observations: string;
  tags: string[];
}

async function upsertTags(
  supabase: Awaited<ReturnType<typeof createClient>>,
  tagNames: string[]
): Promise<string[]> {
  const cleaned = [...new Set(tagNames.map((t) => t.trim().toLowerCase()).filter(Boolean))];
  if (cleaned.length === 0) return [];

  const { data: existing } = await supabase.from("tags").select("id, name").in("name", cleaned);
  const existingNames = new Set((existing ?? []).map((t) => t.name));
  const toCreate = cleaned.filter((n) => !existingNames.has(n));

  let created: { id: string; name: string }[] = [];
  if (toCreate.length > 0) {
    const { data } = await supabase
      .from("tags")
      .insert(toCreate.map((name) => ({ name })))
      .select("id, name");
    created = data ?? [];
  }

  return [...(existing ?? []), ...created].map((t) => t.id);
}

export async function createDocumentation(input: DocumentationInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado." };

  const { data: doc, error } = await supabase
    .from("documentations")
    .insert({
      title: input.title,
      category_id: input.categoryId,
      problem: input.problem,
      identification: input.identification,
      solution: input.solution,
      observations: input.observations || null,
      author_id: user.id,
    })
    .select("id")
    .single();

  if (error || !doc) return { error: error?.message ?? "Erro ao salvar documentação." };

  const tagIds = await upsertTags(supabase, input.tags);
  if (tagIds.length > 0) {
    await supabase.from("documentation_tags").insert(tagIds.map((tag_id) => ({ documentation_id: doc.id, tag_id })));
  }

  revalidatePath("/");
  revalidatePath("/documentacoes");
  return { id: doc.id as string };
}

export async function updateDocumentation(id: string, input: DocumentationInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado." };

  const { error } = await supabase
    .from("documentations")
    .update({
      title: input.title,
      category_id: input.categoryId,
      problem: input.problem,
      identification: input.identification,
      solution: input.solution,
      observations: input.observations || null,
    })
    .eq("id", id);

  if (error) return { error: error.message };

  await supabase.from("documentation_tags").delete().eq("documentation_id", id);
  const tagIds = await upsertTags(supabase, input.tags);
  if (tagIds.length > 0) {
    await supabase.from("documentation_tags").insert(tagIds.map((tag_id) => ({ documentation_id: id, tag_id })));
  }

  revalidatePath("/");
  revalidatePath("/documentacoes");
  revalidatePath(`/documentacoes/${id}`);
  return { id };
}

export async function deleteDocumentation(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("documentations").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/");
  revalidatePath("/documentacoes");
  return { success: true };
}
