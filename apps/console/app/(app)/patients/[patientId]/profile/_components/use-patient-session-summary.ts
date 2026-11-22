'use client'
import { usePatientSessions } from '@virtality/react-query'
import { lastVisit } from '@/lib/patient-profile-summary'

/**
 * Session count and last visit for the profile header. Same query input as
 * the Sessions tab, so both read one cache entry.
 */
export function usePatientSessionSummary(patientId: string) {
  const { data: sessions } = usePatientSessions({
    input: {
      where: {
        patientId,
        AND: [
          { deletedAt: null },
          { status: { in: ['COMPLETED', 'INTERRUPTED'] } },
        ],
      },
    },
  })

  return {
    sessionCount: sessions?.length,
    lastVisitAt: sessions ? lastVisit(sessions) : null,
  }
}
