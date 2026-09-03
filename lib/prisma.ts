import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/generated/prisma/client";

// Supavisor's transaction-mode pooler (port 6543, `?pgbouncer=true`) is safe
// for many short-lived serverless connections, which is what Vercel needs.
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

// Reuse a single client across hot-reloads in dev so we don't exhaust the
// connection pool every time a module reloads.
export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
