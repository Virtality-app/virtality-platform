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

describe('issue 160 mosaic tray and drag-place slice', () => {
  it('stages media in a tray with pick-existing and upload flows', () => {
    const editor = readAdminboardFile('components/mosaic/mosaic-editor.tsx')
    const tray = readAdminboardFile('components/mosaic/mosaic-tray.tsx')
    const addMedia = readAdminboardFile(
      'components/mosaic/mosaic-add-media-dialog.tsx',
    )
    const picker = readAdminboardFile(
      'components/mosaic/mosaic-media-picker-dialog.tsx',
    )

    expect(editor).toMatch(/MosaicTray/)
    expect(editor).toMatch(/MosaicAddMediaDialog/)
    expect(tray).toMatch(/Staging tray|staging tray/i)
    expect(tray).toMatch(/draggable/)
    expect(addMedia).toMatch(/MosaicMediaPickerDialog/)
    expect(addMedia).toMatch(/useUploadBucketObjects/)
    expect(addMedia).toMatch(/Alt text/)
    expect(picker).toMatch(/useState\(''\)/)
    expect(picker).not.toMatch(/marketing\/mosaic/)
    expect(addMedia).not.toMatch(/marketing\/mosaic/)
  })

  it('places dragged tray items onto empty board cells as 1x1 tiles', () => {
    const boardEditor = readAdminboardFile(
      'components/mosaic/mosaic-board-editor.tsx',
    )
    const editorLib = readAdminboardFile('lib/mosaic-editor.ts')

    expect(boardEditor).toMatch(/MOSAIC_TRAY_DRAG_MIME/)
    expect(boardEditor).toMatch(/onDrop/)
    expect(boardEditor).toMatch(/getEmptyMosaicCells/)
    expect(editorLib).toMatch(/getEmptyMosaicCells/)
    expect(editorLib).toMatch(/placeMosaicTileFromTray/)
    expect(editorLib).toMatch(/width:\s*1/)
    expect(editorLib).toMatch(/height:\s*1/)
    expect(editorLib).toMatch(/reason:\s*'occupied'/)
  })
})

describe('issue 161 mosaic resize, remove, clear, and save UX', () => {
  it('supports click-to-span, remove-to-tray, and clear-editor helpers', () => {
    const editorLib = readAdminboardFile('lib/mosaic-editor.ts')
    const boardEditor = readAdminboardFile(
      'components/mosaic/mosaic-board-editor.tsx',
    )
    const editor = readAdminboardFile('components/mosaic/mosaic-editor.tsx')

    expect(editorLib).toMatch(/getLegalMosaicSpansForTile/)
    expect(editorLib).toMatch(/resizeMosaicTile/)
    expect(editorLib).toMatch(/removeMosaicTileFromBoard/)
    expect(editorLib).toMatch(/clearMosaicEditorState/)
    expect(boardEditor).toMatch(/getLegalMosaicSpansForTile/)
    expect(boardEditor).toMatch(/assessMosaicLiveEligibility/)
    expect(boardEditor).toMatch(/Remove to tray/)
    expect(editor).toMatch(/Clear editor/)
    expect(editor).toMatch(/clearMosaicEditorState/)
  })

  it('wires save to the mosaic API with empty-hide warning and validation UX', () => {
    const editor = readAdminboardFile('components/mosaic/mosaic-editor.tsx')
    const emptyDialog = readAdminboardFile(
      'components/mosaic/mosaic-save-empty-dialog.tsx',
    )

    expect(editor).toMatch(/useSaveMosaic/)
    expect(editor).toMatch(/mosaicEditorTilesToSaveInput/)
    expect(editor).toMatch(/assessMosaicLiveEligibility/)
    expect(editor).toMatch(/MosaicSaveEmptyDialog/)
    expect(emptyDialog).toMatch(/MOSAIC_EMPTY_SAVE_WARNING/)
    expect(emptyDialog).toMatch(/acknowledged/)
    expect(editor).toMatch(/persistBoard\(true\)/)
  })
})
