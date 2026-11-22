import { AlertCircle } from 'lucide-react'
import { TabsList, TabsTrigger } from '@/components/ui/tabs'

const TRIGGER =
  'h-auto flex-none rounded-lg border-0 px-4.5 py-2 text-[13.5px] font-medium text-zinc-500 data-[state=active]:font-semibold data-[state=active]:text-zinc-900 data-[state=active]:shadow-xs dark:border-0 dark:text-zinc-400 dark:data-[state=active]:bg-zinc-700 dark:data-[state=active]:text-zinc-50'

type PatientProfileTabsListProps = {
  labels: { basicInfo: string; medicalHistory: string; sessions: string }
  /** Flags Basic Info when a required field there failed validation. */
  basicInfoHasErrors: boolean
}

/** The segmented control that switches profile tabs. */
const PatientProfileTabsList = ({
  labels,
  basicInfoHasErrors,
}: PatientProfileTabsListProps) => (
  <TabsList className='h-auto gap-0.5 rounded-[10px] bg-zinc-200 p-0.75 dark:bg-zinc-800'>
    <TabsTrigger value='basic-info' className={TRIGGER}>
      {labels.basicInfo}
      {basicInfoHasErrors && (
        <AlertCircle className='text-red-600 dark:text-red-400' />
      )}
    </TabsTrigger>
    <TabsTrigger value='medical-history' className={TRIGGER}>
      {labels.medicalHistory}
    </TabsTrigger>
    <TabsTrigger value='sessions' className={TRIGGER}>
      {labels.sessions}
    </TabsTrigger>
  </TabsList>
)

export default PatientProfileTabsList
