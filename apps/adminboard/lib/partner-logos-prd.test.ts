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

describe('issue 147 partner logos adminboard slice', () => {
  it('exposes a top-level Partner logos nav item and page', () => {
    const navbar = readAdminboardFile('components/layout/navbar.tsx')

    expect(navbar).toMatch(/href=['"]\/partner-logos['"]/)
    expect(navbar).toMatch(/Partner logos/)
    expect(adminboardFileExists('app/partner-logos/page.tsx')).toBe(true)
  })

  it('shows separate strategic and clinical lists backed by the partner logo API', () => {
    const dashboard = readAdminboardFile(
      'components/partner-logos/partner-logos-dashboard.tsx',
    )

    expect(dashboard).toMatch(/usePartnerLogos/)
    expect(dashboard).toMatch(/groupPartnerLogosByCategory/)
    expect(dashboard).toMatch(/PARTNER_LOGO_CATEGORIES/)
    expect(dashboard).toMatch(/PARTNER_LOGO_CATEGORY_LABELS/)
  })

  it('assigns logos via bucket object picker with alt text and category', () => {
    const dialog = readAdminboardFile(
      'components/partner-logos/add-partner-logo-dialog.tsx',
    )

    expect(dialog).toMatch(/BucketObjectPickerDialog/)
    expect(dialog).toMatch(/useCreatePartnerLogo/)
    expect(dialog).toMatch(/alt/i)
    expect(dialog).toMatch(/category/i)
    expect(dialog).not.toMatch(/https?:\/\//)
    expect(dialog).not.toMatch(/external url/i)
  })

  it('lets the bucket picker browse from the bucket root', () => {
    const picker = readAdminboardFile(
      'components/email/bucket-object-picker-dialog.tsx',
    )

    expect(picker).toMatch(/useState\(''\)/)
    expect(picker).not.toMatch(/marketing\/logos/)
  })
})
