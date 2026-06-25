import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const consoleRoot = fileURLToPath(new URL('..', import.meta.url))

const EXERCISE_LIBRARY_LIST_PATH = 'components/ui/exercise-library-list.tsx'

/** Catalog-first flows must not expose the legacy library button on selected-list. */
const CATALOG_FIRST_EXERCISE_LIBRARY_LIST_CONSUMERS = [
  {
    path: 'app/(app)/patients/[patientId]/patient-dashboard/_components/quickstart-dialog.tsx',
    legacyLibraryHidden:
      /<ExerciseLibraryList[\s\S]*?showExerciseLibraryAccess=\{false\}/,
  },
  {
    path: 'app/(app)/programs/[programId]/edit/_components/reusable-program-edit-form.tsx',
    legacyLibraryHidden:
      /<ExerciseLibraryList[\s\S]*?showExerciseLibraryAccess=\{false\}/,
  },
  {
    path: 'app/(app)/programs/new/_components/reusable-program-form.tsx',
    legacyLibraryHidden:
      /showExerciseLibraryAccess=\{!isCatalogFirstSelectedListStep\}/,
  },
] as const

function readConsoleFile(relativePath: string): string {
  return readFileSync(join(consoleRoot, relativePath), 'utf8')
}

describe('exercise library list surfaces', () => {
  const listSource = readConsoleFile(EXERCISE_LIBRARY_LIST_PATH)

  it('can render selected-list settings without the old exercise library access', () => {
    expect(listSource).toMatch(/showExerciseLibraryAccess\s*=\s*true/)
    expect(listSource).toMatch(
      /showExerciseLibraryAccess\s*&&\s*\([\s\S]*?Exercise library/,
    )
    expect(listSource).toMatch(
      /showExerciseLibraryAccess\s*&&\s*<ExerciseLibraryDialog/,
    )
  })

  it('hides legacy exercise library access on all catalog-first selected-list surfaces', () => {
    for (const consumer of CATALOG_FIRST_EXERCISE_LIBRARY_LIST_CONSUMERS) {
      const source = readConsoleFile(consumer.path)
      expect(source).toMatch(/<ExerciseLibraryList/)
      expect(source).toMatch(consumer.legacyLibraryHidden)
      expect(source).not.toMatch(/ExerciseLibraryDialog/)
    }
  })

  it('keeps selected-list settings handlers in the component source', () => {
    expect(listSource).toMatch(/reorderSegmentGroups/)
    expect(listSource).toMatch(/deleteSelected/)
    expect(listSource).toMatch(/checkAll/)
    expect(listSource).toMatch(/toggleProgramDirection/)
    expect(listSource).toMatch(/ExerciseSettings/)
    expect(listSource).toMatch(/markDeferredRemoval/)
    expect(listSource).toMatch(/unmarkDeferredRemoval/)
    expect(listSource).toMatch(
      /segmentProgramExerciseRowsByAdjacentBilateralFamilies/,
    )
  })
})
