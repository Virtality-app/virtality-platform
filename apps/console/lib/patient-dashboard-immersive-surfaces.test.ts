import { describe, expect, it } from 'vitest'
import {
  PATIENT_DASHBOARD_PATH,
  readConsoleFile,
} from './catalog-first-authoring-surface-seams.js'

const IMMERSIVE_PANEL_PATH =
  'app/(app)/patients/[patientId]/patient-dashboard/_components/immersive-video-panel.tsx'

describe('patient dashboard immersive surfaces', () => {
  it('hides the exercise list column when Immersive Video mode is selected', () => {
    const dashboard = readConsoleFile(PATIENT_DASHBOARD_PATH)
    const panel = readConsoleFile(IMMERSIVE_PANEL_PATH)

    expect(dashboard).toMatch(/hideExerciseList: isImmersive/)
    expect(dashboard).toMatch(/\{isImmersive \? null : \(/)
    expect(dashboard).toMatch(
      /<ExerciseList className=\{exerciseListClassName\} \/>/,
    )
    expect(dashboard).not.toMatch(/cardClassName=\{exerciseListClassName\}/)
    expect(panel).toMatch(/ImmersiveVideoSelectedCard/)
    expect(panel).toMatch(/ImmersiveVideoProgress/)
  })

  it('uses one play/pause control like program mode, not separate resume', () => {
    const transport = readConsoleFile(
      'app/(app)/patients/[patientId]/patient-dashboard/_components/immersive-video-transport.tsx',
    )

    expect(transport).toMatch(/resolveImmersivePlayPauseControl/)
    expect(transport).toMatch(/shouldShowImmersiveStop/)
    expect(transport).not.toMatch(/aria-label='Resume'/)
  })
})
