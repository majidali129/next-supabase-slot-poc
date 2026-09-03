import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

export default defineConfig({
	schema: 'prisma/schema.prisma',
	migrations: {
		path: 'prisma/migrations',
	},
	datasource: {
		// CLI commands (migrate/db push/studio) need a direct, non-pooled
		// connection. The pgbouncer transaction-mode pooler doesn't support
		// the schema engine's session semantics.
		url: env('DIRECT_URL'),
	},
})
