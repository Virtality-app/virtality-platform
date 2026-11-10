'use client'

import { useSessionActivity } from '@virtality/react-query'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CliniciansTab } from './clinicians/clinicians-tab'
import { DashboardHeader } from './dashboard-header'
import { DashboardQueryState } from './dashboard-query-state'
import { DashboardRangeControl } from './dashboard-range-control'
import { OverviewTab } from './overview/overview-tab'
import { SessionsTab } from './sessions/sessions-tab'
import { useDashboardRange } from './use-dashboard-range'
import { useDashboardTab } from './use-dashboard-tab'

export function DashboardWorkspace() {
  const rangeState = useDashboardRange()
  const { tab, setTab } = useDashboardTab()
  const activity = useSessionActivity({
    ...rangeState.range,
    allTime: rangeState.allTime,
    granularity: rangeState.granularity,
  })
  const reportedRange = activity.data
    ? { from: activity.data.from, to: activity.data.to }
    : undefined

  return (
    <div className='min-h-screen-with-header mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 md:px-6 md:py-8'>
      <DashboardHeader />
      <Tabs value={tab} onValueChange={setTab} className='gap-6'>
        <div className='flex flex-wrap items-center justify-between gap-3'>
          <TabsList aria-label='Dashboard view'>
            <TabsTrigger value='overview'>Overview</TabsTrigger>
            <TabsTrigger value='sessions'>Sessions</TabsTrigger>
            <TabsTrigger value='clinicians'>Clinicians</TabsTrigger>
          </TabsList>
          <DashboardRangeControl
            state={rangeState}
            reportedRange={reportedRange}
          />
        </div>

        <TabsContent value='overview'>
          <DashboardQueryState {...activity}>
            {(report) => (
              <OverviewTab report={report} allTime={rangeState.allTime} />
            )}
          </DashboardQueryState>
        </TabsContent>

        <TabsContent value='sessions'>
          <SessionsTab
            range={rangeState.range}
            allTime={rangeState.allTime}
            clinicians={activity.data?.clinicians ?? []}
          />
        </TabsContent>

        <TabsContent value='clinicians'>
          <DashboardQueryState {...activity}>
            {(report) => <CliniciansTab report={report} />}
          </DashboardQueryState>
        </TabsContent>
      </Tabs>
    </div>
  )
}
