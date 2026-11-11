import type { SessionType } from '@/lib/dashboard-types'

/** Chart fill per session type; theme tokens so dark mode follows. */
export const SESSION_TYPE_COLOR: Record<SessionType, string> = {
  exercise: 'var(--chart-1)',
  vr: 'var(--chart-4)',
}

export const SESSION_TYPE_SWATCH: Record<SessionType, string> = {
  exercise: 'bg-chart-1',
  vr: 'bg-chart-4',
}

/** Series colors for per-clinician charts, cycled in order. */
export const CLINICIAN_SERIES_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
]
