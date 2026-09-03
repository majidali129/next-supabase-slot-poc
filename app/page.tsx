import Link from "next/link";

// Fully static: no cookies, headers or data fetching, so this is prerendered
// once at build time (SSG) and served straight from the CDN.
export const dynamic = "force-static";

const strategies = [
  {
    title: "Home — SSG",
    description:
      "This page has no dynamic data. It's prerendered once at build time and never touches the server again.",
  },
  {
    title: "Public todos — ISR",
    description:
      'Fetches every todo through Prisma with export const revalidate = 30. Next.js serves the cached HTML and refreshes it in the background at most once every 30s.',
    href: "/todos",
    linkLabel: "View the public feed →",
  },
  {
    title: "Admin — SSR (private)",
    description:
      "Reads the Supabase session cookie on every request, so it's rendered per-visit. The proxy (proxy.ts) redirects signed-out visitors to /login before the page ever runs.",
    href: "/login",
    linkLabel: "Sign in →",
  },
];

export default function Home() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-10 px-4 py-16 sm:py-24">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50 sm:text-4xl">
          Next.js + Supabase + Prisma
        </h1>
        <p className="mt-3 max-w-xl text-lg text-zinc-600 dark:text-zinc-400">
          A small proof of concept covering three rendering strategies, email/password auth via
          Supabase, and a Postgres-backed todos CRUD via Prisma.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/todos"
            className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
          >
            View public todos
          </Link>
          <Link
            href="/login"
            className="rounded-full border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
          >
            Sign in to admin
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {strategies.map((strategy) => (
          <div
            key={strategy.title}
            className="flex flex-col gap-2 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
          >
            <h2 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
              {strategy.title}
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">{strategy.description}</p>
            {strategy.href ? (
              <Link
                href={strategy.href}
                className="mt-auto text-sm font-medium text-zinc-950 underline dark:text-zinc-50"
              >
                {strategy.linkLabel}
              </Link>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
