import type { CSSProperties } from 'react'

/** Shared Recharts styling so every dashboard chart reads alike. */
export const chartAxisTick = { fontSize: 11, fill: 'var(--muted-foreground)' }

export const chartAxisLine = { stroke: 'var(--border)' }

export const chartGridProps = {
  stroke: 'var(--border)',
  strokeDasharray: '3 3',
  opacity: 0.55,
  vertical: false,
} as const

export const chartTooltipCursor = {
  fill: 'color-mix(in oklab, var(--accent) 35%, transparent)',
}

export const chartTooltipContentStyle: CSSProperties = {
  backgroundColor: 'var(--popover)',
  border: '1px solid var(--border)',
  borderRadius: 12,
  fontSize: 12,
  boxShadow:
    '0 10px 10px color-mix(in oklab, var(--foreground) 10%, transparent)',
}

export const chartTooltipLabelStyle: CSSProperties = {
  color: 'var(--muted-foreground)',
}
