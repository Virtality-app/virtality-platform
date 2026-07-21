import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['console/prisma/seeds/**/*.test.ts'],
  },
})
