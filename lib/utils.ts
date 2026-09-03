import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Classification } from "@/lib/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const CLASSIFICATION_OPTIONS: { value: Classification; label: string }[] = [
  { value: "basico", label: "Básico" },
  { value: "medio", label: "Médio" },
  { value: "avancado", label: "Avançado" },
];

const CLASSIFICATION_STYLES: Record<Classification, string> = {
  basico: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  medio: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  avancado: "bg-red-500/10 text-red-600 dark:text-red-400",
};

export function classificationLabel(classification: Classification) {
  return CLASSIFICATION_OPTIONS.find((o) => o.value === classification)?.label ?? classification;
}

export function classificationStyle(classification: Classification) {
  return CLASSIFICATION_STYLES[classification] ?? CLASSIFICATION_STYLES.basico;
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function daysAgoISO(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

export function roleLabel(role: string) {
  return role === "administrador" ? "Administrador" : "Usuário";
}

export function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}
