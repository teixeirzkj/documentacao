import { notFound } from "next/navigation";
import { getCurrentProfile, getDocumentation } from "@/lib/data";
import { DocumentationDetail } from "@/components/documentation-detail";

export default async function DocumentacaoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [doc, profile] = await Promise.all([getDocumentation(id), getCurrentProfile()]);

  if (!doc || !profile) notFound();

  const canManage = profile.role === "administrador" || profile.id === doc.author_id;

  return <DocumentationDetail doc={doc} canManage={canManage} />;
}
