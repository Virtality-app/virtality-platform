import type { SessionActivityReport } from '@/lib/dashboard-types'
import { VrTrackingNotice } from '../vr-tracking-notice'
import { OverviewStatCards } from './overview-stat-cards'
import { SessionLengthChart } from './session-length-chart'
import { SessionMixCard } from './session-mix-card'
import { SessionsOverTimeChart } from './sessions-over-time-chart'
import { SessionsPerPatientChart } from './sessions-per-patient-chart'

type OverviewTabProps = {
  report: SessionActivityReport
  allTime: boolean
}

export function OverviewTab({ report, allTime }: OverviewTabProps) {
  return (
    <div className='flex flex-col gap-6'>
      <VrTrackingNotice />
      <OverviewStatCards summary={report.summary} allTime={allTime} />
      <div className='grid gap-6 lg:grid-cols-3'>
        <div className='min-w-0 lg:col-span-2'>
          <SessionsOverTimeChart report={report} />
        </div>
        <SessionMixCard summary={report.summary} />
      </div>
      <SessionLengthChart buckets={report.lengthBuckets} />
      <SessionsPerPatientChart patients={report.patients} />
    </div>
  )
}
