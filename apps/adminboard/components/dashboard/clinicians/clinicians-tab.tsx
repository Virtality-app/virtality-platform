import type { SessionActivityReport } from '@/lib/dashboard-types'
import { AverageLengthChart } from './average-length-chart'
import { ClinicianTable } from './clinician-table'
import { PatientMixCard } from './patient-mix-card'

type CliniciansTabProps = {
  report: SessionActivityReport
}

export function CliniciansTab({ report }: CliniciansTabProps) {
  return (
    <div className='flex flex-col gap-6'>
      <ClinicianTable clinicians={report.clinicians} />
      <div className='grid gap-6 lg:grid-cols-3'>
        <div className='min-w-0 lg:col-span-2'>
          <AverageLengthChart report={report} />
        </div>
        <PatientMixCard
          mix={report.patientMix}
          activePatients={report.summary.activePatients}
        />
      </div>
    </div>
  )
}
