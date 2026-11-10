'use client'

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@virtality/ui/components/card'
import {
  SESSION_TYPES,
  SESSION_TYPE_LABELS,
  type SessionActivityReport,
} from '@/lib/dashboard-types'
import {
  chartAxisLine,
  chartAxisTick,
  chartGridProps,
  chartTooltipContentStyle,
  chartTooltipCursor,
  chartTooltipLabelStyle,
} from '../chart-theme'
import { SessionTypeLegend } from '../session-type-legend'
import { SESSION_TYPE_COLOR } from '../session-type-style'

type SessionLengthChartProps = {
  buckets: SessionActivityReport['lengthBuckets']
}

export function SessionLengthChart({ buckets }: SessionLengthChartProps) {
  const rows = buckets.map((bucket) => ({
    label: bucket.label,
    ...bucket.sessionsByType,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-base font-semibold'>
          How long sessions run
        </CardTitle>
        <CardDescription>
          Sessions by length in minutes, from start to end. Sessions without an
          end time aren’t included.
        </CardDescription>
      </CardHeader>
      <CardContent className='flex flex-col gap-3'>
        <ResponsiveContainer width='100%' height={260}>
          <BarChart data={rows}>
            <CartesianGrid {...chartGridProps} />
            <XAxis
              dataKey='label'
              tick={chartAxisTick}
              axisLine={chartAxisLine}
              tickLine={false}
            />
            <YAxis
              tick={chartAxisTick}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
              width={40}
            />
            <Tooltip
              cursor={chartTooltipCursor}
              contentStyle={chartTooltipContentStyle}
              labelStyle={chartTooltipLabelStyle}
            />
            {SESSION_TYPES.map((type) => (
              <Bar
                key={type}
                dataKey={type}
                name={SESSION_TYPE_LABELS[type]}
                stackId='length'
                fill={SESSION_TYPE_COLOR[type]}
                maxBarSize={72}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
        <SessionTypeLegend />
      </CardContent>
    </Card>
  )
}
