import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['console/prisma/seeds/**/*.test.ts'],
  },
})
