-- ============================================================================
-- DOCUMENTAÇÃO FREDY — SCHEMA SUPABASE
-- Rode este arquivo inteiro no SQL Editor do seu projeto Supabase.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- EXTENSIONS
-- ---------------------------------------------------------------------------
create extension if not exists "unaccent";
create extension if not exists "pg_trgm";

-- ---------------------------------------------------------------------------
-- TABLES
-- ---------------------------------------------------------------------------

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  email text not null,
  avatar_url text,
  role text not null default 'atendente' check (role in ('administrador', 'atendente')),
  status text not null default 'ativo' check (status in ('ativo', 'inativo')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_login timestamptz
);

create table if not exists public.documentations (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category_id uuid references public.categories (id) on delete set null,
  problem text not null,
  identification text not null,
  solution text not null,
  observations text,
  author_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  search_vector tsvector
);

create table if not exists public.documentation_tags (
  documentation_id uuid not null references public.documentations (id) on delete cascade,
  tag_id uuid not null references public.tags (id) on delete cascade,
  primary key (documentation_id, tag_id)
);

-- ---------------------------------------------------------------------------
-- FULL TEXT SEARCH
-- ---------------------------------------------------------------------------

create or replace function public.documentations_search_vector_update()
returns trigger
language plpgsql
as $$
declare
  cat_name text;
  tag_names text;
begin
  select name into cat_name from public.categories where id = new.category_id;

  select string_agg(t.name, ' ')
    into tag_names
    from public.documentation_tags dt
    join public.tags t on t.id = dt.tag_id
    where dt.documentation_id = new.id;

  new.search_vector :=
    setweight(to_tsvector('portuguese', unaccent(coalesce(new.title, ''))), 'A') ||
    setweight(to_tsvector('portuguese', unaccent(coalesce(cat_name, ''))), 'B') ||
    setweight(to_tsvector('portuguese', unaccent(coalesce(tag_names, ''))), 'B') ||
    setweight(to_tsvector('portuguese', unaccent(coalesce(new.problem, ''))), 'C') ||
    setweight(to_tsvector('portuguese', unaccent(coalesce(new.identification, ''))), 'C') ||
    setweight(to_tsvector('portuguese', unaccent(coalesce(new.solution, ''))), 'C') ||
    setweight(to_tsvector('portuguese', unaccent(coalesce(new.observations, ''))), 'D');

  return new;
end;
$$;

drop trigger if exists trg_documentations_search_vector on public.documentations;
create trigger trg_documentations_search_vector
  before insert or update on public.documentations
  for each row execute function public.documentations_search_vector_update();

-- Re-index search_vector whenever tags change on a documentation.
create or replace function public.documentation_tags_touch()
returns trigger
language plpgsql
as $$
begin
  update public.documentations
    set updated_at = updated_at
    where id = coalesce(new.documentation_id, old.documentation_id);
  return null;
end;
$$;

drop trigger if exists trg_documentation_tags_touch on public.documentation_tags;
create trigger trg_documentation_tags_touch
  after insert or delete on public.documentation_tags
  for each row execute function public.documentation_tags_touch();

create index if not exists idx_documentations_search_vector
  on public.documentations using gin (search_vector);

create index if not exists idx_documentations_title_trgm
  on public.documentations using gin (title gin_trgm_ops);

create index if not exists idx_documentations_category on public.documentations (category_id);
create index if not exists idx_documentations_author on public.documentations (author_id);
create index if not exists idx_documentations_created_at on public.documentations (created_at desc);
create index if not exists idx_documentation_tags_tag on public.documentation_tags (tag_id);

-- Helper search function with relevance ranking.
create or replace function public.search_documentations(query text)
returns table (
  id uuid,
  title text,
  category_id uuid,
  problem text,
  identification text,
  solution text,
  observations text,
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
    d.observations, d.author_id, d.created_at, d.updated_at,
    ts_rank(d.search_vector, websearch_to_tsquery('portuguese', unaccent(query))) as rank
  from public.documentations d
  where query is null or query = '' or
    d.search_vector @@ websearch_to_tsquery('portuguese', unaccent(query))
    or d.title ilike '%' || query || '%'
  order by rank desc, d.created_at desc;
$$;

-- ---------------------------------------------------------------------------
-- updated_at TRIGGERS
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists trg_documentations_updated_at on public.documentations;
create trigger trg_documentations_updated_at
  before update on public.documentations
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- AUTO-CREATE PROFILE ON SIGNUP
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, email, role, status)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data ->> 'role', 'atendente'),
    'ativo'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- ROW LEVEL SECURITY
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.documentations enable row level security;
alter table public.categories enable row level security;
alter table public.tags enable row level security;
alter table public.documentation_tags enable row level security;

-- helper: is the current user an admin?
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'administrador' and status = 'ativo'
  );
$$;

-- profiles ------------------------------------------------------------------
drop policy if exists "profiles_select_authenticated" on public.profiles;
create policy "profiles_select_authenticated" on public.profiles
  for select using (auth.role() = 'authenticated');

drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_update_self" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "profiles_update_admin" on public.profiles;
create policy "profiles_update_admin" on public.profiles
  for update using (public.is_admin()) with check (true);

drop policy if exists "profiles_insert_admin" on public.profiles;
create policy "profiles_insert_admin" on public.profiles
  for insert with check (public.is_admin() or id = auth.uid());

-- categories ------------------------------------------------------------------
drop policy if exists "categories_select_all" on public.categories;
create policy "categories_select_all" on public.categories
  for select using (auth.role() = 'authenticated');

drop policy if exists "categories_write_admin" on public.categories;
create policy "categories_write_admin" on public.categories
  for all using (public.is_admin()) with check (public.is_admin());

-- tags ------------------------------------------------------------------
drop policy if exists "tags_select_all" on public.tags;
create policy "tags_select_all" on public.tags
  for select using (auth.role() = 'authenticated');

drop policy if exists "tags_write_authenticated" on public.tags;
create policy "tags_write_authenticated" on public.tags
  for insert with check (auth.role() = 'authenticated');

-- documentations ------------------------------------------------------------------
drop policy if exists "documentations_select_all" on public.documentations;
create policy "documentations_select_all" on public.documentations
  for select using (auth.role() = 'authenticated');

drop policy if exists "documentations_insert_authenticated" on public.documentations;
create policy "documentations_insert_authenticated" on public.documentations
  for insert with check (auth.role() = 'authenticated' and author_id = auth.uid());

drop policy if exists "documentations_update_author_or_admin" on public.documentations;
create policy "documentations_update_author_or_admin" on public.documentations
  for update using (author_id = auth.uid() or public.is_admin())
  with check (author_id = auth.uid() or public.is_admin());

drop policy if exists "documentations_delete_author_or_admin" on public.documentations;
create policy "documentations_delete_author_or_admin" on public.documentations
  for delete using (author_id = auth.uid() or public.is_admin());

-- documentation_tags ------------------------------------------------------------------
drop policy if exists "documentation_tags_select_all" on public.documentation_tags;
create policy "documentation_tags_select_all" on public.documentation_tags
  for select using (auth.role() = 'authenticated');

drop policy if exists "documentation_tags_write_authenticated" on public.documentation_tags;
create policy "documentation_tags_write_authenticated" on public.documentation_tags
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
-- SEED CATEGORIES
-- ---------------------------------------------------------------------------
insert into public.categories (name) values
  ('Sistema'), ('Financeiro'), ('Atendimento'), ('API'), ('Integração'),
  ('Reserva'), ('Cancelamento'), ('Pagamento'), ('Cadastro'), ('Outros')
on conflict (name) do nothing;

-- ---------------------------------------------------------------------------
-- MAKE THE FIRST USER AN ADMIN (run manually after your first signup)
-- ---------------------------------------------------------------------------
-- update public.profiles set role = 'administrador' where email = 'seu-email@empresa.com';
