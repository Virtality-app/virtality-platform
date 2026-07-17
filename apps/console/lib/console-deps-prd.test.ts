import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const consoleRoot = fileURLToPath(new URL('..', import.meta.url))

function readConsoleFile(relativePath: string): string {
  return readFileSync(join(consoleRoot, relativePath), 'utf8')
}

function readConsoleDependencies(): Record<string, string> {
  const { dependencies = {} } = JSON.parse(readConsoleFile('package.json')) as {
    dependencies?: Record<string, string>
  }

  return dependencies
}

function readConsoleDevDependencies(): Record<string, string> {
  const { devDependencies = {} } = JSON.parse(
    readConsoleFile('package.json'),
  ) as { devDependencies?: Record<string, string> }

  return devDependencies
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

const REDUNDANT_MDX_DEPENDENCIES = ['@mdx-js/loader', '@mdx-js/react'] as const

const OTHER_UNUSED_DEPENDENCIES = ['superjson'] as const

describe('issue #142 remove leftover Console tRPC/lodash/MDX dependencies', () => {
  it.each(LEGACY_TRPC_DEPENDENCIES)(
    'does not declare unused tRPC package %s after the oRPC migration',
    (packageName) => {
      expect(readConsoleDependencies()).not.toHaveProperty(packageName)
    },
  )

  it.each(UNUSED_LODASH_DEPENDENCIES)(
    'drops unused lodash helper %s while keeping capitalize',
    (packageName) => {
      expect(readConsoleDependencies()).not.toHaveProperty(packageName)
    },
  )

  it.each(UNUSED_LODASH_TYPE_PACKAGES)(
    'drops unused lodash type package %s while keeping capitalize',
    (packageName) => {
      expect(readConsoleDevDependencies()).not.toHaveProperty(packageName)
    },
  )

  it('keeps lodash.capitalize dependencies', () => {
    expect(readConsoleDependencies()).toHaveProperty('lodash.capitalize')
    expect(readConsoleDevDependencies()).toHaveProperty(
      '@types/lodash.capitalize',
    )
  })

  it.each(REDUNDANT_MDX_DEPENDENCIES)(
    'drops redundant MDX package %s while keeping @next/mdx for forms instructions',
    (packageName) => {
      expect(readConsoleDependencies()).not.toHaveProperty(packageName)
    },
  )

  it('keeps @next/mdx wired for forms instructions', () => {
    expect(readConsoleDependencies()).toHaveProperty('@next/mdx')
    expect(readConsoleDevDependencies()).toHaveProperty('@types/mdx')
    expect(readConsoleFile('next.config.ts')).toMatch(/createMDX/)
    expect(readConsoleFile('app/(app)/forms/page.tsx')).toMatch(
      /instructions\.mdx/,
    )
  })

  it.each(OTHER_UNUSED_DEPENDENCIES)(
    'does not declare other confirmed-unused console-only dependency %s',
    (packageName) => {
      expect(readConsoleDependencies()).not.toHaveProperty(packageName)
    },
  )
})
