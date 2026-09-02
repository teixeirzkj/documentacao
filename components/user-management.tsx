"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { createUser, updateUserRole, updateUserStatus } from "@/app/actions/users";
import { formatDate, initials, roleLabel } from "@/lib/utils";
import type { Profile, Role, Status } from "@/lib/types";

export function UserManagement({ users, currentUserId }: { users: Profile[]; currentUserId: string }) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-(--color-text)">Usuários</h1>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-(--color-primary) px-4 py-2.5 text-sm font-medium text-white hover:bg-(--color-primary-hover)"
        >
          <Plus size={16} /> Adicionar usuário
        </button>
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-2xl border border-(--color-border) bg-(--color-surface) lg:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-(--color-border) text-left text-xs uppercase tracking-wide text-(--color-text-muted)">
              <th className="px-5 py-3 font-medium">Nome</th>
              <th className="px-5 py-3 font-medium">Função</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Criado em</th>
              <th className="px-5 py-3 font-medium">Último acesso</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <UserRow key={u.id} user={u} isSelf={u.id === currentUserId} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 lg:hidden">
        {users.map((u) => (
          <UserCard key={u.id} user={u} isSelf={u.id === currentUserId} />
        ))}
      </div>

      <AnimatePresence>{modalOpen && <CreateUserModal onClose={() => setModalOpen(false)} />}</AnimatePresence>
    </div>
  );
}

function UserRow({ user, isSelf }: { user: Profile; isSelf: boolean }) {
  return (
    <tr className="border-b border-(--color-border) last:border-0">
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-(--color-primary) text-xs font-semibold text-white">
            {initials(user.name)}
          </div>
          <div>
            <p className="font-medium text-(--color-text)">{user.name}</p>
            <p className="text-xs text-(--color-text-muted)">{user.email}</p>
          </div>
        </div>
      </td>
      <td className="px-5 py-3.5">
        <RoleSelect user={user} disabled={isSelf} />
      </td>
      <td className="px-5 py-3.5">
        <StatusToggle user={user} disabled={isSelf} />
      </td>
      <td className="px-5 py-3.5 text-(--color-text-muted)">{formatDate(user.created_at)}</td>
      <td className="px-5 py-3.5 text-(--color-text-muted)">
        {user.last_login ? formatDate(user.last_login) : "—"}
      </td>
    </tr>
  );
}

function UserCard({ user, isSelf }: { user: Profile; isSelf: boolean }) {
  return (
    <div className="rounded-xl border border-(--color-border) bg-(--color-surface) p-4">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-(--color-primary) text-xs font-semibold text-white">
          {initials(user.name)}
        </div>
        <div className="min-w-0">
          <p className="truncate font-medium text-(--color-text)">{user.name}</p>
          <p className="truncate text-xs text-(--color-text-muted)">{user.email}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <RoleSelect user={user} disabled={isSelf} />
        <StatusToggle user={user} disabled={isSelf} />
      </div>
      <p className="mt-2 text-xs text-(--color-text-muted)">Criado em {formatDate(user.created_at)}</p>
    </div>
  );
}

function RoleSelect({ user, disabled }: { user: Profile; disabled: boolean }) {
  const [loading, setLoading] = useState(false);

  async function handleChange(role: Role) {
    setLoading(true);
    const result = await updateUserRole(user.id, role);
    setLoading(false);
    if (result?.error) toast.error(result.error);
    else toast.success("Função atualizada.");
  }

  return (
    <select
      defaultValue={user.role}
      disabled={disabled || loading}
      onChange={(e) => handleChange(e.target.value as Role)}
      className="rounded-lg border border-(--color-border) bg-(--color-bg) px-2.5 py-1.5 text-xs font-medium text-(--color-text) outline-none disabled:opacity-60"
    >
      <option value="atendente">{roleLabel("atendente")}</option>
      <option value="administrador">{roleLabel("administrador")}</option>
    </select>
  );
}

function StatusToggle({ user, disabled }: { user: Profile; disabled: boolean }) {
  const [loading, setLoading] = useState(false);

  async function handleChange(status: Status) {
    setLoading(true);
    const result = await updateUserStatus(user.id, status);
    setLoading(false);
    if (result?.error) toast.error(result.error);
    else toast.success("Status atualizado.");
  }

  return (
    <select
      defaultValue={user.status}
      disabled={disabled || loading}
      onChange={(e) => handleChange(e.target.value as Status)}
      className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium outline-none disabled:opacity-60 ${
        user.status === "ativo"
          ? "border-green-200 bg-green-50 text-green-700 dark:border-green-500/20 dark:bg-green-500/10 dark:text-green-400"
          : "border-(--color-border) bg-(--color-surface-2) text-(--color-text-muted)"
      }`}
    >
      <option value="ativo">Ativo</option>
      <option value="inativo">Inativo</option>
    </select>
  );
}

function CreateUserModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("atendente");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const result = await createUser({ name, email, password, role });
    setLoading(false);

    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Usuário criado com sucesso.");
    onClose();
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.18 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl border border-(--color-border) bg-(--color-surface) p-6 shadow-2xl"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-base font-semibold text-(--color-text)">Adicionar usuário</h2>
          <button onClick={onClose} className="text-(--color-text-muted) hover:text-(--color-text)">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome"
            className="w-full rounded-lg border border-(--color-border) bg-(--color-bg) px-3.5 py-2.5 text-sm text-(--color-text) outline-none focus:ring-2 focus:ring-(--color-ring)"
          />
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="E-mail"
            className="w-full rounded-lg border border-(--color-border) bg-(--color-bg) px-3.5 py-2.5 text-sm text-(--color-text) outline-none focus:ring-2 focus:ring-(--color-ring)"
          />
          <input
            required
            type="password"
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Senha inicial"
            className="w-full rounded-lg border border-(--color-border) bg-(--color-bg) px-3.5 py-2.5 text-sm text-(--color-text) outline-none focus:ring-2 focus:ring-(--color-ring)"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
            className="w-full rounded-lg border border-(--color-border) bg-(--color-bg) px-3.5 py-2.5 text-sm text-(--color-text) outline-none focus:ring-2 focus:ring-(--color-ring)"
          >
            <option value="atendente">{roleLabel("atendente")}</option>
            <option value="administrador">{roleLabel("administrador")}</option>
          </select>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-(--color-primary) px-4 py-2.5 text-sm font-medium text-white hover:bg-(--color-primary-hover) disabled:opacity-60"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            Criar usuário
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}
