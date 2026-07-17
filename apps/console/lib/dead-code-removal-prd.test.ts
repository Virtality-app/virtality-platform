import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const consoleRoot = fileURLToPath(new URL('..', import.meta.url))
const repoRoot = fileURLToPath(new URL('../../..', import.meta.url))

function consoleFileExists(relativePath: string): boolean {
  return existsSync(join(consoleRoot, relativePath))
}

function repoFileExists(relativePath: string): boolean {
  return existsSync(join(repoRoot, relativePath))
}

function readConsoleDependencies(): Record<string, string> {
  const { dependencies = {} } = JSON.parse(
    readFileSync(join(consoleRoot, 'package.json'), 'utf8'),
  ) as { dependencies?: Record<string, string> }

  return dependencies
}

const removedConsoleDeadFiles = [
  'components/email/invite-email.tsx',
  'components/layout/sidebar-skeleton.tsx',
  'components/tables/action-cell.tsx',
  'components/ui/combo-select.tsx',
  'components/ui/input-otp.tsx',
  'components/ui/input-pill.tsx',
  'components/ui/resizable.tsx',
  'components/ui/scroll-area.tsx',
  'context/theme-context.tsx',
  'data/static/program-form/data.ts',
  'hooks/use-computed-height.ts',
  'hooks/use-scroll-percentage.ts',
  'i18n/get-server-t.ts',
  'lib/orpc-client.ts',
] as const

const removedConsoleOnlyDependencies = [
  'react-resizable-panels',
  'input-otp',
  '@radix-ui/react-scroll-area',
  '@react-email/components',
] as const

describe('issue #141 dead code removal', () => {
  it.each(removedConsoleDeadFiles)(
    'removes fallow-reported dead file %s',
    (relativePath) => {
      expect(consoleFileExists(relativePath)).toBe(false)
    },
  )

  it.each(removedConsoleOnlyDependencies)(
    'drops console-only dependency %s',
    (packageName) => {
      expect(readConsoleDependencies()[packageName]).toBeUndefined()
    },
  )

  it('keeps website testimonials in the codebase', () => {
    expect(
      repoFileExists('apps/website/components/home/testimonials.tsx'),
    ).toBe(true)
  })
})
