'use client'

import { useState } from 'react'
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
import { Button } from '@/components/ui/button'
import { formatMinutes } from '@/lib/dashboard-format'
import {
  SESSION_TYPES,
  SESSION_TYPE_LABELS,
  type PatientActivity,
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

const COLLAPSED_COUNT = 20
const ROW_HEIGHT = 28

type SessionsPerPatientChartProps = {
  patients: PatientActivity[]
}

export function SessionsPerPatientChart({
  patients,
}: SessionsPerPatientChartProps) {
  const [showAll, setShowAll] = useState(false)
  const visible = showAll ? patients : patients.slice(0, COLLAPSED_COUNT)
  const rows = visible.map((patient) => ({
    name: patient.patientName,
    clinician: patient.userLabel,
    minutes: patient.totalMinutes,
    ...patient.sessionsByType,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-base font-semibold'>
          Sessions per patient
        </CardTitle>
        <CardDescription>
          Sessions in this period, most active patients first
        </CardDescription>
      </CardHeader>
      <CardContent className='flex flex-col gap-3'>
        {rows.length === 0 ? (
          <p className='text-muted-foreground py-12 text-center text-sm'>
            No sessions in this period.
          </p>
        ) : (
          <ResponsiveContainer
            width='100%'
            height={Math.max(160, rows.length * ROW_HEIGHT + 40)}
          >
            <BarChart data={rows} layout='vertical' margin={{ left: 8 }}>
              <CartesianGrid {...chartGridProps} vertical horizontal={false} />
              <XAxis
                type='number'
                tick={chartAxisTick}
                axisLine={chartAxisLine}
                tickLine={false}
                allowDecimals={false}
              />
              <YAxis
                type='category'
                dataKey='name'
                width={140}
                tick={chartAxisTick}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={chartTooltipCursor}
                contentStyle={chartTooltipContentStyle}
                labelStyle={chartTooltipLabelStyle}
                labelFormatter={(label, payload) => {
                  const row = payload?.[0]?.payload as
                    | (typeof rows)[number]
                    | undefined
                  return row
                    ? `${label} · ${row.clinician} · ${formatMinutes(row.minutes)}`
                    : label
                }}
              />
              {SESSION_TYPES.map((type) => (
                <Bar
                  key={type}
                  dataKey={type}
                  name={SESSION_TYPE_LABELS[type]}
                  stackId='patient'
                  fill={SESSION_TYPE_COLOR[type]}
                  barSize={16}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )}
        <div className='flex flex-wrap items-center justify-between gap-3'>
          <SessionTypeLegend />
          {patients.length > COLLAPSED_COUNT ? (
            <Button
              variant='outline'
              size='sm'
              onClick={() => setShowAll((value) => !value)}
            >
              {showAll
                ? `Show top ${COLLAPSED_COUNT}`
                : `Show all ${patients.length} patients`}
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}
