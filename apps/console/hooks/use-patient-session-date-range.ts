'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  getDefaultSessionDateRange,
  getSessionDateRangeForPreset,
  normalizeSessionDateRange,
  persistSessionDateRange,
  readPersistedSessionDateRange,
  type DateRangePreset,
  type SessionDateRange,
} from '@/lib/session-date-range'

type DateRangeUpdater =
  | SessionDateRange
  | ((prev: SessionDateRange) => SessionDateRange)

export function usePatientSessionDateRange(patientId: string) {
  const [dateRange, setDateRange] = useState<SessionDateRange>(() =>
    getDefaultSessionDateRange(),
  )

  useEffect(() => {
    setDateRange(
      readPersistedSessionDateRange(patientId) ?? getDefaultSessionDateRange(),
    )
  }, [patientId])

  const updateDateRange = useCallback(
    (updater: DateRangeUpdater) => {
      setDateRange((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater
        const normalized = normalizeSessionDateRange(next)
        persistSessionDateRange(patientId, normalized)
        return normalized
      })
    },
    [patientId],
  )

  const setStartDate = useCallback(
    (startDate: Date) => {
      updateDateRange((prev) => ({ startDate, endDate: prev.endDate }))
    },
    [updateDateRange],
  )

  const setEndDate = useCallback(
    (endDate: Date) => {
      updateDateRange((prev) => ({ startDate: prev.startDate, endDate }))
    },
    [updateDateRange],
  )

  const applyPreset = useCallback(
    (preset: DateRangePreset) => {
      updateDateRange(getSessionDateRangeForPreset(preset))
    },
    [updateDateRange],
  )

  return {
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
    setStartDate,
    setEndDate,
    applyPreset,
  }
}
