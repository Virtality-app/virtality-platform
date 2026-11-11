import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

export type TrendGrouping = 'type' | 'clinician'
export type TrendMeasure = 'sessions' | 'minutes'

type SessionsOverTimeToolbarProps = {
  grouping: TrendGrouping
  measure: TrendMeasure
  onGroupingChange: (grouping: TrendGrouping) => void
  onMeasureChange: (measure: TrendMeasure) => void
}

export function SessionsOverTimeToolbar({
  grouping,
  measure,
  onGroupingChange,
  onMeasureChange,
}: SessionsOverTimeToolbarProps) {
  return (
    <div className='flex flex-wrap gap-2'>
      <Tabs
        value={grouping}
        onValueChange={(value) => onGroupingChange(value as TrendGrouping)}
      >
        <TabsList aria-label='Split bars by'>
          <TabsTrigger value='type'>By type</TabsTrigger>
          <TabsTrigger value='clinician'>By clinician</TabsTrigger>
        </TabsList>
      </Tabs>
      {grouping === 'type' ? (
        <Tabs
          value={measure}
          onValueChange={(value) => onMeasureChange(value as TrendMeasure)}
        >
          <TabsList aria-label='Measure'>
            <TabsTrigger value='sessions'>Sessions</TabsTrigger>
            <TabsTrigger value='minutes'>Minutes</TabsTrigger>
          </TabsList>
        </Tabs>
      ) : null}
    </div>
  )
}
