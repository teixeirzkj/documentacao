"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Calendar, User } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { Documentation } from "@/lib/types";

export function DocumentationCard({ doc, index = 0 }: { doc: Documentation; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index, 6) * 0.04 }}
      whileHover={{ y: -2 }}
    >
      <Link
        href={`/documentacoes/${doc.id}`}
        className="group flex h-full flex-col rounded-2xl border border-(--color-border) bg-(--color-surface) p-5 shadow-sm shadow-black/[0.03] transition-shadow hover:shadow-md hover:shadow-black/[0.06]"
      >
        <div className="mb-2 flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold text-(--color-text) group-hover:text-(--color-primary)">
            {doc.title}
          </h3>
        </div>

        {doc.category && (
          <span className="mb-2 inline-block w-fit rounded-full bg-(--color-primary-soft) px-2.5 py-0.5 text-[11px] font-medium text-(--color-primary)">
            {doc.category.name}
          </span>
        )}

        <p className="mb-3 line-clamp-2 flex-1 text-sm text-(--color-text-muted)">{doc.problem}</p>

        {doc.tags && doc.tags.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1.5">
            {doc.tags.slice(0, 4).map((tag) => (
              <span
                key={tag.id}
                className="rounded-md bg-(--color-surface-2) px-2 py-0.5 text-[11px] text-(--color-text-muted)"
              >
                #{tag.name}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between border-t border-(--color-border) pt-3 text-xs text-(--color-text-muted)">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <User size={12} /> {doc.author?.name ?? "—"}
            </span>
            <span className="flex items-center gap-1">
              <Calendar size={12} /> {formatDate(doc.created_at)}
            </span>
          </div>
          <span className="flex items-center gap-1 font-medium text-(--color-primary) opacity-0 transition-opacity group-hover:opacity-100">
            Ver <ArrowRight size={12} />
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
