'use client'

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
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
import { buildAverageLengthRows } from '@/lib/dashboard-chart-model'
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
  chartTooltipLabelStyle,
} from '../chart-theme'
import { SESSION_TYPE_COLOR } from '../session-type-style'

type AverageLengthChartProps = {
  report: SessionActivityReport
}

export function AverageLengthChart({ report }: AverageLengthChartProps) {
  const rows = buildAverageLengthRows(report.trend, report.granularity)

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-base font-semibold'>
          Average session length{' '}
          {report.granularity === 'day' ? 'per day' : 'per week'}
        </CardTitle>
        <CardDescription>Minutes, by session type</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width='100%' height={280}>
          <LineChart data={rows}>
            <CartesianGrid {...chartGridProps} />
            <XAxis
              dataKey='label'
              tick={chartAxisTick}
              axisLine={chartAxisLine}
              tickLine={false}
              interval='preserveStartEnd'
              minTickGap={12}
            />
            <YAxis
              tick={chartAxisTick}
              axisLine={false}
              tickLine={false}
              unit=' min'
              width={64}
            />
            <Tooltip
              contentStyle={chartTooltipContentStyle}
              labelStyle={chartTooltipLabelStyle}
              formatter={(value: number) => `${Math.round(value)} min`}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {SESSION_TYPES.map((type) => (
              <Line
                key={type}
                type='monotone'
                dataKey={type}
                name={SESSION_TYPE_LABELS[type]}
                stroke={SESSION_TYPE_COLOR[type]}
                strokeWidth={2.5}
                dot={{ r: 3 }}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
