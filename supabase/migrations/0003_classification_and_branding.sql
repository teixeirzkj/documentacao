-- ============================================================================
-- DOCUMENTAÇÃO FREDY — migração 0003: classificação das documentações e logo da marca
-- Rode este arquivo no SQL Editor do Supabase (depois do schema.sql e da 0002).
-- ============================================================================

-- ---------------------------------------------------------------------------
-- CLASSIFICAÇÃO (básico / médio / avançado)
-- ---------------------------------------------------------------------------

alter table public.documentations
  add column if not exists classification text not null default 'basico'
  check (classification in ('basico', 'medio', 'avancado'));

-- O campo "Como você identificou o problema?" saiu do formulário — deixa de
-- ser obrigatório (mantido na tabela apenas para não perder dados antigos).
alter table public.documentations alter column identification drop not null;

create index if not exists idx_documentations_classification on public.documentations (classification);

-- Recria a função de busca incluindo a classificação, para que o filtro por
-- classificação funcione também no fluxo de pesquisa por texto.
-- Precisa dropar antes: o tipo de retorno (colunas) mudou, e o Postgres não
-- permite `create or replace` trocar as colunas de saída de uma função.
drop function if exists public.search_documentations(text);

create or replace function public.search_documentations(query text)
returns table (
  id uuid,
  title text,
  category_id uuid,
  problem text,
  identification text,
  solution text,
  observations text,
  classification text,
  author_id uuid,
  created_at timestamptz,
  updated_at timestamptz,
  rank real
)
language sql
stable
as $$
  select
    d.id, d.title, d.category_id, d.problem, d.identification, d.solution,
    d.observations, d.classification, d.author_id, d.created_at, d.updated_at,
    ts_rank(d.search_vector, websearch_to_tsquery('portuguese', unaccent(query))) as rank
  from public.documentations d
  where query is null or query = '' or
    d.search_vector @@ websearch_to_tsquery('portuguese', unaccent(query))
    or d.title ilike '%' || query || '%'
  order by rank desc, d.created_at desc;
$$;

-- ---------------------------------------------------------------------------
-- LOGO DA MARCA (configurações do app)
-- ---------------------------------------------------------------------------

create table if not exists public.app_settings (
  id boolean primary key default true check (id),
  logo_url text,
  logo_path text,
  updated_at timestamptz not null default now()
);

insert into public.app_settings (id) values (true) on conflict (id) do nothing;

drop trigger if exists trg_app_settings_updated_at on public.app_settings;
create trigger trg_app_settings_updated_at
  before update on public.app_settings
  for each row execute function public.set_updated_at();

alter table public.app_settings enable row level security;

-- Público (inclusive visitantes não autenticados na tela de login) pode ler o logo.
drop policy if exists "app_settings_select_all" on public.app_settings;
create policy "app_settings_select_all" on public.app_settings
  for select using (true);

drop policy if exists "app_settings_write_admin" on public.app_settings;
create policy "app_settings_write_admin" on public.app_settings
  for update using (public.is_admin()) with check (public.is_admin());

insert into storage.buckets (id, name, public)
values ('branding', 'branding', true)
on conflict (id) do nothing;

drop policy if exists "branding_bucket_read" on storage.objects;
create policy "branding_bucket_read" on storage.objects
  for select using (bucket_id = 'branding');

drop policy if exists "branding_bucket_write_admin" on storage.objects;
create policy "branding_bucket_write_admin" on storage.objects
  for insert with check (bucket_id = 'branding' and public.is_admin());

drop policy if exists "branding_bucket_update_admin" on storage.objects;
create policy "branding_bucket_update_admin" on storage.objects
  for update using (bucket_id = 'branding' and public.is_admin());

drop policy if exists "branding_bucket_delete_admin" on storage.objects;
create policy "branding_bucket_delete_admin" on storage.objects
  for delete using (bucket_id = 'branding' and public.is_admin());
