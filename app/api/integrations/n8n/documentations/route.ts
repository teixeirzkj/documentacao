import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Called by an n8n workflow whenever an annotation is created on the other
// platform. Auth is a shared secret (not a user session — n8n has none),
// and documentations created this way are attributed to a dedicated
// "Integração n8n" profile (id in N8N_AUTOMATION_AUTHOR_ID) so they're
// clearly distinguishable from human-authored ones in the UI.
//
// Expected body — either the raw annotation as-is:
// {
//   "content": "texto bruto da anotação do card",   // required if problem/solution aren't sent
//   "title": "...",                                  // optional, derived from `content` when omitted
//   "category": "Reserva",                            // optional, matches an existing category name (case-insensitive); falls back to "Outros"
//   "classification": "basico",                       // optional, one of basico|medio|avancado; defaults to "basico"
//   "observations": "...",                            // optional
//   "tags": ["reserva", "pagamento"]                  // optional
// }
// ...or already-structured fields, if the caller prefers to split them itself:
// { "title": "...", "problem": "...", "solution": "...", "category": "...", "classification": "...", "observations": "...", "tags": [...] }

const CLASSIFICATIONS = ["basico", "medio", "avancado"];

interface Payload {
  title?: string;
  content?: string;
  category?: string;
  classification?: string;
  problem?: string;
  identification?: string;
  solution?: string;
  observations?: string;
  tags?: string[];
}

function deriveTitle(content: string): string {
  const firstLine = content.split("\n").find((line) => line.trim().length > 0) ?? content;
  return firstLine.trim().slice(0, 120);
}

async function resolveCategoryId(
  supabase: ReturnType<typeof createAdminClient>,
  name: string | undefined
): Promise<string | null> {
  const { data: categories } = await supabase.from("categories").select("id, name");
  if (!categories) return null;

  if (name) {
    const match = categories.find((c) => c.name.toLowerCase() === name.trim().toLowerCase());
    if (match) return match.id;
  }

  return categories.find((c) => c.name === "Outros")?.id ?? null;
}

async function upsertTagIds(supabase: ReturnType<typeof createAdminClient>, tagNames: string[]): Promise<string[]> {
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

export async function POST(request: Request) {
  const secret = process.env.N8N_WEBHOOK_SECRET;
  const authorId = process.env.N8N_AUTOMATION_AUTHOR_ID;

  if (!secret || !authorId) {
    return NextResponse.json({ error: "Integração n8n não configurada no servidor." }, { status: 500 });
  }

  const authHeader = request.headers.get("authorization") ?? "";
  if (authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  let body: Payload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo da requisição inválido (esperado JSON)." }, { status: 400 });
  }

  const hasStructuredFields = body.problem && body.solution;
  const content = body.content?.trim();

  if (!hasStructuredFields && !content) {
    return NextResponse.json(
      { error: "Envie 'content' com o texto da anotação, ou os campos problem e solution." },
      { status: 400 }
    );
  }

  const title = body.title?.trim() || (content ? deriveTitle(content) : "");
  const problem = body.problem || content!;
  const identification = body.identification || null;
  const solution = body.solution || content!;

  if (!title) {
    return NextResponse.json({ error: "Não foi possível determinar um título." }, { status: 400 });
  }

  const supabase = createAdminClient();
  const categoryId = await resolveCategoryId(supabase, body.category);
  const classification = CLASSIFICATIONS.includes(body.classification ?? "") ? body.classification : "basico";

  const { data: doc, error } = await supabase
    .from("documentations")
    .insert({
      title,
      category_id: categoryId,
      problem,
      identification,
      solution,
      observations: body.observations || null,
      classification,
      author_id: authorId,
    })
    .select("id")
    .single();

  if (error || !doc) {
    return NextResponse.json({ error: error?.message ?? "Erro ao criar documentação." }, { status: 500 });
  }

  const tagIds = await upsertTagIds(supabase, body.tags ?? []);
  if (tagIds.length > 0) {
    await supabase.from("documentation_tags").insert(tagIds.map((tag_id) => ({ documentation_id: doc.id, tag_id })));
  }

  const url = new URL(`/documentacoes/${doc.id}`, request.url).toString();
  return NextResponse.json({ id: doc.id, url }, { status: 201 });
}
