import Link from "next/link";
import { PlusCircle, SearchX } from "lucide-react";
import { getCategories, getTags, getUsers, searchDocumentations } from "@/lib/data";
import { SearchInput } from "@/components/search-input";
import { DocumentationFilters } from "@/components/documentation-filters";
import { DocumentationCard } from "@/components/documentation-card";
import type { Classification } from "@/lib/types";

export default async function DocumentacoesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const query = params.q ?? "";

  const dateFrom = params.de ? new Date(`${params.de}T00:00:00.000Z`).toISOString() : undefined;
  const dateTo = params.ate ? new Date(`${params.ate}T23:59:59.999Z`).toISOString() : undefined;

  const [categories, authors, tags, docs] = await Promise.all([
    getCategories(),
    getUsers(),
    getTags(),
    searchDocumentations({
      query,
      categoryId: params.categoria,
      authorId: params.autor,
      classification: params.classificacao as Classification | undefined,
      tagId: params.etiqueta,
      dateFrom,
      dateTo,
    }),
  ]);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold text-(--color-text)">Documentações</h1>
        <Link
          href="/documentacoes/nova"
          className="flex items-center justify-center gap-2 rounded-lg bg-(--color-primary) px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-(--color-primary-hover)"
        >
          <PlusCircle size={16} />
          Nova documentação
        </Link>
      </div>

      <div className="mb-4">
        <SearchInput placeholder="Pesquisar uma demanda, problema ou solução..." />
      </div>

      <div className="mb-6">
        <DocumentationFilters categories={categories} authors={authors} tags={tags} />
      </div>

      {query && (
        <p className="mb-4 text-sm text-(--color-text-muted)">
          {docs.length} {docs.length === 1 ? "documentação encontrada" : "documentações encontradas"} para{" "}
          <span className="font-medium text-(--color-text)">&ldquo;{query}&rdquo;</span>
        </p>
      )}

      {docs.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-(--color-border) bg-(--color-surface) px-6 py-16 text-center">
          <SearchX size={28} className="text-(--color-text-muted)" />
          <div>
            <p className="text-sm font-medium text-(--color-text)">Nenhuma solução encontrada</p>
            <p className="mt-1 text-sm text-(--color-text-muted)">
              Não encontramos nenhuma documentação relacionada à sua pesquisa.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/documentacoes/nova"
              className="rounded-lg bg-(--color-primary) px-4 py-2 text-sm font-medium text-white hover:bg-(--color-primary-hover)"
            >
              + Criar nova documentação
            </Link>
            <Link
              href="/documentacoes"
              className="rounded-lg border border-(--color-border) px-4 py-2 text-sm font-medium text-(--color-text) hover:bg-(--color-surface-2)"
            >
              Limpar pesquisa
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {docs.map((doc, i) => (
            <DocumentationCard key={doc.id} doc={doc} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
