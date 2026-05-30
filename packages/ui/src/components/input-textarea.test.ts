import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const componentsDir = dirname(fileURLToPath(import.meta.url))

function readComponentSource(name: string) {
  return readFileSync(join(componentsDir, `${name}.tsx`), 'utf8')
}

describe('promoted form primitives', () => {
  it('input uses semantic tokens, not app-hardcoded palette classes', () => {
    const source = readComponentSource('input')
    expect(source).toContain('border-input')
    expect(source).toContain('placeholder:text-muted-foreground')
    expect(source).not.toMatch(/\bzinc-\d+/)
  })

  it('textarea uses semantic tokens, not app-hardcoded palette classes', () => {
    const source = readComponentSource('textarea')
    expect(source).toContain('border-input')
    expect(source).toContain('placeholder:text-muted-foreground')
    expect(source).not.toMatch(/\bzinc-\d+/)
  })
})
