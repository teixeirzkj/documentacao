"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

export function SearchInput({ placeholder }: { placeholder: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("q") ?? "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (value.trim()) params.set("q", value.trim());
    else params.delete("q");
    router.push(`/documentacoes?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-1 items-center gap-3 rounded-xl border border-(--color-border) bg-(--color-surface) px-4 py-3 focus-within:ring-2 focus-within:ring-(--color-ring)">
      <Search size={18} className="shrink-0 text-(--color-text-muted)" />
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-transparent text-sm text-(--color-text) outline-none placeholder:text-(--color-text-muted)"
      />
    </form>
  );
}
