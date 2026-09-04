"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { FileSearch, Loader2, Search } from "lucide-react";
import { searchAction } from "@/app/actions/search";
import { formatDate } from "@/lib/utils";

type Result = Awaited<ReturnType<typeof searchAction>>[number];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setResults([]);
    setLoading(false);
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const isK = e.key.toLowerCase() === "k";
      if ((e.metaKey || e.ctrlKey) && isK) {
        e.preventDefault();
        setOpen((prev) => !prev);
        return;
      }
      if (e.key === "Escape") close();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [close]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) return;

    const timeout = setTimeout(async () => {
      const data = await searchAction(trimmed);
      setResults(data);
      setLoading(false);
    }, 220);
    return () => clearTimeout(timeout);
  }, [query]);

  function goTo(id: string) {
    close();
    router.push(`/documentacoes/${id}`);
  }

  function handleQueryChange(value: string) {
    setQuery(value);
    if (value.trim()) {
      setLoading(true);
    } else {
      setLoading(false);
      setResults([]);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full max-w-xs items-center gap-2 rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm text-(--color-text-muted) transition-colors hover:border-(--color-primary)"
      >
        <Search size={15} />
        <span className="flex-1 text-left">Pesquisar...</span>
        <kbd className="rounded border border-(--color-border) bg-(--color-surface-2) px-1.5 py-0.5 text-[10px] font-medium text-(--color-text-muted)">
          Ctrl K
        </kbd>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 px-4 pt-20 backdrop-blur-sm"
            onClick={close}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -12 }}
              transition={{ duration: 0.16 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-xl overflow-hidden rounded-2xl border border-(--color-border) bg-(--color-surface) shadow-2xl"
            >
              <div className="flex items-center gap-3 border-b border-(--color-border) px-4 py-3">
                <Search size={18} className="text-(--color-text-muted)" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => handleQueryChange(e.target.value)}
                  placeholder="Pesquisar documentação..."
                  className="flex-1 bg-transparent text-sm text-(--color-text) outline-none placeholder:text-(--color-text-muted)"
                />
                {loading && <Loader2 size={16} className="animate-spin text-(--color-text-muted)" />}
              </div>

              <div className="max-h-96 overflow-y-auto p-2">
                {query.trim() && !loading && results.length === 0 && (
                  <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
                    <FileSearch size={28} className="text-(--color-text-muted)" />
                    <p className="text-sm font-medium text-(--color-text)">Nenhuma solução encontrada</p>
                    <p className="text-xs text-(--color-text-muted)">Tente outros termos ou crie uma nova documentação.</p>
                  </div>
                )}

                {results.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => goTo(r.id)}
                    className="block w-full rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-(--color-surface-2)"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-(--color-text)">{r.title}</span>
                      {r.category && (
                        <span className="shrink-0 rounded-full bg-(--color-primary-soft) px-2 py-0.5 text-[11px] font-medium text-(--color-primary)">
                          {r.category}
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 line-clamp-1 text-xs text-(--color-text-muted)">{r.problem}</p>
                    <div className="mt-1 flex items-center gap-1 text-[11px] text-(--color-text-muted)">
                      <span>{r.authorName}</span>
                      <span>·</span>
                      <span>{formatDate(r.createdAt)}</span>
                    </div>
                  </button>
                ))}

                {!query.trim() && (
                  <div className="px-4 py-10 text-center text-sm text-(--color-text-muted)">
                    Comece a digitar para pesquisar em toda a base de conhecimento.
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
