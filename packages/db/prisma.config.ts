import 'dotenv/config'
import type { PrismaConfig } from 'prisma'

export default {
  schema: './prisma',
  migrations: {
    path: './prisma/migrations',
    // Prisma 7 no longer auto-seeds on migrate/reset; package scripts chain
    // `prisma db seed` after those commands.
    seed: 'tsx ./prisma/seed.ts',
  },
  // Not env('DATABASE_URL'): that throws when unset, which breaks
  // `prisma generate` in builds without a database (e.g. Heroku). Commands
  // that connect still fail on their own if the URL is missing.
  datasource: { url: process.env.DATABASE_URL },
} satisfies PrismaConfig
