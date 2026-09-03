"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { updateAppLogo } from "@/app/actions/settings";
import { Logo } from "@/components/logo";

const BUCKET = "branding";

export function LogoUpload({ logoUrl, logoPath }: { logoUrl: string | null; logoPath: string | null }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [current, setCurrent] = useState<{ url: string | null; path: string | null }>({
    url: logoUrl,
    path: logoPath,
  });

  async function handleFile(files: FileList | null) {
    const file = files?.[0];
    if (!file || !file.type.startsWith("image/")) return;

    setUploading(true);
    const supabase = createClient();
    const ext = file.name.split(".").pop();
    const path = `logo-${crypto.randomUUID()}.${ext}`;

    const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });

    if (uploadError) {
      setUploading(false);
      toast.error(`Erro ao enviar logo: ${uploadError.message}`);
      return;
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    const result = await updateAppLogo({ url: data.publicUrl, path });

    if (current.path) await supabase.storage.from(BUCKET).remove([current.path]);

    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";

    if ("error" in result && result.error) {
      toast.error(result.error);
      return;
    }

    setCurrent({ url: data.publicUrl, path });
    toast.success("Logo atualizado com sucesso.");
  }

  async function handleRemove() {
    if (!current.path) return;
    setUploading(true);
    const result = await updateAppLogo(null);
    const supabase = createClient();
    await supabase.storage.from(BUCKET).remove([current.path]);
    setUploading(false);

    if ("error" in result && result.error) {
      toast.error(result.error);
      return;
    }

    setCurrent({ url: null, path: null });
    toast.success("Logo removido. Voltando ao logo padrão.");
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-(--color-border) bg-(--color-bg)">
        {current.url ? (
          <Image src={current.url} alt="Logo da marca" width={64} height={64} className="h-full w-full object-contain" />
        ) : (
          <Logo size="sm" />
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 rounded-lg border border-(--color-border) px-3.5 py-2 text-sm font-medium text-(--color-text) hover:bg-(--color-surface-2) disabled:opacity-60"
        >
          {uploading ? <Loader2 size={14} className="animate-spin" /> : <ImagePlus size={14} />}
          Trocar logo
        </button>
        {current.url && (
          <button
            type="button"
            onClick={handleRemove}
            disabled={uploading}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm text-(--color-text-muted) hover:text-red-500 disabled:opacity-60"
          >
            <X size={14} /> Remover
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files)}
      />
    </div>
  );
}
