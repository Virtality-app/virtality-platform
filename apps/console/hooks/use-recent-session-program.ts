'use client'

import { useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { usePatientSessions } from '@virtality/react-query'
import type { CompleteReusableProgram } from '@/types/models'
import { parseLaunchIntent } from '@/lib/patient-dashboard-auto-launch'
import {
  resolveLastUsedProgram,
  resolveRecentSessionProgramId,
} from '@/lib/patient-dashboard-program-selection'

type RecentSessionProgramDeps = {
  patientId: string
  programs: CompleteReusableProgram[] | undefined
  /** This browser's Last Used Program; when set, it wins. */
  lastProgramId: string | undefined
  /** False once the clinician has a program or a session going. */
  canRestore: boolean
  onRestore: (program: CompleteReusableProgram) => void
}

/**
 * Opens the dashboard on the program the patient last trained with when this
 * browser remembers none, so a patient seen on another computer doesn't open
 * empty. Decided once per visit, after programs and sessions load: a later
 * clear or Quick Start is never undone, and arriving from the Home picker's
 * Quick Start skips it.
 */
export function useRecentSessionProgram({
  patientId,
  programs,
  lastProgramId,
  canRestore,
  onRestore,
}: RecentSessionProgramDeps) {
  // Same input as the control panel's query, so the request is shared.
  const { data: sessions } = usePatientSessions({
    input: { where: { patientId } },
  })
  const searchParams = useSearchParams()
  const arrivedForQuickStartRef = useRef(
    parseLaunchIntent(searchParams).quickStart,
  )
  const decidedRef = useRef(false)

  useEffect(() => {
    if (decidedRef.current || !programs || !sessions) return
    decidedRef.current = true
    if (arrivedForQuickStartRef.current || lastProgramId || !canRestore) return

    const program = resolveLastUsedProgram(
      programs,
      resolveRecentSessionProgramId(sessions) ?? undefined,
    )
    if (program) onRestore(program)
    // Decided once; the inputs are read at the moment both lists arrive.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [programs, sessions])
}
