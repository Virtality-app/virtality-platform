import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const consoleRoot = fileURLToPath(new URL('..', import.meta.url))
const repoRoot = fileURLToPath(new URL('../../..', import.meta.url))

function readConsoleFile(relativePath: string): string {
  return readFileSync(join(consoleRoot, relativePath), 'utf8')
}

function readRepoFile(relativePath: string): string {
  return readFileSync(join(repoRoot, relativePath), 'utf8')
}

describe('PRD 123 skip-safe exercise progress checkpoints', () => {
  it('defines skip-safe progress glossary terms in the console context', () => {
    const context = readRepoFile('apps/console/CONTEXT.md')

    expect(context).toMatch(/\*\*Completed Rep Measurement\*\*/)
    expect(context).toMatch(/\*\*Completed Set\*\*/)
    expect(context).toMatch(/\*\*Progress Save Checkpoint\*\*/)
    expect(context).toMatch(/\*\*Pending Exercise Change\*\*/)
    expect(context).toMatch(/\*\*Headset-Confirmed Current Exercise\*\*/)
    expect(context).toMatch(/\*\*Session Exercise Completion\*\*/)
    expect(context).toMatch(/\*\*Session Exercise Skip\*\*/)
  })

  it('documents the RepEnd/SetEnd socket payload decision in ADR 0003', () => {
    const adr = readRepoFile(
      'docs/adr/0003-preserve-rep-set-end-socket-payloads.md',
    )

    expect(adr).toMatch(/RepEnd/)
    expect(adr).toMatch(/SetEnd/)
    expect(adr).toMatch(/JSON-string/)
  })

  it('normalizes wire payloads and centralizes progress save checkpoints', () => {
    const normalization = readConsoleFile('lib/progress-event-normalization.ts')
    const checkpoint = readConsoleFile('lib/session-progress-checkpoint.ts')
    const skip = readConsoleFile('lib/session-exercise-skip.ts')
    const flow = readConsoleFile('lib/skip-safe-progress-flow.ts')

    expect(normalization).toMatch(/normalizeRepEndPayload/)
    expect(normalization).toMatch(/normalizeSetEndPayload/)
    expect(checkpoint).toMatch(/buildSetCompletionCheckpoint/)
    expect(checkpoint).toMatch(/buildExerciseSkipCheckpoint/)
    expect(checkpoint).toMatch(/shouldResetLiveExerciseAfterSetCompletion/)
    expect(skip).toMatch(/extractCompletedProgressPoints/)
    expect(skip).toMatch(/shouldIgnoreProgressEventDuringPendingExerciseChange/)
    expect(flow).toMatch(/applyRepEndToFlow/)
    expect(flow).toMatch(/requestExerciseSkipInFlow/)
    expect(flow).toMatch(/completeSessionInFlow/)
  })

  it('routes started-session exercise changes through skip-safe pending change flow', () => {
    const socketSetup = readConsoleFile(
      'hooks/use-patient-dashboard-socket-setup.tsx',
    )
    const controlPanel = readConsoleFile(
      'app/(app)/patients/[patientId]/patient-dashboard/_components/control-panel.tsx',
    )
    const exerciseList = readConsoleFile(
      'app/(app)/patients/[patientId]/patient-dashboard/_components/exercise-list.tsx',
    )

    expect(socketSetup).toMatch(/buildExerciseSkipCheckpoint/)
    expect(socketSetup).toMatch(/buildSetCompletionCheckpoint/)
    expect(socketSetup).toMatch(
      /shouldIgnoreProgressEventDuringPendingExerciseChange/,
    )
    expect(socketSetup).toMatch(/requestForwardBackSkip/)
    expect(socketSetup).toMatch(/requestDirectExerciseSelection/)
    expect(socketSetup).toMatch(/shouldPromotePendingExerciseOnAck/)
    expect(socketSetup).toMatch(/shouldResetLiveExerciseAfterSetCompletion/)
    expect(socketSetup).toMatch(
      /applyExerciseAtIndex\(checkpoint\.nextCurrentExerciseIndex\)/,
    )
    expect(controlPanel).toMatch(/requestForwardBackSkip/)
    expect(exerciseList).toMatch(/requestDirectExerciseSelection/)
    expect(exerciseList).toMatch(/resolveExerciseListHighlightState/)
  })

  it('surfaces pending exercise change status in the active session UI', () => {
    const status = readConsoleFile(
      'app/(app)/patients/[patientId]/patient-dashboard/_components/session-exercise-change-status.tsx',
    )
    const changeUi = readConsoleFile('lib/session-exercise-change-ui.ts')

    expect(status).toMatch(/pendingExerciseChange/)
    expect(changeUi).toMatch(/EXERCISE_CHANGE_ACK_TIMEOUT_MS/)
    expect(changeUi).toMatch(/resolveExerciseChangeStatusMessage/)
    expect(changeUi).toMatch(/resolveExerciseChangeFailureMessage/)
  })
})
