"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search } from "lucide-react";

export function HeroSearch() {
  const [value, setValue] = useState("");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (value.trim()) params.set("q", value.trim());
    router.push(`/documentacoes?${params.toString()}`);
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mx-auto flex w-full max-w-2xl items-center gap-3 rounded-2xl border border-(--color-border) bg-(--color-surface) px-5 py-4 shadow-lg shadow-black/5 transition-shadow focus-within:ring-2 focus-within:ring-(--color-ring)"
    >
      <Search size={20} className="shrink-0 text-(--color-text-muted)" />
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Pesquisar por um problema, erro ou solução..."
        className="flex-1 bg-transparent text-base text-(--color-text) outline-none placeholder:text-(--color-text-muted)"
      />
      <kbd className="hidden shrink-0 rounded border border-(--color-border) bg-(--color-surface-2) px-2 py-1 text-xs font-medium text-(--color-text-muted) sm:block">
        Ctrl K
      </kbd>
    </motion.form>
  );
}
