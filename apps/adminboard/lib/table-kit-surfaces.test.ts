// @vitest-environment node

import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const adminboardRoot = fileURLToPath(new URL('..', import.meta.url))

function readAdminboardFile(relativePath: string): string {
  return readFileSync(join(adminboardRoot, relativePath), 'utf8')
}

function pathExists(relativePath: string): boolean {
  try {
    readFileSync(join(adminboardRoot, relativePath))
    return true
  } catch {
    return false
  }
}

describe('adminboard table primitive migration', () => {
  it('imports shared table primitives in bucket browser', () => {
    const source = readAdminboardFile('components/bucket/bucket-browser.tsx')

    expect(source).toMatch(/@virtality\/ui\/components\/table/)
    expect(source).not.toMatch(/@\/components\/ui\/table/)
  })

  it('imports shared table primitives in inline-editable data-table', () => {
    const source = readAdminboardFile('components/ui/data-table.tsx')

    expect(source).toMatch(/@virtality\/ui\/components\/table/)
    expect(source).not.toMatch(/@\/components\/ui\/table/)
  })

  it('removes adminboard-local table.tsx', () => {
    expect(pathExists('components/ui/table.tsx')).toBe(false)
  })
})
