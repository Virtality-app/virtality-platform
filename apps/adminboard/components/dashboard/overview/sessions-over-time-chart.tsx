'use client'

import { useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
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
  buildClinicianTrendModel,
  buildTypeTrendRows,
} from '@/lib/dashboard-chart-model'
import {
  SESSION_TYPES,
  SESSION_TYPE_LABELS,
  type DashboardGranularity,
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
import {
  CLINICIAN_SERIES_COLORS,
  SESSION_TYPE_COLOR,
} from '../session-type-style'
import {
  SessionsOverTimeToolbar,
  type TrendGrouping,
  type TrendMeasure,
} from './sessions-over-time-toolbar'

type SessionsOverTimeChartProps = {
  report: SessionActivityReport
}

export function SessionsOverTimeChart({ report }: SessionsOverTimeChartProps) {
  const [grouping, setGrouping] = useState<TrendGrouping>('type')
  const [measure, setMeasure] = useState<TrendMeasure>('sessions')
  const granularity: DashboardGranularity = report.granularity

  const series = useMemo(() => {
    if (grouping === 'clinician') {
      const model = buildClinicianTrendModel(
        report.trend,
        report.clinicians,
        granularity,
      )
      return {
        rows: model.rows,
        bars: model.series.map((s, index) => ({
          key: s.key,
          name: s.label,
          color:
            CLINICIAN_SERIES_COLORS[index % CLINICIAN_SERIES_COLORS.length]!,
        })),
      }
    }
    return {
      rows: buildTypeTrendRows(report.trend, granularity, measure),
      bars: SESSION_TYPES.map((type) => ({
        key: type,
        name: SESSION_TYPE_LABELS[type],
        color: SESSION_TYPE_COLOR[type],
      })),
    }
  }, [grouping, measure, granularity, report.trend, report.clinicians])

  const unit = grouping === 'type' && measure === 'minutes' ? 'min' : ''

  return (
    <Card>
      <CardHeader className='flex flex-wrap items-start justify-between gap-3'>
        <div className='flex flex-col gap-1.5'>
          <CardTitle className='text-base font-semibold'>
            {granularity === 'day' ? 'Sessions per day' : 'Sessions per week'}
          </CardTitle>
          <CardDescription>
            Sessions, stacked by{' '}
            {grouping === 'type' ? 'session type' : 'clinician'}
          </CardDescription>
        </div>
        <SessionsOverTimeToolbar
          grouping={grouping}
          measure={measure}
          onGroupingChange={setGrouping}
          onMeasureChange={setMeasure}
        />
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width='100%' height={320}>
          <BarChart data={series.rows}>
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
              allowDecimals={false}
              unit={unit ? ` ${unit}` : undefined}
              width={unit ? 64 : 40}
            />
            <Tooltip
              cursor={chartTooltipCursor}
              contentStyle={chartTooltipContentStyle}
              labelStyle={chartTooltipLabelStyle}
              formatter={(value: number) => (unit ? `${value} ${unit}` : value)}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {series.bars.map((bar) => (
              <Bar
                key={bar.key}
                dataKey={bar.key}
                name={bar.name}
                stackId='sessions'
                fill={bar.color}
                maxBarSize={48}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
