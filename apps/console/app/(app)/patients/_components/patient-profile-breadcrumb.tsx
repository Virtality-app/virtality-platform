import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

/** Back to the patient list, with the current patient's name. */
const PatientProfileBreadcrumb = ({
  patientsLabel,
  name,
}: {
  patientsLabel: string
  name: string
}) => (
  <nav className='flex items-center gap-2 text-[13px] text-zinc-500 dark:text-zinc-400'>
    <Link
      href='/patients'
      className='flex items-center gap-1 hover:text-zinc-900 dark:hover:text-zinc-100'
    >
      <ChevronLeft className='size-4' />
      {patientsLabel}
    </Link>
    <span className='text-zinc-300 dark:text-zinc-600'>/</span>
    <span className='ph-sensitive font-medium text-zinc-900 dark:text-zinc-100'>
      {name}
    </span>
  </nav>
)

export default PatientProfileBreadcrumb
