// @vitest-environment node

import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const repoRoot = fileURLToPath(new URL('../../../../', import.meta.url))

function readRepoFile(relativePath: string): string {
  return readFileSync(join(repoRoot, relativePath), 'utf8')
}

function repoFileExists(relativePath: string): boolean {
  return existsSync(join(repoRoot, relativePath))
}

describe('PRD 145 adminboard-managed strategic and clinical partner logos', () => {
  it('stores partner logo assignments with unique objectKey and category sort order', () => {
    const schema = readRepoFile(
      'packages/db/console/prisma/models/marketing-partner-logo.prisma',
    )

    expect(schema).toMatch(/model MarketingPartnerLogo/)
    expect(schema).toMatch(/objectKey\s+String\s+@unique/)
    expect(schema).toMatch(/category\s+PartnerLogoCategory/)
    expect(schema).toMatch(/sortOrder\s+Int/)
    expect(schema).not.toMatch(/className|wide|compact|draft|published/)
  })

  it('exposes a public list and authed create, update, reorder, and remove procedures', () => {
    const procedures = readRepoFile(
      'packages/orpc/src/procedures/partner-logo.ts',
    )
    const router = readRepoFile('packages/orpc/src/router.ts')

    expect(procedures).toMatch(/\/partner-logo\/list.*method: 'GET'/)
    expect(procedures).toMatch(/\/partner-logo\/create.*method: 'POST'/)
    expect(procedures).toMatch(/\/partner-logo\/update.*method: 'POST'/)
    expect(procedures).toMatch(/\/partner-logo\/reorder.*method: 'POST'/)
    expect(procedures).toMatch(/\/partner-logo\/remove.*method: 'DELETE'/)
    expect(procedures).toMatch(/listPartnerLogos/)
    expect(procedures).toMatch(/createPartnerLogo/)
    expect(procedures).toMatch(/updatePartnerLogo/)
    expect(procedures).toMatch(/reorderPartnerLogo/)
    expect(procedures).toMatch(/removePartnerLogo/)
    expect(router).toMatch(/partnerLogo,/)
  })

  it('derives CDN URLs at read time and keeps domain logic in shared utilities', () => {
    const domain = readRepoFile('packages/shared/src/utils/partner-logo.ts')
    const types = readRepoFile('packages/shared/src/types/partner-logo.ts')

    expect(domain).toMatch(/bucketCdnUrl/)
    expect(domain).toMatch(/mapPartnerLogoToListItem/)
    expect(domain).toMatch(/PartnerLogoObjectKeyAlreadyAssignedError/)
    expect(types).toMatch(/alsoDeleteBucketObject/)
    expect(types).toMatch(/direction: z\.enum\(\['up', 'down'\]\)/)
  })

  it('warns the bucket browser when partner logo object keys are referenced', () => {
    const references = readRepoFile(
      'packages/shared/src/utils/bucket-references.ts',
    )
    const reader = readRepoFile(
      'packages/orpc/src/procedures/bucket-reference-reader.ts',
    )

    expect(references).toMatch(/findPartnerLogoReferences/)
    expect(references).toMatch(/resourceType: 'partnerLogo'/)
    expect(reader).toMatch(/findPartnerLogoReferences/)
    expect(reader).toMatch(/marketingPartnerLogo/)
  })

  it('ships react-query hooks for public reads and admin mutations', () => {
    const queries = readRepoFile(
      'packages/react-query/src/hooks/queries/index.ts',
    )
    const mutations = readRepoFile(
      'packages/react-query/src/hooks/mutations/index.ts',
    )

    expect(queries).toMatch(/usePartnerLogos/)
    expect(mutations).toMatch(/useCreatePartnerLogo/)
    expect(mutations).toMatch(/useUpdatePartnerLogo/)
    expect(mutations).toMatch(/useReorderPartnerLogo/)
    expect(mutations).toMatch(/useRemovePartnerLogo/)
    expect(
      repoFileExists(
        'packages/react-query/src/hooks/queries/partner-logo/use-partner-logos.ts',
      ),
    ).toBe(true)
  })

  it('drives the website Supported by section from the public list without static partner arrays', () => {
    const poweredBy = readRepoFile(
      'apps/website/components/home/powered-by.tsx',
    )
    const content = readRepoFile('apps/website/lib/partner-press-content.ts')
    const adapter = readRepoFile('apps/website/lib/partner-logo-adapter.ts')

    expect(poweredBy).toMatch(/usePartnerLogos/)
    expect(poweredBy).toMatch(/mapPartnerLogosToCredibilityLists/)
    expect(poweredBy).toMatch(/getVisiblePartnerRows/)
    expect(poweredBy).toMatch(/CredibilityLogo/)
    expect(poweredBy).not.toMatch(/<a |href=/)
    expect(content).toMatch(/SUPPORTED_BY_CONTENT/)
    expect(content).not.toMatch(
      /STRATEGIC_PARTNER|CLINICAL_PARTNER|strategicLogos|clinicalLogos/,
    )
    expect(adapter).toMatch(/cdnUrl/)
    expect(adapter).toMatch(/strategicLogos/)
    expect(adapter).toMatch(/clinicalLogos/)
  })

  it('keeps press logos static and separate from the partner logo slice', () => {
    const press = readRepoFile('apps/website/components/home/press.tsx')
    const content = readRepoFile('apps/website/lib/partner-press-content.ts')

    expect(press).toMatch(/PRESS_LOGO_ITEMS/)
    expect(press).toMatch(/getPressLinkProps/)
    expect(content).toMatch(/PRESS_LOGO_ITEMS/)
    expect(content).not.toMatch(/usePartnerLogos/)
  })

  it('provides the adminboard partner logos surface with assign, edit, reorder, and remove flows', () => {
    const navbar = readRepoFile('apps/adminboard/components/layout/navbar.tsx')
    const dashboard = readRepoFile(
      'apps/adminboard/components/partner-logos/partner-logos-dashboard.tsx',
    )
    const addDialog = readRepoFile(
      'apps/adminboard/components/partner-logos/add-partner-logo-dialog.tsx',
    )
    const editDialog = readRepoFile(
      'apps/adminboard/components/partner-logos/edit-partner-logo-dialog.tsx',
    )
    const removeDialog = readRepoFile(
      'apps/adminboard/components/partner-logos/remove-partner-logo-dialog.tsx',
    )
    const categoryList = readRepoFile(
      'apps/adminboard/components/partner-logos/partner-logo-category-list.tsx',
    )

    expect(navbar).toMatch(/\/partner-logos/)
    expect(repoFileExists('apps/adminboard/app/partner-logos/page.tsx')).toBe(
      true,
    )
    expect(dashboard).toMatch(/usePartnerLogos/)
    expect(dashboard).toMatch(/groupPartnerLogosByCategory/)
    expect(addDialog).toMatch(/BucketObjectPickerDialog/)
    expect(addDialog).toMatch(/useUploadBucketObjects/)
    expect(addDialog).toMatch(/Add another/)
    expect(editDialog).toMatch(/useUpdatePartnerLogo/)
    expect(categoryList).toMatch(/useReorderPartnerLogo/)
    expect(removeDialog).toMatch(/alsoDeleteBucketObject/)
    expect(removeDialog).toMatch(/Delete Bucket Object/)
  })
})
