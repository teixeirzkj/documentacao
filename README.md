# Documentação Fredy

Central interna de conhecimento da equipe de atendimento. Registre problemas já solucionados e encontre-os rapidamente através de uma busca inteligente.

Stack: Next.js (App Router) · TypeScript · Tailwind CSS v4 · Framer Motion · Supabase (Auth + Postgres + RLS).

## 1. Configurar o Supabase

1. Crie um projeto em [supabase.com](https://supabase.com).
2. No **SQL Editor**, rode o conteúdo de [`supabase/schema.sql`](supabase/schema.sql) por inteiro. Ele cria as tabelas, os índices de busca (Full Text Search em português + trigram), as políticas de RLS e as categorias padrão.
3. Em **Authentication → Providers**, deixe apenas E-mail/Senha ativado (sem confirmação por e-mail, já que os usuários são criados pelo administrador).
4. Em **Project Settings → API**, copie a `Project URL`, a `anon public key` e a `service_role key`.

## 2. Variáveis de ambiente

Copie `.env.local.example` para `.env.local` e preencha:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...   # usada apenas em server actions, nunca exposta ao client
```

## 3. Criar o primeiro administrador

1. Rode o projeto (`npm run dev`) e crie sua própria conta pela [tela de criação de usuário do Supabase](https://supabase.com/dashboard) (Authentication → Users → Add user), ou peça para outro admin te criar depois.
2. Como ainda não existe nenhum admin, promova seu usuário manualmente no SQL Editor:

   ```sql
   update public.profiles set role = 'administrador' where email = 'seu-email@empresa.com';
   ```

3. A partir daí, você pode criar os demais usuários pela própria interface em **Usuários → Adicionar usuário**.

## 4. Rodar localmente

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) — você será redirecionado para `/login`.

## Estrutura

- `app/(app)` — páginas protegidas (dashboard, documentações, usuários, configurações), atrás do `middleware.ts` que valida a sessão Supabase.
- `app/login` — tela de autenticação.
- `app/actions` — Server Actions (mutações: criar/editar/excluir documentação, criar/gerenciar usuários).
- `lib/data.ts` — leituras server-side (dashboard, busca, listagens).
- `lib/supabase` — clients Supabase (browser, server, middleware).
- `supabase/schema.sql` — schema completo, incluindo Full Text Search com ranking de relevância e as políticas de RLS.

## Busca

A pesquisa (`Ctrl K` em qualquer página, ou a barra central do dashboard/`/documentacoes`) usa a função `search_documentations` no Postgres, que combina `tsvector` em português (com pesos por campo: título > categoria/tags > problema/identificação/solução > observações) com `unaccent` para tolerar acentuação e ranking por relevância.
