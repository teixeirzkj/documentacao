"use server";

import { searchDocumentations } from "@/lib/data";

export async function searchAction(query: string) {
  if (!query.trim()) return [];
  const results = await searchDocumentations({ query });
  return results.slice(0, 8).map((d) => ({
    id: d.id,
    title: d.title,
    category: d.category?.name ?? null,
    problem: d.problem,
    tags: (d.tags ?? []).map((t) => t.name),
    authorName: d.author?.name ?? "—",
    createdAt: d.created_at,
  }));
}
