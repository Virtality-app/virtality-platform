import { formatLastActive, formatMinutes } from '@/lib/dashboard-format'
import type { ClinicianActivity } from '@/lib/dashboard-types'
import { TypeSplitBar } from '../type-split-bar'

type ClinicianRowProps = {
  clinician: ClinicianActivity
  maxSessions: number
  maxMinutes: number
  now: Date
}

export function ClinicianRow({
  clinician,
  maxSessions,
  maxMinutes,
  now,
}: ClinicianRowProps) {
  const { sessionsByType } = clinician

  return (
    <tr className='border-b last:border-b-0'>
      <th scope='row' className='px-4 py-4 text-left font-medium'>
        {clinician.userLabel}
      </th>
      <td className='px-4 py-4 text-right whitespace-nowrap'>
        {clinician.activePatients}{' '}
        <span className='text-muted-foreground'>
          of {clinician.totalPatients}
        </span>
      </td>
      <td className='px-4 py-4'>
        <div className='flex flex-col gap-1.5'>
          <TypeSplitBar
            counts={sessionsByType}
            scaleMax={maxSessions}
            label={`${clinician.sessionCount} sessions`}
            className='h-3 rounded-sm'
          />
          <span className='text-muted-foreground text-xs'>
            {clinician.sessionCount} sessions · {sessionsByType.exercise}{' '}
            exercise · {sessionsByType.vr} VR
          </span>
        </div>
      </td>
      <td className='px-4 py-4'>
        <div className='flex flex-col gap-1.5'>
          <TypeSplitBar
            counts={clinician.minutesByType}
            scaleMax={maxMinutes}
            label={`${formatMinutes(clinician.totalMinutes)} in therapy`}
            className='h-3 rounded-sm'
          />
          <span className='text-muted-foreground text-xs'>
            {formatMinutes(clinician.totalMinutes)} total
          </span>
        </div>
      </td>
      <td className='px-4 py-4 text-right font-mono text-xs tabular-nums'>
        {formatMinutes(clinician.averageMinutes)}
      </td>
      <td className='px-4 py-4 text-right'>
        {clinician.vrPatients}{' '}
        <span className='text-muted-foreground'>
          of {clinician.activePatients}
        </span>
      </td>
      <td className='text-muted-foreground px-4 py-4 text-right whitespace-nowrap'>
        {formatLastActive(clinician.lastSessionAt, now)}
      </td>
    </tr>
  )
}
