-- ============================================================================
-- DOCUMENTAÇÃO FREDY — migração 0002: imagens/prints anexados às documentações
-- Rode este arquivo no SQL Editor do Supabase (depois do schema.sql).
-- ============================================================================

create table if not exists public.documentation_images (
  id uuid primary key default gen_random_uuid(),
  documentation_id uuid not null references public.documentations (id) on delete cascade,
  url text not null,
  path text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_documentation_images_doc on public.documentation_images (documentation_id);

alter table public.documentation_images enable row level security;

drop policy if exists "documentation_images_select_all" on public.documentation_images;
create policy "documentation_images_select_all" on public.documentation_images
  for select using (auth.role() = 'authenticated');

drop policy if exists "documentation_images_write_author_or_admin" on public.documentation_images;
create policy "documentation_images_write_author_or_admin" on public.documentation_images
  for all using (
    exists (
      select 1 from public.documentations d
      where d.id = documentation_id and (d.author_id = auth.uid() or public.is_admin())
    )
  )
  with check (
    exists (
      select 1 from public.documentations d
      where d.id = documentation_id and (d.author_id = auth.uid() or public.is_admin())
    )
  );

-- ---------------------------------------------------------------------------
-- STORAGE BUCKET
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('documentation-images', 'documentation-images', true)
on conflict (id) do nothing;

drop policy if exists "documentation_images_bucket_read" on storage.objects;
create policy "documentation_images_bucket_read" on storage.objects
  for select using (bucket_id = 'documentation-images');

drop policy if exists "documentation_images_bucket_insert" on storage.objects;
create policy "documentation_images_bucket_insert" on storage.objects
  for insert with check (bucket_id = 'documentation-images' and auth.role() = 'authenticated');

drop policy if exists "documentation_images_bucket_delete" on storage.objects;
create policy "documentation_images_bucket_delete" on storage.objects
  for delete using (bucket_id = 'documentation-images' and auth.role() = 'authenticated');
