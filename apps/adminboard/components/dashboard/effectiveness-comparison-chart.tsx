'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@virtality/ui/components/card'

type EffectivenessComparisonRow = {
  userLabel: string
  activePatients: number
  completedSessions: number
  patientActivationRatePercent: number | null
}

interface EffectivenessComparisonChartProps {
  data: EffectivenessComparisonRow[]
}

export function EffectivenessComparisonChart({
  data,
}: EffectivenessComparisonChartProps) {
  return (
    <Card className='shadow-sm transition-shadow hover:shadow-md'>
      <CardHeader className='pb-4'>
        <CardTitle className='text-base font-semibold'>
          Engagement by Owner
        </CardTitle>
        <CardDescription>
          Active patients and completed sessions grouped by patient owner
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className='text-muted-foreground flex h-[320px] items-center justify-center text-sm'>
            No owner activity for the selected date range.
          </div>
        ) : (
          <div className='overflow-x-auto'>
            <table className='w-full min-w-[640px] text-left text-sm'>
              <thead>
                <tr className='border-b'>
                  <th className='text-muted-foreground px-3 py-2 font-medium'>
                    Owner
                  </th>
                  <th className='text-muted-foreground px-3 py-2 font-medium'>
                    Active patients
                  </th>
                  <th className='text-muted-foreground px-3 py-2 font-medium'>
                    Activation rate
                  </th>
                  <th className='text-muted-foreground px-3 py-2 font-medium'>
                    Completed sessions
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.map((row) => (
                  <tr key={row.userLabel} className='border-b last:border-b-0'>
                    <td className='px-3 py-3 font-medium'>{row.userLabel}</td>
                    <td className='px-3 py-3'>{row.activePatients}</td>
                    <td className='px-3 py-3'>
                      {formatPercent(row.patientActivationRatePercent)}
                    </td>
                    <td className='px-3 py-3'>{row.completedSessions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function formatPercent(value: number | null): string {
  if (value === null) {
    return '—'
  }

  return `${value}%`
}
