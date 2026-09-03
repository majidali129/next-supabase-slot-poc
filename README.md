# Next.js + Supabase + Prisma POC

A small proof of concept covering three Next.js rendering strategies, Supabase email/password
auth, and a Postgres-backed todos CRUD via Prisma — deployable to Vercel.

## Routes

| Route     | Access  | Rendering                                                                 |
| --------- | ------- | -------------------------------------------------------------------------- |
| `/`       | Public  | **SSG** — fully static, no data, prerendered once at build time            |
| `/todos`  | Public  | **ISR** — reads every todo via Prisma, `export const revalidate = 30`      |
| `/admin`  | Private | **SSR** — reads the session cookie per request, `dynamic = 'force-dynamic'`|
| `/login`, `/signup` | Public | Auth forms (Server Actions), dynamic because they read `searchParams` |

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

## Getting started

```bash
pnpm install
pnpm dev
```

Environment variables (see `.env.local`):

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...        # only used by scripts/create-test-user.mjs

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

## Testing the auth flow locally without email

Supabase rate-limits confirmation emails. To create a pre-confirmed test user instead of signing
up for real:

```bash
node scripts/create-test-user.mjs
```

This writes a random email/password to `.local/test-user.json` (gitignored) using the Supabase
admin API — it never prints the password to the terminal.

## Deploying

Deploy to Vercel as a standard Next.js app. Set the same environment variables in the Vercel
project settings, then run `npx prisma db push` (or commit real migrations) against the
production database before your first deploy.
