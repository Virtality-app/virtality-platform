import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const consoleRoot = fileURLToPath(new URL('..', import.meta.url))

const QUICKSTART_DIALOG_PATH =
  'app/(app)/patients/[patientId]/patient-dashboard/_components/quickstart-dialog.tsx'

function readConsoleFile(relativePath: string): string {
  return readFileSync(join(consoleRoot, relativePath), 'utf8')
}

describe('quick start dialog surfaces', () => {
  const source = readConsoleFile(QUICKSTART_DIALOG_PATH)

  it('uses the shared catalog-first authoring flow', () => {
    expect(source).toMatch(/useCatalogFirstAuthoringFlow/)
    expect(source).toMatch(/isCatalogStep/)
    expect(source).toMatch(/isSelectedListStep/)
    expect(source).toMatch(/goToSelectedList/)
    expect(source).toMatch(/goToCatalog/)
  })

  it('shows the exercise catalog on the first step', () => {
    expect(source).toMatch(/<ExerciseGrid/)
  })

  it('shows selected-list settings without the legacy library button on the second step', () => {
    expect(source).toMatch(
      /<ExerciseLibraryList[\s\S]*?showExerciseLibraryAccess=\{false\}/,
    )
  })

  it('places Continue and Save Program on the selected-list step', () => {
    expect(source).toMatch(/canQuickStartFinalAction/)
    expect(source).toMatch(/Continue/)
    expect(source).toMatch(/Save Program/)
    expect(source).not.toMatch(/Quickstart Program Overview/)
  })
})
