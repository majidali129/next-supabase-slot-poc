import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Next.js + Supabase + Prisma POC",
    template: "%s · Next.js + Supabase + Prisma POC",
  },
  description:
    "A proof of concept for Next.js SSG/ISR/SSR, Supabase email/password auth, and Prisma CRUD on Postgres.",
};

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/todos", label: "Todos" },
  { href: "/admin", label: "Admin" },
  { href: "/login", label: "Login" },
];

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-zinc-50 dark:bg-black">
        <nav className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-black">
          <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 py-3">
            <Link href="/" className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
              slot-poc
            </Link>
            <div className="flex gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-zinc-600 transition-colors hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </nav>
        <main className="flex flex-1 flex-col">{children}</main>
      </body>
    </html>
  );
}
