"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { DocumentationImageInput } from "@/app/actions/documentations";

const BUCKET = "documentation-images";

export function ImageUpload({
  value,
  onChange,
}: {
  value: DocumentationImageInput[];
  onChange: (images: DocumentationImageInput[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    const supabase = createClient();
    const uploaded: DocumentationImageInput[] = [];

    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) continue;
      const ext = file.name.split(".").pop();
      const path = `${crypto.randomUUID()}.${ext}`;

      const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });

      if (error) {
        toast.error(`Erro ao enviar ${file.name}: ${error.message}`);
        continue;
      }

      const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
      uploaded.push({ url: data.publicUrl, path });
    }

    setUploading(false);
    if (uploaded.length > 0) onChange([...value, ...uploaded]);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function handleRemove(path: string) {
    onChange(value.filter((img) => img.path !== path));
    const supabase = createClient();
    await supabase.storage.from(BUCKET).remove([path]);
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {value.map((img) => (
          <div key={img.path} className="group relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-(--color-border)">
            <Image src={img.url} alt="Print anexado" fill sizes="80px" className="object-cover" />
            <button
              type="button"
              onClick={() => handleRemove(img.path)}
              aria-label="Remover imagem"
              className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
            >
              <X size={12} />
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex h-20 w-20 shrink-0 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-(--color-border) text-(--color-text-muted) transition-colors hover:border-(--color-primary) hover:text-(--color-primary) disabled:opacity-60"
        >
          {uploading ? <Loader2 size={18} className="animate-spin" /> : <ImagePlus size={18} />}
          <span className="text-[10px]">Print</span>
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
