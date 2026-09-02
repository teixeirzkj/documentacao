"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Loader2, Monitor, Moon, Sun } from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "@/components/theme-provider";
import { updateOwnProfile } from "@/app/actions/users";
import { createClient } from "@/lib/supabase/client";
import { initials, roleLabel } from "@/lib/utils";
import type { Profile } from "@/lib/types";

const APPEARANCE_OPTIONS = [
  { value: "light", label: "Claro", icon: Sun },
  { value: "dark", label: "Escuro", icon: Moon },
  { value: "system", label: "Sistema", icon: Monitor },
] as const;

export function SettingsView({ profile }: { profile: Profile }) {
  const { theme, setTheme } = useTheme();
  const [name, setName] = useState(profile.name);
  const [savingName, setSavingName] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  async function handleSaveName(e: React.FormEvent) {
    e.preventDefault();
    setSavingName(true);
    const result = await updateOwnProfile(name);
    setSavingName(false);
    if (result?.error) toast.error(result.error);
    else toast.success("Perfil atualizado.");
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error("A senha deve ter ao menos 6 caracteres.");
      return;
    }
    setSavingPassword(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSavingPassword(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setNewPassword("");
    toast.success("Senha alterada com sucesso.");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <h1 className="text-xl font-semibold text-(--color-text)">Configurações</h1>

      <section className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-6">
        <h2 className="mb-4 text-sm font-semibold text-(--color-text)">Aparência</h2>
        <div className="grid grid-cols-3 gap-3">
          {APPEARANCE_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const active = theme === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setTheme(opt.value)}
                className={`flex flex-col items-center gap-2 rounded-xl border px-4 py-4 text-sm font-medium transition-colors ${
                  active
                    ? "border-(--color-primary) bg-(--color-primary-soft) text-(--color-primary)"
                    : "border-(--color-border) text-(--color-text-muted) hover:bg-(--color-surface-2)"
                }`}
              >
                <Icon size={18} />
                {opt.label}
                {active && <Check size={12} />}
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-6">
        <h2 className="mb-4 text-sm font-semibold text-(--color-text)">Conta</h2>

        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-(--color-primary) text-sm font-semibold text-white">
            {initials(profile.name)}
          </div>
          <div>
            <p className="text-sm font-medium text-(--color-text)">{profile.email}</p>
            <p className="text-xs text-(--color-text-muted)">{roleLabel(profile.role)}</p>
          </div>
        </div>

        <form onSubmit={handleSaveName} className="mb-6 flex items-end gap-3">
          <div className="flex-1">
            <label className="mb-1.5 block text-sm font-medium text-(--color-text)">Nome</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-(--color-border) bg-(--color-bg) px-3.5 py-2.5 text-sm text-(--color-text) outline-none focus:ring-2 focus:ring-(--color-ring)"
            />
          </div>
          <button
            type="submit"
            disabled={savingName}
            className="flex items-center gap-2 rounded-lg bg-(--color-primary) px-4 py-2.5 text-sm font-medium text-white hover:bg-(--color-primary-hover) disabled:opacity-60"
          >
            {savingName && <Loader2 size={14} className="animate-spin" />}
            Salvar
          </button>
        </form>

        <form onSubmit={handleChangePassword} className="flex items-end gap-3">
          <div className="flex-1">
            <label className="mb-1.5 block text-sm font-medium text-(--color-text)">Alterar senha</label>
            <input
              type="password"
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Nova senha"
              className="w-full rounded-lg border border-(--color-border) bg-(--color-bg) px-3.5 py-2.5 text-sm text-(--color-text) outline-none focus:ring-2 focus:ring-(--color-ring)"
            />
          </div>
          <button
            type="submit"
            disabled={savingPassword}
            className="flex items-center gap-2 rounded-lg border border-(--color-border) px-4 py-2.5 text-sm font-medium text-(--color-text) hover:bg-(--color-surface-2) disabled:opacity-60"
          >
            {savingPassword && <Loader2 size={14} className="animate-spin" />}
            Alterar
          </button>
        </form>
      </section>

      {profile.role === "administrador" && (
        <section className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-6">
          <h2 className="mb-4 text-sm font-semibold text-(--color-text)">Sistema</h2>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/usuarios"
              className="rounded-lg border border-(--color-border) px-4 py-2 text-sm font-medium text-(--color-text) hover:bg-(--color-surface-2)"
            >
              Gerenciar usuários
            </Link>
          </div>
          <p className="mt-3 text-xs text-(--color-text-muted)">
            Categorias podem ser editadas diretamente na tabela <code>categories</code> do Supabase.
          </p>
        </section>
      )}
    </div>
  );
}
