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

describe('PRD 153 issue 155 mosaic persistence and public get API', () => {
  it('stores a singleton landing mosaic with child tiles keyed by bucket objectKey', () => {
    const schema = readRepoFile(
      'packages/db/console/prisma/models/marketing-mosaic.prisma',
    )

    expect(schema).toMatch(/model MarketingLandingMosaic/)
    expect(schema).toMatch(/model MarketingMosaicTile/)
    expect(schema).toMatch(/objectKey\s+String/)
    expect(schema).toMatch(/mediaKind\s+MosaicMediaKind/)
    expect(schema).toMatch(/alt\s+String/)
    expect(schema).toMatch(/row\s+Int/)
    expect(schema).toMatch(/col\s+Int/)
    expect(schema).toMatch(/width\s+Int/)
    expect(schema).toMatch(/height\s+Int/)
    expect(schema).toMatch(/onDelete: Cascade/)
  })

  it('exposes a public get procedure that returns eligibility and CDN-resolved tiles', () => {
    const procedures = readRepoFile('packages/orpc/src/procedures/mosaic.ts')
    const router = readRepoFile('packages/orpc/src/router.ts')

    expect(procedures).toMatch(/\/mosaic\/get.*method: 'GET'/)
    expect(procedures).toMatch(/getMosaicBoard/)
    expect(procedures).toMatch(/createPrismaMosaicStore/)
    expect(router).toMatch(/mosaic,/)
  })

  it('derives CDN URLs at read time through the shared mosaic domain', () => {
    const domain = readRepoFile('packages/shared/src/utils/mosaic.ts')
    const types = readRepoFile('packages/shared/src/types/mosaic.ts')

    expect(domain).toMatch(/bucketCdnUrl/)
    expect(domain).toMatch(/mapMosaicTileToListItem/)
    expect(domain).toMatch(/assessMosaicLiveEligibility/)
    expect(types).toMatch(/MosaicLiveEligibility/)
    expect(types).toMatch(/status: 'empty'/)
    expect(types).toMatch(/status: 'live'/)
    expect(types).toMatch(/status: 'incomplete'/)
  })

  it('warns the bucket browser when mosaic tile object keys are referenced', () => {
    const references = readRepoFile(
      'packages/shared/src/utils/bucket-references.ts',
    )
    const reader = readRepoFile(
      'packages/orpc/src/procedures/bucket-reference-reader.ts',
    )

    expect(references).toMatch(/findMosaicTileReferences/)
    expect(references).toMatch(/resourceType: 'mosaic'/)
    expect(reader).toMatch(/findMosaicTileReferences/)
    expect(reader).toMatch(/marketingMosaicTile/)
  })

  it('ships a react-query hook for the public mosaic get', () => {
    const queries = readRepoFile(
      'packages/react-query/src/hooks/queries/index.ts',
    )

    expect(queries).toMatch(/useMosaic/)
    expect(
      repoFileExists(
        'packages/react-query/src/hooks/queries/mosaic/use-mosaic.ts',
      ),
    ).toBe(true)
  })
})

describe('PRD 153 issue 158 mosaic save API', () => {
  it('exposes an authenticated save procedure wired to shared domain validation', () => {
    const procedures = readRepoFile('packages/orpc/src/procedures/mosaic.ts')
    const router = readRepoFile('packages/orpc/src/router.ts')

    expect(procedures).toMatch(/\/mosaic\/save.*method: 'POST'/)
    expect(procedures).toMatch(/saveMosaicBoard/)
    expect(procedures).toMatch(/saveMosaicInputSchema/)
    expect(procedures).toMatch(/authed/)
    expect(procedures).toMatch(/MosaicValidationError/)
    expect(router).toMatch(/mosaic,/)
  })

  it('requires explicit empty-hide acknowledgment and returns a warning contract', () => {
    const types = readRepoFile('packages/shared/src/types/mosaic.ts')
    const domain = readRepoFile('packages/shared/src/utils/mosaic.ts')

    expect(types).toMatch(/acknowledgeEmptyHide/)
    expect(types).toMatch(/MOSAIC_EMPTY_SAVE_WARNING/)
    expect(types).toMatch(/warnings\?: string\[\]/)
    expect(domain).toMatch(/validateEmptySaveAcknowledgment/)
    expect(domain).toMatch(/warnings: \[MOSAIC_EMPTY_SAVE_WARNING\]/)
  })

  it('ships a react-query mutation hook for mosaic save', () => {
    const mutations = readRepoFile(
      'packages/react-query/src/hooks/mutations/index.ts',
    )

    expect(mutations).toMatch(/useSaveMosaic/)
    expect(
      repoFileExists(
        'packages/react-query/src/hooks/mutations/mosaic/use-save-mosaic.ts',
      ),
    ).toBe(true)
  })
})
