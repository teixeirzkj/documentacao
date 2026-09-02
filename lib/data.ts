import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Documentation, Profile } from "@/lib/types";

// cache() dedupes this across every Server Component that calls it during the
// same request (layout + page both need it) — without it each call is a
// separate round trip to Supabase Auth, which is the main source of
// navigation lag.
export const getCurrentProfile = cache(async (): Promise<Profile | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  return (data as Profile) ?? null;
});

export async function getCategories() {
  const supabase = await createClient();
  const { data } = await supabase.from("categories").select("*").order("name");
  return data ?? [];
}

export async function getStats(userId: string) {
  const supabase = await createClient();
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [{ count: total }, { count: recent }, { count: mine }, { count: users }] = await Promise.all([
    supabase.from("documentations").select("*", { count: "exact", head: true }),
    supabase.from("documentations").select("*", { count: "exact", head: true }).gte("created_at", sevenDaysAgo),
    supabase.from("documentations").select("*", { count: "exact", head: true }).eq("author_id", userId),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("status", "ativo"),
  ]);

  return {
    total: total ?? 0,
    recent: recent ?? 0,
    mine: mine ?? 0,
    users: users ?? 0,
  };
}

const DOC_SELECT = `
  id, title, category_id, problem, identification, solution, observations, author_id, created_at, updated_at,
  category:categories(id, name, created_at),
  author:profiles(id, name, email, avatar_url, role, status, created_at, updated_at, last_login),
  documentation_tags(tags(id, name, created_at))
`;

function normalizeDoc(row: Record<string, unknown>): Documentation {
  const rawTags = (row.documentation_tags as { tags: unknown }[] | undefined) ?? [];
  return {
    ...(row as unknown as Documentation),
    tags: rawTags.map((t) => t.tags) as Documentation["tags"],
  };
}

export async function getRecentDocumentations(limit = 6): Promise<Documentation[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("documentations")
    .select(DOC_SELECT)
    .order("created_at", { ascending: false })
    .limit(limit);
  return ((data as unknown as Record<string, unknown>[]) ?? []).map(normalizeDoc);
}

export async function getDocumentation(id: string): Promise<Documentation | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("documentations").select(DOC_SELECT).eq("id", id).single();
  if (!data) return null;
  return normalizeDoc(data as unknown as Record<string, unknown>);
}

export interface DocFilters {
  query?: string;
  categoryId?: string;
  authorId?: string;
  dateFrom?: string;
}

export async function searchDocumentations(filters: DocFilters): Promise<Documentation[]> {
  const supabase = await createClient();

  if (filters.query && filters.query.trim().length > 0) {
    const { data, error } = await supabase.rpc("search_documentations", { query: filters.query });
    if (error || !data) return [];

    let rows = data as Documentation[];
    if (filters.categoryId) rows = rows.filter((d) => d.category_id === filters.categoryId);
    if (filters.authorId) rows = rows.filter((d) => d.author_id === filters.authorId);
    if (filters.dateFrom) rows = rows.filter((d) => d.created_at >= filters.dateFrom!);

    const ids = rows.map((d) => d.id);
    if (ids.length === 0) return [];

    const { data: full } = await supabase.from("documentations").select(DOC_SELECT).in("id", ids);
    const byId = new Map(((full as unknown as Record<string, unknown>[]) ?? []).map((d) => [d.id as string, normalizeDoc(d)]));
    return ids.map((id) => byId.get(id)).filter(Boolean) as Documentation[];
  }

  let q = supabase.from("documentations").select(DOC_SELECT).order("created_at", { ascending: false });
  if (filters.categoryId) q = q.eq("category_id", filters.categoryId);
  if (filters.authorId) q = q.eq("author_id", filters.authorId);
  if (filters.dateFrom) q = q.gte("created_at", filters.dateFrom);

  const { data } = await q;
  return ((data as unknown as Record<string, unknown>[]) ?? []).map(normalizeDoc);
}

export async function getUsers(): Promise<Profile[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
  return (data as Profile[]) ?? [];
}
