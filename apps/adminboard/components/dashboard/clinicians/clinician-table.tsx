import { cn } from '@/lib/utils'
import type { ClinicianActivity } from '@/lib/dashboard-types'
import { SessionTypeLegend } from '../session-type-legend'
import { ClinicianRow } from './clinician-row'

const COLUMNS = [
  { label: 'Clinician', align: 'text-left' },
  { label: 'Active patients', align: 'text-right' },
  { label: 'Sessions by type', align: 'text-left' },
  { label: 'Time in therapy', align: 'text-left' },
  { label: 'Avg length', align: 'text-right' },
  { label: 'Patients on VR', align: 'text-right' },
  { label: 'Last session', align: 'text-right' },
]

type ClinicianTableProps = {
  clinicians: ClinicianActivity[]
}

export function ClinicianTable({ clinicians }: ClinicianTableProps) {
  const maxSessions = Math.max(1, ...clinicians.map((c) => c.sessionCount))
  const maxMinutes = Math.max(1, ...clinicians.map((c) => c.totalMinutes))
  const now = new Date()

  return (
    <div className='bg-card rounded-xl border'>
      <div className='overflow-x-auto'>
        <table className='w-full min-w-[1000px] text-sm'>
          <thead>
            <tr className='bg-muted/50 text-muted-foreground border-b text-xs uppercase'>
              {COLUMNS.map((column) => (
                <th
                  key={column.label}
                  scope='col'
                  className={cn('px-4 py-3 font-medium', column.align)}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {clinicians.length === 0 ? (
              <tr>
                <td
                  colSpan={COLUMNS.length}
                  className='text-muted-foreground px-4 py-12 text-center'
                >
                  No clinicians with patients yet.
                </td>
              </tr>
            ) : (
              clinicians.map((clinician) => (
                <ClinicianRow
                  key={clinician.userId}
                  clinician={clinician}
                  maxSessions={maxSessions}
                  maxMinutes={maxMinutes}
                  now={now}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className='flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3'>
        <SessionTypeLegend />
        <p className='text-muted-foreground text-xs'>
          Active patients had a session in this period, out of all patients the
          clinician has added.
        </p>
      </div>
    </div>
  )
}
