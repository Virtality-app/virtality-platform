import { useCallback, useState } from 'react'
import {
  defaultGranularityFor,
  rangeForPreset,
  type DashboardPreset,
  type DashboardRange,
} from '@/lib/dashboard-range'
import type { DashboardGranularity } from '@/lib/dashboard-types'

const INITIAL_PRESET = '8w' as const

export type DashboardRangeState = ReturnType<typeof useDashboardRange>

/** Date window and bucket size shared by every dashboard tab. */
export function useDashboardRange() {
  const [preset, setPreset] = useState<DashboardPreset>(INITIAL_PRESET)
  const [range, setRange] = useState<DashboardRange>(() =>
    rangeForPreset(INITIAL_PRESET, new Date()),
  )
  const [granularity, setGranularity] = useState<DashboardGranularity>(() =>
    defaultGranularityFor(rangeForPreset(INITIAL_PRESET, new Date())),
  )

  const applyRange = useCallback(
    (nextPreset: DashboardPreset, nextRange: DashboardRange) => {
      setPreset(nextPreset)
      setRange(nextRange)
      setGranularity(
        nextPreset === 'all' ? 'week' : defaultGranularityFor(nextRange),
      )
    },
    [],
  )

  const selectPreset = useCallback(
    (nextPreset: Exclude<DashboardPreset, 'custom'>) =>
      applyRange(nextPreset, rangeForPreset(nextPreset, new Date())),
    [applyRange],
  )

  const selectCustomRange = useCallback(
    (nextRange: DashboardRange) => applyRange('custom', nextRange),
    [applyRange],
  )

  return {
    preset,
    range,
    /** The server picks the start date: the first session on record. */
    allTime: preset === 'all',
    granularity,
    setGranularity,
    selectPreset,
    selectCustomRange,
  }
}
