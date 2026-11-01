import { cleanup, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { CompleteReusableProgram } from '@/types/models'
import { useRecentSessionProgram } from './use-recent-session-program'

const mocks = vi.hoisted(() => ({
  sessions: undefined as unknown[] | undefined,
  searchParams: new URLSearchParams(),
}))

vi.mock('@virtality/react-query', () => ({
  usePatientSessions: () => ({ data: mocks.sessions }),
}))
vi.mock('next/navigation', () => ({
  useSearchParams: () => mocks.searchParams,
}))

const programA = { id: 'program-a' } as CompleteReusableProgram
const programB = { id: 'program-b' } as CompleteReusableProgram
const programs = [programA, programB]
const finished = (createdAt: string, programId: string | null) => ({
  status: 'COMPLETED',
  createdAt: new Date(createdAt),
  sourceReusableProgramId: programId,
})

beforeEach(() => {
  mocks.sessions = [
    finished('2026-10-01', 'program-a'),
    finished('2026-10-20', 'program-b'),
  ]
  mocks.searchParams = new URLSearchParams()
})
afterEach(cleanup)

function render(
  overrides: Partial<Parameters<typeof useRecentSessionProgram>[0]> = {},
) {
  const onRestore = vi.fn()
  const result = renderHook(
    (props: Partial<Parameters<typeof useRecentSessionProgram>[0]>) =>
      useRecentSessionProgram({
        patientId: 'patient',
        programs,
        lastProgramId: undefined,
        canRestore: true,
        onRestore,
        ...overrides,
        ...props,
      }),
    { initialProps: {} },
  )
  return { ...result, onRestore }
}

describe('useRecentSessionProgram', () => {
  it("loads the program of the patient's latest session", () => {
    const { onRestore } = render()
    expect(onRestore).toHaveBeenCalledWith(programB)
  })

  it('leaves a remembered Last Used Program to the browser', () => {
    const { onRestore } = render({ lastProgramId: 'program-a' })
    expect(onRestore).not.toHaveBeenCalled()
  })

  it('does nothing once a program or session is already going', () => {
    const { onRestore } = render({ canRestore: false })
    expect(onRestore).not.toHaveBeenCalled()
  })

  it("skips when arriving from the Home picker's Quick Start", () => {
    mocks.searchParams = new URLSearchParams('quickstart=1')
    const { onRestore } = render()
    expect(onRestore).not.toHaveBeenCalled()
  })

  it('skips a program that is no longer in the library', () => {
    mocks.sessions = [finished('2026-10-20', 'program-retired')]
    const { onRestore } = render()
    expect(onRestore).not.toHaveBeenCalled()
  })

  it('waits for sessions, then decides once', () => {
    mocks.sessions = undefined
    const { rerender, onRestore } = render()
    expect(onRestore).not.toHaveBeenCalled()

    mocks.sessions = [finished('2026-10-20', 'program-b')]
    rerender({})
    expect(onRestore).toHaveBeenCalledTimes(1)

    // A clear later must not bring the program back.
    mocks.sessions = [...mocks.sessions]
    rerender({ canRestore: true })
    expect(onRestore).toHaveBeenCalledTimes(1)
  })
})
