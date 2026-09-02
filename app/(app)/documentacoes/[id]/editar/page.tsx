import { notFound, redirect } from "next/navigation";
import { getCategories, getCurrentProfile, getDocumentation } from "@/lib/data";
import { DocumentationForm } from "@/components/documentation-form";

export default async function EditarDocumentacaoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [doc, profile, categories] = await Promise.all([
    getDocumentation(id),
    getCurrentProfile(),
    getCategories(),
  ]);

  if (!doc || !profile) notFound();

  const canManage = profile.role === "administrador" || profile.id === doc.author_id;
  if (!canManage) redirect(`/documentacoes/${id}`);

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-1 text-xl font-semibold text-(--color-text)">Editar documentação</h1>
      <p className="mb-8 text-sm text-(--color-text-muted)">Atualize as informações desta solução.</p>
      <DocumentationForm categories={categories} documentation={doc} />
    </div>
  );
}
