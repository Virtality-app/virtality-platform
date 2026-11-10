import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { SessionSavedFilter as SavedFilter } from '@/lib/dashboard-types'

type SessionSavedFilterProps = {
  value: SavedFilter
  counts: { saved: number; notSaved: number } | undefined
  onChange: (value: SavedFilter) => void
}

const withCount = (label: string, count: number | undefined) =>
  count === undefined ? label : `${label} ${count}`

/** Saved sessions versus ones the clinician closed with Don't Save. */
export function SessionSavedFilter({
  value,
  counts,
  onChange,
}: SessionSavedFilterProps) {
  return (
    <div className='flex flex-col gap-1.5'>
      <span className='text-sm font-medium'>Saved</span>
      <Tabs
        value={value}
        onValueChange={(next) => onChange(next as SavedFilter)}
      >
        <TabsList aria-label='Saved or not saved'>
          <TabsTrigger value='all'>
            {withCount(
              'All',
              counts ? counts.saved + counts.notSaved : undefined,
            )}
          </TabsTrigger>
          <TabsTrigger value='saved'>
            {withCount('Saved', counts?.saved)}
          </TabsTrigger>
          <TabsTrigger value='notSaved'>
            {withCount('Not saved', counts?.notSaved)}
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  )
}
