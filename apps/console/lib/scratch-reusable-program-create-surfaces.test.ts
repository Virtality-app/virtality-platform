import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { canSubmitReusableProgram } from './program-library-submit.js'

const consoleRoot = fileURLToPath(new URL('..', import.meta.url))

const SCRATCH_CREATE_FORM_PATH =
  'app/(app)/programs/new/_components/reusable-program-form.tsx'

function readConsoleFile(relativePath: string): string {
  return readFileSync(join(consoleRoot, relativePath), 'utf8')
}

describe('scratch reusable program catalog-first create flow', () => {
  const formSource = readConsoleFile(SCRATCH_CREATE_FORM_PATH)

  it('wires scratch creation through the catalog-first authoring hook', () => {
    expect(formSource).toMatch(/useCatalogFirstAuthoringFlow/)
    expect(formSource).toMatch(/editorSource\.kind === 'scratch'/)
  })

  it('opens scratch creation on the exercise catalog step', () => {
    expect(formSource).toMatch(/isCatalogStep/)
    expect(formSource).toMatch(/<ExerciseGrid/)
  })

  it('shows selected exercise count near the catalog Next action', () => {
    expect(formSource).toMatch(/selectedExerciseCountLabel/)
    expect(formSource).toMatch(/goToSelectedList/)
    expect(formSource).toMatch(/canGoToSelectedList/)
  })

  it('renders the program name field only on the selected-list step', () => {
    const catalogStepBlock =
      formSource.match(
        /if \(isScratch && isCatalogStep\) \{[\s\S]*?\n  \}/,
      )?.[0] ?? ''

    expect(formSource).toMatch(/showProgramNameField/)
    expect(formSource).toMatch(
      /showProgramNameField[\s\S]*<FormField[\s\S]*name=['"]name['"]/,
    )
    expect(catalogStepBlock).not.toMatch(/<FormField/)
    expect(catalogStepBlock).not.toMatch(/name=['"]name['"]/)
  })

  it('uses selected-list settings without the legacy exercise library access', () => {
    expect(formSource).toMatch(/isScratchSelectedListStep/)
    expect(formSource).toMatch(
      /showExerciseLibraryAccess=\{!isScratchSelectedListStep\}/,
    )
    expect(formSource).toMatch(/goToCatalog/)
  })

  it('blocks final submit when no enabled exercise variants remain', () => {
    expect(formSource).toMatch(/canSubmitReusableProgram/)
    expect(formSource).toMatch(/ZERO_ENABLED_VARIANTS_MESSAGE/)

    expect(canSubmitReusableProgram('Shoulder rehab', [], [])).toEqual({
      ok: false,
      reason: 'exercises',
    })
  })
})
