import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const serverRoot = fileURLToPath(new URL('../', import.meta.url))

function readServerFile(relativePath: string): string {
  return readFileSync(join(serverRoot, relativePath), 'utf8')
}

const LEGACY_TRPC_DEPENDENCIES = ['@hono/trpc-server', '@trpc/server'] as const

describe('PRD 143 remove leftover Server tRPC dependencies', () => {
  it('does not declare unused tRPC packages after the oRPC migration', () => {
    const { dependencies = {} } = JSON.parse(
      readServerFile('package.json'),
    ) as {
      dependencies?: Record<string, string>
    }

    for (const dependency of LEGACY_TRPC_DEPENDENCIES) {
      expect(dependencies).not.toHaveProperty(dependency)
    }
  })

  it('routes API traffic through oRPC middleware instead of tRPC', () => {
    const indexSource = readServerFile('src/index.ts')
    const orpcMiddlewareSource = readServerFile('src/middleware/orpc.ts')

    expect(indexSource).toMatch(/orpcMiddleware/)
    expect(indexSource).not.toMatch(/trpc/i)
    expect(orpcMiddlewareSource).toMatch(/@virtality\/orpc\/server/)
  })
})
