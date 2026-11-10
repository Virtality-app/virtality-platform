import { Suspense } from 'react'
import { DashboardWorkspace } from '@/components/dashboard/dashboard-workspace'

const StartPage = () => (
  <Suspense
    fallback={
      <div className='p-8'>
        <p className='text-muted-foreground'>Loading dashboard…</p>
      </div>
    }
  >
    <DashboardWorkspace />
  </Suspense>
)

export default StartPage
