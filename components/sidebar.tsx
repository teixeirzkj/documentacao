"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpenCheck,
  Home,
  Library,
  LogOut,
  Menu,
  PlusCircle,
  Settings,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { cn, initials } from "@/lib/utils";
import type { Profile } from "@/lib/types";

const NAV_ITEMS = [
  { href: "/", label: "Início", icon: Home },
  { href: "/documentacoes", label: "Documentações", icon: Library },
  { href: "/documentacoes/nova", label: "Nova documentação", icon: PlusCircle },
  { href: "/usuarios", label: "Usuários", icon: Users, adminOnly: true },
  { href: "/configuracoes", label: "Configurações", icon: Settings, adminOnly: true },
];

export function Sidebar({ profile }: { profile: Profile }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const items = NAV_ITEMS.filter((item) => !item.adminOnly || profile.role === "administrador");

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  const content = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-(--color-primary-soft) text-(--color-primary)">
          <BookOpenCheck size={18} />
        </div>
        <span className="text-sm font-semibold text-(--color-text)">Documentação Fredy</span>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {items.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-(--color-primary-soft) text-(--color-primary)"
                  : "text-(--color-text-muted) hover:bg-(--color-surface-2) hover:text-(--color-text)"
              )}
            >
              <Icon size={17} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-(--color-border) p-4">
        <div className="mb-2 flex items-center gap-3 rounded-lg px-1 py-1">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-(--color-primary) text-xs font-semibold text-white">
            {initials(profile.name)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-(--color-text)">{profile.name}</p>
            <p className="truncate text-xs text-(--color-text-muted)">{profile.email}</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-(--color-text-muted) transition-colors hover:bg-(--color-surface-2) hover:text-red-500"
        >
          <LogOut size={16} />
          Sair
        </button>
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-30 flex h-10 w-10 items-center justify-center rounded-lg border border-(--color-border) bg-(--color-surface) text-(--color-text) shadow-sm lg:hidden"
        aria-label="Abrir menu"
      >
        <Menu size={18} />
      </button>

      <aside className="hidden w-64 shrink-0 border-r border-(--color-border) bg-(--color-surface) lg:block">
        {content}
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "tween", duration: 0.22 }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-(--color-surface) shadow-2xl lg:hidden"
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute right-3 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-(--color-text-muted) hover:bg-(--color-surface-2)"
                aria-label="Fechar menu"
              >
                <X size={16} />
              </button>
              {content}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
