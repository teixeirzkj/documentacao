"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { createDocumentation, updateDocumentation, type DocumentationInput } from "@/app/actions/documentations";
import { TagInput } from "@/components/tag-input";
import type { Category, Documentation } from "@/lib/types";

export function DocumentationForm({
  categories,
  documentation,
}: {
  categories: Category[];
  documentation?: Documentation;
}) {
  const router = useRouter();
  const isEditing = Boolean(documentation);

  const [title, setTitle] = useState(documentation?.title ?? "");
  const [categoryId, setCategoryId] = useState(documentation?.category_id ?? categories[0]?.id ?? "");
  const [problem, setProblem] = useState(documentation?.problem ?? "");
  const [identification, setIdentification] = useState(documentation?.identification ?? "");
  const [solution, setSolution] = useState(documentation?.solution ?? "");
  const [observations, setObservations] = useState(documentation?.observations ?? "");
  const [tags, setTags] = useState<string[]>(documentation?.tags?.map((t) => t.name) ?? []);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const input: DocumentationInput = {
      title,
      categoryId: categoryId || null,
      problem,
      identification,
      solution,
      observations,
      tags,
    };

    const result = isEditing
      ? await updateDocumentation(documentation!.id, input)
      : await createDocumentation(input);

    setLoading(false);

    if ("error" in result && result.error) {
      toast.error(result.error);
      return;
    }

    toast.success(isEditing ? "Documentação atualizada com sucesso." : "Documentação salva com sucesso!");
    router.push(`/documentacoes/${result.id}`);
    router.refresh();
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      <Field label="Título">
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex: Erro ao realizar pagamento"
          className="w-full rounded-lg border border-(--color-border) bg-(--color-bg) px-3.5 py-2.5 text-sm text-(--color-text) outline-none focus:ring-2 focus:ring-(--color-ring)"
        />
      </Field>

      <Field label="Categoria">
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="w-full rounded-lg border border-(--color-border) bg-(--color-bg) px-3.5 py-2.5 text-sm text-(--color-text) outline-none focus:ring-2 focus:ring-(--color-ring)"
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </Field>

      <Field label="O que aconteceu?">
        <textarea
          required
          rows={3}
          value={problem}
          onChange={(e) => setProblem(e.target.value)}
          placeholder="Descreva o problema relatado..."
          className="w-full resize-y rounded-lg border border-(--color-border) bg-(--color-bg) px-3.5 py-2.5 text-sm text-(--color-text) outline-none focus:ring-2 focus:ring-(--color-ring)"
        />
      </Field>

      <Field label="Como você identificou o problema?">
        <textarea
          required
          rows={3}
          value={identification}
          onChange={(e) => setIdentification(e.target.value)}
          placeholder="Explique como a causa foi identificada..."
          className="w-full resize-y rounded-lg border border-(--color-border) bg-(--color-bg) px-3.5 py-2.5 text-sm text-(--color-text) outline-none focus:ring-2 focus:ring-(--color-ring)"
        />
      </Field>

      <Field label="Como foi solucionado?">
        <textarea
          required
          rows={6}
          value={solution}
          onChange={(e) => setSolution(e.target.value)}
          placeholder={"Descreva a solução passo a passo. Ex:\n1. Acessar a tela X\n2. Verificar o campo Y\n3. Corrigir a informação\n4. Confirmar"}
          className="w-full resize-y rounded-lg border border-(--color-border) bg-(--color-bg) px-3.5 py-2.5 text-sm text-(--color-text) outline-none focus:ring-2 focus:ring-(--color-ring)"
        />
      </Field>

      <Field label="Observações" optional>
        <textarea
          rows={3}
          value={observations}
          onChange={(e) => setObservations(e.target.value)}
          placeholder="Informações adicionais (opcional)"
          className="w-full resize-y rounded-lg border border-(--color-border) bg-(--color-bg) px-3.5 py-2.5 text-sm text-(--color-text) outline-none focus:ring-2 focus:ring-(--color-ring)"
        />
      </Field>

      <Field label="Tags">
        <TagInput value={tags} onChange={setTags} />
      </Field>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-(--color-border) px-4 py-2.5 text-sm font-medium text-(--color-text) hover:bg-(--color-surface-2)"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 rounded-lg bg-(--color-primary) px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-(--color-primary-hover) disabled:opacity-60"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Salvar documentação
        </button>
      </div>
    </motion.form>
  );
}

function Field({ label, optional, children }: { label: string; optional?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-(--color-text)">
        {label}
        {optional && <span className="ml-1 font-normal text-(--color-text-muted)">(opcional)</span>}
      </label>
      {children}
    </div>
  );
}
