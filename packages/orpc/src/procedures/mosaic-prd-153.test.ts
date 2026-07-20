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

describe('PRD 153 adminboard-managed landing mosaic (photos + videos)', () => {
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

  it('exposes public get and authed save procedures wired to shared domain validation', () => {
    const procedures = readRepoFile('packages/orpc/src/procedures/mosaic.ts')
    const router = readRepoFile('packages/orpc/src/router.ts')

    expect(procedures).toMatch(/\/mosaic\/get.*method: 'GET'/)
    expect(procedures).toMatch(/\/mosaic\/save.*method: 'POST'/)
    expect(procedures).toMatch(/getMosaicBoard/)
    expect(procedures).toMatch(/saveMosaicBoard/)
    expect(procedures).toMatch(/saveMosaicInputSchema/)
    expect(procedures).toMatch(/authed/)
    expect(procedures).toMatch(/MosaicValidationError/)
    expect(router).toMatch(/mosaic,/)
  })

  it('keeps tiling validity, CDN mapping, and empty-hide contracts in the shared domain', () => {
    const domain = readRepoFile('packages/shared/src/utils/mosaic.ts')
    const types = readRepoFile('packages/shared/src/types/mosaic.ts')

    expect(domain).toMatch(/bucketCdnUrl/)
    expect(domain).toMatch(/mapMosaicTileToListItem/)
    expect(domain).toMatch(/assessMosaicLiveEligibility/)
    expect(domain).toMatch(/validateEmptySaveAcknowledgment/)
    expect(domain).toMatch(/warnings: \[MOSAIC_EMPTY_SAVE_WARNING\]/)
    expect(types).toMatch(/MosaicLiveEligibility/)
    expect(types).toMatch(/status: 'empty'/)
    expect(types).toMatch(/status: 'live'/)
    expect(types).toMatch(/status: 'incomplete'/)
    expect(types).toMatch(/acknowledgeEmptyHide/)
    expect(types).toMatch(/MOSAIC_EMPTY_SAVE_WARNING/)
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

  it('ships react-query hooks for public reads and admin save', () => {
    const queries = readRepoFile(
      'packages/react-query/src/hooks/queries/index.ts',
    )
    const mutations = readRepoFile(
      'packages/react-query/src/hooks/mutations/index.ts',
    )

    expect(queries).toMatch(/useMosaic/)
    expect(mutations).toMatch(/useSaveMosaic/)
    expect(
      repoFileExists(
        'packages/react-query/src/hooks/queries/mosaic/use-mosaic.ts',
      ),
    ).toBe(true)
    expect(
      repoFileExists(
        'packages/react-query/src/hooks/mutations/mosaic/use-save-mosaic.ts',
      ),
    ).toBe(true)
  })

  it('drives the website mosaic section from the public query and hides when not live', () => {
    const page = readRepoFile('apps/website/app/page.tsx')
    const mosaicSection = readRepoFile(
      'apps/website/components/home/mosaic/mosaic-section.tsx',
    )
    const visibility = readRepoFile('apps/website/lib/mosaic-visibility.ts')
    const content = readRepoFile('apps/website/lib/mosaic-content.ts')

    const testimonialsIndex = page.indexOf('<Testimonials')
    const mosaicIndex = page.indexOf('<MosaicSection')
    const promoVideoIndex = page.indexOf('<PromoVideo')

    expect(testimonialsIndex).toBeGreaterThan(-1)
    expect(mosaicIndex).toBeGreaterThan(testimonialsIndex)
    expect(promoVideoIndex).toBeGreaterThan(mosaicIndex)
    expect(mosaicSection).toMatch(/useMosaic/)
    expect(mosaicSection).toMatch(/shouldShowMosaicSection/)
    expect(mosaicSection).toMatch(/return null/)
    expect(mosaicSection).toMatch(/MOSAIC_SECTION_CONTENT/)
    expect(mosaicSection).toMatch(/MOSAIC_GRID_MOBILE_SCALE_CLASS/)
    expect(mosaicSection).toMatch(/grid-cols-3/)
    expect(mosaicSection).toMatch(/grid-rows-3/)
    expect(visibility).toMatch(/status === 'live'/)
    expect(content).toMatch(/MOSAIC_SECTION_CONTENT/)
  })

  it('renders image and video tiles with ambient playback and lightbox interactions', () => {
    const mosaicSection = readRepoFile(
      'apps/website/components/home/mosaic/mosaic-section.tsx',
    )
    const mosaicImageTile = readRepoFile(
      'apps/website/components/home/mosaic/mosaic-image-tile.tsx',
    )
    const mosaicVideoTile = readRepoFile(
      'apps/website/components/home/mosaic/mosaic-video-tile.tsx',
    )
    const mosaicLightbox = readRepoFile(
      'apps/website/components/home/mosaic/mosaic-lightbox.tsx',
    )

    expect(mosaicSection).toMatch(/MosaicImageTile/)
    expect(mosaicSection).toMatch(/MosaicVideoTile/)
    expect(mosaicSection).toMatch(/MosaicLightbox/)
    expect(mosaicSection).toMatch(/mediaKind === 'video'/)
    expect(mosaicImageTile).toMatch(/getMosaicImageTileProps/)
    expect(mosaicImageTile).toMatch(/alt=\{alt\}/)
    expect(mosaicImageTile).toMatch(/onOpen/)
    expect(mosaicVideoTile).toMatch(/shouldPlayMosaicAmbientVideo/)
    expect(mosaicVideoTile).toMatch(/prefers-reduced-motion/)
    expect(mosaicVideoTile).toMatch(/IntersectionObserver/)
    expect(mosaicVideoTile).toMatch(/muted/)
    expect(mosaicVideoTile).toMatch(/loop/)
    expect(mosaicLightbox).toMatch(/getMosaicLightboxContent/)
    expect(mosaicLightbox).toMatch(/controls/)
    expect(readRepoFile('apps/website/lib/mosaic-lightbox.ts')).toMatch(
      /getMosaicLightboxContent/,
    )
  })

  it('provides the adminboard mosaic editor with tray, drag-place, resize, save, and clear flows', () => {
    const nav = readRepoFile('apps/adminboard/data/static/sidebar-nav.ts')
    const dashboard = readRepoFile(
      'apps/adminboard/components/mosaic/mosaic-dashboard.tsx',
    )
    const editor = readRepoFile(
      'apps/adminboard/components/mosaic/mosaic-editor.tsx',
    )
    const boardEditor = readRepoFile(
      'apps/adminboard/components/mosaic/mosaic-board-editor.tsx',
    )
    const editorLib = readRepoFile('apps/adminboard/lib/mosaic-editor.ts')
    const mediaPicker = readRepoFile(
      'apps/adminboard/lib/mosaic-media-picker.ts',
    )
    const emptyDialog = readRepoFile(
      'apps/adminboard/components/mosaic/mosaic-save-empty-dialog.tsx',
    )

    expect(nav).toMatch(/href: ['"]\/mosaic['"]/)
    expect(repoFileExists('apps/adminboard/app/mosaic/page.tsx')).toBe(true)
    expect(dashboard).toMatch(/useMosaicPhoneGate|MosaicDesktopGate/)
    expect(editor).toMatch(/MosaicTray/)
    expect(editor).toMatch(/useSaveMosaic/)
    expect(editor).toMatch(/clearMosaicEditorState/)
    expect(editor).toMatch(/MosaicSaveEmptyDialog/)
    expect(boardEditor).toMatch(/MOSAIC_TRAY_DRAG_MIME/)
    expect(boardEditor).toMatch(/getLegalMosaicSpansForTile/)
    expect(boardEditor).toMatch(/assessMosaicLiveEligibility/)
    expect(editorLib).toMatch(/placeMosaicTileFromTray/)
    expect(editorLib).toMatch(/resizeMosaicTile/)
    expect(editorLib).toMatch(/removeMosaicTileFromBoard/)
    expect(mediaPicker).toMatch(/image\/jpeg/)
    expect(mediaPicker).toMatch(/video\/mp4/)
    expect(mediaPicker).toMatch(/video\/quicktime/)
    expect(emptyDialog).toMatch(/MOSAIC_EMPTY_SAVE_WARNING/)
    expect(emptyDialog).toMatch(/acknowledged/)
  })
})
