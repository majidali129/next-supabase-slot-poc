# Next.js + Supabase + Prisma POC

A small proof of concept covering three Next.js rendering strategies, Supabase email/password
auth, and a Postgres-backed todos CRUD via Prisma — deployable to Vercel.

## Routes

| Route          | Access  | Rendering                                                                         |
| -------------- | ------- | ---------------------------------------------------------------------------------- |
| `/`            | Public  | **SSG** — fully static, no data, prerendered once at build time                    |
| `/todos`       | Public  | **ISR** — reads every todo via Prisma, `export const revalidate = 30`              |
| `/todos/[id]`  | Public  | **SSG + ISR** — known todos prerendered via `generateStaticParams`, new ones render on first visit and are then cached the same way |
| `/admin`       | Private | **SSR** — reads the session cookie per request, `dynamic = 'force-dynamic'`         |
| `/login`, `/signup` | Public | Auth forms (Server Actions), dynamic because they read `searchParams`         |

`/admin` is protected by `proxy.ts` (the Next.js 16 replacement for `middleware.ts`), which
refreshes the Supabase session on every request and redirects signed-out visitors to `/login`.
Every Server Action under `app/admin/actions.ts` re-checks auth independently, since Server
Actions are reachable directly over POST regardless of the proxy.

## Stack

- **Next.js 16** (App Router, Turbopack, previous/`fetch`-cache caching model — `cacheComponents`
  is not enabled)
- **Supabase Auth** (`@supabase/ssr`) for email/password signup, sign-in and sign-out
- **Prisma ORM 7** with the `@prisma/adapter-pg` driver adapter, querying Supabase Postgres
  directly (Supavisor transaction-mode pooler for the app, session-mode/direct connection for
  CLI migrations)

### Caching layer

`lib/todos.ts` wraps every read with [`unstable_cache`](https://nextjs.org/docs/app/api-reference/functions/unstable_cache),
tagged so Server Actions can invalidate precisely what changed instead of re-querying Postgres
on every request:

- `todos:public` — the public `/todos` feed
- `todos:public:<id>` — one `/todos/[id]` detail page
- `todos:user:<userId>` — one user's todos on `/admin`

`app/admin/actions.ts` calls both `revalidatePath` (for the ISR page cache) and `revalidateTag`
(for the underlying cached Prisma reads) after every mutation, so creating/toggling/editing/
deleting a todo shows up on `/admin`, `/todos`, and `/todos/[id]` without waiting for the next
30s ISR window.

### Pending UI

`components/submit-button.tsx` is a small client component built on React's `useFormStatus`. It
renders inside the existing `<form action={serverAction}>` elements (sign in, sign up, sign out,
add/toggle/save/delete todo) and shows a spinner + disables the button while its Server Action is
in flight — no extra client state or JS needed beyond the button itself.

## Getting started

```bash
pnpm install
pnpm dev
```

Environment variables (see `.env.local`):

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...        # only used by prisma/seed.ts and scripts/create-test-user.mjs

DATABASE_URL=...     # Supavisor transaction pooler, port 6543, ?pgbouncer=true
DIRECT_URL=...       # Supavisor session pooler or direct connection, port 5432
```

## Database

The Prisma schema lives in `prisma/schema.prisma` (a single `Todo` model). Prisma 7 keeps
connection URLs out of the schema file — they're configured in `prisma.config.ts` instead, and
the app builds its own driver-adapter client in `lib/prisma.ts`.

```bash
npx prisma db push        # sync the schema to Supabase Postgres (prototyping)
npx prisma db execute --file prisma/rls.sql   # (re)apply row-level security policies
```

`prisma/rls.sql` enables RLS on `todos` as defense-in-depth: the app itself queries Postgres
directly via Prisma (which bypasses RLS), so these policies only matter if the Supabase Data API
is ever turned on for this table.

## Seeding a test user + todos

```bash
pnpm seed
```

Runs `prisma/seed.ts` (via `prisma db seed`), which:

- Ensures one pre-confirmed Supabase user exists (`SEED_USER_EMAIL` / `SEED_USER_PASSWORD` env
  vars, defaulting to `demo@proton.me` / `Seed-Password-123!`), using the Supabase admin API to
  skip email confirmation.
- Ensures that user owns 6 sample todos (mixed done/open), so `/todos`, `/todos/[id]`, and
  `/admin` all have real data on a fresh database.

It's safe to re-run: it looks up the user by email and the todos by count before creating
anything, so it never duplicates data. Credentials are written to `.local/seed-user.json`
(gitignored) instead of being printed.

Supabase rate-limits confirmation emails, so `pnpm seed`'s pre-confirmed user (created via the
admin API) is also the easiest way to test `/login` locally without waiting on a real inbox.

## Deploying

Deploy to Vercel as a standard Next.js app. Set the same environment variables in the Vercel
project settings, then run `npx prisma db push` (or commit real migrations) against the
production database before your first deploy.
