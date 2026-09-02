import Link from "next/link";
import { FileText, Library, PlusCircle, Sparkles, Users } from "lucide-react";
import { getCurrentProfile, getRecentDocumentations, getStats } from "@/lib/data";
import { HeroSearch } from "@/components/hero-search";
import { StatCard } from "@/components/stat-card";
import { DocumentationCard } from "@/components/documentation-card";

export default async function DashboardPage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const [stats, recent] = await Promise.all([getStats(profile.id), getRecentDocumentations(6)]);
  const firstName = profile.name.split(" ")[0];

  return (
    <div className="mx-auto max-w-6xl">
      <p className="mb-8 text-sm text-(--color-text-muted)">
        Olá, {firstName} <span aria-hidden>👋</span>
      </p>

      <div className="mb-3 text-center">
        <h1 className="text-2xl font-semibold text-(--color-text) sm:text-3xl">
          O que você está procurando?
        </h1>
        <p className="mt-2 text-sm text-(--color-text-muted)">
          Pesquise por um problema, erro, sistema ou solução.
        </p>
      </div>

      <HeroSearch />

      <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Documentações" value={stats.total} hint="Demandas registradas" icon={Library} />
        <StatCard label="Recentes" value={stats.recent} hint="Adicionadas na última semana" icon={Sparkles} />
        <StatCard label="Minhas" value={stats.mine} hint="Criadas por você" icon={FileText} />
        <StatCard label="Usuários" value={stats.users} hint="Usuários ativos" icon={Users} />
      </div>

      <div className="mt-12">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-(--color-text)">Documentações recentes</h2>
          <Link
            href="/documentacoes"
            className="text-xs font-medium text-(--color-primary) hover:underline"
          >
            Ver todas
          </Link>
        </div>

        {recent.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recent.map((doc, i) => (
              <DocumentationCard key={doc.id} doc={doc} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-(--color-border) bg-(--color-surface) px-6 py-16 text-center">
      <p className="text-sm font-medium text-(--color-text)">Ainda não existem documentações.</p>
      <Link
        href="/documentacoes/nova"
        className="flex items-center gap-2 rounded-lg bg-(--color-primary) px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-(--color-primary-hover)"
      >
        <PlusCircle size={16} />
        Criar primeira documentação
      </Link>
    </div>
  );
}
