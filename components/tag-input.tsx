"use client";

import { useState } from "react";
import { X } from "lucide-react";

export function TagInput({ value, onChange }: { value: string[]; onChange: (tags: string[]) => void }) {
  const [draft, setDraft] = useState("");

  function addTag(raw: string) {
    const tag = raw.trim().toLowerCase().replace(/^#/, "");
    if (!tag || value.includes(tag)) return;
    onChange([...value, tag]);
    setDraft("");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(draft);
    } else if (e.key === "Backspace" && !draft && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-(--color-border) bg-(--color-bg) px-3 py-2.5 focus-within:ring-2 focus-within:ring-(--color-ring)">
      {value.map((tag) => (
        <span
          key={tag}
          className="flex items-center gap-1 rounded-md bg-(--color-primary-soft) px-2 py-1 text-xs font-medium text-(--color-primary)"
        >
          #{tag}
          <button type="button" onClick={() => onChange(value.filter((t) => t !== tag))} aria-label={`Remover tag ${tag}`}>
            <X size={12} />
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => addTag(draft)}
        placeholder={value.length === 0 ? "Adicione tags e pressione Enter..." : "Adicionar..."}
        className="min-w-[140px] flex-1 bg-transparent text-sm text-(--color-text) outline-none placeholder:text-(--color-text-muted)"
      />
    </div>
  );
}
