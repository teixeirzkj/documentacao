"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteDocumentation } from "@/app/actions/documentations";
import { formatDate } from "@/lib/utils";
import type { Documentation, Profile } from "@/lib/types";

export function DocumentationDetail({ doc, canManage }: { doc: Documentation; canManage: boolean }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [confirming, setConfirming] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    const result = await deleteDocumentation(doc.id);
    if (result?.error) {
      toast.error(result.error);
      setDeleting(false);
      return;
    }
    toast.success("Documentação excluída.");
    router.push("/documentacoes");
    router.refresh();
  }

  const solutionSteps = parseSteps(doc.solution);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/documentacoes" className="flex items-center gap-1.5 text-sm font-medium text-(--color-text-muted) hover:text-(--color-text)">
          <ArrowLeft size={16} /> Voltar
        </Link>

        {canManage && (
          <div className="flex items-center gap-2">
            <Link
              href={`/documentacoes/${doc.id}/editar`}
              className="flex items-center gap-1.5 rounded-lg border border-(--color-border) px-3 py-1.5 text-sm font-medium text-(--color-text) hover:bg-(--color-surface-2)"
            >
              <Pencil size={14} /> Editar
            </Link>
            {confirming ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-(--color-text-muted)">Confirmar exclusão?</span>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
                >
                  Sim, excluir
                </button>
                <button
                  onClick={() => setConfirming(false)}
                  className="rounded-lg border border-(--color-border) px-3 py-1.5 text-sm font-medium text-(--color-text) hover:bg-(--color-surface-2)"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirming(true)}
                className="flex items-center gap-1.5 rounded-lg border border-(--color-border) px-3 py-1.5 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
              >
                <Trash2 size={14} /> Excluir
              </button>
            )}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-6 sm:p-8">
        {doc.category && (
          <span className="mb-3 inline-block rounded-full bg-(--color-primary-soft) px-2.5 py-0.5 text-xs font-medium text-(--color-primary)">
            {doc.category.name}
          </span>
        )}

        <h1 className="text-2xl font-semibold text-(--color-text)">{doc.title}</h1>
        <p className="mt-2 text-sm text-(--color-text-muted)">
          Criado por <span className="font-medium text-(--color-text)">{(doc.author as Profile | null | undefined)?.name ?? "—"}</span> ·{" "}
          {formatDate(doc.created_at)}
        </p>

        <Section title="Problema">{doc.problem}</Section>
        <Section title="Como foi identificado">{doc.identification}</Section>

        <div className="mt-8 border-t border-(--color-border) pt-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-(--color-text-muted)">Solução</h2>
          {solutionSteps ? (
            <ol className="space-y-3">
              {solutionSteps.map((step, i) => (
                <li key={i} className="flex gap-3 text-sm leading-relaxed text-(--color-text)">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-(--color-primary-soft) text-xs font-semibold text-(--color-primary)">
                    {i + 1}
                  </span>
                  <span className="pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-(--color-text)">{doc.solution}</p>
          )}
        </div>

        {doc.observations && <Section title="Observações">{doc.observations}</Section>}

        {doc.images && doc.images.length > 0 && (
          <div className="mt-8 border-t border-(--color-border) pt-6">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-(--color-text-muted)">Prints</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {doc.images.map((img) => (
                <a
                  key={img.id}
                  href={img.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative block aspect-video overflow-hidden rounded-lg border border-(--color-border) transition-opacity hover:opacity-90"
                >
                  <Image src={img.url} alt="Print da documentação" fill sizes="(max-width: 640px) 50vw, 33vw" className="object-cover" />
                </a>
              ))}
            </div>
          </div>
        )}

        {doc.tags && doc.tags.length > 0 && (
          <div className="mt-8 border-t border-(--color-border) pt-6">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-(--color-text-muted)">Tags</h2>
            <div className="flex flex-wrap gap-2">
              {doc.tags.map((tag) => (
                <span key={tag.id} className="rounded-md bg-(--color-surface-2) px-2.5 py-1 text-xs text-(--color-text-muted)">
                  #{tag.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-8 border-t border-(--color-border) pt-6">
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-(--color-text-muted)">{title}</h2>
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-(--color-text)">{children}</p>
    </div>
  );
}

function parseSteps(solution: string): string[] | null {
  const lines = solution
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const stepped = lines
    .map((l) => l.match(/^(?:\d+[.)-]|-|\*)\s*(.+)$/))
    .filter(Boolean) as RegExpMatchArray[];

  if (stepped.length >= 2 && stepped.length === lines.length) {
    return stepped.map((m) => m[1]);
  }
  return null;
}
