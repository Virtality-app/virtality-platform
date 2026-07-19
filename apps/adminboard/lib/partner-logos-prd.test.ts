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
    const nav = readAdminboardFile('data/static/sidebar-nav.ts')

    expect(nav).toMatch(/href: ['"]\/partner-logos['"]/)
    expect(nav).toMatch(/Partner logos/)
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

describe('issue 149 partner logos upload-and-assign slice', () => {
  it('supports upload-and-assign with category-based marketing/logos prefix', () => {
    const dialog = readAdminboardFile(
      'components/partner-logos/add-partner-logo-dialog.tsx',
    )
    const helpers = readAdminboardFile('lib/partner-logos.ts')

    expect(dialog).toMatch(/useUploadBucketObjects/)
    expect(dialog).toMatch(/getPartnerLogoUploadPrefix/)
    expect(helpers).toMatch(/PARTNER_LOGO_UPLOAD_BASE_PREFIX/)
    expect(helpers).toMatch(/marketing\/logos/)
  })

  it('supports multi-file upload on the upload path', () => {
    const dialog = readAdminboardFile(
      'components/partner-logos/add-partner-logo-dialog.tsx',
    )

    expect(dialog).toMatch(/type=['"]file['"]/)
    expect(dialog).toMatch(/multiple/)
  })

  it('keeps the dialog open with Add another after a successful save', () => {
    const dialog = readAdminboardFile(
      'components/partner-logos/add-partner-logo-dialog.tsx',
    )

    expect(dialog).toMatch(/Add another/)
    expect(dialog).toMatch(/addAnother/)
    expect(dialog).toMatch(/BucketObjectPickerDialog/)
  })
})

describe('issue 150 partner logos edit reorder slice', () => {
  it('lets admins edit objectKey, alt, and category on an existing logo', () => {
    const dialog = readAdminboardFile(
      'components/partner-logos/edit-partner-logo-dialog.tsx',
    )
    const dashboard = readAdminboardFile(
      'components/partner-logos/partner-logos-dashboard.tsx',
    )

    expect(dialog).toMatch(/useUpdatePartnerLogo/)
    expect(dialog).toMatch(/BucketObjectPickerDialog/)
    expect(dialog).toMatch(/alt/i)
    expect(dialog).toMatch(/category/i)
    expect(dashboard).toMatch(/EditPartnerLogoDialog/)
    expect(dashboard).toMatch(/onEdit/)
  })

  it('exposes up and down reorder controls within each category list', () => {
    const list = readAdminboardFile(
      'components/partner-logos/partner-logo-category-list.tsx',
    )

    expect(list).toMatch(/useReorderPartnerLogo/)
    expect(list).toMatch(/ChevronUp/)
    expect(list).toMatch(/ChevronDown/)
    expect(list).toMatch(/handleReorder\(logo, 'up'\)/)
    expect(list).toMatch(/handleReorder\(logo, 'down'\)/)
  })
})

describe('issue 151 partner logos remove slice', () => {
  it('removes assignments with optional bucket object delete and confirm', () => {
    const categoryList = readAdminboardFile(
      'components/partner-logos/partner-logo-category-list.tsx',
    )
    const removeDialog = readAdminboardFile(
      'components/partner-logos/remove-partner-logo-dialog.tsx',
    )

    expect(categoryList).toMatch(/RemovePartnerLogoDialog/)
    expect(categoryList).toMatch(/Remove partner logo|Remove \$\{logo\.alt\}/)
    expect(removeDialog).toMatch(/useRemovePartnerLogo/)
    expect(removeDialog).toMatch(/alsoDeleteBucketObject/)
    expect(removeDialog).toMatch(/Also delete the Bucket Object/)
    expect(removeDialog).toMatch(/confirmObjectDelete|Delete Bucket Object/)
    expect(removeDialog).not.toMatch(/useBucketObjectReferences/)
  })
})
