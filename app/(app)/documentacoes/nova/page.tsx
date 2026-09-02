import { getCategories } from "@/lib/data";
import { DocumentationForm } from "@/components/documentation-form";

export default async function NovaDocumentacaoPage() {
  const categories = await getCategories();

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-1 text-xl font-semibold text-(--color-text)">Nova documentação</h1>
      <p className="mb-8 text-sm text-(--color-text-muted)">
        Registre um problema já solucionado para que a equipe encontre rapidamente no futuro.
      </p>
      <DocumentationForm categories={categories} />
    </div>
  );
}
