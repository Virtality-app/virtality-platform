import path from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '@virtality/shared/types': path.resolve(
        __dirname,
        '../../packages/shared/src/types/index.ts',
      ),
      '@virtality/shared/observability': path.resolve(
        __dirname,
        '../../packages/shared/src/observability/index.ts',
      ),
      '@virtality/shared/utils': path.resolve(
        __dirname,
        '../../packages/shared/src/utils/index.ts',
      ),
      '@virtality/db': path.resolve(__dirname, 'vitest-stubs/db.ts'),
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    passWithNoTests: true,
  },
})
