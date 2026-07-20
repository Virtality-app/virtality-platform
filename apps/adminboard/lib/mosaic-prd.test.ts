// @vitest-environment node

import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const adminboardRoot = fileURLToPath(new URL('..', import.meta.url))

function readAdminboardFile(relativePath: string): string {
  return readFileSync(join(adminboardRoot, relativePath), 'utf8')
}

function adminboardFileExists(relativePath: string): boolean {
  return existsSync(join(adminboardRoot, relativePath))
}

describe('issue 159 mosaic adminboard slice', () => {
  it('exposes a Content nav item and /mosaic page', () => {
    const nav = readAdminboardFile('data/static/sidebar-nav.ts')

    expect(nav).toMatch(/href: ['"]\/mosaic['"]/)
    expect(nav).toMatch(/Mosaic/)
    expect(adminboardFileExists('app/mosaic/page.tsx')).toBe(true)
  })

  it('gates phone users with a desktop or tablet required message', () => {
    const dashboard = readAdminboardFile(
      'components/mosaic/mosaic-dashboard.tsx',
    )
    const gate = readAdminboardFile('components/mosaic/mosaic-desktop-gate.tsx')
    const phoneGate = readAdminboardFile('hooks/use-mosaic-phone-gate.ts')

    expect(dashboard).toMatch(/useMosaicPhoneGate|MosaicDesktopGate/)
    expect(gate).toMatch(/desktop|tablet/i)
    expect(phoneGate).toMatch(/max-width:\s*767px|767/)
  })

  it('loads saved mosaic tiles for a read-only board preview on desktop', () => {
    const dashboard = readAdminboardFile(
      'components/mosaic/mosaic-dashboard.tsx',
    )
    const preview = readAdminboardFile(
      'components/mosaic/mosaic-board-preview.tsx',
    )

    expect(dashboard).toMatch(/useMosaic/)
    expect(preview).toMatch(/grid-cols-3/)
    expect(preview).toMatch(/grid-rows-3/)
    expect(preview).toMatch(/readOnly|read-only|aria-readonly/i)
  })

  it('shows an empty state when no tiles are saved', () => {
    const preview = readAdminboardFile(
      'components/mosaic/mosaic-board-preview.tsx',
    )

    expect(preview).toMatch(/No tiles saved|no tiles saved/i)
  })
})
