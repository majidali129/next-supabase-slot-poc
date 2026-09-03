import 'dotenv/config'
import { defineConfig } from 'prisma/config'

/**
 * Do NOT use `env('DIRECT_URL')` here. That helper throws when the var is
 * missing, and every Prisma CLI command (including `prisma generate`) loads
 * this file. Vercel/CI builds need `generate` to succeed without a live DB.
 *
 * Prefer DIRECT_URL for migrate/db push (session mode); fall back to
 * DATABASE_URL when only the pooler URL is configured.
 */
export default defineConfig({
	schema: 'prisma/schema.prisma',
	migrations: {
		path: 'prisma/migrations',
	},
	datasource: {
		url: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
	},
})
