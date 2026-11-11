import Link from 'next/link'
import { LineChart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EFFECTIVENESS_REPORT_COPY } from '@/lib/effectiveness-report-copy'

export function DashboardHeader() {
  return (
    <div className='flex flex-wrap items-end justify-between gap-4'>
      <div className='flex flex-col gap-1'>
        <h1 className='text-2xl font-semibold tracking-tight'>Dashboard</h1>
        <p className='text-muted-foreground text-sm'>
          Patient sessions across every clinician, excluding internal and test
          accounts.
        </p>
      </div>
      <Button asChild variant='outline'>
        <Link href='/effectiveness' className='flex items-center gap-2'>
          <LineChart className='size-4' />
          {EFFECTIVENESS_REPORT_COPY.dashboardLinkLabel}
        </Link>
      </Button>
    </div>
  )
}
