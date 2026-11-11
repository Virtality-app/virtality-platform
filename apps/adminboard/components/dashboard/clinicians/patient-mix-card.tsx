import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@virtality/ui/components/card'
import { cn } from '@/lib/utils'
import type { SessionActivityReport } from '@/lib/dashboard-types'
import { SESSION_TYPE_SWATCH } from '../session-type-style'

type PatientMixCardProps = {
  mix: SessionActivityReport['patientMix']
  activePatients: number
}

export function PatientMixCard({ mix, activePatients }: PatientMixCardProps) {
  const groups = [
    {
      label: 'Exercise only',
      count: mix.exerciseOnly,
      swatch: SESSION_TYPE_SWATCH.exercise,
    },
    {
      label: 'VR video only',
      count: mix.vrOnly,
      swatch: SESSION_TYPE_SWATCH.vr,
    },
    {
      label: 'Exercise and VR video',
      count: mix.exerciseAndVr,
      swatch: 'bg-chart-2',
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-base font-semibold'>
          Patients by what they’ve done
        </CardTitle>
        <CardDescription>{activePatients} active patients</CardDescription>
      </CardHeader>
      <CardContent className='flex flex-col gap-4'>
        {groups.map((group) => (
          <div key={group.label} className='flex flex-col gap-1.5'>
            <div className='flex justify-between text-sm'>
              <span>{group.label}</span>
              <span className='font-semibold'>{group.count}</span>
            </div>
            <div className='bg-muted h-2 overflow-hidden rounded-full'>
              <div
                className={cn('h-full rounded-full', group.swatch)}
                style={{
                  width: `${activePatients ? (group.count / activePatients) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
        ))}
        <p className='text-muted-foreground text-xs'>
          Exercise and VR video counts patients who had at least one session of
          each kind in this period.
        </p>
      </CardContent>
    </Card>
  )
}
