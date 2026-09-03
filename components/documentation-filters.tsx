"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import { CLASSIFICATION_OPTIONS } from "@/lib/utils";
import type { Category, Profile, Tag } from "@/lib/types";

const FILTER_KEYS = ["categoria", "autor", "classificacao", "etiqueta", "de", "ate"];

export function DocumentationFilters({
  categories,
  authors,
  tags,
}: {
  categories: Category[];
  authors: Profile[];
  tags: Tag[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/documentacoes?${params.toString()}`);
  }

  const hasFilters = FILTER_KEYS.some((key) => searchParams.get(key));

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={searchParams.get("categoria") ?? ""}
        onChange={(e) => updateParam("categoria", e.target.value)}
        className="rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm text-(--color-text) outline-none focus:ring-2 focus:ring-(--color-ring)"
      >
        <option value="">Todas as categorias</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      <select
        value={searchParams.get("classificacao") ?? ""}
        onChange={(e) => updateParam("classificacao", e.target.value)}
        className="rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm text-(--color-text) outline-none focus:ring-2 focus:ring-(--color-ring)"
      >
        <option value="">Todas as classificações</option>
        {CLASSIFICATION_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      <select
        value={searchParams.get("etiqueta") ?? ""}
        onChange={(e) => updateParam("etiqueta", e.target.value)}
        className="rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm text-(--color-text) outline-none focus:ring-2 focus:ring-(--color-ring)"
      >
        <option value="">Todas as etiquetas</option>
        {tags.map((t) => (
          <option key={t.id} value={t.id}>
            #{t.name}
          </option>
        ))}
      </select>

      <select
        value={searchParams.get("autor") ?? ""}
        onChange={(e) => updateParam("autor", e.target.value)}
        className="rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm text-(--color-text) outline-none focus:ring-2 focus:ring-(--color-ring)"
      >
        <option value="">Todos os autores</option>
        {authors.map((a) => (
          <option key={a.id} value={a.id}>
            {a.name}
          </option>
        ))}
      </select>

      <div className="flex items-center gap-1.5">
        <label className="text-sm text-(--color-text-muted)">De</label>
        <input
          type="date"
          value={searchParams.get("de") ?? ""}
          onChange={(e) => updateParam("de", e.target.value)}
          className="rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm text-(--color-text) outline-none focus:ring-2 focus:ring-(--color-ring)"
        />
      </div>

      <div className="flex items-center gap-1.5">
        <label className="text-sm text-(--color-text-muted)">Até</label>
        <input
          type="date"
          value={searchParams.get("ate") ?? ""}
          onChange={(e) => updateParam("ate", e.target.value)}
          className="rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm text-(--color-text) outline-none focus:ring-2 focus:ring-(--color-ring)"
        />
      </div>

      {hasFilters && (
        <button
          onClick={() => router.push("/documentacoes")}
          className="flex items-center gap-1 rounded-lg px-2.5 py-2 text-sm text-(--color-text-muted) hover:text-(--color-text)"
        >
          <X size={14} /> Limpar filtros
        </button>
      )}
    </div>
  );
}
