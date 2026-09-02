"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import type { Category, Profile } from "@/lib/types";

const DATE_OPTIONS = [
  { value: "", label: "Qualquer data" },
  { value: "1", label: "Hoje" },
  { value: "7", label: "Últimos 7 dias" },
  { value: "30", label: "Últimos 30 dias" },
];

export function DocumentationFilters({
  categories,
  authors,
}: {
  categories: Category[];
  authors: Profile[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/documentacoes?${params.toString()}`);
  }

  const hasFilters = searchParams.get("categoria") || searchParams.get("autor") || searchParams.get("periodo");

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

      <select
        value={searchParams.get("periodo") ?? ""}
        onChange={(e) => updateParam("periodo", e.target.value)}
        className="rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm text-(--color-text) outline-none focus:ring-2 focus:ring-(--color-ring)"
      >
        {DATE_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

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
