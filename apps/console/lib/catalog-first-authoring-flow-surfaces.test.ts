import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { CATALOG_FIRST_AUTHORING_STEPS } from './catalog-first-authoring-flow.js'
import { CATALOG_FIRST_AUTHORING_MANUAL_QA } from './catalog-first-authoring-manual-qa.js'
import { canSubmitReusableProgram } from './program-library-submit.js'
import { canQuickStartFinalAction } from './quickstart-authoring-flow.js'

const consoleRoot = fileURLToPath(new URL('..', import.meta.url))

const CREATE_FORM_PATH =
  'app/(app)/programs/new/_components/reusable-program-form.tsx'
const CREATE_FLOW_PATH =
  'app/(app)/programs/new/_components/reusable-program-create-flow.tsx'
const EDIT_FORM_PATH =
  'app/(app)/programs/[programId]/edit/_components/reusable-program-edit-form.tsx'
const QUICKSTART_DIALOG_PATH =
  'app/(app)/patients/[patientId]/patient-dashboard/_components/quickstart-dialog.tsx'

const CATALOG_FIRST_FLOW_SURFACES = [
  {
    id: 'quick-start',
    path: QUICKSTART_DIALOG_PATH,
    catalogStepPattern: /isCatalogStep/,
    selectedListPattern: /isSelectedListStep/,
    legacyLibraryHidden:
      /<ExerciseLibraryList[\s\S]*?showExerciseLibraryAccess=\{false\}/,
    noNestedLibraryDialog: true,
    seedPattern: null,
    requiresCanGoToSelectedList: false,
  },
  {
    id: 'scratch-create',
    path: CREATE_FORM_PATH,
    catalogStepPattern: /isCatalogFirstCatalogStep/,
    selectedListPattern: /isCatalogFirstSelectedListStep/,
    flowMarker: /editorSource\.kind === 'scratch'/,
    legacyLibraryHidden:
      /showExerciseLibraryAccess=\{!isCatalogFirstSelectedListStep\}/,
    noNestedLibraryDialog: true,
    seedPattern: null,
  },
  {
    id: 'starter-template-create',
    path: CREATE_FORM_PATH,
    catalogStepPattern: /isCatalogFirstCatalogStep/,
    selectedListPattern: /isCatalogFirstSelectedListStep/,
    flowMarker: /editorSource\.kind === 'template'/,
    legacyLibraryHidden:
      /showExerciseLibraryAccess=\{!isCatalogFirstSelectedListStep\}/,
    noNestedLibraryDialog: true,
    seedPattern: /starterTemplateCatalogSelection/,
    companionPath: CREATE_FLOW_PATH,
    companionPatterns: [/StarterTemplatePicker/, /setStep\('editor'\)/],
  },
  {
    id: 'reusable-program-edit',
    path: EDIT_FORM_PATH,
    catalogStepPattern: /isCatalogStep/,
    selectedListPattern: /isSelectedListStep/,
    legacyLibraryHidden:
      /<ExerciseLibraryList[\s\S]*?showExerciseLibraryAccess=\{false\}/,
    noNestedLibraryDialog: true,
    seedPattern: /reusableProgramExercisesForCatalogSeed/,
  },
] as const

function readConsoleFile(relativePath: string): string {
  return readFileSync(join(consoleRoot, relativePath), 'utf8')
}

function expectCatalogFirstAuthoringHook(
  source: string,
  options: { requiresCanGoToSelectedList?: boolean } = {},
) {
  const { requiresCanGoToSelectedList = true } = options

  expect(source).toMatch(/useCatalogFirstAuthoringFlow/)
  expect(source).toMatch(/goToSelectedList/)
  expect(source).toMatch(/goToCatalog/)
  expect(source).toMatch(/selectedExerciseCountLabel/)
  if (requiresCanGoToSelectedList) {
    expect(source).toMatch(/canGoToSelectedList/)
  }
}

function expectCatalogBeforeSelectedList(source: string) {
  expect(source).toMatch(/<ExerciseGrid/)
  expect(source.indexOf('<ExerciseGrid')).toBeLessThan(
    source.indexOf('<ExerciseLibraryList'),
  )
}

function expectNoLegacyExerciseLibraryPath(source: string) {
  expect(source).not.toMatch(/ExerciseLibraryDialog/)
  expect(source).not.toMatch(/showExerciseLibraryAccess=\{true\}/)
}

describe('catalog-first authoring rollout seam', () => {
  it('defines the shared catalog then selected-list step order', () => {
    expect(CATALOG_FIRST_AUTHORING_STEPS).toEqual(['catalog', 'selected-list'])
  })

  for (const flow of CATALOG_FIRST_FLOW_SURFACES) {
    describe(flow.id, () => {
      const source = readConsoleFile(flow.path)

      it('wires the shared catalog-first authoring hook', () => {
        const requiresCanGoToSelectedList =
          'requiresCanGoToSelectedList' in flow
            ? flow.requiresCanGoToSelectedList !== false
            : true

        expectCatalogFirstAuthoringHook(source, {
          requiresCanGoToSelectedList,
        })
        if ('flowMarker' in flow && flow.flowMarker) {
          expect(source).toMatch(flow.flowMarker)
        }
      })

      it('opens on the catalog step with ExerciseGrid before selected-list', () => {
        expect(source).toMatch(flow.catalogStepPattern)
        expect(source).toMatch(flow.selectedListPattern)
        expectCatalogBeforeSelectedList(source)
      })

      it('hides the legacy exercise library access on selected-list', () => {
        expect(source).toMatch(flow.legacyLibraryHidden)
      })

      it('does not expose the nested exercise library dialog path', () => {
        if (flow.noNestedLibraryDialog) {
          expectNoLegacyExerciseLibraryPath(source)
        }
      })

      if (flow.seedPattern) {
        it('seeds catalog selection when the flow opens', () => {
          expect(source).toMatch(flow.seedPattern)
        })
      }

      if ('companionPath' in flow && flow.companionPath) {
        it('routes through prerequisite steps before the catalog editor', () => {
          const companionSource = readConsoleFile(flow.companionPath)
          for (const pattern of flow.companionPatterns ?? []) {
            expect(companionSource).toMatch(pattern)
          }
        })
      }
    })
  }

  it('blocks reusable program submit when no enabled variants remain', () => {
    expect(canSubmitReusableProgram('Test program', [], [])).toEqual({
      ok: false,
      reason: 'exercises',
    })
  })

  it('blocks quick start final actions when no enabled variants remain', () => {
    expect(canQuickStartFinalAction([], [])).toBe(false)
  })
})

describe('catalog-first authoring manual QA coverage', () => {
  it('documents manual QA for all target flows', () => {
    const qaFlowIds = CATALOG_FIRST_AUTHORING_MANUAL_QA.map((flow) => flow.id)
    const targetFlowIds = CATALOG_FIRST_FLOW_SURFACES.map((flow) => flow.id)

    expect(qaFlowIds).toEqual(targetFlowIds)
    for (const flow of CATALOG_FIRST_AUTHORING_MANUAL_QA) {
      expect(flow.entry.length).toBeGreaterThan(0)
      expect(flow.checks.length).toBeGreaterThanOrEqual(4)
    }
  })
})
