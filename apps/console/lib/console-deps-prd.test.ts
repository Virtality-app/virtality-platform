import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const consoleRoot = fileURLToPath(new URL('..', import.meta.url))

function readConsolePackageJson(): {
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
} {
  return JSON.parse(readConsoleFile('package.json')) as {
    dependencies?: Record<string, string>
    devDependencies?: Record<string, string>
  }
}

function readConsoleFile(relativePath: string): string {
  return readFileSync(join(consoleRoot, relativePath), 'utf8')
}

const LEGACY_TRPC_DEPENDENCIES = [
  '@trpc/client',
  '@trpc/tanstack-react-query',
] as const

const UNUSED_LODASH_DEPENDENCIES = [
  'lodash.differencewith',
  'lodash.isempty',
  'lodash.isequal',
  'lodash.sorteduniq',
] as const

const UNUSED_LODASH_TYPE_PACKAGES = [
  '@types/lodash.differencewith',
  '@types/lodash.isempty',
  '@types/lodash.isequal',
  '@types/lodash.sorteduniq',
] as const

const REDUNDANT_MDX_DEPENDENCIES = [
  '@mdx-js/loader',
  '@mdx-js/react',
] as const

const OTHER_UNUSED_DEPENDENCIES = ['superjson'] as const

describe('PRD 142 remove leftover Console tRPC/lodash/MDX dependencies', () => {
  it('does not declare unused tRPC packages after the oRPC migration', () => {
    const { dependencies = {} } = readConsolePackageJson()

    for (const dependency of LEGACY_TRPC_DEPENDENCIES) {
      expect(dependencies).not.toHaveProperty(dependency)
    }
  })

  it('drops unused lodash helpers while keeping capitalize', () => {
    const { dependencies = {}, devDependencies = {} } = readConsolePackageJson()

    for (const dependency of UNUSED_LODASH_DEPENDENCIES) {
      expect(dependencies).not.toHaveProperty(dependency)
    }

    for (const dependency of UNUSED_LODASH_TYPE_PACKAGES) {
      expect(devDependencies).not.toHaveProperty(dependency)
    }

    expect(dependencies).toHaveProperty('lodash.capitalize')
    expect(devDependencies).toHaveProperty('@types/lodash.capitalize')
  })

  it('drops redundant MDX packages while keeping @next/mdx for forms instructions', () => {
    const { dependencies = {}, devDependencies = {} } = readConsolePackageJson()

    for (const dependency of REDUNDANT_MDX_DEPENDENCIES) {
      expect(dependencies).not.toHaveProperty(dependency)
    }

    expect(dependencies).toHaveProperty('@next/mdx')
    expect(devDependencies).toHaveProperty('@types/mdx')
    expect(readConsoleFile('next.config.ts')).toMatch(/createMDX/)
    expect(readConsoleFile('app/(app)/forms/page.tsx')).toMatch(
      /instructions\.mdx/,
    )
  })

  it('does not declare other confirmed-unused console-only dependencies', () => {
    const { dependencies = {} } = readConsolePackageJson()

    for (const dependency of OTHER_UNUSED_DEPENDENCIES) {
      expect(dependencies).not.toHaveProperty(dependency)
    }
  })
})
