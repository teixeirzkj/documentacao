import type { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: number;
  hint: string;
  icon: LucideIcon;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-(--color-border) bg-(--color-surface) px-4 py-3.5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-(--color-primary-soft) text-(--color-primary)">
        <Icon size={16} aria-hidden />
      </div>
      <div className="min-w-0">
        <p className="sr-only">{label}</p>
        <p className="text-lg font-semibold leading-tight text-(--color-text)">{value}</p>
        <p className="truncate text-xs text-(--color-text-muted)">{hint}</p>
      </div>
    </div>
  );
}
